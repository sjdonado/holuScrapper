const MongoClient = require('mongodb').MongoClient;
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
            return db.collection('users').findOne({ usuario: user }, { fields: { usuario: 1, contraseña: 1 } });
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
    async crearNuevoUsuario(user, pass, tel, u) {
        return this.connect().then(db => {
            return db.collection('users').insertOne({ universidad: u, usuario: user, contraseña: pass, telefono: tel, horario: [],horaslibres: []});
        })
    }
    async crearNuevoUsuarioConHorario(user, pass, tel, u, lunes, martes, miercoles, jueves, viernes, sabado, domingo) {
        return this.connect().then(db => {
            return db.collection('users').insertOne({ universidad: u, usuario: user, contraseña: pass, telefono: tel, horario: [lunes, martes, miercoles, jueves, viernes, sabado, domingo] });
        })
    }
}
module.exports = new Mongohandler()