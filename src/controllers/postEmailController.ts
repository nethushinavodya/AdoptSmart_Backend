import nodemailer from 'nodemailer';
import { Request, Response } from "express";
import { Pet } from '../models/PetPostModel';
import { User } from '../models/userModel';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nethushiperera03@gmail.com',
    pass: 'tamlkaoprefnkstm',
  },
});

type AuthedRequest = Request & { user?: any };

export const contactOwnerToAdoptPet = async (req: AuthedRequest, res: Response) => {
  try {
    const { postId } = req.params as { postId: string };
    const { message } = req.body as { message?: string };

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const senderId = req.user?.sub || req.user?._id || req.user?.id;
    if (!senderId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const post = await Pet.findById(postId).populate("ownerId", "email username");
    if (!post) return res.status(404).json({ message: "Pet post not found" });

    const owner: any = (post as any).ownerId;
    const ownerEmail = owner?.email;
    if (!ownerEmail) return res.status(400).json({ message: "Post owner email not found" });

    const sender = await User.findById(senderId).select("email username");
    const senderEmail = (sender as any)?.email;
    if (!senderEmail) return res.status(400).json({ message: "Sender email not found" });

    const petName = (post as any).name || "this pet";
    const species = (post as any).species || "";
    const breed = (post as any).breed || "";

    const subject = `Adoption request: ${petName}${species ? ` (${species})` : ""}`;
    const text =
      `Hi${owner?.username ? ` ${owner.username}` : ""},\n\n` +
      `A user is interested in adopting your pet post:\n` +
      `- Name: ${petName}\n` +
      `${species ? `- Species: ${species}\n` : ""}` +
      `${breed ? `- Breed: ${breed}\n` : ""}` +
      `\n` +
      `Message:\n${message.trim()}\n\n` +
      `Reply to this email to contact the adopter.\n` +
        `Sender email: ${senderEmail}` +
      `\n\nBest regards,\nAdoptSmart Team`;

    await transporter.sendMail({
      from: `"AdoptSmart" <noreply@adoptsmart.com>`,
      to: ownerEmail,
      subject,
      text
    });

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending adoption email:", error);
    return res.status(500).json({ message: "Failed to send email" });
  }
};
