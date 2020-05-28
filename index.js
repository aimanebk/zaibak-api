const express = require('express');
const app = express();

const auth = require('./routes/auth');

app.use(express.json());
app.use('/api/auth', auth);

const port = process.env.PORT || 3000 ;

app.listen(port, () => { console.log(`Listening on the port ${port} ...`) });