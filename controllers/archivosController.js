const multer = require('multer')
const shortid = require('shortid')
const fs = require('fs')
const Enlaces = require('../models/Enlaces')


exports.subirArchivo = async (req, res, next) => {

    const configuracionMulter = {
        limits: { 
            fileSize: req.usuario ? 1024 * 1024 * 10: 1024 * 1024 
        },
        storage: fileStorage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, __dirname + '/../uploads')
            },
            filename: (req, file, cb) => {
                const extension = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length)
                cb(null, `${shortid.generate()}${extension}`)
            },
            // fileFilter: (req, file, cb) => { 
            //     if(file.mimetype === "application/pdf"){
            //         return cb(null, true)
            //     }
            // }
        })
    }
    
    const upload = multer(configuracionMulter).single('archivo')

    upload(req, res, async (error) => {
        console.log(req.file)

        if(!error){
            res.json({ archivo: req.file.filename })
        } else {
            res.json({ error })
            return next()
        }
    })
}

exports.eliminarArchivo = async (req, res) => {
    const archivo = req.archivo

    try {
        fs.unlinkSync(__dirname + `/../uploads/${archivo}`)
        console.log('Archivo eliminado')
    } catch (error) {
        console.log(error)
    }
}

exports.descargar = async (req, res, next) => {

    // Verificar si existe el enlace
    const { archivo } = req.params
    const enlace = await Enlaces.findOne({ url: archivo })
    
    // Si no existe
    if(!enlace){
        res.status(404).json({ msg: 'Ese enlace no existe '})
        return next()
    }

    const download = __dirname + '/../uploads/' + enlace.nombre
    res.download(download)

    // Eliminar archivo del servidor y la base de datos
    // Destructuring
    const { nombre, descargas } = enlace

    // Si las descargas son iguales a 1 - Borrar la entrada en BD y borrar el archivo
    if(descargas === 1){
        // Eliminar archivo
        req.archivo = nombre

        // Eliminar de la base de datos
        await Enlaces.findOneAndRemove(enlace.id)

        // Ejecutar el siguiente middleware
        next()
    } else {
        // Si las descargas son > 1 - Restar 1
        enlace.descargas--
        await enlace.save()
    }
}