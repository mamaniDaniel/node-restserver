const express = require('express');

const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);


const Usuario = require('../models/usuario');

const app = express();



app.post('/login', (req, res) => {
    let body = req.body;

    Usuario.findOne({ email: body.email}, (err, usuarioDB) =>{
    //A: buscar UN usuario con la condicion entre llaves, callback recibe error o usuario encontrado
        if(err){
            return res.status(500).json({
                ok:false,
                err: err || 'error en la base de datos'
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

//Configuracion de Google
async function verify( token ) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
  }

app.post('/google', async (req, res) => {

    let token = req.body.idtoken;
    //TODO: sino me envian nada en req.body.idtoken se rompe todo el codigo
    let googleUser = await verify( token )
        .catch( e=> {
            res.status(403).json({
                ok: false,
                err: e
            })
        })
    
    console.log("Google user ENTREEEE: " , googleUser)
    Usuario.findOne ({email: googleUser.email}, (err, usuarioDB) =>{
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if (usuarioDB){
            if (usuarioDB.google === false){
                //A: el usuario existe pero se autentico con email y password
                return res.status(400).json({
                    ok:false,
                    err: {
                        message: 'debe de usar su autenticacion normal'
                    }
                });
            }else{
                //A: usuario existe, actualizo token para que pueda seguir navegando
                let token = jwt.sign({
                    //armamos el payload, podemos poner lo que queramos
                    usuario: usuarioDB
                },process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN}); //A: expira en 30 dias
                //"secret" semilla para el signature del token

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                })
            }
        }else{
            //A: el usuario no existe en nuestra base de datos, lo creo
            let usuario = new Usuario();

            usuario.nombre =  googleUser.nombre;
            usuario.email =  googleUser.email;
            usuario.img =  googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save ((err, usuarioDB) =>{
                if(err){
                    return res.status(500).json({
                        ok:false,
                        err
                    });
                };

                let token = jwt.sign({
                    //armamos el payload, podemos poner lo que queramos
                    usuario: usuarioDB
                },process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN}); //A: expira en 30 dias
                //"secret" semilla para el signature del token

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                })
            })
        }
    })
})

module.exports = app;