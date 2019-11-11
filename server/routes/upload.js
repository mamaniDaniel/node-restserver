const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs');
const path = require('path');

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

app.use( fileUpload({ useTempFiles: true }) );


app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;
    let archivo = req.files.archivo;

    if (!req.files || Object.keys(req.files).length === 0){
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'no se ha seleccionado ningun archivo'
                }
            });
    }

    let tiposValidos = ['productos','usuarios'];

    if (tiposValidos.indexOf(tipo) < 0){
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las tipos permitidos son: ' + tiposValidos.join(', ' ),
            }
        })
    }
    //A: me asegure que los tipos sea productos o usuario

    //Extensiones permitidas
    let extensionesValidas = ['png','jpg','gif','jpeg'];
    let nombreCortado = archivo.name.split('.');

    let extension = nombreCortado[nombreCortado.length - 1];

    if ( extensionesValidas.indexOf( extension) < 0){
        return res.status(400).json({
            ok: false,
            err: {
                message: 'las extensiones permitidas son ' + extensionesValidas.join(', ' ),
                ext: extension
            }
        })
    }
    //A: verifique que la extension sea una de las permitidas

    let nombreArchivo = `${id}-${ new Date().getMilliseconds() }.${extension}`
    //A: nombre de archivo con id y milisegundos

    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, function(err) {
        if (err)
          return res.status(500).json({
            ok:false,
            err  
          });
        
        tipo == 'usuario' 
            ? imagenUsuario(id, res, nombreArchivo)
            : imagenProducto(id,res,nombreArchivo)

      });

});

function imagenUsuario(id, res, nombreArchivo){
    Usuario.findById(id, (err, usuarioDB)=> {
        if(err){
            borraArchivo(nombreArchivo,'usuarios')

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if( !usuarioDB){
            borraArchivo(nombreArchivo,'usuarios');

            return res.status(400).json({
                ok: false,
                err:{
                    message: 'usuario no existe'
                }
            });
        }

        borraArchivo(usuarioDB.img,'usuarios')

        usuarioDB.img = nombreArchivo;

        usuarioDB.save( (err, usuarioGuardado)=> {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });
        })
    })
}

function imagenProducto(id, res, nombreArchivo){
    
    Producto.findById(id, (err, productoDB)=>{
        if(err){
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!productoDB){
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err:{
                    message: 'ID no existe'
                }
            });
        }

        productoDB.img = nombreArchivo;

        productoDB.save( (err, productoGuardado)=> {
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });
        })
    })
}

function borraArchivo(nombreImagen,tipo){
    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreImagen}`);
    //A: path de la imagen actual guardada

    if ( fs.existsSync(pathImagen) ){
        fs.unlinkSync(pathImagen);
    }
    //A: elimine imagen vieja, listo para actualizar
}
module.exports = app;