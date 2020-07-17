module.exports = function(req, res, next){
    const csrfCookie = req.cookies["XSRF-TOKEN"];

    const csrfHeader = req.headers['x-xsrf-token'];

    if (csrfCookie && csrfHeader && csrfCookie === csrfHeader) {
        next();
    }else {
        return res.status(403).send({ message : 'Forbidden.'});
    }
}

