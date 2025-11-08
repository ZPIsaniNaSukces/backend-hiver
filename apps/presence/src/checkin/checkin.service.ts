import type { AuthenticatedUser } from "@app/auth";
import { CheckinDirection, CheckinType } from "@generated/presence";
import { USER_ROLE } from "@prisma/client";

import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { CheckinCheckoutDto } from "../../../../libs/contracts/src/checkin/dto/checkin-checkout.dto";
import { NfcTagsService } from "../nfc-tags/nfc-tags.service";
import {
  PRESENCE_PRISMA,
  PresencePrismaClient,
} from "../prisma/prisma.constants";

export interface CheckinStatusResponse {
  status: "success" | "error" | "idle";
  czyWejscieCzyWyjscie: CheckinDirection | null;
  godzinaOdklikniecia: string | null;
}

@Injectable()
export class CheckinService {
  constructor(
    @Inject(PRESENCE_PRISMA)
    private readonly prisma: PresencePrismaClient,
    private readonly nfcTagsService: NfcTagsService,
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
      czyWejscieCzyWyjscie: nextDirection,
      godzinaOdklikniecia: currentTimestamp.toISOString(),
    } satisfies CheckinStatusResponse;
  }

  async getLastStatus(
    userId: number,
    user: AuthenticatedUser,
  ): Promise<CheckinStatusResponse> {
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

    const lastCheckin = await this.prisma.checkin.findFirst({
      where: { userId },
      orderBy: { timestamp: "desc" },
    });

    if (lastCheckin == null) {
      return {
        status: "idle",
        czyWejscieCzyWyjscie: null,
        godzinaOdklikniecia: null,
      } satisfies CheckinStatusResponse;
    }

    return {
      status: "success",
      czyWejscieCzyWyjscie: lastCheckin.direction,
      godzinaOdklikniecia: lastCheckin.timestamp.toISOString(),
    } satisfies CheckinStatusResponse;
  }
}
