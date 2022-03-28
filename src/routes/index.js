const express = require('express');
const router = express.Router();
const pool = require('../database');
const async = require('async');
const { validationResult } = require('express-validator');
const { passwordValidator, validateConfirmPassword } = require('../lib/validator');
const bcrypt = require('bcryptjs');
let current_date = new Date();

router.get('/', (req, res) => {
    res.render('./layouts/dashboard');
});

router.get('/login', (req, res) => {
    res.render('./layouts/login');
});

// Employees functionality start
router.get('/employees', async(req, res) => {
    const employees = `SELECT e.id, e.first_name, e.last_name, e.email, s.description, 
                             DATE_FORMAT(e.created_date, "%Y-%m-%d") AS created_date
                      FROM employees e
                      INNER JOIN statuses s ON 
                        s.id = e.id_status;`;

    const status = `SELECT id, description FROM statuses WHERE category = 'E'`;

    let results_dt = {};

    async.parallel([
        function(parallel_done) {
            pool.query(employees, {}, function(err, results) {
                if (err) return parallel_done(err);
                results_dt.table1 = results;
                parallel_done();
            })
        },
        function(parallel_done) {
            pool.query(status, {}, function(err, results) {
                if (err) return parallel_done(err);
                results_dt.table2 = results;
                parallel_done();
            })
        }
    ], function(err) {
        if (err) console.log(err);
        res.render('./layouts/employees', { results_dt });
    });
});

router.post('/add', async(req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.send('Invalid');
    }
    if (req.body.password == req.body.confirmPassword) {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await pool.query(`INSERT INTO employees VALUES(NULL, ?, ?, ?, ?, ?, ?, ?)`, [req.body.first_name,
            req.body.last_name,
            req.body.email,
            current_date,
            req.body.id_status,
            req.body.userid,
            hashedPassword
        ], (err, fields, rows) => {
            if (err) {
                console.log(err);
            } else {
                res.render('./layouts/employees');
            }
        });
    } else {
        let message = "Password doesn't match. Try Again";
        res.render('./layouts/employees', { message });
    }
});

router.get('/delete/:id', async(req, res) => {
    const { id } = req.params;
    await pool.query(`DELETE FROM employees WHERE id = ?`, [id]);
    res.redirect('/employees');
});

router.get('/edit/:id', async(req, res) => {
    const { id } = req.params;
    const employee = `SELECT * FROM employees WHERE id = ` + id;
    const ticketspEmployee = `select t.id, t.subject, concat(e.first_name, ' ', e.last_name) as name, s.description as status, DATE_FORMAT(t.date, "%Y-%m-%d") AS date, t.description, t.id_status 
    from tickets as t
    inner join statuses s on 
       t.id_status = s.id
    inner join employees e on
       t.id_employee = e.id
    where e.id = ` + id + ` order by t.id asc;`;

    const results_dt = {};

    async.parallel([
        function(parallel_done) {
            pool.query(employee, {}, function(err, results) {
                if (err) return parallel_done(err);
                results_dt.table1 = results;
                parallel_done();
            })
        },
        function(parallel_done) {
            pool.query(ticketspEmployee, {}, function(err, results) {
                if (err) return parallel_done(err);
                results_dt.table2 = results;
                parallel_done();
            })
        }
    ], function(err) {
        if (err) console.log(err);
        res.render('controllers/edit', { results_dt });
    });
});

router.post('/edit/:id', async(req, res) => {
    const { id } = req.params;
    const { first_name, last_name, email, id_status, userid, passwrd } = req.body;
    const newEmployee = {
        first_name,
        last_name,
        email,
        id_status,
        userid,
        passwrd
    }
    await pool.query(`
            UPDATE employees
            SET ?
            WHERE id = ? `, [newEmployee, id], (err, data, fields) => {
        if (!err) res.redirect('/employees');
    });
});
// Employees functionality end

//Tickets functionality start
router.get('/tickets', (req, res) => {
    const ticketsInfo = `
            select t.id, t.subject, concat(e.first_name, ' ', e.last_name) as name, s.description as status, DATE_FORMAT(t.date, "%Y-%m-%d") AS date, t.description, t.id_status
            from tickets as t
            inner join statuses s on
            t.id_status = s.id
            inner join employees e on
            t.id_employee = e.id
            order by t.id asc;
            `;

    const dataEmployees =
        `
            select id, concat(first_name, ' ', last_name) as name from employees;
            `;

    const status = `
            select * from statuses where category = 'T';
            `;

    let results_dt = {};

    async.parallel([
        function(parallel_done) {
            pool.query(dataEmployees, {}, function(err, results) {
                if (err) return parallel_done(err);
                results_dt.table1 = results;
                parallel_done();
            });
        },
        function(parallel_done) {
            pool.query(status, {}, function(err, results) {
                if (err) return parallel_done(err);
                results_dt.table2 = results;
                parallel_done();
            });
        },
        function(parallel_done) {
            pool.query(ticketsInfo, {}, function(err, results) {
                if (err) return parallel_done(err);
                results_dt.table3 = results;
                parallel_done();
            })
        }
    ], function(err) {
        if (err) console.log(err);
        res.render('./layouts/tickets', { results_dt });
    });
});

