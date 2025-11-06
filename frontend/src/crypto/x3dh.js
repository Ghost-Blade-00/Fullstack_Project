import sodium from "libsodium-wrappers";
import { ensureIdentity, generatePrekeys } from "./keys";
import { axiosInstance } from "../lib/axios";

const b64 = sodium.to_base64;
const ub64 = sodium.from_base64;

export async function publishDeviceBundle() {
  await sodium.ready;
  await ensureIdentity();
  const bundle = await generatePrekeys(40);
  await axiosInstance.post("/devices/register", bundle);
  return bundle.deviceId;
}

export async function x3dhInitiate(recipientUserId, recipientDeviceBundle) {
  await sodium.ready;
  const me = await ensureIdentity();

  const spkPub = ub64(recipientDeviceBundle.signedPrekey.key);
  const spkSig = ub64(recipientDeviceBundle.signedPrekey.signature);
  const ok = sodium.crypto_sign_verify_detached(
    spkSig, spkPub, ub64(recipientDeviceBundle.identitySigningEd25519)
  );
  if (!ok) throw new Error("Signed prekey verify failed");

  const chosenOtp = (recipientDeviceBundle.oneTimePrekeys || []).find(p => !p.used);
  const otpPub = chosenOtp ? ub64(chosenOtp.key) : null;

  const myEph = sodium.crypto_kx_keypair();

  const dh1 = sodium.crypto_scalarmult(ub64(me.x25519.sk), spkPub);
  const dh2 = sodium.crypto_scalarmult(myEph.privateKey, ub64(recipientDeviceBundle.identityDhX25519));
  const dh3 = sodium.crypto_scalarmult(myEph.privateKey, spkPub);
  const dh4 = otpPub ? sodium.crypto_scalarmult(myEph.privateKey, otpPub) : new Uint8Array(0);

  const rootMaterial = sodium.crypto_generichash(32, new Uint8Array([...dh1, ...dh2, ...dh3, ...dh4]));
  const rootKey = rootMaterial;

  return {
    rootKey: b64(rootKey),
    myEphPub: b64(myEph.publicKey),
    usedOtp: chosenOtp?.key || null,
  };
}
