const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET

const authMiddleware = (req,res,next)=>{
    const authHeader = req.headers.authorization || "";
    const bearerToken = authHeader.toLowerCase().startsWith("bearer ")
        ? authHeader.slice(7).trim()
        : null;
    const token = req.cookies?.token || bearerToken;

    if(!token){
        return res.status(401).json({
            success:false,
            message:"Unauthorized access"
        });
    }
    try{
        const decoded = jwt.verify(token,secretKey);
        req.userId = decoded.userId;
        next();
    }catch{
        return res.status(401).json({
            success:false,
            message:"Invalid or expired token"
        });
    }
}
module.exports = authMiddleware;
