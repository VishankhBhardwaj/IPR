const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const { generateToken } = require("../lib/token");

const registerUser = async(req,res)=>{
    try{
        const {name,email,password,role} = req.body;
        if(!name || !email || !password){
            return res.status(400).json({
                success:false,
                message:"All required fields are mandatory"
            });
        }
        const existingUser = await prisma.user.findUnique({
            where:{
                email:email
            }
        })
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User with this email already exists"
            });
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const newUser = await prisma.user.create({
            data:{
                name:name,
                email:email,
                password:hashedPassword,
                role: role || "STUDENT"
            }
        })
        const token = generateToken(newUser.id);
        res.cookie("token",token,{
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:"strict",
            maxAge:3600*1000
        })
        return res.status(201).json({
            success:true,
            message:"User registered successfully",
            token:token
        })
    }catch(error){
        console.error("Error in registerUser:", error);
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        });
    }
}
const loginUser = async(req,res)=>{
    try{
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"All required fields are mandatory"
            });
        }
        const user = await prisma.user.findUnique({
            where:{
                email:email
            }
        })
        if(!user){
            return res.status(400).json({
                success:false,
                message:"Invalid email or password"
            });
        }
        const isPasswordValid = await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            return res.status(400).json({
                success:false,
                message:"Invalid email or password"
            });
        }
        const token = generateToken(user.id);
        res.cookie("token",token,{
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:"strict",
            maxAge:3600*1000
        })
        return res.status(200).json({
            success:true,
            message:"User logged in successfully",
            token:token
        })
    }catch(error){
        console.error("Error in loginUser:", error);
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        });
    }
}

const logoutUser = async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });
    return res.status(200).json({
        success: true,
        message: "User logged out successfully"
    });
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser
};