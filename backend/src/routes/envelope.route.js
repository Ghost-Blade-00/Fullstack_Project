import express from "express";
import Envelope from "../models/envelope.model.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

const router = express.Router();

// Post encrypted envelopes (fan-out supported)
router.post("/", protectRoute, async (req, res) => {
  try {
    const { envelopes } = req.body;
    if (!Array.isArray(envelopes) || envelopes.length === 0) {
      return res.status(400).json({ message: "No envelopes" });
    }

    const docs = envelopes.map((e) => ({
      ...e,
      senderUserId: req.user._id,
      senderDeviceId: e.senderDeviceId || req.body.senderDeviceId || null,
      delivered: false,
      read: false,
    }));

    const saved = await Envelope.insertMany(docs);

    // Notify recipient users (per-user scope)
    saved.forEach((env) => {
      const sid = getReceiverSocketId(env.recipientUserId?.toString());
      if (sid) io.to(sid).emit("newEnvelope", { envelopeId: env._id, meta: { from: env.senderUserId } });
    });

    res.json({ ok: true, ids: saved.map((d) => d._id) });
  } catch (e) {
    console.error("envelopes post error", e);
    res.status(500).json({ message: "internal" });
  }
});

// Pull undelivered envelopes for the authenticated user
router.get("/pull", protectRoute, async (req, res) => {
  try {
    const docs = await Envelope.find({ recipientUserId: req.user._id, delivered: false })
      .sort({ createdAt: 1 })
      .limit(300);
    res.json(docs);
  } catch (e) {
    console.error("envelopes pull error", e);
    res.status(500).json({ message: "internal" });
  }
});

// Acknowledge delivery/read
router.post("/receipt", protectRoute, async (req, res) => {
  const { ids, kind } = req.body; // kind: "delivered" | "read"
  try {
    const update =
      kind === "read"
        ? { read: true, readAt: new Date(), delivered: true, deliveredAt: new Date() }
        : { delivered: true, deliveredAt: new Date() };

    await Envelope.updateMany({ _id: { $in: ids } }, { $set: update });
    res.json({ ok: true });
  } catch (e) {
    console.error("envelopes receipt error", e);
    res.status(500).json({ message: "internal" });
  }
});

export default router;
