const validate = require('../middleware/validate')
const bcrypt = require('bcrypt');
const _ = require('lodash');
const { User, validateAuth } = require("../models/user");
const express = require('express');
const router = express.Router();

router.post('/', validate(validateAuth), async(req, res) => {
    try {     
        let user = await validateUser(req.body.name)
        if(!user)   
            return res.status(400).send({message : 'Invalid name or password.'});

        const validPassword = await validatePassword(req.body.password, user.password);
        if(!validPassword)   
            return res.status(400).send({message : 'Invalid name or password.'});
        
        const token = user.generateAuthToken();
        return res.send({_id : user._id , username : user.name, role : user.role, token : token});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

async function validateUser(name){
    const user = await User.findOne({ name : new RegExp(`^${name}$`, 'i') });
    return user;
}

async function validatePassword(pass1, pass2){
    const result = await bcrypt.compare(pass1, pass2);
    return result;
}

module.exports = router;