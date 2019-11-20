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
        await this.connect().then(async (db) => {
            await db.collection('users').insertOne({ nombre: name, universidad: u, usuario: user, contraseña: pass, telefono: tel, horaslibres: [], amigos: [] });
        })
        return this.connect().then(db => {
            return db.collection('Horario').insertOne({ usuario: user, horario: [] });
        })
    }
    async crearNuevoUsuarioConHorario(name, user, pass, tel, u, lunes, martes, miercoles, jueves, viernes, sabado, domingo, horaslibress) {
        await this.connect().then(async (db) => {
            await db.collection('users').insertOne({ nombre: name, universidad: u, usuario: user, contraseña: pass, telefono: tel, horaslibres: horaslibress, amigos: [] });
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
    async nuevoAnuncio(f, h, comment, user, tag) {
        return this.connect().then(db => {
            return db.collection('Anuncios').insertOne({ fecha: f, hora: h, comentario: comment, usuario: user, respuestas: [], likes: [], dislikes: [], tag: tag })
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
            return db.collection('users').findOne({ _id: ObjectId(id) }, { projection: { direccionimagen: 1, _id: 1, universidad: 1, nombre: 1 } })
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
        await this.connect().then(async (db) => {
            await db.collection('users').updateOne({ '_id': ObjectId(user1) }, { $push: { amigos: user2 } })
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
    async traerRespuestasEltablero(id) {
        return this.connect().then(db => {
            return db.collection('ElTableroPosts').findOne({ '_id': ObjectId(id) }, { projection: { respuestas: 1, _id: 0 } })
        })
    }
    async nuevaRespuestaEltablero(idAnuncio, respuesta) {
        return this.connect().then(db => {
            return db.collection('ElTableroPosts').updateOne({ '_id': ObjectId(idAnuncio) }, { $push: { respuestas: respuesta } })
        })
    }
    async nuevoLikeAnuncio(commentID, userID) {
        await this.connect().then(async (db) => {
            await db.collection('Anuncios').updateOne({ '_id': ObjectId(commentID) }, { $pull: { dislikes: ObjectId(userID) } })
        })

        return this.connect().then(async (db) => {
            return db.collection('Anuncios').updateOne({ '_id': ObjectId(commentID) }, { $push: { likes: ObjectId(userID) } })
        })
    }
    async noInteractionAnuncio(commentID, userID, flag) {
        if (flag === "1") {
            return await this.connect().then(async (db) => {
                return await db.collection('Anuncios').updateOne({ '_id': ObjectId(commentID) }, { $pull: { likes: ObjectId(userID) } })
            })
        } else {
            return await this.connect().then(async (db) => {
                return await db.collection('Anuncios').updateOne({ '_id': ObjectId(commentID) }, { $pull: { dislikes: ObjectId(userID) } })
            })
        }

    }
    async nuevoDislikeAnuncio(commentID, userID) {
        await this.connect().then(async (db) => {
            await db.collection('Anuncios').updateOne({ '_id': ObjectId(commentID) }, { $pull: { likes: ObjectId(userID) } })
        })
        return this.connect().then(async (db) => {
            return db.collection('Anuncios').updateOne({ '_id': ObjectId(commentID) }, { $push: { dislikes: ObjectId(userID) } })
        })
    }
    async nuevoLikeEltablero(commentID, userID) {
        await this.connect().then(async (db) => {
            await db.collection('ElTableroPosts').updateOne({ '_id': ObjectId(commentID) }, { $pull: { dislikes: ObjectId(userID) } })
        })
        return this.connect().then(async (db) => {
            return db.collection('ElTableroPosts').updateOne({ '_id': ObjectId(commentID) }, { $push: { likes: ObjectId(userID) } })
        })
    }
    async noInteractionTablero(commentID, userID, flag) {
        if (flag === "1") {
            return await this.connect().then(async (db) => {
                return await db.collection('ElTableroPosts').updateOne({ '_id': ObjectId(commentID) }, { $pull: { likes: ObjectId(userID) } })
            })
        } else {
            return await this.connect().then(async (db) => {
                return await db.collection('ElTableroPosts').updateOne({ '_id': ObjectId(commentID) }, { $pull: { dislikes: ObjectId(userID) } })
            })
        }

    }
    async nuevoDislikeEltablero(commentID, userID) {
        await this.connect().then(async (db) => {
            await db.collection('ElTableroPosts').updateOne({ '_id': ObjectId(commentID) }, { $pull: { likes: ObjectId(userID) } })
        })

        return this.connect().then(async (db) => {
            return db.collection('ElTableroPosts').updateOne({ '_id': ObjectId(commentID) }, { $push: { dislikes: ObjectId(userID) } })
        })
    }
    async traerAnunciosPorFiltros(filtro) {
        return this.connect().then(async (db) => {
            return db.collection('Anuncios').find({ tag: filtro })
        })
    }
    async nuevoMensaje(idConversacion, user1, user2, objetoMensaje) {//se tiene que mejorar
        return this.connect().then(async (db) => {
            return db.collection('Conversaciones').findOneAndUpdate(
                { "_id": idConversacion },
                { $set: { _id: idConversacion, user1: user1, user2: user2 }, $push: { mensajes: objetoMensaje } },
                { upsert: true, returnNewDocument: true }
            );
        })
    }
    async buscarConversaciones(user) {
        return this.connect().then(async (db) => {
            return db.collection('Conversaciones').find(
                { $or: [{ user1: user }, { user2: user }] }
            )
        })
    }
    async traerMensajesAnteriores(idConversacion) {
        return this.connect().then(async (db) => {
            return db.collection('Conversaciones').findOne(
                { _id: idConversacion }, { projection: { mensajes: 1, text: 1, _id: 0 } }
            )
        })
    }
}
module.exports = new Mongohandler()