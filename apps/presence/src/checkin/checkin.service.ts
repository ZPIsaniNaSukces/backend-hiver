import type { AuthenticatedUser } from "@app/auth";
import { CheckinCheckoutDto } from "@app/contracts";
import { CheckinDirection, CheckinType } from "@generated/presence";
import type { Checkin, NfcTag } from "@generated/presence";
import { USER_ROLE } from "@prisma/client";

import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { NfcTagsService } from "../nfc-tags/nfc-tags.service";
import {
  PRESENCE_PRISMA,
  PresencePrismaClient,
} from "../prisma/prisma.constants";
import { CmacService, CmacVerificationError } from "./cmac.service";

export interface CheckinStatusResponse {
  status: "success" | "error" | "idle";
  checkinDirection: CheckinDirection | null;
  checkInTime: string | null;
}

export interface CheckinHistoryEntry {
  id: number;
  type: CheckinType;
  direction: CheckinDirection;
  timestamp: string;
  counter: number | null;
  signature: string | null;
  tagUid: string | null;
}

export interface CheckinStatusWithHistoryResponse
  extends CheckinStatusResponse {
  history: CheckinHistoryEntry[];
}

export interface HourlyCheckinStat {
  hour: string;
  count: number;
  isCurrentHour: boolean;
}

export interface DailyCheckinStat {
  date: string;
  workedHours: number;
  workedMinutes: number;
  locationType: CheckinType | null;
}

export interface MonthlyStatsResponse {
  userId: number;
  month: number;
  year: number;
  days: DailyCheckinStat[];
  totalWorkedHours: number;
  totalWorkedMinutes: number;
}

/** Maximum break time in minutes that counts towards work time */
const MAX_BREAK_MINUTES = 30;

@Injectable()
export class CheckinService {
  constructor(
    @Inject(PRESENCE_PRISMA)
    private readonly prisma: PresencePrismaClient,
    private readonly nfcTagsService: NfcTagsService,
    private readonly cmacService: CmacService,
  ) {}

  async checkinCheckout(
    dto: CheckinCheckoutDto,
    user: AuthenticatedUser,
  ): Promise<CheckinStatusResponse> {
    if (user.role === USER_ROLE.EMPLOYEE && user.id !== dto.userId) {
      throw new ForbiddenException(
        "Employees can only track their own presence",
      );
    }

    const userInfo = await this.prisma.checkinUserInfo.findUnique({
      where: { userId: dto.userId },
    });

    if (userInfo == null) {
      throw new NotFoundException(
        `User ${String(dto.userId)} is not registered for presence tracking`,
      );
    }

    if (userInfo.companyId !== dto.companyId) {
      throw new ForbiddenException(
        "User is not linked to the provided company",
      );
    }

    if (user.companyId !== dto.companyId) {
      throw new ForbiddenException(
        "Authenticated user cannot perform presence actions for another company",
      );
    }

    const tag = await this.nfcTagsService.findByUid(dto.tagUid);

    if (tag == null) {
      throw new NotFoundException("Provided NFC tag does not exist");
    }

    if (tag.companyId !== dto.companyId) {
      throw new ForbiddenException(
        "This NFC tag is not assigned to the provided company",
      );
    }

    const lastCheckin = await this.prisma.checkin.findFirst({
      where: { userId: dto.userId },
      orderBy: { timestamp: "desc" },
    });

    const nextDirection =
      lastCheckin?.direction === CheckinDirection.IN
        ? CheckinDirection.OUT
        : CheckinDirection.IN;

    const currentTimestamp = new Date();

    const type = dto.type ?? CheckinType.NFC;

    if (type === CheckinType.NFC) {
      if (dto.signature == null) {
        throw new ForbiddenException("Signature is required for NFC check-ins");
      }

      try {
        const isValid = this.cmacService.verifyMac({
          uidHex: dto.tagUid,
          counter: dto.counter,
          macHex: dto.signature,
          keyHex: tag.aesKey,
        });

        if (!isValid) {
          throw new ForbiddenException("Invalid NFC signature");
        }
      } catch (error: unknown) {
        if (error instanceof CmacVerificationError) {
          throw new BadRequestException(error.message);
        }

        throw error;
      }
    }

    await this.prisma.checkin.create({
      data: {
        userId: dto.userId,
        companyId: dto.companyId,
        type,
        direction: nextDirection,
        timestamp: currentTimestamp,
        counter: dto.counter,
        signature: dto.signature,
        tagId: tag.id,
      },
    });

    return {
      status: "success",
      checkinDirection: nextDirection,
      checkInTime: currentTimestamp.toISOString(),
    } satisfies CheckinStatusResponse;
  }

