const puppeteer = require('puppeteer');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
async function run() {
    /*const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();

    await page.goto('https://www.uninorte.edu.co/login');
    const USERNAME_SELECTOR = '#login_content > div.loginSection.estudiantes > form > p:nth-child(1) > input';
    const PASSWORD_SELECTOR = '#login_content > div.loginSection.estudiantes > form > p:nth-child(2) > input';
    const BUTTON_SELECTOR = '#login_content > div.loginSection.estudiantes > form > p:nth-child(3) > input';
    const SPAN_SELECTOR='#aui_3_4_0_1_187';
    const AURORA_SELECTOR='#article_10112_10230_2547997_2\.2 > div > div > p > a';
    await page.click(USERNAME_SELECTOR);
    await page.keyboard.type('jrossetes');

    await page.click(PASSWORD_SELECTOR);
    await page.keyboard.type('jaimeramos5');

    await page.click(BUTTON_SELECTOR);

    await page.waitForNavigation();
    await page.waitFor(10000)
    //await page.screenshot({ path: 'screenshots/login.png' });
    await page.click(SPAN_SELECTOR)
    await page.waitForNavigation();
    await page.waitFor(10000)
    await page.click(AURORA_SELECTOR)
    browser.close();*/
    const USERNAME_SELECTOR ='#UserID'
    const PASSWORD_SELECTOR ='#PIN > input[type=password]'
    const INFOACADEMICA_SELECTOR='body > div.pagebodydiv > table.menuplaintable > tbody > tr:nth-child(1) > td:nth-child(2) > a'
    const MATRICULA_SELECTOR='body > div.pagebodydiv > table.menuplaintable > tbody > tr:nth-child(2) > td:nth-child(2) > a'
    const HORARIO_SELECTOR='body > div.pagebodydiv > table.menuplaintable > tbody > tr:nth-child(3) > td:nth-child(2) > a'
    const browser = await puppeteer.launch({headless:false});
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
    browser.close();
}

run();