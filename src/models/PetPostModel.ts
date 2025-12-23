import mongoose, { Document, Schema } from "mongoose";

export interface IPet extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  species: string;
  breed: string;
  age: {
    value: number;
    unit: "Months" | "Years";
  };
  gender: string;
  description: string;
  imageUrl: string;
  adoptionType: "Free" | "Paid";
  price?: number;
  contactInfo?: string;
  location: string;
  status: "Available" | "Adopted" | "Pending";
  postStatus: "Pending" | "Approved";
  createdAt?: Date;
  updatedAt?: Date;
}

const petSchema = new Schema<IPet>(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    species: { type: String, required: true }, 
    breed: { type: String, required: true },
    age: {
      value: { type: Number, required: true },
      unit: { type: String, enum: ["Months", "Years"], required: true },
    },
    gender: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    adoptionType: {
      type: String,
      enum: ["Free", "Paid"],
      required: true,
    },
    price: { type: Number, required: function() { return this.adoptionType === "Paid"; } },
    contactInfo: { type: String },
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ["Available", "Adopted"],
      default: "Available", 
    },
    postStatus: {
      type: String,
      enum: ["Pending", "Approved"],
      default: "Pending",
      index: true,
    },
  },
  {
    timestamps: true, 
  }
);

export const Pet = mongoose.model<IPet>("Pet", petSchema);
