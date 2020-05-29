const express = require('express');
const app = express();

const mongoose = require('mongoose');
const config = require('config');
const cors = require('cors')

var allowCrossDomain = function(req, res, next){
	var allowedOrigins = ['http://localhost:4200'];
	var origin = req.headers.origin;
	if(allowedOrigins.indexOf(origin) > -1){
	   res.setHeader('Access-Control-Allow-Origin', origin);
	}
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, HEAD, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type', 'Authorization');
    next();
}

app.options('*', cors())

app.use(allowCrossDomain);


const auth = require('./routes/auth');
const user = require('./routes/user');
const range = require('./routes/range');

app.use(express.json());
app.use('/api/auth', auth);
app.use('/api/user', user);
app.use('/api/range', range);

const db = config.get('db');

mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex : true,
    retryWrites: false})
.then(() => console.log(`Connected to ${db} ...`));

const port = process.env.PORT || 3000 ;

app.listen(port, () => { console.log(`Listening on the port ${port} ...`) });