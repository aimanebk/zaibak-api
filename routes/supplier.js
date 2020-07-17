const auth =  require('../middleware/auth');
const admin =  require('../middleware/admin');
const checkCsrfToken =  require('../middleware/csrf');
const validator = require('../middleware/validate');
const { Supplier, validate } = require('../models/supplier');
const express = require('express');
const router = express.Router();

router.get('/', [auth, checkCsrfToken, admin], async(req, res) => {
    try {
        const suppliers = await getSuppliers();
        return res.send(suppliers); 

    } catch (error) {
        res.status(500).send(error.message);
    }
});


router.post('/', [auth, admin, validator(validate)], async(req, res) => {  
    try {
        const supplier = await createSupplier(req.body);
    
        return res.send(supplier);   
    } catch (error) {
        res.status(500).send(error.message);  
    }   
});

async function getSuppliers(){
    const suppliers = await Supplier.find();
    return suppliers;
}


async function createSupplier(data){
    const supplier =  new Supplier({
        name : data.name
    });

    await supplier.save();
    return supplier;

}

module.exports = router;