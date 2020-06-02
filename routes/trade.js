const auth =  require('../middleware/auth');
const admin = require('../middleware/admin');
const { Trade } = require('../models/trade');
const express = require('express');
const router = express.Router();


router.get('/', [auth, admin], async(req, res) => {     
    const trades = await getTrades();
    return res.send(trades);        
});


async function getTrades(){
    try {
        const trades = await Trade.find();
        return trades;
    } catch (error) {
        return error.message;
    }

}




module.exports = router;