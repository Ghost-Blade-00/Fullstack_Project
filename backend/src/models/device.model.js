import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    deviceId: { type: String, required: true, index: true, unique: true },

    // Public keys (NO SECRETS)
    identitySigningEd25519: { type: String, required: true },
    identityDhX25519: { type: String, required: true },
    signedPrekey: {
      key: { type: String, required: true },
      signature: { type: String, required: true },
    },
    oneTimePrekeys: [{ key: String, used: { type: Boolean, default: false } }],

    createdAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Device", deviceSchema);
