import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // optional for SSO users
  ssoProvider?: string; // "google" or "github"
  ssoId?: string;
  createdAt: Date;
}

const userSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, default: "" }, // empty for SSO accounts
    ssoProvider: { type: String, enum: ["google", "github"], default: null },
    ssoId: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);