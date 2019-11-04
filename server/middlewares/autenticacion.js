const jwt = require('jsonwebtoken');

//============================
//Verficar token
//============================

let verificaToken = (req, res, next) =>{
    let token = req.get('token');
    //A: tome el token del header
    
    jwt.verify(token, process.env.SEED, (err,decoded) => {
        
        if( err ){
            return res.status(401).json({
                ok:false,
                err: {
                    message: 'token no valido'
                }
            })
        }

        req.usuario = decoded.usuario;
        //A: no hay error usuario tienen la informacion del TOKEN
        next();        
    })

};

//============================
//Verfica admin rol
//============================
let verificaAdminRole = (req, res, next) => {
    let usuario = req.usuario;

    if (usuario.role === "ADMIN_ROLE"){
        next();

    }else{
        return res.json({
            ok: true,
            err:{
                message: 'el usuario no es administrador'
            }
        });
    }    
}

module.exports={
    verificaToken,
    verificaAdminRole
}