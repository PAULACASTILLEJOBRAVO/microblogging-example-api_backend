var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render(
    "index", 
    {
      titulo: 'Microblogging example api', 
      mensaje: [
        'API del blog de Aika Kenshi!',
        '',
        'JSON de usuarios: /users/all',
        '',
        'JSON de blogs: /posts/all'
      ]
    }
  );
});

module.exports = router;
