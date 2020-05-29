const auth =  require('../middleware/auth');
const admin =  require('../middleware/admin');
const validator = require('../middleware/validate');
const { Range, validate } = require('../models/range');
const express = require('express');
const router = express.Router();


router.post('/', [auth, admin, validator(validate)], async(req, res) => {     
        const range = await createRange(req.body);
    
        return res.send(range); 
});



async function createRange(data){
    const range =  new Range({
        name : data.name
    });

    try {
        await range.save();
        return range;

    } catch (error) {
        return error.message;
    }
}

module.exports = router;