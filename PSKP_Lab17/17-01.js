const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { v4: uuidv4 } = require('uuid');
const { Strategy } = require('passport-local');
const { readFileSync } = require('fs');
const { join } = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(__dirname + '/static'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    genid: req => {
        console.log('\x1b[33m%s\x1b[0m', `[GENERATE] Session ID: ${req.sessionID}`);
        return uuidv4();
    },
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser((user, done) => { done(null, user); });
passport.deserializeUser((user, done) => { done(null, user); });

passport.use(new Strategy((username, password, done) => {
    const users = JSON.parse(readFileSync(join(__dirname, './users.json')));
    const index = users.findIndex(e => e.username === username);
    const user = users[index];

    if (index === -1)
        return done(null, false, { 'Error': 'Incorrect credentials' });

    if (user.password !== password)
        return done(null, false, { 'Error': `Passwords doesn't match` });

    return done(null, user);
}));




app.get('/', (req, res) => { res.redirect('/login'); });

app.get('/login', (req, res) => { res.sendFile(join(__dirname, './static/login.html')); });

app.post('/login', passport.authenticate(
    'local',
    {
        successRedirect: '/resource',
        failureRedirect: '/login'
    }
));


app.get('/resource', (req, res) => {
    console.log('\x1b[36m%s\x1b[0m', `[RESOURCE] Session ID: ${req.sessionID}`);
    if (!req.user)
        return res.status(401).send('<h2>[ERROR] 401: Unauthorized</h2>');
    return res.send(`<h2>Welcome to the resource, ${req.user.username}!</h2>`);

});


app.get('/logout', (req, res, next) => {
    req.logout(err => {
        if (err)
            console.log(err);

        res.redirect('/login');
    })
});


app.listen(process.env.PORT || PORT, () => console.log(`[OK] Server running at localhost:${PORT}/\n`));