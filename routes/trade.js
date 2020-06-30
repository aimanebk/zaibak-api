const auth =  require('../middleware/auth');
const admin = require('../middleware/admin');
const { Trade } = require('../models/trade');
const express = require('express');
const router = express.Router();


router.get('/', [auth, admin], async(req, res) => {  
    try {
        const trades = await getTrades();
        return res.send(trades);  
    } catch (error) {
        res.status(500).send(error.message);  
    }        
});


async function getTrades(){
    const trades = await Trade.find().sort({date : -1});
    return trades;
}




module.exports = router;