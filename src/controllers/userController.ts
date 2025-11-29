import { Request, Response } from "express"
import { User } from "../models/userModel"
import { AuthRequest } from "../middlewares/auth"
import cloudinary from "../config/cloudinary"

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