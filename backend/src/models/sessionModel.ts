import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true }, 
  createdAt: { type: Date, default: Date.now },
});

sessionSchema.index({ expiresAt: 1 });
sessionSchema.index({ token: 1 });

export const Session = mongoose.model("Session", sessionSchema);
