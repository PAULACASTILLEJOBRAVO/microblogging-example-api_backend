var express = require("express");
var jwt = require("jsonwebtoken");
var router = express.Router();

// Token generation imports
const dotenv = require('dotenv');
dotenv.config();

var debug = require("debug")("microblogging-example-api:users-route");

//Models
var User = require("../models/User.js");

function tokenVerify (req, res, next) {
    const authHeader = req.get('authorization');
    
    if (!authHeader) {
        return res.status(401).send({
            ok: false,
            message: "No se proporcionó token de autorización"
        })
    }
    
    const token = authHeader.split(' ')[1];
    
    if(!token){
        return res.status(401).send({
            ok: false,
            message: "Token no válido o malformado"
        })
    }
    
           
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                ok: false,
                message: "Token inválido"
            });
        }

        req.user = decoded;
        next();
    });
}

//GET de todos los usuarios
router.get("/all", (req, res) => {
    debug("Acceso a todos los usuarios");

    User.find().sort("-creationdate").populate("posts")
    .then(users => {
        if(!users) return res.status(404).send({ message: "Usuario no encontrado" });
        res.status(200).json({ message: "Usuarios encontrados correctamente", users});
    })
    .catch(error =>  res.status(500).send({ message: "Error al obtener usuarios", error }));
});

// GET de un único usuario por su Id
router.get("/secure/:id", tokenVerify, (req, res) => {
    debug("Acceso seguro con token a un solo usuario");

    User.findById(req.params.id).sort("-creationdate").populate("posts")
    .then(users => {
        if(!users) return res.status(404).send({ message: "Usuario no encontrado" });
        res.status(200).json({ message: "Usuarios encontrados correctamente", users});
    })
    .catch(error => res.status(500).send({ message: "Error al obtener el usuario", error }));
});

// POST de un nuevo usuario
router.post("/secure", tokenVerify, (req, res) => {
    debug("Creación segura con token de un usuario");

    User.create(req.body)
    .then(() => res.status(200).send({ message: "Usuario creado correctamente" }))
    .catch(error => res.status(500).send({ message: "Error al crear el usuario", error }));
});

//PUT de un usuario existente identificado por su Id
router.put("/secure/:id", tokenVerify, (req, res) => {
    debug("Modificación segura con token de un usuario");

    User.findByIdAndUpdate(req.params.id, req.body, {new: true})
    .then(users => {
        if (!users) return res.status(404).send({ message: "Usuario no encontrado" });
        res.status(200).send({ message: "Usuario modificado correctamente" })
    })
    .catch(error => res.status(500).send({ message: "Error al modificar el usuario", error }));
});

// DELETE de un usuario existente identificado por su Id
router.delete("/secure/:id", tokenVerify, (req, res) => {
    debug("Borrado seguro con token de un usuario");

    User.findByIdAndDelete(req.params.id)
    .then(users => { 
        if (!users) return res.status(404).send({ message: "Usuario no encontrado" });
        res.status(200).send({ message: "Usuario borrado correctamente" })
    })
    .catch(error => res.status(500).send({ message: "Error al eliminar el usuario", error }));
});

//LOGIN
router.post("/signin", function (req, res) {
    debug("¡Login!");
    debug("Body recibido:", req.body);

    const {username, password} = req.body;

    User.findOne({username})
    .then(user => {
        if(!user){
            debug("El usuario no existe");
            return res.status(401).send({ message: "Usuario no existe" });
        }

        debug("Usuario encontrado", user);

        if(!user.password){
            debug("El usuario no tiene contraseña");
            return res.status(500).send({ message: "Usuario no tiene contraseña" });
        }

        return user.comparePassword(password)
        .then(isMatch => {
            if(!isMatch){
                debug("La contraseña no coincide");
                return res.status(401).send({ message: "Contraseña no coincide" });
            }

            const token = jwt.sign(
                {id: user._id, username: user.username, role: user.role},
                process.env.TOKEN_SECRET,
                { expiresIn: 3600 }
            );

            res.status(200).send({
                message: "ok",
                token: token,
                id: user._id,
                email: user.email,
                role: user.role
            });
        })
        .catch(err => {
            console.error("Error comparar contraseña", err);
            res.status(500).send("¡Error comparando la contraseña!");
        });
    })
    .catch(err => {
        console.error("Error en /signin:", err);
        res.status(500).send("¡Error comprobando usuario o contraseña!");
    });
});

module.exports = router;
