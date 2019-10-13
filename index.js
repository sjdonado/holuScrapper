const express = require("express")
const app = express()
const server = require('http').createServer(app)
const router = express.Router()
const sockets = require('socket.io')(server)
const bcrypt = require('bcrypt')
const mongohandler = require('./Mongolib/index')
const scrapper = require('./scrappers/uninorte')
const horasEnComun = require('./funcionalities/commonHours')
//const config=require('dotenv').config()
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
app.use(router)
//OJO ESTOY AGREGANDO ELEMENTOS AL VECTOR DE HORARIO, SI LLAMA VARIAS A VECES A LA FUNCION SE VAN A AGREGAR LO EQUIVALENTE A MAS DIAS, PUEDE SER PERJUDICIAL
console.log('server started on port 3000');
router.post('/completeRegister/:userApp/:passApp/:telefono/:universidad/:userU/:passU', async function (req, res) {//registro completo (con horario incluido)
    console.log("se conectaron a complete register")
    let user = req.params.userApp
    let pass = req.params.passApp
    let number = req.params.telefono
    let uni = req.params.universidad
    let uniUser = req.params.userU
    let uniPass = req.params.passU
    const solucion = await scrapper(uniUser, uniPass);
    const vector = solucion[0]
    res.send("DONE!")
    const hashedpassword = await bcrypt.hash(pass, 10)
    let c = await mongohandler.crearNuevoUsuarioConHorario(user, hashedpassword, number, uni, vector[0], vector[1], vector[2], vector[3], vector[4], vector[5], vector[6], solucion[1])
})
router.patch('/agregarhorario/:Appuser/:universityUser/:universityPass', async function (req, res) {//para cuando una persona que al registrarse no quiso importar su horario y apenas ahora lo va a hacer
    console.log("se conectaron a agregarhorario/:Appuser/:universityUser/:universityPass")
    let user = req.params.Appuser
    let userU = req.params.universityUser
    let passU = req.params.universityPass
    const vector = await scrapper(userU, passU)
    res.json("DONE!")
    let c = await mongohandler.actualizar(user, vector[0], vector[1], vector[2], vector[3], vector[4], vector[5], vector[6])//falta borrar si es que hay el horario anterior
})
router.post('/directRegister/:user/:pass/:telefono/:universidad', async function (req, res) {//registro de un nuevo usuario de manera directa, es decir, sin usar instagram fb etc y sin importar su horario con nuestro scrapper
    console.log("se conectaron a /directRegister/:user/:pass/:telefono/:universidad")
    let user = req.params.user
    let pass = req.params.pass
    const hashedpassword = await bcrypt.hash(pass, 10)
    let telefono = req.params.telefono
    let u = req.params.universidad
    let x = await mongohandler.crearNuevoUsuario(user, hashedpassword, telefono, u)
    console.log(x)
})
router.get('/login/:user/:pass', async function (req, res) {//tratando de entrar a la aplicación
    console.log("se conectaron a login/:user/:pass")
    let username = req.params.user
    let pass = req.params.pass
    mongohandler.buscar(username).then(function (user) {
        return bcrypt.compare(pass, user.contraseña)
    }).then(function (samePassword) {
        if (!samePassword) {
            res.send("No digitó la contraseña correcta")
        } else {
            res.send("Digitó la contraseña correcta");
        }
    }).catch(function (error) {
        console.log("Error authenticating user: ");
        console.log(error);
    });
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
router.post('/newPostTablero/:fecha/:hora/:comentario', async function (req, res) {
    console.log("se conectaron a /newPostTablero/:fecha/:hora/:comentario")
    let fecha = req.params.fecha
    let hora = req.params.hora
    let comentario = req.params.comentario
    if (comentario)
        await mongohandler.nuevoComentarioTablero(fecha, hora, comentario)
    res.json("Done!")
})
router.post('/newPostAnuncios/:fecha/:hora/:comentario/:user', async function (req, res) {
    console.log("se conectaron a /newPostAnuncios/:fecha/:hora/:comentario/:user")
    let fecha = req.params.fecha
    let hora = req.params.hora
    let comentario = req.params.comentario
    let user = req.params.user
    if (comentario)
        await mongohandler.nuevoAnuncio(fecha, hora, comentario, user)
    res.json("Done!")
})
router.get('/retreivePostsTablero', async function (req, res) {
    console.log("se conectaron a /retreivePostsTablero")
    let x = await mongohandler.traerPostsAnterioresTablero()
    let xx=await x.toArray()
    res.json(xx)
})
router.get('/retreivePostsAnuncios', async function (req, res) {
    console.log("se conectaron a /retreivePostsAnuncios")
    let x = await mongohandler.traerPostsAnterioresAnuncios()
    let xx=await x.toArray()
    res.json(xx)
})
module.exports = app;