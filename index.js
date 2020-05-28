const express = require('express');
const app = express();

const mongoose = require('mongoose');
const config = require('config');


const auth = require('./routes/auth');
const user = require('./routes/user');

app.use(express.json());
app.use('/api/auth', auth);
app.use('/api/user', user);

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