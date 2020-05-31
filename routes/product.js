const auth =  require('../middleware/auth');
const admin =  require('../middleware/admin');
const validator = require('../middleware/validate');
const { Product, validate } = require('../models/product');
const express = require('express');
const router = express.Router();


router.post('/', [auth, admin, validator(validate)], async(req, res) => {     
        const product = await createProduct(req.body);
    
        return res.send(product); 
});




async function createProduct(data){
    const product =  new Product({
        code : data.code,
        article : data.article,
        type : data.type,
        sellingPrice : data.sellingPrice,
        discount : data.discount,
        equivalents : data.equivalents,
        notes : data.notes
    });

    try {
        await product.save();
        return product;

    } catch (error) {
        return error.message;
    }
}

module.exports = router;