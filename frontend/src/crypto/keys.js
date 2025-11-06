import sodium from "libsodium-wrappers";
import { saveIdentity, loadIdentity, savePrekeys } from "./storage";

export async function ensureIdentity() {
  await sodium.ready;
  let id = await loadIdentity();
  if (id) return id;

  const signKp = sodium.crypto_sign_keypair();
  const dhKp = sodium.crypto_kx_keypair();

  id = {
    ed25519: {
      pk: sodium.to_base64(signKp.publicKey),
      sk: sodium.to_base64(signKp.privateKey),
    },
    x25519: {
      pk: sodium.to_base64(dhKp.publicKey),
      sk: sodium.to_base64(dhKp.privateKey),
    },
    deviceId: crypto.randomUUID(),
  };
  await saveIdentity(id);
  return id;
}

export async function generatePrekeys(N = 40) {
  await sodium.ready;
  const id = await ensureIdentity();
  const spk = sodium.crypto_kx_keypair();
  const spkSig = sodium.crypto_sign_detached(spk.publicKey, sodium.from_base64(id.ed25519.sk));

  const otps = [];
  for (let i=0;i<N;i++){
    const kp = sodium.crypto_kx_keypair();
    otps.push({ key: sodium.to_base64(kp.publicKey) });
  }

  const bundle = {
    identitySigningEd25519: id.ed25519.pk,
    identityDhX25519: id.x25519.pk,
    signedPrekey: { key: sodium.to_base64(spk.publicKey), signature: sodium.to_base64(spkSig) },
    oneTimePrekeys: otps,
    deviceId: id.deviceId,
  };

  await savePrekeys({ spk, otps, published: bundle });
  return bundle;
}