  async getLastStatus(
    userId: number,
    user: AuthenticatedUser,
  ): Promise<CheckinStatusWithHistoryResponse> {
    if (user.role === USER_ROLE.EMPLOYEE && user.id !== userId) {
      throw new ForbiddenException(
        "Employees can only view their own presence status",
      );
    }

    const userInfo = await this.prisma.checkinUserInfo.findUnique({
      where: { userId },
    });

    if (userInfo == null) {
      throw new NotFoundException(
        "Presence information for this user is not available",
      );
    }

    if (userInfo.companyId !== user.companyId) {
      throw new ForbiddenException(
        "Cannot access presence data for another company",
      );
    }

    const historyRecords = await this.prisma.checkin.findMany({
      where: { userId },
      include: { tag: true },
      orderBy: { timestamp: "desc" },
    });

    const history = historyRecords.map((record) =>
      this.mapHistoryEntry(record),
    );
    const lastCheckin = historyRecords.at(0);

    if (lastCheckin == null) {
      return {
        status: "idle",
        checkinDirection: null,
        checkInTime: null,
        history,
      };
    }

    return {
      status: "success",
      checkinDirection: lastCheckin.direction,
      checkInTime: lastCheckin.timestamp.toISOString(),
      history,
    };
  }

  private mapHistoryEntry(
    record: Checkin & { tag: NfcTag | null },
  ): CheckinHistoryEntry {
    return {
      id: record.id,
      type: record.type,
      direction: record.direction,
      timestamp: record.timestamp.toISOString(),
      counter: record.counter ?? null,
      signature: record.signature ?? null,
      tagUid: record.tag?.uid ?? null,
    };
  }

  async getHourlyStats(companyId: number): Promise<HourlyCheckinStat[]> {
    const now = new Date();
    const currentHour = now.getHours();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const checkins = await this.prisma.checkin.findMany({
      where: {
        companyId,
        timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        userId: true,
        direction: true,
        timestamp: true,
      },
      orderBy: { timestamp: "asc" },
    });

    const stats: HourlyCheckinStat[] = [];

    for (let hour = 7; hour <= 17; hour++) {
      // For current hour, use current time; for past hours, use end of that hour
      // For future hours, don't count any attendance (they haven't happened yet)
      let cutoffTime: Date;
      if (hour === currentHour) {
        cutoffTime = now; // Use actual current time, not end of hour
      } else if (hour < currentHour) {
        cutoffTime = new Date(now);
        cutoffTime.setHours(hour, 59, 59, 999);
      } else {
        // Future hours - skip them, show 0 count
        stats.push({
          hour: `${hour.toString().padStart(2, "0")}:00`,
          count: 0,
          isCurrentHour: false,
        });
        continue;
      }

      // Track last direction per user up to this cutoff time
      const userLastDirection = new Map<number, CheckinDirection>();

      for (const checkin of checkins) {
        if (checkin.timestamp <= cutoffTime) {
          userLastDirection.set(checkin.userId, checkin.direction);
        }
      }

      // Count users whose last action was IN
      let presentCount = 0;
      for (const direction of userLastDirection.values()) {
        if (direction === CheckinDirection.IN) {
          presentCount++;
        }
      }

      stats.push({
        hour: `${hour.toString().padStart(2, "0")}:00`,
        count: presentCount,
        isCurrentHour: hour === currentHour,
      });
    }

    return stats;
  }

