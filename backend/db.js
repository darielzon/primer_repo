const sql = require('mssql/msnodesqlv8');

const config = {
    connectionString:
        "Driver={ODBC Driver 17 for SQL Server};" +
        "Server=DESKTOP-E7M0SH4\\SQLEXPRESS;" +
        "Database=productos_remate;" +
        "Trusted_Connection=Yes;"
};

async function conectarDB() {

    try {

        await sql.connect(config);

        console.log('Conectado a SQL Server 🚀');

    } catch (error) {

        console.log('Error de conexión SQL');
        console.log(error);

    }

}

module.exports = {
    sql,
    conectarDB
};