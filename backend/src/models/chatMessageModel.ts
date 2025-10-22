import mongoose, { Document, Schema } from "mongoose";

export interface IChatMessage extends Document {
  roomId: string;
  user: string;
  text: string;
  timestamp: Date;
}

const chatMessageSchema = new Schema<IChatMessage>({
  roomId: { type: String, required: true },
  user: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const ChatMessage = mongoose.model<IChatMessage>("ChatMessage", chatMessageSchema);
