const auth =  require('../middleware/auth');
const admin =  require('../middleware/admin');
const checkCsrfToken =  require('../middleware/csrf');
const validator = require('../middleware/validate');
const { Range, validate } = require('../models/range');
const express = require('express');
const router = express.Router();

router.get('/', [auth, checkCsrfToken, admin], async(req, res) => {
    try {
        const ranges = await getRanges();
        return res.send(ranges); 

    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.post('/', [auth, admin, validator(validate)], async(req, res) => {     
    try {
        const range = await createRange(req.body);
    
        return res.send(range); 

    } catch (error) {
        res.status(500).send(error.message);  
    }
});

async function getRanges(){
    const ranges = await Range.find();
    return ranges;
}


async function createRange(data){
    const range =  new Range({
        name : data.name
    });

    await range.save();
    return range;
}

module.exports = router;