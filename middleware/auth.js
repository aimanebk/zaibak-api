const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next){
    // const token = req.header("x-auth-token");
    const token = req.cookies["SESSIONID"];
    console.log("token => " + token);
    if(!token)
        return res.status(401).send({ message : 'Access denied. No token provided.'});

    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(400).send({ message : 'Invalid token.'})
    }    
}