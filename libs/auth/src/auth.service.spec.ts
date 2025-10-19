import { PrismaService } from "@app/prisma";
import { USER_ROLE } from "@prisma/client";
import * as bcrypt from "bcrypt";

import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
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
    decode: jest.fn(),
  };

  const configServiceMock = {
    get: jest.fn(),
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
    jwtServiceMock.decode.mockReset();
    bcryptCompareMock.mockReset();
    configServiceMock.get.mockReset();

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
        {
          provide: ConfigService,
          useValue: configServiceMock as unknown as ConfigService,
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
      const accessExp = 1_700_000_000;
      const refreshExp = 1_700_086_400;

      configServiceMock.get.mockImplementation((key: string) => {
        const values: Record<string, string> = {
          JWT_REFRESH_SECRET: "refresh-secret",
          JWT_REFRESH_EXPIRES_IN: "30d",
          JWT_SECRET: "jwt-secret",
        };
        return values[key];
      });

      jwtServiceMock.signAsync
        .mockResolvedValueOnce("access-token")
        .mockResolvedValueOnce("refresh-token");
      jwtServiceMock.decode.mockImplementation((token: string) => {
        if (token === "access-token") {
          return { exp: accessExp };
        }
        if (token === "refresh-token") {
          return { exp: refreshExp };
        }
        return null;
      });

      const result = await authService.login({
        email: validUserRecord.email,
        password: "password",
      });

      expect(result).toEqual({
        accessToken: "access-token",
        accessTokenExpiresAt: new Date(accessExp * 1000).toISOString(),
        refreshToken: "refresh-token",
        refreshTokenExpiresAt: new Date(refreshExp * 1000).toISOString(),
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
      expect(jwtServiceMock.signAsync).toHaveBeenNthCalledWith(1, {
        sub: validUserRecord.id,
        email: validUserRecord.email,
        role: validUserRecord.role,
      });
      expect(jwtServiceMock.signAsync).toHaveBeenNthCalledWith(
        2,
        {
          sub: validUserRecord.id,
          email: validUserRecord.email,
          role: validUserRecord.role,
        },
        {
          secret: "refresh-secret",
          expiresIn: "30d",
        },
      );
    });
  });
});
