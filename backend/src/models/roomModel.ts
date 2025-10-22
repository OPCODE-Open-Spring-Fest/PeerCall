import mongoose, { Schema, Document } from "mongoose";

export interface IRoom extends Document {
    name: string;
    members: mongoose.Types.ObjectId[];
    createdAt: Date;
}

const roomSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IRoom>("Room", roomSchema);
