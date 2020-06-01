const auth =  require('../middleware/auth');
const validator = require('../middleware/validate');
const { Product, validateSell } = require('../models/product');
const { Trade } = require('../models/trade');
const express = require('express');
const router = express.Router();


router.post('/:id', [auth, validator(validateSell)], async(req, res) => {     

        //CHECK THE PRODUCT EXISTANCE
        const product = await Product.lookup(req.params.id);     

        if(!product)
            return res.status(404).send(`Produit n'a pas été trouvé.`);

        //CHECK THE PRODUCT IN STOCK
        let numberInStock = product.stock - req.body.quantity;
        if(numberInStock < 0 )
            return res.status(400).send(`Cette quantité n'existe pas en stock`);

        //UPDATE PRODUCT STOCK
        product.updateStock(-req.body.quantity);
        await product.save();

        //ADD SELL TO TRADES
        const trade = await addSell(product, req.body);
    
        return res.send(trade);         
});


async function addSell(product , data){
    const trade =  new Trade({
        code : product.code,
        article : product.article,
        username : data.username,
        quantity : data.quantity,
        price : data.price
    });

    try {
        await trade.save();
        return trade;

    } catch (error) {
        return error.message;
    }
}



module.exports = router;