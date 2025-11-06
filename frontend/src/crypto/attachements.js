import sodium from "libsodium-wrappers";
import { axiosInstance } from "../lib/axios";

export async function encryptFile(file) {
  await sodium.ready;
  const key = sodium.randombytes_buf(32);
  const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
  const buf = new Uint8Array(await file.arrayBuffer());
  const ct = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(buf, null, null, nonce, key);
  const hash = sodium.to_hex(sodium.crypto_generichash(32, buf));
  return { ct, key: sodium.to_base64(key), nonce: sodium.to_base64(nonce), hash };
}

export async function uploadEncrypted({ ct, hash }) {
  const form = new FormData();
  const blob = new Blob([ct], { type: "application/octet-stream" });
  form.append("blob", blob, `${hash}.bin`);
  const { data } = await axiosInstance.post(`/attachments/upload?contentHash=${hash}`, form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data.fileId;
}
