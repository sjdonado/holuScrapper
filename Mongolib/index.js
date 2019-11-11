const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId
class Mongohandler {
    constructor() {
        //mongodb+srv://jaime:Rd2fFLksxOainVOu@holu-cluster-aj9p4.mongodb.net?retryWrites=true&w=majority
        this.client = new MongoClient("mongodb://localhost:27017", { useNewUrlParser: true, useUnifiedTopology: true });
        this.dbName = 'holu-db'
    }
    connect() {
        return new Promise((resolve, reject) => {
            this.client.connect(err => {
                if (err) {
                    reject(err)
                }
                console.log('Connected')
                resolve(this.client.db(this.dbName))
            })
        })
    }
    async buscar(user) {
        return this.connect().then(db => {
            return db.collection('users').findOne({ usuario: user }, { usuario: 1, contraseña: 1 });
        })
    }

    async actualizar(user, lunes2, martes2, miercoles2, jueves2, viernes2, sabado2, domingo2) {
        const horario = [lunes2, martes2, miercoles2, jueves2, viernes2, sabado2, domingo2]
        return this.connect().then(db => {
            return db.collection('Horario').updateOne(
                { usuario: user },
                { $set: { 'Horario': horario } }
            )
        })
    }
    async crearNuevoUsuario(name, user, pass, tel, u) {
        this.connect().then(db => {
            db.collection('users').insertOne({ nombre: name, universidad: u, usuario: user, contraseña: pass, telefono: tel, horaslibres: [], amigos: [] });
        })
        return this.connect().then(db => {
            return db.collection('Horario').insertOne({ usuario: user, horario: [] });
        })
    }
    async crearNuevoUsuarioConHorario(name, user, pass, tel, u, lunes, martes, miercoles, jueves, viernes, sabado, domingo, horaslibress) {
        this.connect().then(db => {
            db.collection('users').insertOne({ nombre: name, universidad: u, usuario: user, contraseña: pass, telefono: tel, horaslibres: horaslibress, amigos: [] });
        })
        return this.connect().then(db => {
            return db.collection('Horario').insertOne({ usuario: user, horario: [lunes, martes, miercoles, jueves, viernes, sabado, domingo] });
        })
    }
    async traerHorario(user) {//horaslibres
        return this.connect().then(db => {
            return db.collection('users').findOne({ usuario: user }, { projection: { horaslibres: 1 } });
        })
    }
    async cambiarhoraslibres(user, horas) {//agregar un amigo al vector de amigos de horaslibres de cada usuario
        return this.connect().then(db => {
            return db.collection('users').updateOne({ '_id': ObjectId(user) }, { $set: { 'horaslibres': horas } })
        })
    }
    async nuevoComentarioTablero(f, h, comment) {
        return this.connect().then(db => {
            return db.collection('ElTableroPosts').insertOne({ fecha: f, hora: h, comentario: comment, respuestas: [], likes: [], dislikes: [] })
        })
    }
    async nuevoAnuncio(f, h, comment, user) {
        return this.connect().then(db => {
            return db.collection('Anuncios').insertOne({ fecha: f, hora: h, comentario: comment, usuario: user, respuestas: [], likes: [], dislikes: [] })
        })
    }
    async traerPostsAnterioresTablero() {
        return this.connect().then(db => {
            return db.collection('ElTableroPosts').find({}).limit(50)
        })
    }
    async traerPostsAnterioresAnuncios() {
        return this.connect().then(db => {
            return db.collection('Anuncios').find({}).limit(50)
        })
    }
    async insertarFoto(user, image) {
        return this.connect().then(db => {
            return db.collection('users').updateOne({ 'usuario': user }, { $set: { 'direccionimagen': image } })
        })
    }
    async traerfoto(user) {
        return this.connect().then(db => {
            return db.collection('users').findOne({ 'usuario': user }, { projection: { direccionimagen: 1, _id: 0 } })
        })
    }
    async traerFotoPorId(id) {
        return this.connect().then(db => {
            return db.collection('users').findOne({ '_id': ObjectId(id) }, { projection: { direccionimagen: 1, usuario: 1, _id: 0 } })
        })
    }
    async traerInfoAmigos(id) {//crear el campo nombre en mongo atlas y esta función debe devolver dirección de imagen, universidad y nombre(por ahora +3usuario)
        return this.connect().then(db => {
            return db.collection('users').findOne({ _id: ObjectId(id) }, { projection: { direccionimagen: 1, _id: 0, universidad: 1, nombre: 1 } })
        })
    }
    async traerHorasLibres(user) {
        return this.connect().then(db => {
            return db.collection('users').findOne({ usuario: user }, { projection: { horaslibres: 1, _id: 0 } })
        })
    }
    async buscarUsuario(user) {//para que al momento de registrarse se verifique que ese usuario que quiere la persona no haya sido tomado anteriormente
        return this.connect().then(db => {
            return db.collection('users').findOne({ usuario: user }, { projection: { usuario: 1, _id: 0 } })
        })
    }
    async nuevoAmigo(user1, user2) {
        this.connect().then(db => {
            db.collection('users').updateOne({ '_id': ObjectId(user1) }, { $push: { amigos: user2 } })
        })
        return this.connect().then(db => {
            return db.collection('users').updateOne({ '_id': ObjectId(user2) }, { $push: { amigos: user1 } })
        })
    }
    async traerTodaInfoUsuario(user) {
        return this.connect().then(db => {
            return db.collection('users').findOne({ usuario: user })
        })
    }
    async traerRespuestasPostAnuncios(id) {
        return this.connect().then(db => {
            return db.collection('Anuncios').findOne({ '_id': ObjectId(id) }, { projection: { respuestas: 1, _id: 0 } })
        })
    }
    async nuevaRespuestaAnuncio(idAnuncio, objeto) {
        return this.connect().then(db => {
            return db.collection('Anuncios').updateOne({ '_id': ObjectId(idAnuncio) }, { $push: { respuestas: objeto } })
        })
    }
    async nuevoLikeAnuncio(commentID,userID){//primero se debe buscar en el array del documento correspondiente al anuncio en cuestión, si ya tiene like se borra del array de likes, si no se añade a dicho array y se busca si está en el de dislikes, si está se elimina.

    }
    async nuevoDislikeAnuncio(commentID,userID){//lo mismo de arriba pero con dislike...

    }
    //lo mismo pero con el tablero
    async nuevoLikeAnuncio(commentID,userID){

    }
    async nuevoDislikeAnuncio(commentID,userID){

    }
}
module.exports = new Mongohandler()