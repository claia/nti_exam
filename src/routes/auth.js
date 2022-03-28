const express = require('express');
const router = express.Router();
const passport = require('passport');
const { isLoggedIn } = require('../lib/auth');

router.post('/login', passport.authenticate('local.login', {
    successRedirect: '/main',
    failureRedirect: '/login',
    failureFlash: true
}));

router.post('/login', (req, res, next) => {
    req.check('username', 'Username is required').notEmpty();
    req.check('password', 'Password is required').notEmpty();
    const errors = req.validationErrors();
    if (errors.length > 0) {
        req.flash('message', errors[0].msg);
        res.redirect('/login');
    }
    passport.authenticate('local.login', {
        successRedirect: './views/layouts/main',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
});

router.get('/', isLoggedIn, (req, res) => {
    res.render('./layouts/dashboard');
});

module.exports = router;