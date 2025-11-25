import type { AuthenticatedUser } from "@app/auth";
import { toAuthenticatedUserResponse } from "@app/auth";
import type { RegistrationResult } from "@app/contracts/users";
import {
  CompleteRegistrationDto,
  CreateUserDto,
  UpdateUserDto,
  UserCreatedEventDto,
  UserUpdatedEventDto,
  UsersMessageTopic,
} from "@app/contracts/users";
import { MailService } from "@app/mail";
import type {
  PaginatedResponse,
  PaginatedSearchQueryDto,
} from "@app/pagination";
import {
  createPaginatedResponse,
  getPaginationParameters,
} from "@app/pagination";
import { PrismaService } from "@app/prisma";
import { buildSearchWhere } from "@app/search";
import { generatePassword } from "@app/utils";
import type { Prisma } from "@prisma/client";
import * as bcrypt from "bcrypt";

import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";

@Injectable()
export class UsersService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    @Inject("USERS_KAFKA") private readonly kafka: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafka.connect();
  }

  async onModuleDestroy() {
    await this.kafka.close();
  }

  async create(
    createUserDto: CreateUserDto,
    companyId: number,
  ): Promise<AuthenticatedUser> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    const data: Prisma.UserUncheckedCreateInput = {
      name: createUserDto.name ?? null,
      surname: createUserDto.surname ?? null,
      email: createUserDto.email,
      password: hashedPassword,
      phone: createUserDto.phone ?? null,
      dateOfBirth: createUserDto.dateOfBirth ?? null,
      title: createUserDto.title ?? null,
      role: createUserDto.role,
      bossId:
        createUserDto.bossId != null && createUserDto.bossId > 0
          ? createUserDto.bossId
          : null,
      companyId,
    };

    const user = await this.prisma.user.create({
      data,
      include: { teams: { select: { id: true, name: true } } },
    });
    // Publish user created event for other services
    const createdEvent: UserCreatedEventDto = {
      id: user.id,
      bossId: user.bossId ?? null,
      companyId: user.companyId,
    };
    this.kafka.emit(UsersMessageTopic.CREATE, createdEvent);

    return toAuthenticatedUserResponse(user);
  }

  async findAll(
    query: PaginatedSearchQueryDto,
  ): Promise<PaginatedResponse<AuthenticatedUser>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const { skip, take } = getPaginationParameters(page, limit);

    // Build search filter for name, surname, and email fields
    const searchWhere = buildSearchWhere(query.search, [
      "name",
      "surname",
      "email",
    ]);

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: searchWhere,
        skip,
        take,
        include: { teams: { select: { id: true, name: true } } },
      }),
      this.prisma.user.count({
        where: searchWhere,
      }),
    ]);

    const authenticatedUsers = users.map((user) =>
      toAuthenticatedUserResponse(user),
    );

    return createPaginatedResponse(authenticatedUsers, total, page, limit);
  }

  async findOne(id: number): Promise<AuthenticatedUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        teams: { select: { id: true, name: true } },
        subordinates: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
          },
        },
      },
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

    const data: Prisma.UserUncheckedUpdateInput = {
      name: updateUserDto.name,
      surname: updateUserDto.surname,
      email: updateUserDto.email,
      password: hashedPassword,
      phone: updateUserDto.phone ?? null,
      dateOfBirth: updateUserDto.dateOfBirth ?? null,
      title: updateUserDto.title ?? null,
      role: updateUserDto.role,
      bossId:
        updateUserDto.bossId != null && updateUserDto.bossId > 0
          ? updateUserDto.bossId
          : null,
      accountStatus: updateUserDto.accountStatus,
    };

    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: { teams: { select: { id: true, name: true } } },
    });
    // Publish user updated event
    const updatedEvent: UserUpdatedEventDto = {
      id: user.id,
      bossId: user.bossId ?? null,
      companyId: user.companyId,
    };
    this.kafka.emit(UsersMessageTopic.UPDATE, updatedEvent);

    return toAuthenticatedUserResponse(user);
  }

  async remove(id: number): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.delete({
      where: { id },
      include: { teams: { select: { id: true, name: true } } },
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
    if (process.env.ENVIRONMENT_TYPE === "development") {
      this.logger.debug(
        `PASSWORD GENERATED: ${randomPassword}, HASHED: ${hashedPassword}`,
      );
    }
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
      temporaryPassword:
        process.env.ENVIRONMENT_TYPE === "development"
          ? randomPassword
          : undefined, //TODO: remove temporary password from response in production
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
        dateOfBirth: completeRegistrationDto.dateOfBirth ?? null,
        title: completeRegistrationDto.title ?? null,
        password: hashedPassword,
        accountStatus: "VERIFIED",
      },
      include: { teams: { select: { id: true, name: true } } },
    });

    return toAuthenticatedUserResponse(updatedUser);
  }
}
