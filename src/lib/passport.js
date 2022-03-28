const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const pool = require('../database');
const helpers = require('./helpers');

passport.use('local.login', new localStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async(req, username, password, done, res) => {
    if (rows.length > 0) {
        const user = rows[0];
        const validPass = await helpers.matchPassword(password, user.password);
        if (validPass) {
            done(null, user, req.flash('success', 'Welcome ' + user.username));
            res.render('./layouts/main')
        } else {
            done(null, false, req.flash('message', 'Incorrect password'));
        }
    } else {
        return done(null, false, req.flash('message', 'Username does not exists'));
    }
}))