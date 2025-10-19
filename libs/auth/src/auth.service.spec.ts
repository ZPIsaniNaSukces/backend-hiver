import { PrismaService } from "@app/prisma";
import { USER_ROLE } from "@prisma/client";
import * as bcrypt from "bcrypt";

import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";

import { AuthService } from "./auth.service";

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));

const bcryptCompareMock = bcrypt.compare as jest.MockedFunction<
  (data: string, encrypted: string) => Promise<boolean>
>;

describe("AuthService", () => {
  const prismaServiceMock = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const jwtServiceMock = {
    signAsync: jest.fn(),
  };

  const validUserRecord = {
    id: 1,
    name: "Jane",
    surname: "Doe",
    email: "jane.doe@example.com",
    password: "hashedPassword",
    role: USER_ROLE.ADMIN,
    phone: "123456789",
    teamId: 2,
    companyId: 3,
  } as const;

  let authService: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaServiceMock.user.findUnique.mockReset();
    jwtServiceMock.signAsync.mockReset();
    bcryptCompareMock.mockReset();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock as unknown as PrismaService,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock as unknown as JwtService,
        },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  describe("validateUser", () => {
    it("returns a sanitized user when credentials are valid", async () => {
      prismaServiceMock.user.findUnique.mockResolvedValue(validUserRecord);
      bcryptCompareMock.mockResolvedValue(true);

      const user = await authService.validateUser(
        validUserRecord.email,
        "password",
      );

      expect(user).toEqual({
        id: validUserRecord.id,
        name: validUserRecord.name,
        surname: validUserRecord.surname,
        email: validUserRecord.email,
        role: validUserRecord.role,
        phone: validUserRecord.phone,
        teamId: validUserRecord.teamId,
        companyId: validUserRecord.companyId,
      });
      expect(bcryptCompareMock).toHaveBeenCalledWith(
        "password",
        validUserRecord.password,
      );
    });

    it("throws when the password hash is missing", async () => {
      prismaServiceMock.user.findUnique.mockResolvedValue({
        ...validUserRecord,
        password: null,
      });

      await expect(
        authService.validateUser(validUserRecord.email, "password"),
      ).rejects.toThrow(new UnauthorizedException("Invalid credentials"));
      expect(bcryptCompareMock).not.toHaveBeenCalled();
    });

    it("throws when the password does not match", async () => {
      prismaServiceMock.user.findUnique.mockResolvedValue(validUserRecord);
      bcryptCompareMock.mockResolvedValue(false);

      await expect(
        authService.validateUser(validUserRecord.email, "password"),
      ).rejects.toThrow(new UnauthorizedException("Invalid credentials"));
    });
  });

  describe("login", () => {
    it("returns an access token with the sanitized user", async () => {
      prismaServiceMock.user.findUnique.mockResolvedValue(validUserRecord);
      bcryptCompareMock.mockResolvedValue(true);
      jwtServiceMock.signAsync.mockResolvedValue("jwt-token");

      const result = await authService.login({
        email: validUserRecord.email,
        password: "password",
      });

      expect(result).toEqual({
        accessToken: "jwt-token",
        user: {
          id: validUserRecord.id,
          name: validUserRecord.name,
          surname: validUserRecord.surname,
          email: validUserRecord.email,
          role: validUserRecord.role,
          phone: validUserRecord.phone,
          teamId: validUserRecord.teamId,
          companyId: validUserRecord.companyId,
        },
      });
      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
        sub: validUserRecord.id,
        email: validUserRecord.email,
        role: validUserRecord.role,
      });
    });
  });
});
