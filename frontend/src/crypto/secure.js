export async function sendSecureText(toUserId, text) {
  const { data: bundles } = await axiosInstance.get(`/devices/bundles/${toUserId}`);
  const envelopes = [];
  const now = Date.now();

  for (const dev of bundles) {
    await ensurePeerSession(toUserId, dev);

    const aad = {
      toUserId,
      ts: now,
      typ: "text",
      dev: dev.deviceId,
    };
    const env = await ratchetEncrypt(dev.deviceId, text, aad);

    envelopes.push({
      conversationId: [toUserId].sort().join(":"), // add your own user id if you prefer stable ordering
      recipientUserId: toUserId,
      recipientDeviceId: dev.deviceId,
      ratchetPub: env.myRatchetPub,
      header: env.header,
      aad: env.header,
      ciphertext: env.ciphertext,
      nonce: env.nonce,
      counter: env.counter
    });
  }

  await axiosInstance.post("/envelopes", { envelopes });
}
