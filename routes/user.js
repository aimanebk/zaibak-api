const bcrypt = require('bcrypt');
const _ = require('lodash');
const auth =  require('../middleware/auth');
const { User, validate } = require("../models/user");
const express = require('express');
const router = express.Router();

router.post('/', async(req, res) => {
    try {
        const { error } = validate(req.body);
        if(error)
            return res.status(400).send(error.details[0].message);
        
        let user = await validateUser(req.body.name)
        if(user)   
            return res.status(400).send('User already registered');

        if(req.body.password !== req.body.repeat_password)
            return res.status(400).send('Password Invalid ');
        
        user = await register(req.body);
        
        const token = user.generateAuthToken();

        return res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name']));
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/role', [auth], async(req, res) => {
    if(!req.user)
        return res.status(400).send({ message : 'utilisateur non trouvé'});
    
    return res.send({role : req.user.role})

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
    try {
        await user.save();
        return user ;
    } catch (error) {
        return error.message;
    }
}

module.exports = router;