const auth =  require('../middleware/auth');
const admin =  require('../middleware/admin');
const validator = require('../middleware/validate');
const { Product, validatePurchase } = require('../models/product');
const express = require('express');
const router = express.Router();


router.post('/:id', [auth, admin, validator(validatePurchase)], async(req, res) => {     
        const product = await Product.lookup(req.params.id);

        if(!product)
            return res.status(404).send(`Produit n'a pas été trouvé.`);

        //UPDATE BUYING PRICE
        product.calculateBuyingPrice(req.body.quantite, req.body.price);
       
        //UPDATE STOCK
        product.updateStock(req.body.quantite);

        //ADD PURCHASE TO PRODUCT
        product.purchaseVariation.push(req.body);

        await product.save();
        
        return res.send(product); 
});



module.exports = router;