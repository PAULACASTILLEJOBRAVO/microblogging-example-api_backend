var express = require("express");
var router = express.Router();

var debug = require("debug")("microblogging-example-api:users-route");

var jwt = require("jsonwebtoken");

//Models
var User = require("../models/User.js");

//Security
const tokenVerify = require("../middlewares/tokenVerify.js");

//GET de todos los usuarios
router.get("/all", (req, res) => {
    debug("Acceso a todos los usuarios");
    debug("Parametros recibidos:", req.params);

    User.find().sort("-creationdate").populate("posts")
    .then(users => {
        if(!users) return res.status(404).send({ message: "Usuario no encontrado" });
        debug("Usuarios encontrados: ", users);
        res.status(200).json({ message: "Usuarios encontrados correctamente", users});
    })
    .catch(error =>  res.status(500).send({ message: "Error al obtener usuarios", error: error.message }));
});

// GET de un único usuario por su Id
router.get("/secure/:id", tokenVerify, (req, res) => {
    debug("Acceso seguro con token a un solo usuario");
    debug("Parametros recibidos:", req.params);

    User.findById(req.params.id)
    .then(users => {
        if(!users) return res.status(404).send({ message: "Usuario no encontrado" });
        debug("Usuario encontrado:", users);
        res.status(200).json({ message: "Usuario encontrado correctamente", users});
    })
    .catch(error => res.status(500).send({ message: "Error al obtener el usuario", error: error.message }));
});

// POST de un nuevo usuario
router.post("/", (req, res) => {
    debug("Creación de un usuario");
    debug("Parametros recibidos:", req.params);
    debug("Body recibido:", req.body);

    User.create(req.body)
    .then(() => res.status(200).send({ message: "Usuario creado correctamente" }))
    .catch(error => {
        if (error.code === 11000) {
            return res.status(400).send({ message: "El username ya está en uso", error: error.message });
        }

        res.status(500).send({ message: "Error al crear el usuario", error: error.message })
    });
});

//PUT de un usuario existente identificado por su Id
router.put("/secure/:id", tokenVerify, (req, res) => {
    debug("Modificación segura con token de un usuario");
    debug("Parametros recibido:", req.params);
    debug("Body recibido:", req.body);

    User.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(users => {
        if (!users) return res.status(404).send({ message: "Usuario no encontrado" });
        debug("Usuario encontrado: ", users);
        res.status(200).send({ message: "Usuario modificado correctamente" })
        debug("Usuario modificado correctamente");
    })
    .catch(error => res.status(500).send({ message: "Error al modificar el usuario", error: error.message }));
});

// DELETE de un usuario existente identificado por su Id
router.delete("/secure/:id", tokenVerify, (req, res) => {
    debug("Borrado seguro con token de un usuario");
    debug("Parametros recibidos:", req.params);

    User.findByIdAndDelete(req.params.id)
    .then(users => { 
        if (!users) return res.status(404).send({ message: "Usuario no encontrado" });
        debug("Usuario encontrado: ", users);
        res.status(200).send({ message: "Usuario borrado correctamente" })
        debug("Usuario borrado correctamente");
    })
    .catch(error => res.status(500).send({ message: "Error al eliminar el usuario", error: error.message }));
});

//LOGIN
router.post("/login", function (req, res) {
    debug("¡Login!");
    debug("Body recibido:", req.body);

    const {username, password} = req.body;

    User.findOne({username})
    .then(user => {
        if(!user){
            debug("El usuario no existe");
            return res.status(401).send({ message: "Usuario no existe" });
        }

        if(!user.password){
            debug("El usuario no tiene contraseña");
            return res.status(500).send({ message: "Usuario no tiene contraseña" });
        }

        debug("Usuario encontrado: ", user);

        return user.comparePassword(password)
        .then(isMatch => {
            if(!isMatch){
                debug("La contraseña no coincide: ", password);
                return res.status(401).send({ message: "Contraseña no coincide" });
            }

            const token = jwt.sign(
                {
                    id: user._id, 
                    username: user.username, 
                    role: user.role,
                    email: user.email
                },
                process.env.TOKEN_SECRET,
                { 
                    expiresIn: '1h' 
                }
            );

            res.status(200).send({
                message: "Login completado",
                token: token,
                id: user._id,
                username: user.username,
                email: user.email,
            });
        })
        .catch(error => {
            console.error("Error comparar contraseña", error);
            res.status(500).send({message: "¡Error comparando la contraseña!", error: error.message});
        });
    })
    .catch(error => {
        console.error("Error en /signin:", error);
        res.status(500).send({message: "¡Error comprobando usuario o contraseña!", error: error.message});
    });
});

module.exports = router;
