const ObjectId = require('mongodb').ObjectId
class Clasee {
    constructor(sender, mensaje, hora, dia, year) {
        this.sender = ObjectId(sender)
        this.text = mensaje
        this.hora = hora
        this.dia = dia
        this.year = year
    }
}
module.exports = Clasee