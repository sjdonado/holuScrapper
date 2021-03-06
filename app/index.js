const express = require('express');
const router = express.Router();
//const sockets = require('socket.io')(server)
const bcrypt = require('bcrypt')
//const multer = require('multer')
//const path = require('path')
const mongohandler = require('./Mongolib/index')
const scrapper = require('./scrappers/uninorte')
const horasEnComun = require('./funcionalities/commonHours')
//const OtraClase = require('./funcionalities/messageClass')
//const { Storage } = require('@google-cloud/storage')
//const fs = require('fs');
const firebase = require("firebase/app");
const ObjectId = require('mongodb').ObjectId
const bodyParser = require('body-parser')
const firebaseConfig = require('./config')
require("firebase/auth")
require("firebase/firestore")

var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

const app = express();

app.use(allowCrossDomain);

firebase.initializeApp(firebaseConfig);
{/*const storage =
    multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/')
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + path.extname(file.originalname))
        }
    })
const upload = multer({ storage: storage })

sockets.on('connect', socket => {
    let arreglo = []
    console.log("se conectaron a este socket")
    let room = socket.handshake['query']['room']
    socket.join(room);
    console.log('user joined room #' + room);
    socket.on("message", async (msg) => {
        arreglo.push(msg)
        let obj = new OtraClase(arreglo[0].user.sender, arreglo[0].text, arreglo[0].user.hora, arreglo[0].user.dia, arreglo[0].user.year)
        await mongohandler.nuevoMensaje(arreglo[0].user.idConversacion, arreglo[0].user.sender, arreglo[0].user.otherUser, obj)
        socket.broadcast.emit("message", msg)
    })
})
server.listen(8080, function () {
    console.log('servidor iniciado en 8080')
})*/}
app.use(bodyParser.json());
app.use(router);
//OJO ESTOY AGREGANDO ELEMENTOS AL VECTOR DE HORARIO, SI LLAMA VARIAS A VECES A LA FUNCION SE VAN A AGREGAR LO EQUIVALENTE A MAS DIAS, PUEDE SER PERJUDICIAL
console.log('server started on port 3001')
router.post('/completeRegister/:userU/:passU/:name/:passApp/', async function (req, res) {//registro completo (con horario incluido)
    console.log("se conectaron a complete register")
    let flag = false
    let uniUser = req.params.userU
    let mail = req.params.userU + "@uninorte.edu.co"
    let uniPass = req.params.passU
    let name = req.params.name
    let pass = req.params.passApp
    await firebase.auth().createUserWithEmailAndPassword(mail, pass).then(result => {
        result.user.updateProfile({
            displayName: name
        })
        const configuracion = {
            url: 'http://192.168.1.64:3000/bienvenido'
        }
        result.user.sendEmailVerification(configuracion).catch(err => {
            console.log("1:" + err)
            flag = true
        })
        firebase.auth().signOut()
    }).catch(err => {
        flag = true
        console.error("2:" + err)
        res.json(err)
    })
    if (!flag) {
        const solucion = await scrapper(uniUser, uniPass)
        const vector = solucion[0]
        const hashedpassword = await bcrypt.hash(pass, 10)
        let c = await mongohandler.crearNuevoUsuarioConHorario(name, uniUser, hashedpassword, vector[0], vector[1], vector[2], vector[3], vector[4], vector[5], vector[6], solucion[1])
        res.json("DONE!")
    }
})
router.patch('/agregarhorario/:Appuser/:universityUser/:universityPass', async function (req, res) {//para cuando una persona que al registrarse no quiso importar su horario y apenas ahora lo va a hacer
    console.log("se conectaron a agregarhorario/:Appuser/:universityUser/:universityPass")
    let user = req.params.Appuser
    let userU = req.params.universityUser
    let passU = req.params.universityPass
    const vector = await scrapper(userU, passU)
    let c = await mongohandler.actualizar(user, vector[0], vector[1], vector[2], vector[3], vector[4], vector[5], vector[6])//falta borrar si es que hay el horario anterior
    res.json("DONE!")
})
router.get('/login/:email/:pass', async function (req, res) {//tratando de entrar a la aplicación
    console.log("se conectaron a login/:email/:pass")
    let email = req.params.email
    let pass = req.params.pass
    firebase.auth().signInWithEmailAndPassword(email, pass).then(result => {//la contraseña si se guarda de algún extraño modo XD para cuando vaya a dar sign in
        if (result.user.emailVerified) {
            res.json("ingreso exitoso!")
        } else {
            res.json("no se ha verificado la cuenta.")
        }
    }).catch(
        err => {
            console.error(err)
            res.json(err)
        }
    )

})
router.get('/traerTodaLaInfoUsuario/:user', async function (req, res) {
    console.log("se conectaron a /login/traerTodaLaInfoUsuario/:user")
    let user = req.params.user
    let x = await mongohandler.traerTodaInfoUsuario(user)
    res.json(x)
})
router.patch('/newFriend/:user1/:user2', async function (req, res) {//cuando agrega a un amigo y se encuentran sus horas libres en común
    console.log("se conectaron a /newFriend/:user1/:user2")
    let user1 = req.params.user1
    let user2 = req.params.user2
    let x = await mongohandler.buscar(user1)
    let xx = await mongohandler.buscar(user2)
    if (x !== null && xx !== null) {
        let datosusuario1 = await mongohandler.traerHorario(user1)
        let datosusuario2 = await mongohandler.traerHorario(user2)
        let h1 = datosusuario1.horaslibres
        let id1 = datosusuario1._id
        let h2 = datosusuario2.horaslibres
        let id2 = datosusuario2._id
        horasEnComun(h1, h2, id1, id2)
        res.send("petición exitosa")
    } else {

    }
})
router.get('/traerHorasLibres/:user', async function (req, res) {
    console.log("se conectaron a /traerHorasLibres/:user")
    let user = req.params.user
    let x = await mongohandler.traerHorasLibres(user)
    res.json(x)
})
router.get('/buscarUsuarioPorNombre/:user', async function (req, res) {
    console.log("se conectaron a /buscarUsuarioPorNombre/:user")
    let user = req.params.user
    let x = await mongohandler.busquedaUsuarioPorNombre(user)
    let xx = await x.toArray()
    res.json(xx)
})
router.patch('/enviarSolicitudDeAmistad/:userSender/:userReceiver', async function (req, res) {
    console.log("se conectaron a /buscarUsuarioPorNombre/:user")
    try {
        let userSender = req.params.userSender
        let userReceiver = req.params.userReceiver
        let x = await mongohandler.enviarSolicitudDeAmistad(userSender, userReceiver)
        res.json("Done")
    } catch (err) {
        console.log(err)
        res.json("hubo un error")
    }

})
{/*router.post('/completeRegister/:name/:userApp/:passApp/:telefono/:universidad/:userU/:passU', async function (req, res) {//registro completo (con horario incluido)
    console.log("se conectaron a complete register")
    let name = req.params.name
    let user = req.params.userApp
    let pass = req.params.passApp
    let number = req.params.telefono
    let uni = req.params.universidad
    let uniUser = req.params.userU
    let uniPass = req.params.passU
    let existencia = await mongohandler.buscarUsuario(user)
    if (existencia) {
        res.json("usuario existente")
    } else {
        const solucion = await scrapper(uniUser, uniPass);
        const vector = solucion[0]
        const hashedpassword = await bcrypt.hash(pass, 10)
        let c = await mongohandler.crearNuevoUsuarioConHorario(name, user, hashedpassword, number, uni, vector[0], vector[1], vector[2], vector[3], vector[4], vector[5], vector[6], solucion[1])
        res.json("DONE!")
    }

})*/}//register anterior
{/*router.post('/directRegister/:name/:user/:pass/:telefono/:universidad', async function (req, res) {//registro de un nuevo usuario de manera directa, es decir, sin usar instagram fb etc y sin importar su horario con nuestro scrapper
    console.log("se conectaron a /directRegister/:user/:pass/:telefono/:universidad")
    let name = req.params.name
    let user = req.params.user
    let pass = req.params.pass
    let existencia = await mongohandler.buscarUsuario(user)
    if (existencia) {
        res.json("usuario existente")
    } else {
        const hashedpassword = await bcrypt.hash(pass, 10)
        let telefono = req.params.telefono
        let u = req.params.universidad
        let x = await mongohandler.crearNuevoUsuario(name, user, hashedpassword, telefono, u)
        res.json("DONE!")
    }

})*/}//funcionalidad vieja no para el 20/01/20
{/*router.get('/login/:user/:pass', async function (req, res) {//login anterior (react native)
    console.log("se conectaron a login/:user/:pass")
    let username = req.params.user
    let pass = req.params.pass
    mongohandler.buscar(username).then(function (user) {
        return bcrypt.compare(pass, user.contraseña)
    }).then(function (samePassword) {
        if (!samePassword) {
            res.json({ "result": false })
        } else {
            res.json({ "result": true });
        }
    }).catch(function (error) {
        console.log("Error authenticating user: ");
        console.log(error);
    });
})*/}


