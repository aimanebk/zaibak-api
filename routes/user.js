const bcrypt = require('bcrypt');
const _ = require('lodash');
const auth =  require('../middleware/auth');
const checkCsrfToken =  require('../middleware/csrf');
const validation = require('../middleware/validate');
const { User, validate, createCsrfToken } = require("../models/user");
const express = require('express');
const router = express.Router();

router.post('/', validation(validate), async(req, res) => {
    try {       
        let user = await validateUser(req.body.name)
        if(user)   
            return res.status(400).send({message : 'User already registered'});

        if(req.body.password !== req.body.repeat_password)
            return res.status(400).send({message : 'Password Invalid '});
        
        user = await register(req.body);
        
        const token = user.generateAuthToken();

        return res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name']));
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/info', [auth, checkCsrfToken], async(req, res) => {
    try {
        if(!req.user)
            return res.status(400).send({ message : 'utilisateur non trouvé'});
    
        return res.send({_id : req.user._id , username : req.user.name, role : req.user.role})

    } catch (error) {
        res.status(500).send(error.message); 
    }


});

async function validateUser(name){
    const user = await User.findOne({ name : name });
    return user;
}

async function register(data){
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    
    const user = new User({
        name : data.name,
        email :  data.email,
        password : hashedPassword,
        role : data.role
    });
    
    await user.save();
    return user ;

}

module.exports = router;