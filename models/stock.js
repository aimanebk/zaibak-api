const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    productCode : {
        type : String,
        required : true,
        minlength : 3,
        maxlength : 50,
        trim : true
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

stockSchema.statics.stockLog = function(productCode, newStock){
    const stock = new Stock({
        productCode : productCode,
        stock : newStock
    });
    
    return stock.save();
}

const Stock = mongoose.model('Stock', stockSchema);


module.exports.Stock = Stock;