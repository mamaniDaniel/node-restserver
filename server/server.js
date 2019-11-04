require ('./config/config')

const express = require('express');
const mongoose = require('mongoose');

const app = express();

const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())
//TODO: me puedo llevar el body parser al archivo config.js


app.use ( require('./routes/index'));
//A: de este archivo salen todas las rutas

mongoose.connect(process.env.URLDB,{
    useNewUrlParser: true,
    useUnifiedTopology: true  
}, (err, res) =>{
    if( err ) throw err;
    console.log('base da datos ONLINE');
});

mongoose.set('useCreateIndex', true) //VER: https://github.com/Automattic/mongoose/issues/6890

app.listen( process.env.PORT, ()=>{
    console.log("escuchando puerto : ", process.env.PORT);
})