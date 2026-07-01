const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET

const authMiddleware = (req,res,next)=>{
    const token = req.cookies.token;

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