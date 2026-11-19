// Lidhja me databazen RENTACAR1 (Windows Authentication, pa password)
const sql = require("mssql/msnodesqlv8");

const db = sql.connect({
    connectionString:
        "Driver={ODBC Driver 18 for SQL Server};" +
        "Server=LAPTOP-L0TRSPBA;" +
        "Database=RENTACAR1;" +
        "Trusted_Connection=yes;" +
        "TrustServerCertificate=yes;"
});

module.exports = db;
