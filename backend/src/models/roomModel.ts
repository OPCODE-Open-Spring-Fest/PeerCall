import mongoose, { Schema, Document } from "mongoose";

export interface IRoom extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  members: mongoose.Types.ObjectId[];
  host: mongoose.Types.ObjectId; // 👈 identifies who created/owns the room
  isActive: boolean;             // 👈 track whether the room is still active
  createdAt: Date;
}

const roomSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // host reference
  isActive: { type: Boolean, default: true }, // true until ended or empty
  createdAt: { type: Date, default: Date.now },
});

// ✅ Optional cleanup or logic
// When all members leave, mark as inactive automatically (not delete immediately)
roomSchema.methods.deactivateIfEmpty = async function () {
  if (this.members.length === 0) {
    this.isActive = false;
    await this.save();
  }
};

// Optional: auto-remove inactive rooms after certain time
// roomSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 }); // expires in 7 days

export default mongoose.model<IRoom>("Room", roomSchema);
