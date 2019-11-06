
//===========================
//  Puerto
//===========================

process.env.PORT = process.env.PORT || 3000;

// =========================================
// Entorno
// ==========================================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
//A: NODE_ENV la crea heroku, me ayuda a saber si estoy en produccion o desarrollo

// =========================================
// Vencimiento del token
// ==========================================
//60 segundos
//60 minutos
//24 horas
//30 dias
process.env.CADUCIDAD_TOKEN = ( 60 * 60 * 24 * 30);


// =========================================
// Seed de autenticacion
// ==========================================
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';
//heroku config (ver variable creadas)
//heroku config:set nombreVariable="valor" 
//puedo crear una seed en horoku para evitar que la semilla este visible
//en github

// =========================================
// Base de datos
// ==========================================
let urlDB;
if (process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://localhost:27017/cafe';
}else{
    urlDB = process.env.MONGO_URI;
    //A: este es el url a mi base de datos en mongo atlas, la tengo escondida en una variable global en mi HEROKU
}
process.env.URLDB = urlDB;

// =========================================
// Google Client ID
// ==========================================
process.env.CLIENT_ID = process.env.CLIENT_ID || '1072934725453-4l15kooephsbtupfmht7orpbjd6n93vh.apps.googleusercontent.com';
