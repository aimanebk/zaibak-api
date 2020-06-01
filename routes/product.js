const auth =  require('../middleware/auth');
const admin =  require('../middleware/admin');
const validator = require('../middleware/validate');
const { Product, validate, validateUpdate } = require('../models/product');
const express = require('express');
const router = express.Router();


router.post('/', [auth, admin, validator(validate)], async(req, res) => {     
        const product = await createProduct(req.body);
    
        return res.send(product); 
});

router.put('/:id', [auth, admin, validator(validateUpdate)], async(req, res) => {
        const result = await updateProduct(req.params.id, req.body);
        if(result.n <= 0)
            return res.status(404).send(`Produit n'a pas été trouvé.`);

        return res.send(result); 
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

async function updateProduct(id, newProduct){
    try {
        const result = await Product.updateOne({"_id" : id },
                                { 
                                    article : newProduct.article,
                                    type : newProduct.type,
                                    sellingPrice : newProduct.sellingPrice,
                                    discount : newProduct.discount,
                                    equivalents : newProduct.equivalents,
                                    notes : newProduct.notes
                                },
                                { new : true});
        return result;

    } catch (error) {
        return error.message;
    }
}

module.exports = router;