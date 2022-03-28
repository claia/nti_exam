const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../lib/auth');
const pool = require('../database');

router.post('/login', async(req, res, next) => {
    if (req.body.username != '' &&
        req.body.username != '') {
        await pool.query(`SELECT * from employees where userid = ? and passwrd = ?`, [req.body.username, req.body.password], (err, data, fields) => {
            if (err) throw err;
            console.log(data)
            if (data.length > 0) {
                res.render('./layouts/dashboard');
            } else {
                res.render('./layouts/login');
            }
        });
    } else {
        res.render('./layouts/login');
    }
});

router.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
});

module.exports = router;