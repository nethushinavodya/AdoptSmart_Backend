import { Request, Response } from "express"
import { User } from "../models/userModel"
import { AuthRequest } from "../middlewares/auth"
import cloudinary from "../config/cloudinary"

export const updateUser = async (req : AuthRequest , res : Response) => {
   try {
      const {id} = req.params;
      console.log(id);
      const user = await User.findById(id);
      if(!user){
         return res.status(404).json({message : "User not found"})
      }

      // Ensure only owner can update
      if(user.id.toString() !== req.user.sub){
         return res.status(403).json({message : "Not allowed to update this user"})
      }

      const {
         contactNumber,
         location,
         email
      } = req.body;

      //optional image update
      if(req.file){
         console.log(req.file);
         const buffer = req.file.buffer;
         const result : any = await new Promise((resolve, reject) => {
            const upload_stream = cloudinary.uploader.upload_stream({folder : "users"}, (error, result) => {
               if(error) return reject(error);
               resolve(result);
            });
            upload_stream.end(buffer);
         });
         user.profilePicture = result.secure_url;
      }

      //   user.profilePicture = profilePicture;
      user.contactNumber = contactNumber || user.contactNumber;
      user.location = location || user.location;
      user.email = email || user.email;

      const updatedUser = await user.save();
      res.status(200).json({
         message : "User updated successfully",
         data : updatedUser
      })
   } catch (error) {
      console.log(error);
      res.status(500).json({message : "Something went wrong"})
   }
};
// delete account
export const deleteAccount = async (req : AuthRequest , res : Response) => {
   try {
      if(!req.user){
         return res.status(401).json({message : "Unauthorized"})
      }

      const {id} = req.params;
      const user = await User.findById(id);
      if(!user){
         return res.status(404).json({message : "User not found"})
      }

      // Ensure only owner can delete
      if(user.id.toString() !== req.user.sub){
         return res.status(403).json({message : "Not allowed to delete this user"})
      }

      await User.findByIdAndDelete(id);

      res.status(200).json({
         message : "User deleted successfully"
      })
   } catch (error) {
      console.log(error);
      res.status(500).json({message : "Something went wrong"})
   }
};