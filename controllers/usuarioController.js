const Usuarios = require('../models/Usuarios')
const bcrypt = require('bcrypt')
const { validationResult } = require('express-validator')

exports.nuevoUsuario = async (req, res) => {
    try {
        // Mostrar mensajes de express-validator
        const errores = validationResult(req)

        // Si hay errores
        if(!errores.isEmpty()){
            return res.status(400).json({ errores: errores.array() })
        }

        // Verificar si el usuario ya está registrado
        const { email, password } = req.body

        let usuario = await Usuarios.findOne({ email })

        // Si existe el usuario
        if(usuario) {
            return res.status(400).json({ msg: `El correo ${email} ya está registrado` })
        }

        usuario = new Usuarios(req.body)

        // Hashear password
        const salt = await bcrypt.genSalt(12)
        usuario.password = await bcrypt.hash(password, salt)
        await usuario.save()
        
        res.status(200).json({ msg: 'Usuario creado correctamente'})

    } catch (error) {
        console.log(error)
        res.status(500).json({ error })    
    }
}