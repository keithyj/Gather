import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const version = "v1";

function decodeKey(encodedKey: string) {
  const key = Buffer.from(encodedKey, "base64");
  if (key.length !== 32) throw new Error("EVENT_DETAILS_ENCRYPTION_KEY must decode to exactly 32 bytes.");
  return key;
}

/** Encrypts sensitive event fields before they enter the database. Never call from a client component. */
export function encryptSensitiveDetail(plainText: string, encodedKey: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", decodeKey(encodedKey), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  return [
    version,
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    encrypted.toString("base64url")
  ].join(".");
}

/** Decrypt only after the repository's RLS-backed approved-membership query has succeeded. */
export function decryptSensitiveDetail(cipherText: string, encodedKey: string) {
  const [payloadVersion, iv, authTag, encrypted] = cipherText.split(".");
  if (payloadVersion !== version || !iv || !authTag || !encrypted)
    throw new Error("Invalid sensitive detail payload.");
  const decipher = createDecipheriv("aes-256-gcm", decodeKey(encodedKey), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(authTag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64url")), decipher.final()]).toString(
    "utf8"
  );
}
