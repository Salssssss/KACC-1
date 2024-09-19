//Authorizes a user account's role, primarily for checking if they're an admin or not
//Read about middleware: https://www.scaler.com/topics/nodejs/middleware-in-nodejs/

const authorizeUser = (req, res, next) => {
    const user = req.user; 
    if(user && user.role === 'admin') {
        next();
    }
    else{
        return res.status(403).json({ message: 'Access deined. You are not an Administrator.'});
    }
}

module.exports = {
    authorizeUser,
};