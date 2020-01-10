const puppeteer = require('puppeteer');
async function run(user, pass) {
    horario = [], lunes2 = [], martes2 = [], miercoles2 = [], jueves2 = [], viernes2 = [], sabado2 = [], domingo2 = [], thefinalone = []
    const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: false });
    try {
        const USERNAME_SELECTOR = '#UserID'
        const PASSWORD_SELECTOR = '#PIN > input[type=password]'
        const INFOACADEMICA_SELECTOR = 'body > div.pagebodydiv > table.menuplaintable > tbody > tr:nth-child(1) > td:nth-child(2) > a'
        const MATRICULA_SELECTOR = 'body > div.pagebodydiv > table.menuplaintable > tbody > tr:nth-child(2) > td:nth-child(2) > a'
        const HORARIO_SELECTOR = 'body > div.pagebodydiv > table.menuplaintable > tbody > tr:nth-child(4) > td:nth-child(2) > a'
        const SELECT_SELECTOR = '#term_id'
        const BOTON_SELECTOR = 'body > div.pagebodydiv > form > input[type=submit]'
        const page = await browser.newPage();
        await page.goto('https://pomelo.uninorte.edu.co/pls/prod/twbkwbis.P_WWWLogin');
        await page.click(USERNAME_SELECTOR);
        await page.keyboard.type(user)
        await page.click(PASSWORD_SELECTOR);
        await page.keyboard.type(pass)
        await page.click('body > div.pagebodydiv > form > p > input[type=submit]')
        await page.waitForNavigation()
        await page.click(INFOACADEMICA_SELECTOR)
        await page.click(MATRICULA_SELECTOR)
        await page.click(HORARIO_SELECTOR)
        await page.select(SELECT_SELECTOR, '202010')
        await page.click(BOTON_SELECTOR)
        await page.waitForSelector('body > div.pagebodydiv');
        await page.waitFor(10000);
        const data = await page.evaluate(() =>
            Array.from(document.querySelectorAll('body div.pagebodydiv table.datadisplaytable[summary="Esta tabla lista los horarios de reunión calendarizados y los instructores asignados para esta clase.."] tbody tr td.dddefault')).map(r => r.innerText)
        )
        matrix2 = []
        i = 0
        let h1, h2, dd, ii = [], aux
        for (let d in data) {
            let c = new clase()
            if (i == 4) {
                ii = []
                aux = data[d]
                ii.push(data[d])
            } else {
                if (i == 2) {
                    dd = data[d]
                } else {
                    if (i == 1) {
                        let nuevo = data[d].split("-")
                        h1 = nuevo[0].trim()
                        h2 = nuevo[1].trim()
                    }
                }
            }
            i++
            if (i == 7) {
                if (verificar(matrix2, h1, h2, dd, aux)) {
                    let c = new clase(h1, h2, dd, ii)
                    matrix2.push(c)
                }
                i = 0
            }
        }
        for (let i in matrix2) {
            let o = new clases(matrix2[i].horainicial, matrix2[i].horafinal, matrix2[i].intervalos)
            if (matrix2[i].dia === "V") {
                viernes2.push(o)
            } else {
                if (matrix2[i].dia === "J") {
                    jueves2.push(o)
                } else {
                    if (matrix2[i].dia === "I") {
                        miercoles2.push(o)
                    } else {
                        if (matrix2[i].dia === "M") {
                            martes2.push(o)
                        } else {
                            if (matrix2[i].dia === "L") {
                                lunes2.push(o)
                            } else {
                                if (matrix2[i].dia === "D") {
                                    domingo2.push(o)
                                } else {
                                    if (matrix2[i].dia === "S") {
                                        sabado2.push(o)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        lunes2 = ordenar(lunes2)
        martes2 = ordenar(martes2)
        miercoles2 = ordenar(miercoles2)
        jueves2 = ordenar(jueves2)
        viernes2 = ordenar(viernes2)
        sabado2 = ordenar(sabado2)
        domingo2 = ordenar(domingo2)
        horario.push(lunes2)
        horario.push(martes2)
        horario.push(miercoles2)
        horario.push(jueves2)
        horario.push(viernes2)
        horario.push(sabado2)
        horario.push(domingo2)
        let freehours = horasLibres(horario)
        thefinalone.push(horario)
        thefinalone.push(freehours)
        let pages = await browser.pages();
        pages.forEach(async (page) => await page.close());
    } catch (e) {
        console.log(e)
    } finally {
        return thefinalone
    }
}

function verificar(m, hi, hf, ddd, a) {
    if (m.length == 0) {
        return true
    } else {
        for (let i in m) {
            if (m[i].horainicial == hi && m[i].horafinal == hf && matrix2[i].dia == ddd) {
                m[i].intervalos.push(a)
                return false
            }
        }
    }
    return true
}
function ordenar(arreglo) {
    vector = []
    for (let i in arreglo) {
        if (arreglo[i].horainicial.includes("PM")) {
            vector[i] = arreglo[i].horainicial.substring(0, 5).trim().replace(':', '')
            vector[i] = vector[i] * 10000
            let sr = arreglo[i].horainicial.substring(1, 2)
            if (sr === ":") {
                vector[i] = vector[i] * 10
            }
        } else {
            vector[i] = arreglo[i].horainicial.substring(0, 5).trim().replace(':', '')
            vector[i] = vector[i] * 100
        }
        vector[i] = vector[i] + parseFloat(i)
    }
    let ordenado = quick_Sort(vector)
    let final = []
    let s, pi
    for (i in ordenado) {
        s = ordenado[i].toString()
        pi = parseInt(s.substring(s.length - 1, s.length))
        final[i] = arreglo[pi]
    }
    return final
}
function quick_Sort(origArray) {
    if (origArray.length <= 1) {
        return origArray;
    } else {

        var left = [];
        var right = [];
        var newArray = [];
        var pivot = origArray.pop();
        var length = origArray.length;

        for (var i = 0; i < length; i++) {
            if (origArray[i] <= pivot) {
                left.push(origArray[i]);
            } else {
                right.push(origArray[i]);
            }
        }

        return newArray.concat(quick_Sort(left), pivot, quick_Sort(right));
    }
}
function horasLibres(matriz) {//hacer comparaciones dia a dia para solo darle peso a las horas
    let ma = []
    for (let i in matriz) {
        let vector = matriz[i]
        let horas = [630, 730, 830, 930, 1030, 1130, 123000, 130000, 230000, 330000, 430000, 530000, 630000, 730000, 830000]
        let horas2 = []
        let ii = 0
        for (let j in vector) {
            let numero1 = vector[j].horainicial.substring(0, 5).trim().replace(':', '')
            let numero2 = vector[j].horafinal.substring(0, 5).trim().replace(':', '')
            vii = vector[j].horainicial
            vff = vector[j].horainicial
            if (vii.includes("P")) {
                numero1 = numero1 * 100
                numero2 = numero2 * 1000
                if (vii.substring(0, 2) !== "12") {
                    numero1 = numero1 * 10
                }
            }
            while (ii < horas.length && horas[ii] < numero2) {
                if (!(horas[ii] >= numero1 && horas[ii] < numero2)) {
                    horas2.push(reparseo(horas[ii] + ""))
                }
                ii++
            }
        }
        while (ii < horas.length) {
            horas2.push(reparseo(horas[ii] + ""))
            ii++
        }
        ma.push(horas2)
    }
    return ma //retorno ya la matriz lista
}
function reparseo(algo) {
    if (algo < 1200) {
        if (algo.substring(0, 1) === "1") {
            let obj = new otraClase(algo.substring(0, 2) + ":" + algo.substring(2, algo.length) + " AM")
            return obj
        } else {
            let obj = new otraClase(algo.substring(0, 1) + ":" + algo.substring(1, algo.length) + " AM")
            return obj
        }
    } else {
        if (algo.substring(0, 2) === "12") {
            let obj = new otraClase(algo.substring(0, 2) + ":30 PM")
            return obj
        } else {
            let obj = new otraClase(algo.substring(0, 1) + ":30 PM")
            return obj
        }
    }
}
class clase {

    constructor(horai, horaf, dia, intervalos) {
        this.horainicial = horai
        this.horafinal = horaf
        this.dia = dia
        this.intervalos = intervalos
    }

}
class clases {

    constructor(horai, horaf, intervalos) {
        this.horainicial = horai
        this.horafinal = horaf
        this.intervalos = intervalos
    }

}
class otraClase {
    constructor(lahora) {
        this.hora = lahora
        this.amigos = []
    }
}

module.exports = run
//SIMON
/*
const browser = await puppeteer.launch({ headless: false, timeout: 0 });
const page = await browser.newPage();
await page.goto('https://www.unisimon.edu.co/portales/estudiantes');
const USERNAME_SELECTOR = '#usuario'
const PASSWORD_SELECTOR = '#clave'
const BOTON_SELECTOR='body > div.w100.rel.bec.pt20.pb50 > div > div > div > fieldset > div.w75.dcenter.mt50.w100m > form > div > div.col-md-7 > div.fright.dtable.pad12.cwhite.lts2.b05.fw3.mt20.mrp10.fz10.poi.fnonem.mb30m'
const CASI_SELECTOR='#opciones > div:nth-child(4) > font'
await page.click(USERNAME_SELECTOR);
await page.keyboard.type('juan.rosado')
await page.click(PASSWORD_SELECTOR);
await page.keyboard.type('Rose1896')
await page.click(BOTON_SELECTOR);
await page.click(CASI_SELECTOR)*/