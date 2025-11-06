import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";

import Device from "../models/device.model.js";

const router = express.Router();

// Register or update device public bundle
router.post("/register", protectRoute, async (req, res) => {
  try {
    const { deviceId, identitySigningEd25519, identityDhX25519, signedPrekey, oneTimePrekeys } = req.body;
    if (!deviceId || !identitySigningEd25519 || !identityDhX25519 || !signedPrekey) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const up = await Device.findOneAndUpdate(
      { deviceId },
      {
        userId: req.user._id,
        deviceId,
        identitySigningEd25519,
        identityDhX25519,
        signedPrekey,
        oneTimePrekeys: oneTimePrekeys || [],
        lastSeenAt: new Date(),
        revokedAt: null,
      },
      { upsert: true, new: true }
    );

    res.json({ ok: true, deviceId: up.deviceId });
  } catch (e) {
    console.error("device/register error", e);
    res.status(500).json({ message: "internal" });
  }
});

// Get public bundles for a user's devices
router.get("/bundles/:userId", protectRoute, async (req, res) => {
  try {
    const devices = await Device.find({
      userId: req.params.userId,
      $or: [{ revokedAt: null }, { revokedAt: { $exists: false } }],
    }).select("deviceId identitySigningEd25519 identityDhX25519 signedPrekey oneTimePrekeys");
    res.json(devices);
  } catch (e) {
    console.error("device/bundles error", e);
    res.status(500).json({ message: "internal" });
  }
});

// Mark one-time prekey as consumed (idempotent)
router.post("/consume-otp", protectRoute, async (req, res) => {
  const { deviceId, prekey } = req.body;
  try {
    const doc = await Device.findOneAndUpdate(
      { deviceId, "oneTimePrekeys.key": prekey },
      { $set: { "oneTimePrekeys.$.used": true } },
      { new: true }
    );
    res.json({ ok: true, consumed: !!doc });
  } catch (e) {
    console.error("device/consume-otp error", e);
    res.status(500).json({ message: "internal" });
  }
});

export default router;
