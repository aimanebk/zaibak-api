const admin =  require('../middleware/admin');
const auth =  require('../middleware/auth');
const validator = require('../middleware/validate');
const { Product } = require('../models/product');
const { Trade , validate } = require('../models/trade');
const express = require('express');
const router = express.Router();


router.post('/:id', [auth, admin, validator(validate)], async(req, res) => {     

        //CHECK THE PRODUCT EXISTANCE
        const product = await Product.lookup(req.params.id);     

        if(!product)
            return res.status(404).send(`Produit n'a pas été trouvé.`);

        //UPDATE PRODUCT STOCK
        product.updateStock(req.body.quantity);
        await product.save();

        //ADD SELL TO TRADES
        const trade = await addReturn(product, req.body);
    
        return res.send(trade);         
});


async function addReturn(product , data){
    const trade =  new Trade({
        code : product.code,
        article : product.article,
        username : data.username,
        quantity : data.quantity,
        price : -data.price,
        description : "Return"
    });

    try {
        await trade.save();
        return trade;

    } catch (error) {
        return error.message;
    }
}



module.exports = router;