const mysql = require('mysql');

const { promisify } = require('util');

const { database } = require('./keys');

const pool = mysql.createPool(database);

// pool.getConnection((err, connection) => {
//     if (err) {
//         throw err;
//     } else {
//         connection.release();
//     }
//     console.log('MYSQL connection working.')
//     return;
// });

// pool.query = promisify(pool.query);

module.exports = pool;