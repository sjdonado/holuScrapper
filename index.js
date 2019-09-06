const puppeteer = require('puppeteer');
const express = require("express")
const app = express()
app.get('/:user/:pass', async function (req, res) {
    let user = req.params.user
    let pass = req.params.pass
    await run(user, pass);
    res.send(horario)
})
app.listen(3000);
console.log('server started on port 3000');
let horario = []
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
async function run(user, pass) {
    const browser = await puppeteer.launch({headless:false, args: ['--no-sandbox'] });
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
        let h1, h2, dd, ii = []
        for (let d in data) {
            let c = new clase()
            if (i == 4) {
                ii = []
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
                if (verificar(matrix2, h1, h2, dd, ii)) {
                    let c = new clase(h1, h2, dd, ii)
                    matrix2.push(c)
                }
                i = 0
            }
        }
        let lunes2 = []
        let martes2 = []
        let miercoles2 = []
        let jueves2 = []
        let viernes2 = []
        let sabado2 = []
        let domingo2 = []

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
    }
}

function verificar(m, hi, hf, ddd, ii) {
    if (m.length == 0) {
        return true
    } else {
        for (let i in m) {
            if (m[i].horainicial == hi && m[i].horafinal == hf && matrix2[i].dia == ddd) {
                m[i].intervalos.push(ii)
                return false
            }
        }
    }
    return true
}
module.exports = app;
//debo orientar todo esto a objetos

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