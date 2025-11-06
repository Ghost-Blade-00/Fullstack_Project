// frontend/src/crypto/session.js
import sodium from "libsodium-wrappers";
import { axiosInstance } from "../lib/axios";
import { ensureIdentity } from "./keys";
import { x3dhInitiate } from "./x3dh";
import { initSession, ratchetEncrypt, ratchetDecrypt } from "./ratchet";
import { saveSession, loadSession } from "./storage";

/**
 * Publish this device's bundle if needed (idempotent on your API side)
 */
export async function publishIfNeeded() {
  const { publishDeviceBundle } = await import("./x3dh");
  return publishDeviceBundle();
}

/**
 * Ensure there is a ratchet session with a specific recipient device.
 * Bootstraps via X3DH on first use and consumes a one-time prekey.
 */
export async function ensurePeerSession(recipientUserId, recipientDevice) {
  await sodium.ready;
  await ensureIdentity();

  const existing = await loadSession(recipientDevice.deviceId);
  if (existing) return existing;

  // X3DH handshake to derive root key
  const x = await x3dhInitiate(recipientUserId, recipientDevice);
  const myRatchet = sodium.crypto_kx_keypair();

  // Mark the OTP as consumed (server side)
  if (x.usedOtp) {
    await axiosInstance.post("/devices/consume-otp", {
      deviceId: recipientDevice.deviceId,
      prekey: x.usedOtp,
    });
  }

  // Initialize sending/receiving chain keys
  return await initSession(
    recipientDevice.deviceId,
    x.rootKey,
    myRatchet,
    recipientDevice.signedPrekey.key
  );
}

/**
 * Build AAD that binds message metadata to the ciphertext
 */
function buildAAD({ toUserId, deviceId, type = "text", extra = {} }) {
  return {
    toUserId,
    dev: deviceId,
    typ: type,
    ts: Date.now(),
    ...extra,
  };
}

/**
 * Send a secure text to a user. Fan-out to all of their devices.
 * Returns the array of envelope summaries (ids returned by server).
 */
export async function sendSecureText(toUserId, text) {
  const { data: bundles } = await axiosInstance.get(`/devices/bundles/${toUserId}`);
  const envelopes = [];

  for (const dev of bundles) {
    // Ensure or create a ratchet session per recipient device
    await ensurePeerSession(toUserId, dev);

    // Rich AAD
    const aad = buildAAD({ toUserId, deviceId: dev.deviceId, type: "text" });

    // Encrypt the plaintext under the ratchet
    const env = await ratchetEncrypt(dev.deviceId, text, aad);

    // Prepare the transport envelope (server stores only ciphertext/meta)
    envelopes.push({
      conversationId: [toUserId].sort().join(":"), // stable id if you also include your own id
      recipientUserId: toUserId,
      recipientDeviceId: dev.deviceId,
      ratchetPub: env.myRatchetPub,
      header: env.header,          // same as aad, base64-encoded
      aad: env.header,             // duplicate for clarity (server won't parse)
      ciphertext: env.ciphertext,
      nonce: env.nonce,
      counter: env.counter,
    });
  }

  const { data } = await axiosInstance.post("/envelopes", { envelopes });
  return data;
}

/**
 * Pull undelivered envelopes from the server and decrypt what we can.
 * Posts a delivery receipt for the batch we pulled.
 * Returns plaintext array: [{ id, msg, from, at }]
 */
export async function pullAndDecrypt() {
  const { data } = await axiosInstance.get("/envelopes/pull");
  const pt = [];

  for (const env of data) {
    try {
      // session key identity: prefer recipientDeviceId, fall back to senderDeviceId (older records)
      const peerDeviceKey = env.recipientDeviceId ?? env.senderDeviceId;
      const msg = await ratchetDecrypt(peerDeviceKey, env);
      pt.push({ id: env._id, msg, from: env.senderUserId, at: env.createdAt });
    } catch {
      // Skip decrypt errors (out-of-order or wrong session); next pull may succeed after ratchet advances
    }
  }

  // Ack delivery for everything we fetched (idempotent)
  if (data.length) {
    try {
      await axiosInstance.post("/envelopes/receipt", {
        ids: data.map((d) => d._id),
        kind: "delivered",
      });
    } catch {
      // best effort, will retry on next pull
    }
  }
  return pt;
}

/**
 * Start a background pull loop with exponential backoff.
 * Returns a stop function you must call on logout/unmount.
 */
export function startPullLoop(intervalMs = 4000) {
  let timer = null;
  let backoff = intervalMs;
  let stopped = false;

  async function tick() {
    if (stopped) return;
    try {
      await pullAndDecrypt();
      backoff = intervalMs; // reset after success
    } catch {
      backoff = Math.min(backoff * 2, 60000); // cap at 60s
    } finally {
      if (!stopped) timer = setTimeout(tick, backoff);
    }
  }

  timer = setTimeout(tick, backoff);

  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  };
}

/**
 * Wire socket push to trigger immediate pulls on "newEnvelope" events.
 * Call this after your socket connects; pass the live socket instance.
 */
export function attachEnvelopeSocket(socket) {
  if (!socket) return;
  socket.off("newEnvelope");
  socket.on("newEnvelope", async () => {
    try { await pullAndDecrypt(); } catch { /* ignore */ }
  });
}
