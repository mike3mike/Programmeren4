const conn = require('mysql2');
require('dotenv').config();

const pool = conn.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    database: process.env.DB_DATABASE || 'share_a_meal',
    password: process.env.DB_PASSWORD || 'root',
    port: process.env.DB_PORT || '3306',
    waitForConnections: true,
    multipleStatements: true,
    connectionLimit: 10,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0
    });

module.exports = pool;