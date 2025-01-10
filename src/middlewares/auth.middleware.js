import { User } from "../model/user.model.js";
import { ApiError } from "../utility/ApiError.js";
import { asyncHandler } from "../utility/asyncHandler.js";
import jwt from "jsonwebtoken";

export  const verifyJWT = asyncHandler(async(req, _, next) => {
   try {
     const token = req.cookies?.accessToken || Headers("Athorization")?.replace("Bearer ", "")
 
     if(!token) {
         throw new ApiError(404, "Unauthorized request")
     }
 
     const decodedToken = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN)
 
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
     
     if(!user) {
         throw new ApiError(404, "Invalid Access Token")
     }
 
     req.user = user
     next()
   } catch (error) {
    throw new ApiError(404, "Invalid access token")
   }
})