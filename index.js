const express = require('express')
const connectDB = require('./config/db')
const cors = require('cors')

// Crear servidor
const app = express()

// Habilitar CORS Policy
const optionsCors = {
    origin: process.env.FRONTEND_URL
}
app.use(cors(optionsCors));

// Conectar la base de datos
connectDB()

// Habilitar leer valores del body
app.use(express.json())

// Habilitar carpeta pública
app.use(express.static('uploads'))

// Rutas de la app
app.use('/api/usuarios', require('./routes/usuarios'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/enlaces', require('./routes/enlaces'))
app.use('/api/archivos', require('./routes/archivos'))

// Puerto de la app
const port = process.env.PORT || 4000

// Arrancar servidor
app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor ejecutándose en el puerto ${port}`)
})
