const puppeteer = require('puppeteer');
async function run() {
    const USERNAME_SELECTOR = '#UserID'
    const PASSWORD_SELECTOR = '#PIN > input[type=password]'
    const INFOACADEMICA_SELECTOR = 'body > div.pagebodydiv > table.menuplaintable > tbody > tr:nth-child(1) > td:nth-child(2) > a'
    const MATRICULA_SELECTOR = 'body > div.pagebodydiv > table.menuplaintable > tbody > tr:nth-child(2) > td:nth-child(2) > a'
    const HORARIO_SELECTOR = 'body > div.pagebodydiv > table.menuplaintable > tbody > tr:nth-child(4) > td:nth-child(2) > a'
    const SELECT_SELECTOR = '#term_id'
    const BOTON_SELECTOR = 'body > div.pagebodydiv > form > input[type=submit]'
    const browser = await puppeteer.launch({ headless: false ,timeout:0});
    const page = await browser.newPage();
    await page.goto('https://pomelo.uninorte.edu.co/pls/prod/twbkwbis.P_WWWLogin');
    await page.click(USERNAME_SELECTOR);
    await page.keyboard.type('jrossetes')
    await page.click(PASSWORD_SELECTOR);
    await page.keyboard.type('jaimeramos5')
    await page.click('body > div.pagebodydiv > form > p > input[type=submit]')
    await page.waitForNavigation()
    await page.click(INFOACADEMICA_SELECTOR)
    await page.click(MATRICULA_SELECTOR)
    await page.click(HORARIO_SELECTOR)
    await page.select(SELECT_SELECTOR, '201930')
    await page.click(BOTON_SELECTOR)
    await page.waitForSelector('body > div.pagebodydiv');
    await page.waitFor(30000);
    const tmp =await page.evaluate(()=>
        Array.from(document.querySelectorAll('body div.pagebodydiv table.datadisplaytable[summary="Esta tabla lista los horarios de reunión calendarizados y los instructores asignados para esta clase.."] tbody tr td.dddefault')).map(r=>r.innerText)
    )
    console.log(tmp.length)
    //Array.from(document.querySelectorAll('body div.pagebodydiv table.datadisplaytable[summary="Esta tabla lista los horarios de reunión calendarizados y los instructores asignados para esta clase.."] tbody td.dddefault')).map((r)=>r.innerText)
    await browser.close()
}

run();