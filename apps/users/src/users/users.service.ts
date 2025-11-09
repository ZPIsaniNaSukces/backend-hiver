import type { AuthenticatedUser } from "@app/auth";
import { toAuthenticatedUserResponse } from "@app/auth";
import type { RegistrationResult } from "@app/contracts/users";
import {
  CompleteRegistrationDto,
  CreateUserDto,
  UpdateUserDto,
} from "@app/contracts/users";
import { MailService } from "@app/mail";
import { PrismaService } from "@app/prisma";
import { generatePassword } from "@app/utils";
import type { Prisma } from "@prisma/client";
import * as bcrypt from "bcrypt";

import { Injectable, Logger, NotFoundException } from "@nestjs/common";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<AuthenticatedUser> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    const data: Prisma.UserUncheckedCreateInput & {
      teams?: { connect: { id: number }[] };
    } = {
      name: createUserDto.name ?? null,
      surname: createUserDto.surname ?? null,
      email: createUserDto.email,
      password: hashedPassword,
      phone: createUserDto.phone ?? null,
      role: createUserDto.role,
      bossId:
        createUserDto.bossId != null && createUserDto.bossId > 0
          ? createUserDto.bossId
          : null,
      companyId: createUserDto.companyId,
    };

    if (createUserDto.teamIds != null && createUserDto.teamIds.length > 0) {
      data.teams = {
        connect: createUserDto.teamIds.map((teamId) => ({ id: teamId })),
      };
    }

    const user = await this.prisma.user.create({
      data,
      include: { teams: { select: { id: true } } },
    });
    return toAuthenticatedUserResponse(user);
  }

  async findAll(): Promise<AuthenticatedUser[]> {
    const users = await this.prisma.user.findMany({
      include: { teams: { select: { id: true } } },
    });
    return users.map((user) => toAuthenticatedUserResponse(user));
  }

  async findOne(id: number): Promise<AuthenticatedUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { teams: { select: { id: true } } },
    });
    if (user == null) {
      return null;
    }
    return toAuthenticatedUserResponse(user);
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<AuthenticatedUser> {
    const hashedPassword =
      updateUserDto.password === undefined
        ? undefined
        : await bcrypt.hash(updateUserDto.password, 12);

    const data: Prisma.UserUncheckedUpdateInput & {
      teams?: { set?: { id: number }[]; connect?: { id: number }[] };
    } = {
      name: updateUserDto.name,
      surname: updateUserDto.surname,
      email: updateUserDto.email,
      password: hashedPassword,
      phone: updateUserDto.phone ?? null,
      role: updateUserDto.role,
      bossId:
        updateUserDto.bossId != null && updateUserDto.bossId > 0
          ? updateUserDto.bossId
          : null,
      companyId:
        updateUserDto.companyId != null && updateUserDto.companyId > 0
          ? updateUserDto.companyId
          : undefined,
      accountStatus: updateUserDto.accountStatus,
    };

    if (updateUserDto.teamIds != null) {
      data.teams = {
        set: [],
        connect: updateUserDto.teamIds.map((teamId) => ({ id: teamId })),
      };
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: { teams: { select: { id: true } } },
    });

    return toAuthenticatedUserResponse(user);
  }

  async remove(id: number): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.delete({
      where: { id },
      include: { teams: { select: { id: true } } },
    });
    return toAuthenticatedUserResponse(user);
  }

  async register(
    email: string,
    companyId: number,
    bossId: number,
  ): Promise<RegistrationResult> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser !== null) {
      return {
        success: false,
        message: "User with this email already exists.",
      };
    }

    const randomPassword = generatePassword();

    const hashedPassword = await bcrypt.hash(randomPassword, 12);

    await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        companyId,
        bossId,
        role: "EMPLOYEE",
        accountStatus: "UNVERIFIED",
      },
    });
    this.logger.debug(
      `PASSWORD GENERATED: ${randomPassword}, HASHED: ${hashedPassword}`,
    );

    try {
      await this.mailService.sendWelcomeEmail(email, randomPassword);
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send welcome email to ${email}, but user was created. Error: ${errorMessage}`,
      );
      //what if email fails? what do we do
    }

    return {
      success: true,
      message: "User registered successfully.",
      temporaryPassword: randomPassword,
    };
  }

  async completeRegistration(
    userId: number,
    completeRegistrationDto: CompleteRegistrationDto,
  ): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user == null) {
      throw new NotFoundException("User not found");
    }

    //hash new password if provided
    const hashedPassword =
      completeRegistrationDto.password === undefined
        ? undefined
        : await bcrypt.hash(completeRegistrationDto.password, 12);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: completeRegistrationDto.name,
        surname: completeRegistrationDto.surname,
        phone: completeRegistrationDto.phone ?? null,
        password: hashedPassword,
        accountStatus: "VERIFIED",
      },
      include: { teams: { select: { id: true } } },
    });

    return toAuthenticatedUserResponse(updatedUser);
  }
}