{/*router.post('/newPostTablero/:fecha/:hora/:comentario', async function (req, res) {
    console.log("se conectaron a /newPostTablero/:fecha/:hora/:comentario")
    let fecha = req.params.fecha
    let hora = req.params.hora
    let comentario = req.params.comentario
    if (comentario) {
        await mongohandler.nuevoComentarioTablero(fecha, hora, comentario)
        res.json("Done!")
    }

})
router.post('/newPostAnuncios/:fecha/:hora/:comentario/:user/:tag', async function (req, res) {
    console.log("se conectaron a /newPostAnuncios/:fecha/:hora/:comentario/:user")
    let fecha = req.params.fecha
    let hora = req.params.hora
    let comentario = req.params.comentario
    let user = req.params.user
    let tag = req.params.tag
    if (comentario) {
        await mongohandler.nuevoAnuncio(fecha, hora, comentario, user, tag)
        res.json("Done!")
    }

})
router.get('/retreivePostsTablero', async function (req, res) {
    console.log("se conectaron a /retreivePostsTablero")
    let x = await mongohandler.traerPostsAnterioresTablero()
    let xx = await x.toArray()
    res.json(xx)
})
router.get('/retreivePostsAnuncios', async function (req, res) {
    console.log("se conectaron a /retreivePostsAnuncios")
    let x = await mongohandler.traerPostsAnterioresAnuncios()
    let xx = await x.toArray()
    res.json(xx)
})*/}

