const mongohandler = require('../Mongolib/index')
async function Main(m1, m2, user1, user2) {
    let v1 = [], v1f = [], v2 = [], v2f = [], horasComun = []
    for (let i = 0; i < 7; i++) {//cuantificando horas del usuario 1
        v1 = []
        for (let j = 0; j < m1[i].length; j++) {
            if (m1[i][j].hora.includes("PM")) {
                v1[j] = m1[i][j].hora.substring(0, 5).trim().replace(':', '')
                v1[j] = v1[j] * 10000
                let sr = m1[i][j].hora.substring(1, 2)
                if (sr === ":") {
                    v1[j] = v1[j] * 10
                }
            } else {
                v1[j] = m1[i][j].hora.substring(0, 5).trim().replace(':', '')
                v1[j] = v1[j] * 100
            }
        }
        v1f.push(v1)
    }
    for (let i = 0; i < 7; i++) {//cuantificando horas del usuario 2
        v2 = []
        for (let j = 0; j < m2[i].length; j++) {
            if (m2[i][j].hora.includes("PM")) {
                v2[j] = m2[i][j].hora.substring(0, 5).trim().replace(':', '')
                v2[j] = v2[j] * 10000
                let sr = m2[i][j].hora.substring(1, 2)
                if (sr === ":") {
                    v2[j] = v2[j] * 10
                }
            } else {
                v2[j] = m2[i][j].hora.substring(0, 5).trim().replace(':', '')
                v2[j] = v2[j] * 100
            }
        }
        v2f.push(v2)
    }
    horasComun = horasEnComun(v1f, v2f)//me devuelve una matriz con las horas libres en común por día

    for (let i = 0; i < 7; i++) {//agrega el id del user2 a la lista de amigos libres del user1
        let elemento = horasComun[i]
        for (let j = 0; j < elemento.length; j++) {
            let lahora = elemento[j]
            for (let k = 0; k < m1[i].length; k++) {
                if (lahora === m1[i][k].hora) {
                    m1[i][k].amigos.push(user2)
                }
            }
        }
    }


    for (let i = 0; i < 7; i++) {//agrega el id del user1 a la lista de amigos libres del user2
        let elemento = horasComun[i]
        for (let j = 0; j < elemento.length; j++) {
            let lahora = elemento[j]
            for (let k = 0; k < m2[i].length; k++) {
                if (lahora === m2[i][k].hora) {
                    m2[i][k].amigos.push(user1)
                }
            }
        }
    }
    mongohandler.cambiarhoraslibres(user1,m1)
    mongohandler.cambiarhoraslibres(user2,m2)
    mongohandler.nuevoAmigo(user1,user2)
}

function horasEnComun(m1, m2) {
    let v4 = []
    for (let i = 0; i < 7; i++) {
        v1 = m1[i]
        v2 = m2[i]
        let v3 = [], ii = 0, j = 0
        while (ii < v1.length && j < v2.length) {
            while (v1[ii] > v2[j]) {
                j++
            }
            if (v1[ii] === v2[j]) {
                v3.push(parseo(v1[ii] + ""))
                j++
            }
            ii++
        }
        v4.push(v3)
    }
    return v4
}
function parseo(algo) {
    if (algo <= 113000) {
        if (algo.substring(0, 1) === "1") {
            return algo.substring(0, 2) + ":" + "30 AM"
        } else {
            return algo.substring(0, 1) + ":" + "30 AM"
        }
    } else {
        if (algo.substring(0, 2) === "12") {
            return "12:30 PM"
        } else {
            return algo.substring(0, 1) + ":30 PM"
        }
    }
}
module.exports = Main