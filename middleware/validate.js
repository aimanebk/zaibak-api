module.exports = function(validation){
    return (req, res, next) => {
        const { error } = validation(req.body);
        if(error)
            return res.status(400).send({ message : error.details[0].message});

        next();
    }
}
