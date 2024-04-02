const express = require('express');
const fs = require('fs');
const app = express();

const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const session = require('express-session')({
    resave: false,
    saveUninitialized: false,
    secret: 'qwe'
});

const port = 3000;
const users = JSON.parse(fs.readFileSync('users.json'));

app.use(session);
app.use(passport.initialize());
passport.use(new BasicStrategy((login, password, done) => {
    console.log(`\npassport.use: login = ${login}, password = ${password}`);
    let rc = null;
    let credentials = getCredentials(login);
    if (!credentials) {
        rc = done(null, false, { message: 'Incorrect login' });
        console.log(`denied: login = ${login}, password = ${password}`);
    }
    else if (!verifyPassword(credentials.password, password)) {
        rc = done(null, false, { message: 'Incorrect password' });
        console.log(`incorrect: login = ${login}, password = ${password}`);
    }
    else
        rc = done(null, login);
    return rc;
}));

// Перенеправление на /login
app.get('/', (req, res) => res.redirect('/login'));


// Ввод логина и пароля в prompt'е для аутентифицированного доступа к ресурсу
app.get('/login', (req, res, next) => {
    if (req.session.logout) {
        req.session.logout = false;
        delete req.headers['authorization'];
    }
    next();
}, passport.authenticate('basic', { session: false }))
    .get('/login', (req, res) => {
        res.redirect('/resource');
    });

// Отключить аутентифицированный доступ к ресурсу 
app.get('/logout', (req, res) => {
    req.session.logout = true;
    res.redirect('/login');
});

// Ресурс отправляет сообщение RESOURCE
// При попытке неаутентифицированного доступа выполняет переадресацию на GET /login 
app.get('/resource', (req, res) => {
    if (req.headers['authorization'])
        res.send('secret resource');
    else
        res.redirect('/login');
});

// Остальные URI => Сообщение со статусом 404 
app.get('*', (req, res) => {
    res.status(404).send('[ERROR] 404: Not Found');
});

const getCredentials = login => {
    console.log('login', login)
    console.log('found', users.find(u => u.login.toUpperCase() == login.toUpperCase()))
    return users.find(u => u.login.toUpperCase() == login.toUpperCase());
}
const verifyPassword = (firstPassword, secondPassword) => firstPassword == secondPassword;

app.listen(process.env.PORT || port, () => console.log(`Server running at localhost:${port}/\n`));