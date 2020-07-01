const cors = require('cors')

var allowCrossDomain = function(req, res, next){
    var allowedOrigins = ['http://localhost:4200', 'https://stark-dawn-53505.herokuapp.com',
                          'https://zaibak.web.app'];
	var origin = req.headers.origin;
	if(allowedOrigins.indexOf(origin) > -1){
	   res.setHeader('Access-Control-Allow-Origin', origin);
	}
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, HEAD, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type', 'Authorization');
    next();
}



module.exports = function(app){
    app.options('*', cors())
    app.use(allowCrossDomain);
}