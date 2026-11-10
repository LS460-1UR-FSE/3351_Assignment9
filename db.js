require('dotenv').config();

const { Pool } = require('pg');

// Uses the PG settings from .env to manage reusable connections.
const pool = new Pool();

module.exports = pool;