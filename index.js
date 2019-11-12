const express = require("express")
const app = express()
const server = require('http').createServer(app)
const router = express.Router()
const sockets = require('socket.io')(server)
const bcrypt = require('bcrypt')
const multer = require('multer')
const path = require('path')
const mongohandler = require('./Mongolib/index')
const scrapper = require('./scrappers/uninorte').default
const horasEnComun = require('./funcionalities/commonHours')
const { Storage } = require('@google-cloud/storage')
const fs = require('fs');
const ObjectId = require('mongodb').ObjectId
const bodyParser = require('body-parser')
//const config=require('dotenv').config()
const storage =
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
    socket.on("message", msg => {
        arreglo.push(msg)
        console.log(arreglo)
        socket.broadcast.emit("message", msg)
    })
})
server.listen(8080, function () {
    console.log('servidor iniciado en 8080')
})
app.listen(3000);
app.use(bodyParser.json())
app.use(router)
//OJO ESTOY AGREGANDO ELEMENTOS AL VECTOR DE HORARIO, SI LLAMA VARIAS A VECES A LA FUNCION SE VAN A AGREGAR LO EQUIVALENTE A MAS DIAS, PUEDE SER PERJUDICIAL
console.log('server started on port 3000');
router.post('/completeRegister/:name/:userApp/:passApp/:telefono/:universidad/:userU/:passU', async function (req, res) {//registro completo (con horario incluido)
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
router.post('/directRegister/:name/:user/:pass/:telefono/:universidad', async function (req, res) {//registro de un nuevo usuario de manera directa, es decir, sin usar instagram fb etc y sin importar su horario con nuestro scrapper
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

})
router.get('/login/:user/:pass', async function (req, res) {//tratando de entrar a la aplicación
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
router.post('/newPostTablero/:fecha/:hora/:comentario/:tag', async function (req, res) {
    console.log("se conectaron a /newPostTablero/:fecha/:hora/:comentario")
    let fecha = req.params.fecha
    let hora = req.params.hora
    let comentario = req.params.comentario
    let tag = req.params.tag
    if (comentario) {
        await mongohandler.nuevoComentarioTablero(fecha, hora, comentario, tag)
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
})

router.post('/uploadImage/:user', upload.single('file'), async function (req, res) {//falta recibir el usuario
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
})
router.get('/traerHorasLibres/:user', async function (req, res) {
    console.log("se conectaron a /traerHorasLibres/:user")
    let user = req.params.user
    let x = await mongohandler.traerHorasLibres(user)
    res.json(x)
})
router.get('/traerInfoAmigo/:amigo', async function (req, res) {
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
router.patch('/nuevoLikeAnuncio/:anuncioID/:userID', async function (req, res) {
    console.log("se conectaron a /nuevoLikeAnuncio/:anuncioID/:userID")

})
router.patch('/nuevoDislikeAnuncio/:anuncioID/:userID', async function (req, res) {
    console.log("se conectaron a /nuevoDislikeAnuncio/:anuncioID/:userID")

})
router.get('/traerAnunciosPorFiltros/:arreglo', async function (req, res) {
    console.log("se conectaron a /traerAnunciosPorFiltros/:arreglo")
    let arreglo = req.params.arreglo.split(',')
    let arre = []
    await Promise.all(arreglo.map(async (element, index) => {
        let x = await mongohandler.traerAnunciosPorFiltros(element)
        let xx = await x.toArray()
        arre[index] = xx
        Promise.resolve('ok')
    }))
    res.json(arre)
})
module.exports = app;