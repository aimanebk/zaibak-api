const express = require('express');
const app = express();

require('./startup/mongo')();
require('./startup/cors')(app);
require('./startup/config')();
require('./startup/cookie')(app);
require('./startup/routes')(app);
require('./startup/prod')(app);


const port = process.env.PORT || 3000 ;

app.listen(port, () => { console.log(`Listening on the port ${port} ...`) });