  async getMonthlyStats(
    userId: number,
    month: number,
    year: number,
    user: AuthenticatedUser,
  ): Promise<MonthlyStatsResponse> {
    if (user.role === USER_ROLE.EMPLOYEE && user.id !== userId) {
      throw new ForbiddenException(
        "Employees can only view their own presence statistics",
      );
    }

    const userInfo = await this.prisma.checkinUserInfo.findUnique({
      where: { userId },
    });

    if (userInfo == null) {
      throw new NotFoundException(
        "Presence information for this user is not available",
      );
    }

    if (userInfo.companyId !== user.companyId) {
      throw new ForbiddenException(
        "Cannot access presence data for another company",
      );
    }

    const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    const daysInMonth = new Date(year, month, 0).getDate();

    const checkins = await this.prisma.checkin.findMany({
      where: {
        userId,
        timestamp: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: { timestamp: "asc" },
    });

    // Group checkins by day
    const checkinsByDay = new Map<number, typeof checkins>();
    for (const checkin of checkins) {
      const day = checkin.timestamp.getDate();
      const existing = checkinsByDay.get(day) ?? [];
      existing.push(checkin);
      checkinsByDay.set(day, existing);
    }

    const days: DailyCheckinStat[] = [];
    let totalWorkedMinutes = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dayCheckins = checkinsByDay.get(day) ?? [];
      const { workedMinutes, locationType } =
        this.calculateDailyWorkTime(dayCheckins);

      const date = new Date(year, month - 1, day);
      days.push({
        date: date.toISOString().split("T")[0],
        workedHours: Math.floor(workedMinutes / 60),
        workedMinutes: workedMinutes % 60,
        locationType,
      });

      totalWorkedMinutes += workedMinutes;
    }

    return {
      userId,
      month,
      year,
      days,
      totalWorkedHours: Math.floor(totalWorkedMinutes / 60),
      totalWorkedMinutes: totalWorkedMinutes % 60,
    };
  }

  /**
   * Calculates daily work time from checkin records.
   * Accounts for breaks: only up to MAX_BREAK_MINUTES (30 min) of total break time
   * is counted towards work time. Any break time beyond that is subtracted.
   */
  private calculateDailyWorkTime(
    checkins: {
      direction: CheckinDirection;
      timestamp: Date;
      type: CheckinType;
    }[],
  ): { workedMinutes: number; locationType: CheckinType | null } {
    if (checkins.length === 0) {
      return { workedMinutes: 0, locationType: null };
    }

    let totalWorkMinutes = 0;
    let totalBreakMinutes = 0;
    let lastCheckinTime: Date | null = null;
    let locationType: CheckinType | null = null;

    for (const checkin of checkins) {
      locationType ??= checkin.type;

      if (checkin.direction === CheckinDirection.IN) {
        // Starting work or returning from break
        if (lastCheckinTime !== null) {
          // This means there was a break (OUT -> IN transition)
          const breakDuration = Math.floor(
            (checkin.timestamp.getTime() - lastCheckinTime.getTime()) /
              (1000 * 60),
          );
          totalBreakMinutes += breakDuration;
        }
        lastCheckinTime = checkin.timestamp;
      } else {
        // Ending work session
        if (lastCheckinTime !== null) {
          const workDuration = Math.floor(
            (checkin.timestamp.getTime() - lastCheckinTime.getTime()) /
              (1000 * 60),
          );
          totalWorkMinutes += workDuration;
        }
        lastCheckinTime = checkin.timestamp;
      }
    }

    // Add allowed break time (max 30 minutes) to total work time
    const allowedBreakMinutes = Math.min(totalBreakMinutes, MAX_BREAK_MINUTES);
    const finalWorkedMinutes = totalWorkMinutes + allowedBreakMinutes;

    return { workedMinutes: finalWorkedMinutes, locationType };
  }
}
