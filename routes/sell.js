const auth =  require('../middleware/auth');
const validator = require('../middleware/validate');
const validateObjectId = require('../middleware/validateObjectId');
const { Product } = require('../models/product');
const { Trade , validate } = require('../models/trade');
const { Stock } = require('../models/stock');
const express = require('express');
const router = express.Router();


router.post('/:id', [auth, validateObjectId, validator(validate)], async(req, res) => {     
        try {
           //CHECK THE PRODUCT EXISTANCE
            const product = await Product.lookup(req.params.id);     

            if(!product)
                return res.status(404).send({ message : `Produit n'a pas été trouvé.`});

            //CHECK THE PRODUCT IN STOCK
            let numberInStock = product.stock - req.body.quantity;
            if(numberInStock < 0 )
                return res.status(400).send({ message : `Cette quantité n'existe pas en stock`});

            //UPDATE STOCK IN PRODUCY COLLECTION
            let stock = product.updateStock(-req.body.quantity);

            //ADD NEW STOCK TO STOCK COLLECTION

            const a = await Stock.stockLog(product.code , stock);
            await product.save();

            //ADD SELL TO TRADES
            const trade = await addSell(product, req.body);
        
            return res.send(trade);         
        } catch (error) {
            res.status(500).send(error.message);
        }
         
});


async function addSell(product , data){
    const trade =  new Trade({
        code : product.code,
        article : product.article,
        username : data.username,
        quantity : -data.quantity,
        price : data.price,
        description : "Sell"
    });

    try {
        await trade.save();
        return trade;

    } catch (error) {
        return error.message;
    }
}



module.exports = router;