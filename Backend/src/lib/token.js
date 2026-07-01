const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET

const generateToken = (userId) => {
    return jwt.sign({userId},secretKey,{expiresIn:'1h'});
}
export {generateToken}