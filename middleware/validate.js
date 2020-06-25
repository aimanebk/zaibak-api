module.exports = function(validation){
    return (req, res, next) => {
        const { error } = validation(req.body);
        if(error){
            console.log(error.details[0].message);
            return res.status(400).send({ message : `Formulaire n'est pas valide`});
        }

        next();
    }
}
