const Enlaces = require('../models/Enlaces')
const shortid = require('shortid')
const bcrypt = require('bcrypt')
const { validationResult } = require('express-validator')

exports.nuevoEnlace = async (req, res, next) => {

    // Revisar si hay errores
    const errores = validationResult(req)

    // Si hay errores
    if(!errores.isEmpty()){
        return res.status(400).json({ errores: errores.array() })
    }

    // Crear un objeto de Enlace
    const { nombre, nombre_original } = req.body

    const enlace = new Enlaces()
    enlace.url = shortid.generate()
    enlace.nombre = nombre
    enlace.nombre_original = nombre_original
    
    // Si el usuario está autenticado
    if(req.usuario){
        const { password, descargas } = req.body

        // Asignar número de descargas
        if(descargas) enlace.descargas = descargas
        
        // Asignar password
        if(password){
            const salt = await bcrypt.genSalt(10)
            enlace.password = await bcrypt.hash(password, salt)
        } 

        // Asignar autor
        enlace.autor = req.usuario.id
    }

    // Almacenar en la base de datos
    try {
        await enlace.save()
        
        return res.status(200).json({ msg: `${enlace.url}` })
        next()

    } catch (error) {
        console.log(error)
    }

}

// Obtener el enlace
exports.obtenerEnlace = async (req, res, next) => {

    const { url } = req.params

    // Verificar si existe el enlace
    const enlace = await Enlaces.findOne({ url })

    // Si no existe
    if(!enlace){
        res.status(404).json({ msg: 'Ese enlace no existe '})
        return next()
    }

    // Si existe
    res.status(200).json({ archivo: enlace.nombre, password: false })

    next()
}

// Retorna si el enlace tiene password
exports.tienePassword = async (req, res, next) => {
    const { url } = req.params

    // Verificar si existe el enlace
    const enlace = await Enlaces.findOne({ url })

    // Si no existe
    if(!enlace){
        res.status(404).json({ msg: 'Ese enlace no existe '})
        return next()
    }

    if(enlace.password){
        return res.json({ password: true, archivo: enlace.url })
    }

    next()
}

exports.todosEnlaces = async (req, res) => {
    const enlaces = await Enlaces.find({}).select('url -_id')

    res.status(200).json({ enlaces })
}

// Verificar si el password es correcto
exports.verificarPassword = async (req, res, next) => {
    const { password } = req.body
    const { url } = req.params

    // Consultar por el enlace
    const enlace = await Enlaces.findOne({ url })

    // Verificar el password
    if(bcrypt.compareSync(password, enlace.password)){
        // Permitir descargar el archivo
        next()
    } else {
        return res.status(401).json({ msg: 'Contraseña incorrecta'})
    }
}