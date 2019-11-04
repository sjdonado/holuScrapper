const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId
class Mongohandler {
    constructor() {
        this.client = new MongoClient("mongodb+srv://jaime:Rd2fFLksxOainVOu@holu-cluster-aj9p4.mongodb.net?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });
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
        return this.connect().then(db => {
            return db.collection('users').updateOne(
                { usuario: user },
                {
                    $push: {
                        horario: {
                            $each: [lunes2, martes2, miercoles2, jueves2, viernes2, sabado2, domingo2]
                        }
                    }
                }
            )
        })
    }
    async crearNuevoUsuario(name, user, pass, tel, u) {
        return this.connect().then(db => {
            return db.collection('users').insertOne({ nombre: name, universidad: u, usuario: user, contraseña: pass, telefono: tel, horario: [], horaslibres: [], amigos: [] });
        })
    }
    async crearNuevoUsuarioConHorario(name, user, pass, tel, u, lunes, martes, miercoles, jueves, viernes, sabado, domingo, horaslibress) {
        return this.connect().then(db => {
            return db.collection('users').insertOne({ nombre: name, universidad: u, usuario: user, contraseña: pass, telefono: tel, horario: [lunes, martes, miercoles, jueves, viernes, sabado, domingo], horaslibres: horaslibress, amigos: [] });
        })
    }
    async traerHorario(user) {
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
            return db.collection('ElTableroPosts').insertOne({ fecha: f, hora: h, comentario: comment })
        })
    }
    async nuevoAnuncio(f, h, comment, user) {
        return this.connect().then(db => {
            return db.collection('Anuncios').insertOne({ fecha: f, hora: h, comentario: comment, usuario: user })
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
    async traerInfoAmigos(id) {//crear el campo nombre en mongo atlas y esta función debe devolver dirección de imagen, universidad y nombre(por ahora +3usuario)
        return this.connect().then(db => {
            return db.collection('users').findOne({ _id: ObjectId(id) }, { projection: { direccionimagen: 1, _id: 0, universidad: 1, usuario: 1 } })
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
        console.log(user1,user2)
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
}
module.exports = new Mongohandler()