const puppeteer = require('puppeteer');
async function run(user, pass) {
    horario = [], lunes2 = [], martes2 = [], miercoles2 = [], jueves2 = [], viernes2 = [], sabado2 = [], domingo2 = []
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
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
        await page.select(SELECT_SELECTOR, '201930')
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
        let pages = await browser.pages();
        pages.forEach(async (page) => await page.close());
    } catch (e) {
        console.log(e)
    } finally {
        return horario
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
            let sr=arreglo[i].horainicial.substring(1,2)
            if(sr===":"){
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

module.exports = run