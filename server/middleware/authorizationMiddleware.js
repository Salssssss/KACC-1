//Authorizes a user account's role, primarily for checking if they're an admin or not
//Read about middleware: https://www.scaler.com/topics/nodejs/middleware-in-nodejs/

const authorizeUser = (req, res, next) => {
    // Check if session exists and if the user is logged in
    if (req.session && req.session.user) {
      const userRole = req.session.user.role_name;
  
      if (userRole === 'administrator') {
        return next(); // Proceed if the user is an admin
      } else {
        return res.status(403).json({ message: 'Access forbidden: Insufficient privileges' });
      }
    } else {
      return res.status(403).json({ message: 'No valid session found' });
    }
  };
  
  module.exports = authorizeUser;
  
/*const authorizeUser = (req, res, next) => {
    const user = req.user; 
    if(user && user.role_name === 'administrator') {
        next();
    }
    else{
        return res.status(403).json({ message: 'Access deined. You are not an Administrator.'});
    }
}*/

/*module.exports = {
    authorizeUser,
};*/