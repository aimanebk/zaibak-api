const mongoose = require('mongoose');
const config = require('config');

module.exports = function(){
    const db = config.get('db')
    mongoose.connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex : true,
        retryWrites: false})
    .then(() => console.log(`Connected to ${db} ...`))
}

