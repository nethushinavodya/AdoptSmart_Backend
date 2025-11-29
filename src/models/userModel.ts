import mongoose, { Document, Schema } from "mongoose";

export enum Role {
    User = "user",
    Admin = "admin",
}
export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    profilePicture?: string;
    contactNumber: string;
    location: string;
    role: Role[];
    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String }, 
    contactNumber: { type: String, required: true },
    location: { type: String, required: true },
    role: {
    type: [String],
    enum: Object.values(Role),
    default: [Role.User]
    },
  },
  {
    timestamps: true, 
  }
);

export const User = mongoose.model<IUser>("User", userSchema);
