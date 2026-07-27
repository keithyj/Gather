import { randomBytes } from "crypto";
import { describe, expect, it } from "vitest";
import { decryptSensitiveDetail, encryptSensitiveDetail } from "./crypto";

describe("sensitive detail encryption", () => {
  const key = randomBytes(32).toString("base64");

  it("round trips an address without retaining plaintext in the ciphertext", () => {
    const address = "12 Example Street, London E8 1AA";
    const ciphertext = encryptSensitiveDetail(address, key);
    expect(ciphertext).not.toContain(address);
    expect(decryptSensitiveDetail(ciphertext, key)).toBe(address);
  });

  it("rejects a ciphertext when the key is wrong", () => {
    const ciphertext = encryptSensitiveDetail("A private address", key);
    expect(() => decryptSensitiveDetail(ciphertext, randomBytes(32).toString("base64"))).toThrow();
  });
});
