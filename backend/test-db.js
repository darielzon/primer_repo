require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({

    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    ssl: {
        rejectUnauthorized: false
    }

});

async function probarConexion() {

    try {

        const resultado = await pool.query(
            'SELECT NOW()'
        );

        console.log(
            'Conexión exitosa 🚀'
        );

        console.log(
            resultado.rows
        );

    }
    catch(error){

        console.log(error);

    }

}

probarConexion();