router.post('/addtickets', async(req, res) => {
    console.log(req.body);
    let current_date = new Date();
    await pool.query(`
            INSERT INTO tickets VALUES(NULL, ? , ? , ? , ? , ? , ? )
            `, [req.body.subject,
        req.body.id_employee,
        req.body.description,
        current_date,
        req.body.id_status,
        '2',
    ], (err, fields, rows) => {
        if (err) {
            console.log(err)
        } else {
            res.render('./layouts/tickets');
        }
    });
});

router.get('/editickets/:id', async(req, res) => {
    const { id } = req.params;

    const ticketInfo = `
            select t.id, t.subject, concat(e.first_name, ' ', e.last_name) as name, s.description as status,
                DATE_FORMAT(t.date, "%Y-%m-%d") AS date, t.description, t.id_status
            from tickets as t
            inner join statuses s on
            t.id_status = s.id
            inner join employees e on
            t.id_employee = e.id
            where t.id = ` + id;

    const status = `
            select * from statuses where category = 'T';
            `;

    const employees = `
            select id, concat(first_name, ' ', last_name) as name from employees where id_status = 8;
            `;

    const timeEntries = `SELECT tt.id, concat(e.first_name, ' ', e.last_name) as name, DATE_FORMAT(tt.date_start, "%Y-%m-%d %h:%i:%s") AS date_start,
                         DATE_FORMAT(tt.date_end, "%Y-%m-%d %h:%i:%s") AS date_end, tt.note
                         FROM ticket_time_entries tt 
                         inner join employees e on
                         tt.id_employee = e.id
                         where tt.id_ticket = ` + id;

    let status_dt = {};

    async.parallel([
        function(parallel_done) {
            pool.query(ticketInfo, {}, function(err, results) {
                if (err) return parallel_done(err);
                status_dt.table1 = results;
                parallel_done();
            });
        },
        function(parallel_done) {
            pool.query(status, {}, function(err, results) {
                if (err) return parallel_done(err);
                status_dt.table2 = results;
                parallel_done();
            });
        },
        function(parallel_done) {
            pool.query(employees, {}, function(err, results) {
                if (err) return parallel_done(err);
                status_dt.table3 = results;
                parallel_done();
            })
        },
        function(parallel_done) {
            pool.query(timeEntries, {}, function(err, results) {
                if (err) return parallel_done(err);
                status_dt.table4 = results;
                parallel_done();
            })
        }
    ], function(err) {
        if (err) console.log(err);
        console.log(status_dt.table3)
        res.render('controllers/timentries', { status_dt, id });
    });
});

router.post('/editickets/:id', async(req, res) => {
    const { id } = req.params;
    const { subject, description, id_status } = req.body;
    const newTicket = {
        subject,
        description,
        id_status
    }
    await pool.query(`
            UPDATE tickets
            SET ?
            WHERE id = ? `, [newTicket, id], (err, data, fields) => {
        if (!err) res.redirect('/tickets');
    });
});

router.get('/deleteticket/:id', async(req, res) => {
    const { id } = req.params;
    await pool.query(`
            DELETE FROM tickets WHERE id = ? `, [id]);
    res.redirect('/tickets');
});

router.get('/viewtickets/:id', async(req, res) => {
    const { id } = req.params;
    console.log(id);
    await pool.query(`
            SELECT * FROM employees WHERE id = ? `, [id], (err, data, fields) => {
        console.log(data);
        res.render('controllers/edit', { data });
    });
});

router.get('/addnote/:id', async(req, res) => {
    const { id } = req.params;

    await pool.query(`select tn.id, tn.note, DATE_FORMAT(tn.created_date, "%Y-%m-%d") AS date, concat(e.first_name, ' ', e.last_name) as name 
                      from ticket_notes tn 
                      inner join employees e on
                        tn.userid = e.id
                      where tn.id_ticket = ? `, [id], (err, data, fields) => {
        console.log(data)
        res.render('controllers/ticketnote', { data, id });
    });
});

router.post('/addnote/:id', async(req, res) => {
    const { id } = req.params;
    const { note } = req.body;
    let userid = 2;
    await pool.query(`INSERT INTO ticket_notes values (null, ?, ?, ?, ?)`, [id, note, current_date, userid], (err, data, fields) => {
        res.redirect('/tickets');
    });
});

router.post('/timentries/:id', async(req, res) => {
    const { id } = req.params;
    const { id_employee, date_start, date_end, note } = req.body;
    await pool.query(`INSERT INTO ticket_time_entries values (NULL, ?, ?, ?, ?, ?, ?)`, [id, id_employee, date_start, date_end, note, current_date], (err, data, fields) => {
        if (err) throw err;
        res.redirect('/tickets');
    });
});
// End tickets functionality

router.get('/reports', async(req, res) => {
    res.render('./layouts/reports');
});

router.post('/reports', async(req, res) => {
    const { date_start, date_end } = req.body;
    console.log(req.body);
    await pool.query(`select t.id, concat(e.first_name, ' ', e.last_name) as name, tt.note, DATE_FORMAT(tt.date_start, "%Y-%m-%d %h:%i:%s") as date_start, DATE_FORMAT(tt.date_end, "%Y-%m-%d %h:%i:%s") as date_end, timestampdiff(hour, date_start, date_end) as hours
    from tickets t
    inner join employees e on
    t.id_employee = e.id
    inner join ticket_time_entries tt on
    tt.id_ticket = t.id
    where t.date >= ? and t.date <= ?
    order by tt.id desc;`, [date_start, date_end], (err, data, fields) => {
        res.render('./layouts/reports', { data });
    });
});

module.exports = router;