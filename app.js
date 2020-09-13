'use strict'

// Cargar modulos de node para crear servidor
var express = require('express');
var bodyParser = require('body-parser');

// Ejecutar express (http)
var app = express();

// Cargar ficheros rutas
var articleRoutes = require('./routes/article');

// Middlewares (se ejecuta antes de su ruta)
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// CORS (permitir peticiones desde el frontend)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

// Añadir prefijos a rutas
app.use('/api', articleRoutes);
// Ruta o metodo de prueba
/*app.get('/probando', (req, res)=>{
    var hola = req.body.hola;
    return res.status(200).send({
        nombre: 'Diego',
        apellido: 'Gongora',
        hola
    });
});*/

// Exportar modulos (fichero actual)
module.exports = app;