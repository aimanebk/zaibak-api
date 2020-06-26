module.exports = function(req, res, next){
    if(!req.user.role || req.user.role != 'Admin' )
        return res.status(403).send({ message : 'Access denied.'});

    next();
}