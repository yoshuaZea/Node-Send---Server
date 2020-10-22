const Usuario = require('../models/Usuarios')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
require('dotenv').config({ path: 'variable.env' })

exports.autenticarUsuario = async (req, res, next) => {
    // Revisar si hay errores
    // Mostrar mensajes de express-validator
    const errores = validationResult(req)

    // Si hay errores
    if(!errores.isEmpty()){
        return res.status(400).json({ errores: errores.array() })
    }

    // Buscar el usuario
    const { email, password } = req.body
    const usuario = await Usuario.findOne({ email })

    // Si no hay usuario
    if(!usuario){
        res.status(401).json({ msg: 'No se encontró el usuario' })
        return next()
    }
    
    // Verificar el password y autenticar al usuario
    if(!bcrypt.compareSync(password, usuario.password)){
        res.status(401).json({ msg: 'Usuario y/o contraseña incorrectos' })
        return next()
    }

    // Crear JWT
    const token = jwt.sign({
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email
    }, process.env.SECRET_KEY, {
        expiresIn: '8h'
    })

    res.status(200).json({ msg: 'Usuario autenticado', token })

}

exports.usuarioAutenticado = (req, res, next) => {
    res.status(200).json({ usuario: req.usuario })
}