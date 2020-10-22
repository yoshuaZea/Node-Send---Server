const jwt = require('jsonwebtoken')
require('dotenv').config({ path: 'variable.env' })

module.exports = (req, res, next) => {
    // Extraer Authorization
    const authHeader = req.get('Authorization')

    if(authHeader){
        // Obtener el token
        const token = authHeader.replace('Bearer ', '')

        // Comprobar el JWT
        try {
            const usuario = jwt.verify(token, process.env.SECRET_KEY)
            req.usuario = usuario
            
        } catch (error) {
            res.status(403).json({ msg: 'Token no válido', authHeader })
        }
    }

    return next()
}