import mongoose, { Document, Schema } from "mongoose";

export interface ISuccessStory extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    title: string;
    description: string;
    images: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

const successStorySchema = new Schema<ISuccessStory>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
        },

        images: {
            type: [String],
            validate: {
                validator: function (value: string[]) {
                    return value.length >= 1 && value.length <= 4;
                },
                message: "You can upload minimum 1 and maximum 4 images.",
            },
            required: true,
        },
    },
    { timestamps: true }
);

export const SuccessStory = mongoose.model<ISuccessStory>(
    "SuccessStory",
    successStorySchema
);
