const express = require('express');
const Usuario = require('../models/usuario');

const app = express();
const bcrypt = require('bcrypt');
const _ = require('underscore');

app.get('/usuario', function (req, res) {

    let desde = req.query.desde || 0; //todo validar que sea numero
    desde = Number(desde) //req.query es String

    let limite = req.query.limite || 5;
    limite = Number(limite);

    //Usuario: schema de mongodb
    Usuario.find({estado: true,email: "Test5@gmail.com"})
        .skip(desde)  //me salteo 
        .limit(limite) //solo me devuelvo 5
        .exec( (err, usuarios) => {
            if(err){
                return res.status(400).json({
                    ok:false,
                    err
                });
            }
            
            Usuario.count({estado: true,email: "Test5@gmail.com"},(err,total) => {
                res.json({
                    ok: true,
                    cuantos: total,
                    usuarios: usuarios
                });
            })
            
        })
})
  
app.post('/usuario', function (req, res) {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    })

    usuario.save( (err,usuarioDB) => {
        if(err){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        })
    });
   
})
  
app.put('/usuario/:id', function (req, res) {
    let id = req.params.id;
    //de todo el body solo quiero los campos que estan en el array 
    //usamos underscore para usar la funcion pick
    let body = _.pick(req.body, ['nombre','email','img','role','estado' ]);

    //busco y actualizo
    //tercer parametro: devolver en el callback el usuario modificado
    Usuario.findByIdAndUpdate( id, body, {new: true, runValidators: true}, (err,usuarioDB) => {
        //callback si hay error devuelvo el error
        if(err){
            return res.status(400).json({
                ok:false,
                err
            });
        }

        //si sale todo bien devuelvo el usuario encontrado
        //y actualizado
        res.json({
            ok: true,
            usuario: usuarioDB
        })  
    })
})
  
app.delete('/usuario/:id', function (req, res) {
    let id = req.params.id;

    //eliminamos cambiando el estado.No eliminamos el registro
    let cambiarEstado = {
        estado : false
    }
    //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        //2 parametro: objeto con las propiedades que quiero actualizar
        Usuario.findByIdAndUpdate( id, cambiarEstado, {new: true}, (err,usuarioBorrado) => {
        if(err){
            return res.status(400).json({
                ok:false,
                err
            });
        };

        if ( !usuarioBorrado ){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            })
        }
        
        res.json ({
            ok:true,
            usuario: usuarioBorrado
        })
    })
})


module.exports = app;