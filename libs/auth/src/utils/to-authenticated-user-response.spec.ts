import { USER_ROLE } from "@prisma/client";

import { toAuthenticatedUserResponse } from "./to-authenticated-user-response";

describe("toAuthenticatedUserResponse", () => {
  it("maps a full user to AuthenticatedUser response", () => {
    const result = toAuthenticatedUserResponse({
      id: 10,
      name: "Alice",
      surname: "Smith",
      email: "alice@example.com",
      role: USER_ROLE.ADMIN,
      phone: "555-123",
      bossId: 3,
      companyId: 7,
      teams: [{ id: 1 }, { id: 2 }],
      password: "should-be-ignored",
      isFirstLogin: false,
    });

    expect(result).toEqual({
      id: 10,
      name: "Alice",
      surname: "Smith",
      email: "alice@example.com",
      role: USER_ROLE.ADMIN,
      phone: "555-123",
      bossId: 3,
      teamIds: [1, 2],
      companyId: 7,
      isFirstLogin: false,
    });
    expect(
      (result as unknown as Record<string, unknown>).password,
    ).toBeUndefined();
  });

  it("normalizes nullable fields and handles empty teams", () => {
    const result = toAuthenticatedUserResponse({
      id: 11,
      name: "Bob",
      surname: "Jones",
      email: "bob@example.com",
      role: USER_ROLE.EMPLOYEE,
      phone: null,
      bossId: null,
      companyId: 5,
      teams: [],
      isFirstLogin: true,
    });

    expect(result).toEqual({
      id: 11,
      name: "Bob",
      surname: "Jones",
      email: "bob@example.com",
      role: USER_ROLE.EMPLOYEE,
      phone: null,
      bossId: null,
      teamIds: [],
      companyId: 5,
      isFirstLogin: true,
    });
  });
});
