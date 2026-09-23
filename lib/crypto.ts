import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const hex = process.env.COUPA_CREDENTIAL_ENCRYPTION_KEY;
  if (!hex) {
    throw new Error("Missing COUPA_CREDENTIAL_ENCRYPTION_KEY environment variable");
  }
  const key = Buffer.from(hex, "hex");
  if (key.length !== 32) {
    throw new Error("COUPA_CREDENTIAL_ENCRYPTION_KEY must be a 32-byte (64 hex character) key");
  }
  return key;
}

/** Encrypts a secret for storage. Returns `iv:authTag:ciphertext`, all hex. */
export function encryptSecret(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptSecret(stored: string): string {
  const key = getKey();
  const [ivHex, authTagHex, dataHex] = stored.split(":");
  if (!ivHex || !authTagHex || !dataHex) {
    throw new Error("Malformed encrypted secret");
  }
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
