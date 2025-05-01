var debug = require("debug")("microblogging-example-api:verifyToken");

var jwt = require("jsonwebtoken");

const dotenv = require('dotenv');
dotenv.config();

function tokenVerify (req, res, next) {
    const authHeader = req.get('authorization');
    
    if (!authHeader) {
        debug("No se proporcionó token de autorización");

        return res.status(401).send({
            ok: false,
            message: "No se proporcionó token de autorización"
        })
    }
    
    const token = authHeader.split(' ')[1];
    
    if(!token){
        debug("Token no válido o malformado");

        return res.status(401).send({
            ok: false,
            message: "Token no válido o malformado"
        })
    }
    
           
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
        if (err) {
            debug("Token inválido");

            return res.status(401).send({
                ok: false,
                message: "Token inválido"
            });
        }

        debug("Token válido. Decodificando");

        req.user = decoded;
        next();
    });
}

module.exports = tokenVerify;