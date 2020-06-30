const express = require('express');
const auth = require('../routes/auth');
const user = require('../routes/user');
const range = require('../routes/range');
const supplier = require('../routes/supplier');
const product = require('../routes/product');
const purchase = require('../routes/purchase');
const sell = require('../routes/sell');
const returns = require('../routes/return');
const trade = require('../routes/trade');
const report = require('../routes/report');


module.exports = function(app){
    app.use(express.json());
    app.use('/api/auth', auth);
    app.use('/api/user', user);
    app.use('/api/range', range);
    app.use('/api/supplier', supplier);
    app.use('/api/product', product);
    app.use('/api/purchase', purchase);
    app.use('/api/sell', sell);
    app.use('/api/return', returns);
    app.use('/api/trade', trade);
    app.use('/api/report', report);
}