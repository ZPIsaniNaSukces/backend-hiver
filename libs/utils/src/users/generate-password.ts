import { randomBytes } from "node:crypto";

export function generatePassword(): string {
  const basePassword = randomBytes(6)
    .toString("base64")
    .slice(0, 8)
    .replaceAll(/[^a-zA-Z0-9]/g, "x");
  const specialChars = "!@#$%^&*()";
  const specialPart = Array.from(
    { length: 4 },
    () => specialChars[Math.floor(Math.random() * specialChars.length)],
  ).join("");
  const randomPassword = basePassword + specialPart;
  return randomPassword;
}
