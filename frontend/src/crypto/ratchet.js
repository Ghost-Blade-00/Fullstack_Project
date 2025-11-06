import sodium from "libsodium-wrappers";
import { loadSession, saveSession } from "./storage";

const toB64 = sodium.to_base64;
const fromB64 = sodium.from_base64;

function hkdf(inputKey, infoStr) {
  // HKDF-Expand like step using generichash as PRF:
  const info = new TextEncoder().encode(infoStr);
  return sodium.crypto_generichash(32, info, inputKey);
}

export async function initSession(peerDeviceId, rootKeyB64, myRatchetKeyPair, theirRatchetPub) {
  await sodium.ready;
  const rootKey = fromB64(rootKeyB64);
  const dh = sodium.crypto_scalarmult(myRatchetKeyPair.privateKey, fromB64(theirRatchetPub));
  const master = sodium.crypto_generichash(32, new Uint8Array([...rootKey, ...dh]));
  const sendChainKey = hkdf(master, "send");
  const recvChainKey = hkdf(master, "recv");
  const state = {
    rootKey: toB64(master),
    send: { ck: toB64(sendChainKey), n: 0 },
    recv: { ck: toB64(recvChainKey), n: 0 },
    myRatchetPriv: toB64(myRatchetKeyPair.privateKey),
    myRatchetPub: toB64(myRatchetKeyPair.publicKey),
    theirRatchetPub,
  };
  await saveSession(peerDeviceId, state);
  return state;
}

function kdfChain(ckBytes) {
  const mk = hkdf(ckBytes, "msg");
  const nextCk = hkdf(ckBytes, "next");
  return { mk, nextCk };
}

export async function ratchetEncrypt(peerDeviceId, plaintext, aadObj = {}) {
  await sodium.ready;
  const s = await loadSession(peerDeviceId);
  if (!s) throw new Error("No session");

  const ck = fromB64(s.send.ck);
  const { mk, nextCk } = kdfChain(ck);
  const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);

  const aad = new TextEncoder().encode(JSON.stringify(aadObj));
  const ct = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    new TextEncoder().encode(plaintext), aad, null, nonce, mk
  );

  s.send.ck = toB64(nextCk);
  s.send.n = (s.send.n || 0) + 1;
  await saveSession(peerDeviceId, s);

  return {
    ciphertext: toB64(ct),
    nonce: toB64(nonce),
    counter: s.send.n,
    myRatchetPub: s.myRatchetPub,
    header: toB64(aad),
  };
}

export async function ratchetDecrypt(peerDeviceId, env) {
  await sodium.ready;
  const s = await loadSession(peerDeviceId);
  if (!s) throw new Error("No session");

  const ck = fromB64(s.recv.ck);
  const { mk, nextCk } = kdfChain(ck);

  const aad = fromB64(env.header);
  const pt = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null, fromB64(env.ciphertext), aad, fromB64(env.nonce), mk
  );

  s.recv.ck = toB64(nextCk);
  s.recv.n = (s.recv.n || 0) + 1;
  await saveSession(peerDeviceId, s);

  return new TextDecoder().decode(pt);
}
