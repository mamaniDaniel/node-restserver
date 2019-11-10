const express = require ('express');

let {verificaToken,verificaAdminRole} = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');



app.get('/categoria',(req,res) =>{ //U: muestro todas las categorias
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario','nombre email') //U: llena el usuario con la informacion de la tabla usuario
        .exec((err, categorias) =>{
            if(err){
                return res.status(500).json({
                    ok:false,
                    err
                });
            }
    
            if(!categorias){
                return res.status(400).json({
                    ok:false,
                    err
                });
            }

            res.json({
                ok: true,
                categorias
            })
        })
})


app.get('/categoria/:id',verificaToken, (req,res)=> { //U: muestra una categoria por ID
    let id = req.params.id;

    Categoria.findById(id, (err,categoriaDB)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if(!categoriaDB){
            return res.status(400).json({
                ok:false,
                err:{
                    message: 'el ID no es valido'
                }
            });
        }

        res.json({
            ok: true,
            categoriaDB
        })
    })   
})

app.post('/categoria',verificaToken,(req, res)=>{ //U: crea una nueva categoria
    //regresa la nueva categoria
    //req.usuario._id
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save( (err,categoriaDB)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if(!categoriaDB){
            return res.status(400).json({
                ok:false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })
})

app.put('/categoria/:id',verificaToken,(req,res)=>{ //U: actualizar el nombre de la categoria
    
    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    }

    Categoria.findByIdAndUpdate(id, descCategoria, {new: true, runValidators: true}, (err,categoriaDB) =>{
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if(!categoriaDB){
            return res.status(400).json({
                ok:false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })
})

app.delete('/categoria/:id',[verificaToken, verificaAdminRole],(req,res)=>{
    //solo un administrador puede borrar una categoria
    //categoria.findByIdAndRemove    

    let id = req.params.id;

    Categoria.findByIdAndRemove( id, (err, categoriaDB) =>{
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if(!categoriaDB){
            return res.status(400).json({
                ok:false,
                err:{
                    message: 'el ID no existe'
                }
            });
        }

        res.json({
            ok: true,
            message: 'categoria borrada',
            categoria: categoriaDB
        })
    })
})

module.exports = app;