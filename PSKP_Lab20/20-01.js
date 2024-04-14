// const express = require('express')
// const app = express()
// const https = require('https')
// const fs = require('fs')
// const PORT = 5000;

// let options = {
//     key: fs.readFileSync('./localhost.key').toString(),
//     cert: fs.readFileSync('./localhost.crt').toString(),
// };

// app.get('/', (req, res) => res.send('hello'));

// https.createServer(options, app).listen({
//     port: PORT
// }, () => console.log(`[OK] Server running at localhost:${PORT}/\n`));

const express = require('express')
const https = require('https')
const path = require('path')
const fs = require('fs')

const app = express()

app.use('/',(req,res,next) =>{
    res.send('Hello')
})

const sslServer = https.createServer({
    key: fs.readFileSync(path.join(__dirname,'getCert','LAB.key')),
    cert: fs.readFileSync(path.join(__dirname,'getCert','LAB.crt'))
}, app)

sslServer.listen(3443, ()=> console.log('SSL server start on https://KNS:3443'))