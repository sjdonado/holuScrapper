const express = require("express")
const app = express()
const bcrypt = require('bcrypt')
const mongohandler = require('./Mongolib/index')
const scrapper= require('./scrappers/uninorte')
//const config=require('dotenv').config()
app.listen(3000);
console.log('server started on port 3000');
app.get('/completeRegister/:userApp/:passApp/:telefono/:universidad/:userU/:passU', async function (req, res) {//registro completo (con horario incluido)
    console.log("se conectaron a complete register")
    let user = req.params.userApp
    let pass = req.params.passApp
    let number=req.params.telefono
    let uni=req.params.universidad
    let uniUser=req.params.userU
    let uniPass=req.params.passU
    const vector =await scrapper(uniUser, uniPass);
    res.send("DONE!")
    const hashedpassword = await bcrypt.hash(pass, 10)
    let c = await mongohandler.crearNuevoUsuarioConHorario(user,hashedpassword,number,uni,vector[0],vector[1],vector[2],vector[3], vector[4], vector[5], vector[6])
})
app.get('/:Appuser/:universityUser/:universityPass', async function (req, res) {//para cuando una persona que al registrarse no quiso importar su horario y apenas ahora lo va a hacer
    let user = req.params.Appuser
    let userU=req.params.universityUser
    let passU = req.params.universityPass
    const vector=await scrapper(userU, passU)
    res.json("DONE!")
    let c = await mongohandler.actualizar(user,vector[0],vector[1],vector[2],vector[3], vector[4], vector[5], vector[6])
})
app.get('/directRegister/:user/:pass/:telefono/:universidad', async function (req, res) {//registro de un nuevo usuario de manera directa, es decir, sin usar instagram fb etc y sin importar su horario con nuestro scrapper
    console.log("se conectaron")
    let user = req.params.user
    let pass = req.params.pass
    const hashedpassword = await bcrypt.hash(pass, 10)
    let telefono = req.params.telefono
    let u = req.params.universidad
    let x = await mongohandler.crearNuevoUsuario(user, hashedpassword, telefono, u)
    console.log(x)
})
app.get('/login/:user/:pass', async function (req, res) {
    console.log("se conectaron")
    let username = req.params.user
    let pass = req.params.pass
    mongohandler.buscar(username).then(function (user) {
        return bcrypt.compare(pass, user.contraseña)
    }).then(function (samePassword) {
        if (!samePassword) {
            res.send("No digitó la contraseña correcta")
        } else {
            res.send("Digitó la contraseña correcta");
        }
    }).catch(function (error) {
        console.log("Error authenticating user: ");
        console.log(error);
    });
})
module.exports = app;
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