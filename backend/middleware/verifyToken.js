import jwt from "jsonwebtoken"
import User from "../models/auth.model.js"

const verifyToken=async (req,res,next)=>{
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(401).json({message:"Unauthorized: No token"})
    }
    try {
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        if(!decoded){
            return res.status(401).json({message:"Unauthorized:Invalid or expired token"})
        }
        const user=await User.findById(decoded.userId)
        if(!user){
            return res.status(401).json({message:"Unauthorized:User not found"})
        }
        req.user=user
        next()
    } 
    catch (error) {
        console.log("Error in verifyToken middleware",error)
        return res.status(500).json({message:"Internal server error"})
    }
}

export default verifyToken
