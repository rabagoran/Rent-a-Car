// Krijon (ose rregullon) llogarine e adminit.
// Perdorimi: node create-admin.js EMAIL PASSWORD
const db = require("./db");
const { hashPassword } = require("./password");

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
    console.log("Usage: node create-admin.js EMAIL PASSWORD");
    process.exit(1);
}

async function createAdmin() {
    const pool = await db;
    const hash = hashPassword(password);

    // A ekziston ky email?
    const found = await pool.request()
        .input("email", email)
        .query("SELECT id FROM users WHERE email = @email");

    if (found.recordset.length > 0) {
        // Po: e bejme admin dhe i vendosim fjalekalimin e ri
        await pool.request()
            .input("email", email)
            .input("hash", hash)
            .query("UPDATE users SET password_hash = @hash, role = 'ADMIN' WHERE email = @email");
    } else {
        // Jo: e krijojme si admin
        await pool.request()
            .input("email", email)
            .input("hash", hash)
            .query("INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES ('Admin', '', @email, @hash, 'ADMIN')");
    }

    console.log("Admin is ready: " + email);
    process.exit(0);
}

createAdmin().catch(err => {
    console.error(err.message);
    process.exit(1);
});
