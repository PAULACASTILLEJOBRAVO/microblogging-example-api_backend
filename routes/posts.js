var express = require('express');
var router = express.Router();

router.use(function timeLog(req, res, next){
    console.log("Fecha actual: ", Date.now());
    next();
});

router.get('/', function(req,res) {
    res.send("Página inicial de los posts");
});

router.get('/about', function(req, res) {
    res.send("Acerca de los posts");
});

module.exports = router;