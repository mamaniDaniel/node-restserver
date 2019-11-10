const express = require ('express');

let {verificaToken} = require('../middlewares/autenticacion');

let app = express();

let Producto = require('../models/producto');


app.get('/productos',verificaToken, (req, res)=> {
    //trae todos los productos
    //populate: usuario categoria
    //pagina
    let desde = req.query.desde || 0;
    desde = Number(desde);

    Producto.find({ disponible: true })
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .skip(desde)
        .limit(5)
        .exec( (err, productosDB)=>{
            if(err){
                return res.status(500).json({
                    ok:false,
                    err
                });
            }
    
            if(!productosDB){
                return res.status(400).json({
                    ok:false,
                    err
                });
            }

            res.json({
                ok: true,
                productosDB
            })
        })
})

app.get('/productos/:id',verificaToken,(req,res)=> {
    //populate: usuario categoria
    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario','nombre email')
        .populate('categoria','nombre')
        .exec((err,productoDB)=>{
            if(err){
                return res.status(500).json({
                    ok:false,
                    err
                });
            }
    
            if(!productoDB){
                return res.status(400).json({
                    ok:false,
                    err
                });
            }

            res.json({
                ok: true,
                productoDB
            })
        })
})

app.get('/productos/buscar/:termino',verificaToken,(req,res)=> {
    
    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');
    //A: expresion regular insensible a las mayusculas

    Producto.find({ nombre: regex})
        .populate('categoria','nombre')
        .exec( (err, productos)=> {
            if(err){
                return res.status(500).json({
                    ok:false,
                    err
                })
            }

            res.json({
                ok: true,
                productos
            })
        })
})
app.post('/productos',verificaToken, (req,res)=> {
    //grabar el usuario
    //grabar la categoria del listado

    let body = req.body;
    
    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    })

    producto.save( (err, productoDB)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if(!productoDB){
            return res.status(400).json({
                ok:false,
                err
            });
        }

        res.json({
            ok: true,
            productoDB
        })
    })
})

app.put('/productos/:id',verificaToken,(req,res)=> {
    //populate: usuario categoria
    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err,productoDB)=> {
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if(!productoDB){
            return res.status(400).json({
                ok:false,
                err: {
                    message: 'el id no existe'
                }
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;

        productoDB.save ( (err, productoGuardado)=> {
            if(err){
                return res.status(500).json({
                    ok:false,
                    err
                });
            }
            res.json({
                ok: true,
                producto: productoGuardado
            })
        })
    })

})

app.delete('/productos/:id',verificaToken,(req,res)=> {
    //disponible: false
    
    let id = req.params.id;

    Producto.findById(id, (err, productoDB)=> {
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if(!productoDB){
            return res.status(400).json({
                ok:false,
                err: {
                    message: 'el id no existe'
                }
            });
        }

        productoDB.disponible = false;
        productoDB.save ((err, productoBorrado) =>{
            if(err){
                return res.status(500).json({
                    ok:false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoBorrado,
                message: 'producto borrado'
            })
        })
    })
})


module.exports = app;