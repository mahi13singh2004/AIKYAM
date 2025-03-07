import jwt from "jsonwebtoken"

const generateTokenAndSetCookie=(res,userId)=>{
    const token=jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn:"30d",
    })

    res.cookie("token",token,{
        maxAge:30*24*60*60*1000,
        httpOnly:true,
        sameSite:"strict",  
        secure:process.env.NODE_ENV==="production",
    })
    return token
}

export default generateTokenAndSetCookie