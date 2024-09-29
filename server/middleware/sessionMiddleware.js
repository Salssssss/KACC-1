const session = require('express-session');

const sessionMiddleware = session({
    secret: 'placeholder-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        //Change to true if we use HTTPS
        secure: false,
        //Mitigates client-side script access
        httpOnly: true,
        //Sets session age to 1 day
        maxAge: 1000* 60 * 60 * 24
    }
});

module.exports = sessionMiddleware;