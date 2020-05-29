const auth =  require('../middleware/auth');
const admin =  require('../middleware/admin');
const validator = require('../middleware/validate');
const { Supplier, validate } = require('../models/supplier');
const express = require('express');
const router = express.Router();


router.post('/', [auth, admin, validator(validate)], async(req, res) => {     
        const supplier = await createSupplier(req.body);
    
        return res.send(supplier); 
});



async function createSupplier(data){
    const supplier =  new Supplier({
        name : data.name
    });

    try {
        await supplier.save();
        return supplier;

    } catch (error) {
        return error.message;
    }
}

module.exports = router;