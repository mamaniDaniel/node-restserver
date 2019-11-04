const express = require('express');

const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario');

const app = express();



app.post('/login', (req, res) => {
    let body = req.body;

    Usuario.findOne({ email: body.email}, (err, usuarioDB) =>{
    //A: buscar UN usuario con la condicion entre llaves, callback recibe error o usuario encontrado
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }
        

        if ( !usuarioDB ){
            //A: si no encuentra usuario no lanza error, sino que usuarioDB es null
            return res.status(400).json({
                ok:false,
                err:{
                    message: '(usuario) o contraseña incorrectos'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)){
            //A: tengo usuario de DB . comparo que contraseña enviada sea igual a la del usuario de la DB
            return res.status(400).json({
                ok:false,
                err:{
                    message: 'usuario o (contraseña) incorrectos'
                }
            });
        }

        let token = jwt.sign({
            //armamos el payload, podemos poner lo que queramos
            usuario: usuarioDB
        },process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN}); //A: expira en 30 dias
        //"secret" semilla para el signature del token


        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        })

    }) 
});



module.exports = app;