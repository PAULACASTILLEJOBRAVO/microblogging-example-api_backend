var express = require('express');
var router = express.Router();

var debug = require("debug")("microblogging-example-api:posts-route");

//Models
var Post = require('../models/Posts');
var User = require('../models/User');

//GET de todos los blogs
router.get("/all", (req, res) => {
    debug("Acceso a todos los blogs");

    Post.find().sort("-publicationdate").populate('user')
    .then(posts => {
        if(!posts) return res.status(404).send({ message: "Blog no encontrado" });
        res.status(200).json({ message: "Blogs encontrados correctamente", posts });
    })
    .catch(error => res.status(500).send({ message: "Error al obtener los blogs", error }));
});

//GET de un único blog por el id del usuario que lo creó
router.get("/:id", (req, res) => {
    debug("Acceso a un solo blog");

    Post.find({user: req.params.id}).sort("-publicationdate").populate('user')
    .then(posts => {
        if(!posts) return res.status(404).send({ message: "Blog no encontrado" });
        res.status(200).json({ message: "Blog encontrado correctamente", posts });
    })
    .catch(error =>res.status(500).send({ message: "Error al obtener el blog", error }));
});

// POST de un nuevo blog
router.post("/", (req, res) => {
    debug("Creación de un blog");

    User.findById(req.body.user)
    .then(users => {
        if (!users) {
            return res.status(404).send({ message: "Usuario no encontrado" });
        }
        
        var postInstance = new Post({
            user: req.body.user,
            title: req.body.title,
            email: req.body.email,
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
router.put('/:id', (req, res) => {
    debug("Modificación de un blog");

    Post.findByIdAndUpdate(req.params.id, req.body)
    .then(posts => {
        if(!posts) return res.status(404).send({ message: "Blog no encontrado" });

        res.status(200).send({ message: "Blog modificado correctamente" })
    })
    .catch(error => res.status(500).send({ message: "Error al modificar el blog", error }));
});

// DELETE de un blog existente identificado por su Id
router.delete('/:id', (req, res) => {
    debug("Borrado de un blog");

    Post.findByIdAndDelete(req.params.id)
    .then(posts => {
        if(!posts) return res.status(404).send({ message: "Blog no encontrado" });

        User.findByIdAndUpdate(posts.user, {$pull: {posts: posts._id}})
        .then(() => res.status(200).send({ message: "Blog eliminado correctamente" }))
        .catch(error => res.status(500).send({ message: "Error al actualizar el usuario", error }));
    })
    .catch(error => res.status(500).send({ message: "Error al eliminar el blog", error }));
});

module.exports = router;