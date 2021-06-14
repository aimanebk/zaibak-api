const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    productId : {
        type: mongoose.Schema.Types.ObjectId, 
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default : 0
    },
    date: {
        type: Date,
        default: Date.now
    }    
});

stockSchema.statics.stockLog = function(productId, newStock){
    const stock = new Stock({
        productId : productId,
        stock : newStock
    });
    
    return stock.save();
}

const Stock = mongoose.model('Stock', stockSchema);


module.exports.Stock = Stock;