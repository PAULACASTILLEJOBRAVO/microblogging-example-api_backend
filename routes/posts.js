var express = require('express');
var router = express.Router();

var debug = require("debug")("microblogging-example-api:posts-route");

//Models
var Post = require('../models/Posts');
var User = require('../models/User');

//Security
const tokenVerify = require("../middlewares/tokenVerify.js");

//GET de todos los blogs
router.get("/all", (req, res) => {
    debug("Acceso a todos los blogs");
    debug("Parametros recibidos:", req.params);

    Post.find().sort("-publicationdate").populate('user')
    .then(posts => {
        if(!posts) return res.status(404).send({ message: "Blog no encontrado" });
        res.status(200).json({ message: "Blogs encontrados correctamente", posts });
    })
    .catch(error => res.status(500).send({ message: "Error al obtener los blogs", error }));
});

//GET de un único blog por el id del usuario que lo creó
router.get("/secure/:id", tokenVerify, (req, res) => {
    debug("Acceso seguro a un solo blog");
    debug("Parametros recibidos:", req.params);

    Post.find({user: req.params.id}).sort("-publicationdate").populate('user')
    .then(posts => {
        res.status(200).json({ message: "Blog encontrado correctamente", posts });
    })
    .catch(error =>res.status(500).send({ message: "Error al obtener el blog", error }));
});

// POST de un nuevo blog
router.post("/secure", tokenVerify, (req, res) => {
    debug("Creación segura de un blog");
    debug("Parametros recibidos:", req.params);
    debug("Body recibido:", req.body);
    debug("Usuario recibido:", req.user);

    if (!req.body.title || !req.body.description) {
        debug("Faltan campos obligatorios para el blog");
        return res.status(400).send({ message: "Faltan campos obligatorios para el blog" });
    }

    const userId = req.user.id; 
    const userEmail = req.user.email;

    User.findById(req.user.id)
    .then(users => {
        if (!users) {
            debug("Usuario no encontrado");
            return res.status(404).send({ message: "Usuario no encontrado" });
        }
        
        var postInstance = new Post({
            user: userId,
            title: req.body.title,
            email: userEmail,
            description: req.body.description
        });

        users.posts.push(postInstance);
        
        return users.save()
        .then(() => { return postInstance.save() })
        .then(() => res.status(200).send({ message: "Blog creado correctamente" }))
        .catch(error => res.status(500).send({ message: "Error al guardar el blog", error }));
    })
    .catch(error => res.status(500).send({ message: "Error al crear el blog", error }));
});


//PUT de un blog existente identificado por su Id
router.put('/secure/:id', tokenVerify, (req, res) => {
    debug("Modificación segura de un blog");
    debug("Parametros recibidos:", req.params);
    debug("Body recibido:", req.body);

    Post.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(posts => {
        if(!posts) return res.status(404).send({ message: "Blog no encontrado" });

        res.status(200).send({ message: "Blog modificado correctamente" })
    })
    .catch(error => res.status(500).send({ message: "Error al modificar el blog", error }));
});

// DELETE de un blog existente identificado por su Id
router.delete('/secure/:id', tokenVerify, (req, res) => {
    debug("Borrado seguro de un blog");
    debug("Parametros recibidos:", req.params);

    Post.findByIdAndDelete(req.params.id)
    .then(posts => {
        if(!posts) return res.status(404).send({ message: "Blog no encontrado" });

        User.findByIdAndUpdate(posts.user, {$pull: {posts: posts._id}}, { new: true })
        .then(() => res.status(200).send({ message: "Blog eliminado correctamente" }))
        .catch(error => res.status(500).send({ message: "Error al actualizar el usuario", error }));
    })
    .catch(error => res.status(500).send({ message: "Error al eliminar el blog", error }));
});

module.exports = router;