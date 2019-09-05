const puppeteer = require('puppeteer');
const express = require("express")
const app = express()
app.get('/:user/:pass', async function (req, res) {
    let user = req.params.user
    let pass = req.params.pass
    const data = await run(user, pass);
    console.log(data)
    res.send("done!")
})
app.listen(3000);
console.log('server started on port 3000');

async function run(user, pass) {

    const USERNAME_SELECTOR = '#UserID'
    const PASSWORD_SELECTOR = '#PIN > input[type=password]'
    const INFOACADEMICA_SELECTOR = 'body > div.pagebodydiv > table.menuplaintable > tbody > tr:nth-child(1) > td:nth-child(2) > a'
    const MATRICULA_SELECTOR = 'body > div.pagebodydiv > table.menuplaintable > tbody > tr:nth-child(2) > td:nth-child(2) > a'
    const HORARIO_SELECTOR = 'body > div.pagebodydiv > table.menuplaintable > tbody > tr:nth-child(4) > td:nth-child(2) > a'
    const SELECT_SELECTOR = '#term_id'
    const BOTON_SELECTOR = 'body > div.pagebodydiv > form > input[type=submit]'
    const browser = await puppeteer.launch({ headless: false, timeout: 0 });
    try {
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
        matrix = []
        i = 0
        vector = []//0-hora de inicio, 1-hora de fin, 2-letra, 3array
        for (let d in data) {
            if (i == 4) {
                ve = []
                ve.push(data[d])
                vector.push(ve)
            } else {
                if (i == 2) {
                    vector.push(data[d])
                } else {
                    if (i == 1) {
                        let nuevo = data[d].split("-")
                        vector.push(nuevo[0].trim())
                        vector.push(nuevo[1].trim())
                    }
                }
            }
            i++
            if (i == 7) {
                if (verificar(vector, matrix)) {
                    matrix.push(vector)
                }
                vector = []
                i = 0
            }
        }
        let lunes = []
        let martes = []
        let miercoles = []
        let jueves = []
        let viernes = []
        let sabado = []
        let domingo = []

        for (let i in matrix) {
            if (matrix[i][2] === "V") {
                viernes.push(matrix[i])
            } else {
                if (matrix[i][2] === "J") {
                    jueves.push(matrix[i])
                } else {
                    if (matrix[i][2] === "I") {
                        miercoles.push(matrix[i])
                    } else {
                        if (matrix[i][2] === "M") {
                            martes.push(matrix[i])
                        } else {
                            if (matrix[i][2] === "L") {
                                lunes.push(matrix[i])
                            } else {
                                if (matrix[i][2] === "D") {
                                    domingo.push(matrix[i])
                                } else {
                                    if (matrix[i][2] === "S") {
                                        sabado.push(matrix[i])
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        let horario = []
        horario.push(lunes)
        horario.push(martes)
        horario.push(miercoles)
        horario.push(jueves)
        horario.push(viernes)
        horario.push(sabado)
        horario.push(domingo)
        for (let i in horario) {
            for (let j in horario[i]) {
                horario[i][j].splice(2, 1)
            }
        }
        return horario;
    } catch (e) {
        console.log(e)
    } finally {
        await browser.close()
    }
    
}
function verificar(v, m) {
    if (m.length == 0) {
        return true
    } else {
        for (let i in matrix) {
            if (matrix[i][0] == v[0] && matrix[i][1] == v[1] && matrix[i][2] == v[2]) {
                matrix[i][3].push(v[3].toString())
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