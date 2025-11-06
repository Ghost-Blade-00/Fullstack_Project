import mongoose from "mongoose";

const envelopeSchema = new mongoose.Schema(
  {
    conversationId: { type: String, index: true },
    senderUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    senderDeviceId: { type: String, index: true },
    recipientUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    recipientDeviceId: { type: String, index: true },

    // Only encrypted/meta data (NO plaintext)
    counter: { type: Number },
    ratchetPub: { type: String },
    header: { type: String },
    aad: { type: String },
    ciphertext: { type: String, required: true },
    nonce: { type: String, required: true },

    // Attachments (ciphertext stored in GridFS; keys are in plaintext payload of message)
    attachmentIds: [String],

    delivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    read: { type: Boolean, default: false },
    readAt: { type: Date },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Optional metadata retention window (30 days)
envelopeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export default mongoose.model("Envelope", envelopeSchema);
