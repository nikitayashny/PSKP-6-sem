const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github').Strategy;

const app = express();

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GitHubStrategy({
  clientID: '78bddaa3675bfd78643b',
  clientSecret: 'c2b6fd2bcb60f45ba770026070d919798ab918ca',
  callbackURL: '/auth/github/callback'
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback', passport.authenticate('github', {
  successRedirect: '/resource',
  failureRedirect: '/login'
}));

app.get('/logout', (req, res) => {
    req.logout(function () {
        res.redirect('/login')
    })
});

app.get('/resource', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`RESOURCE\nUser ID: ${req.user.id}\nUsername: ${req.user.username}`);
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/views/login.html');
});

app.use((req, res) => {
  res.status(404).send('Not found');
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});