const auth =  require('../middleware/auth');
const admin =  require('../middleware/admin');
const validator = require('../middleware/validate');
const validateObjectId = require('../middleware/validateObjectId');
const { Product, validatePurchase } = require('../models/product');
const { Stock } = require('../models/stock');
const express = require('express');
const router = express.Router();


router.post('/:id', [auth, admin, validateObjectId, validator(validatePurchase)], async(req, res) => {     
        
    try {
        const product = await Product.lookup(req.params.id);

        if(!product)
            return res.status(404).send({ message : `Produit n'a pas été trouvé.`});

        //UPDATE BUYING PRICE
        product.calculateBuyingPrice(req.body.quantite, req.body.price);
       
        //UPDATE STOCK IN PRODUCY COLLECTION
        let stock = product.updateStock(req.body.quantite);

        //ADD NEW STOCK TO STOCK COLLECTION

        const a = await Stock.stockLog(product.code , stock);

        //ADD PURCHASE TO PRODUCT
        product.purchaseVariation.push(req.body);

        await product.save();
        
        return res.send(product); 

    } catch (error) {
        res.status(500).send(error.message);
    }
        
});



module.exports = router;