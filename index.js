const express = require('express');
const app = express();

require('./startup/mongo')();
require('./startup/cors')(app);
require('./startup/routes')(app);


const port = process.env.PORT || 3000 ;

app.listen(port, () => { console.log(`Listening on the port ${port} ...`) });