{/*router.post('/uploadImage/:user', upload.single('file'), async function (req, res) {//falta recibir el usuario
    console.log("se conectaron a /uploadingImage")
    let urI = req.file.filename
    let user = req.params.user
    const gc = new Storage({
        keyFilename: path.join(__dirname, "./clave/index.json"),
        projectId: 'holu-256603'
    })
    const holuBucket = gc.bucket('primersegmentoholu')
    const nombreArchivo = path.basename(path.join(__dirname, './uploads/' + urI))
    const archivo = holuBucket.file(nombreArchivo)
    await holuBucket
        .upload(path.join(__dirname, './uploads/' + urI))
        .then(() => {
            archivo.makePublic()
            mongohandler.insertarFoto(user, "https://storage.googleapis.com/primersegmentoholu/" + urI)
            fs.unlinkSync(path.join(__dirname, './uploads/' + urI))
        })
        .catch(err => {
            console.error('ERROR:', err);
        });
    res.end()
})*/}

{/*router.get('/traerInfoAmigo/:amigo', async function (req, res) {
    console.log("se conectaron a /traerInfoAmigos")
    let amigo = req.params.amigo
    let x = await mongohandler.traerInfoAmigos(amigo)
    res.json(x)
})
router.get('/traerSoloFoto/:user', async function (req, res) {
    console.log("se conectaron a /traerSoloFoto/:user")
    let user = req.params.user
    let x = await mongohandler.traerfoto(user)
    res.json(x)
})
router.get('/traerSoloFotoPorId/:Id', async function (req, res) {
    console.log("se conectaron a /traerSoloFotoPorId/:Id")
    let Id = req.params.Id
    let x = await mongohandler.traerFotoPorId(Id)
    res.json(x)
})
router.get('/traerRespuestasPostAnuncios/:ID', async function (req, res) {
    console.log("se conectaron a traerRespuestasPostAnuncios/:ID")
    let ID = req.params.ID
    let x = await mongohandler.traerRespuestasPostAnuncios(ID)
    res.json(x)
})
router.get('/traerRespuestasPostTablero/:ID', async function (req, res) {
    console.log("se conectaron a traerRespuestasPostTablero/:ID")
    let ID = req.params.ID
    let x = await mongohandler.traerRespuestasEltablero(ID)
    res.json(x)
})
router.post('/nuevaRespuestaAnuncio/:anuncioID/:userID/:respuesta', async function (req, res) {
    console.log("se conectaron a nuevaRespuestaAnuncio/:anuncioID/:userID")
    let anuncioID = req.params.anuncioID
    let userID = req.params.userID
    let respuesta = req.params.respuesta
    class clase {
        constructor(respuesta, userID) {
            this.mensaje = respuesta
            this.userID = ObjectId(userID)
        }
    }
    let o = new clase(respuesta, userID)
    let x = await mongohandler.nuevaRespuestaAnuncio(anuncioID, o)
    res.json("Done!")
})
router.post('/nuevaRespuestaTablero/:anuncioID/:respuesta', async function (req, res) {
    console.log("se conectaron a nuevaRespuestaTablero/:anuncioID/:respuesta")
    let anuncioID = req.params.anuncioID
    let respuesta = req.params.respuesta
    console.log(anuncioID)
    let x = await mongohandler.nuevaRespuestaEltablero(anuncioID, respuesta)
    res.json("Done!")
})
router.patch('/nuevoLikeTablero/:anuncioID/:userID', async function (req, res) {
    console.log("se conectaron a /nuevoLikeTablero/:anuncioID/:userID")
    let anuncioID = req.params.anuncioID
    let userID = req.params.userID
    let x = await mongohandler.nuevoLikeEltablero(anuncioID, userID)
    res.json("Done!")
})
router.patch('/noInteractionTablero/:anuncioID/:userID/:flag', async function (req, res) {
    console.log("se conectaron a /noInteractionTablero/:anuncioID/:userID/:flag")
    let anuncioID = req.params.anuncioID
    let userID = req.params.userID
    let flag = req.params.flag
    let x = await mongohandler.noInteractionTablero(anuncioID, userID, flag)
    res.json("Done!")
})
router.patch('/nuevoDislikeTablero/:anuncioID/:userID', async function (req, res) {
    console.log("se conectaron a /nuevoDislikeTablero/:anuncioID/:userID")
    let anuncioID = req.params.anuncioID
    let userID = req.params.userID
    let x = await mongohandler.nuevoDislikeEltablero(anuncioID, userID)
    res.json("Done!")
})
router.patch('/nuevoLikeAnuncio/:anuncioID/:userID', async function (req, res) {
    console.log("se conectaron a /nuevoLikeAnuncio/:anuncioID/:userID")
    let anuncioID = req.params.anuncioID
    let userID = req.params.userID
    let x = await mongohandler.nuevoLikeAnuncio(anuncioID, userID)
    res.json("Done!")
})
router.patch('/noInteractionAnuncio/:anuncioID/:userID/:flag', async function (req, res) {
    console.log("se conectaron a /noInteractionAnuncio/:anuncioID/:userID/:flag")
    let anuncioID = req.params.anuncioID
    let userID = req.params.userID
    let flag = req.params.flag
    let x = await mongohandler.noInteractionAnuncio(anuncioID, userID, flag)
    res.json("Done!")
})
router.patch('/nuevoDislikeAnuncio/:anuncioID/:userID', async function (req, res) {
    console.log("se conectaron a /nuevoDislikeAnuncio/:anuncioID/:userID")
    let anuncioID = req.params.anuncioID
    let userID = req.params.userID
    let x = await mongohandler.nuevoDislikeAnuncio(anuncioID, userID)
    res.json("Done!")
})
router.get('/traerAnunciosPorFiltros/:arreglo', async function (req, res) {
    console.log("se conectaron a /traerAnunciosPorFiltros/:arreglo")
    let arreglo = req.params.arreglo.split(',')
    let arre = []
    await Promise.all(arreglo.map(async (element, index) => {
        let x = await mongohandler.traerAnunciosPorFiltros(element)
        let xx = await x.toArray()
        arre[index] = xx[0]
        Promise.resolve('ok')
    }))
    res.json(arre)
})
app.get('/buscarConversaciones/:user', async function (req, res) {
    console.log("se conectaron a /buscarConversaciones/:user")
    let user = req.params.user
    let x = await mongohandler.buscarConversaciones(user)
    let xx = await x.toArray()
    res.json(xx)
})
app.get('/traerMensajesAnteriores/:idConversacion', async function (req, res) {
    console.log("se conectaron a /traerMensajesAnteriores/:idConversacion")
    let idConversacion = req.params.idConversacion
    let x = await mongohandler.traerMensajesAnteriores(idConversacion)
    res.json(x)
})
app.get('/traerAnuncioVidaUniversitaria/:dia', async function (req, res) {//no más spam al correo
    console.log("se conectaron a /traerAnuncioVidaUniversitaria/:dia")
    let dia = req.params.dia
    let x = await mongohandler.traerVidaUniversitaria(dia)
    res.json(x)
})*/}

module.exports = app;
