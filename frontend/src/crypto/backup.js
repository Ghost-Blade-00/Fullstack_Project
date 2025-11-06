import sodium from "libsodium-wrappers";
import { loadIdentity } from "./storage";

export async function exportEncryptedBackup(passphrase) {
  await sodium.ready;
  const id = await loadIdentity();
  if (!id) throw new Error("No identity");

  const salt = sodium.randombytes_buf(16);
  const key = sodium.crypto_pwhash(
    32,
    passphrase,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_MODERATE,
    sodium.crypto_pwhash_MEMLIMIT_MODERATE,
    sodium.crypto_pwhash_ALG_ARGON2ID13
  );
  const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
  const pt = new TextEncoder().encode(JSON.stringify(id));
  const ct = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(pt, null, null, nonce, key);
  return {
    salt: sodium.to_base64(salt),
    nonce: sodium.to_base64(nonce),
    ciphertext: sodium.to_base64(ct),
  };
}
