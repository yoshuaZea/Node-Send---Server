const express = require('express')
const router = express.Router()
const usuarioController = require('../controllers/usuarioController')
const { check } = require('express-validator')

router.post('/',
    [
        check('nombre', 'El nombre es obligatorio').not().isEmpty(),
        check('email', 'El email no es válido').isEmail(),
        check('password', 'El password debe ser de al menos 8 caracteres').isLength({ min: 8 }),
    ],
    usuarioController.nuevoUsuario
)

module.exports = router