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
}
