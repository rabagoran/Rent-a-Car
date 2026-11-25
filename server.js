// RentACar - serveri qe lidh faqet me databazen RENTACAR1
const express = require("express");
const session = require("express-session");
const crypto = require("crypto");
const path = require("path");
const db = require("./db");
const { hashPassword, checkPassword } = require("./password");

const app = express();
const PORT = 4500;

// Statusi i vetures llogaritet automatikisht:
// - MAINTENANCE: kur admini e ka vendos ne servis
// - RENTED: kur sot eshte brenda nje rezervimi te konfirmuar
// - perndryshe: statusi qe ka vendos admini (zakonisht AVAILABLE)
const CAR_STATUS = `
    CASE
        WHEN c.status = 'MAINTENANCE' THEN 'MAINTENANCE'
        WHEN EXISTS (
            SELECT 1 FROM reservations r
            WHERE r.car_id = c.id
              AND r.status = 'CONFIRMED'
              AND CAST(GETDATE() AS DATE) >= r.start_date
              AND CAST(GETDATE() AS DATE) < r.end_date
        ) THEN 'RENTED'
        ELSE c.status
    END`;

// Lexon te dhenat qe vijne nga format HTML
app.use(express.urlencoded({ extended: false }));

// Mban mend kush eshte i kycur (sesioni)
app.use(session({
    secret: crypto.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false
}));

// ---------- Ndihmese ----------

// A eshte i kycur admini?
function isAdmin(req) {
    return req.session.user && req.session.user.role === "ADMIN";
}

// Vetem admini mund te vazhdoje
function adminOnly(req, res, next) {
    if (isAdmin(req)) {
        next();
    } else {
        res.status(403).json({ error: "Admins only" });
    }
}

// Kthen ne nje faqe me mesazh, p.sh. /login.html?error=...
function back(res, page, type, text) {
    const sign = page.includes("?") ? "&" : "?";   // nese adresa ka "?", shtojme me "&"
    res.redirect(page + sign + type + "=" + encodeURIComponent(text));
}

// ---------- Faqet ----------

// Faqet e dashboardit hapen vetem per adminin
app.use((req, res, next) => {
    if (req.path.startsWith("/dashboard") && !isAdmin(req)) {
        return back(res, "/login.html", "error", "Please log in as admin to open the dashboard.");
    }
    next();
});

// Faqja "My reservations" hapet vetem kur je i kycur
app.use((req, res, next) => {
    if (req.path === "/my-reservations.html" && !req.session.user) {
        return back(res, "/login.html", "error", "Please log in to see your reservations.");
    }
    next();
});

// HTML, CSS, JS dhe fotot nga folderi public
app.use(express.static(path.join(__dirname, "public")));

// ---------- Llogarite ----------

// Sign up: ruan klientin e ri
app.post("/api/signup", async (req, res) => {
    const { first_name, last_name, email, phone, password } = req.body;

    if (!password || password.length < 8) {
        return back(res, "/signup.html", "error", "The password must have at least 8 characters.");
    }

    try {
        const pool = await db;

        const found = await pool.request()
            .input("email", email)
            .query("SELECT id FROM users WHERE email = @email");

        if (found.recordset.length > 0) {
            return back(res, "/signup.html", "error", "This email is already registered.");
        }

        await pool.request()
            .input("first_name", first_name)
            .input("last_name", last_name)
            .input("email", email)
            .input("phone", phone || null)
            .input("hash", hashPassword(password))
            .query(`INSERT INTO users (first_name, last_name, email, phone, password_hash)
                    VALUES (@first_name, @last_name, @email, @phone, @hash)`);

        back(res, "/login.html", "success", "Your account was created. You can log in now.");
    } catch (err) {
        back(res, "/signup.html", "error", err.message);
    }
});

// Log in: kontrollon emailin dhe fjalekalimin
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const pool = await db;
        const result = await pool.request()
            .input("email", email)
            .query("SELECT id, first_name, password_hash, role FROM users WHERE email = @email");

        const user = result.recordset[0];

        if (!user || !checkPassword(password, user.password_hash)) {
            return back(res, "/login.html", "error", "Wrong email or password.");
        }

        req.session.user = { id: user.id, name: user.first_name, role: user.role };

        if (user.role === "ADMIN") {
            res.redirect("/dashboard.html");
        } else {
            res.redirect("/index.html");
        }
    } catch (err) {
        back(res, "/login.html", "error", err.message);
    }
});

// Log out: fshin sesionin
app.get("/api/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/index.html"));
});

// Kush eshte i kycur tani (ose null)
app.get("/api/me", (req, res) => {
    res.json(req.session.user || null);
});

// ---------- Contact ----------

app.post("/api/contact", async (req, res) => {
    const { name, email, subject, message } = req.body;

    try {
        const pool = await db;
        await pool.request()
            .input("name", name)
            .input("email", email)
            .input("subject", subject)
            .input("message", message)
            .query(`INSERT INTO contact_messages (name, email, subject, message)
                    VALUES (@name, @email, @subject, @message)`);

        back(res, "/contact.html", "success", "Thank you! Your message was sent.");
    } catch (err) {
        back(res, "/contact.html", "error", err.message);
    }
});

// ---------- Booking ----------

// Ruan rezervimin e klientit si PENDING
app.post("/api/bookings", async (req, res) => {
    const user = req.session.user;
    const { car_id, location_id, start_date, end_date } = req.body;

    // 1. Vetem klientet e kycur mund te rezervojne
    if (!user) {
        return back(res, "/login.html", "error", "Please log in to book a car.");
    }
    if (user.role !== "CLIENT") {
        return back(res, "/booking.html", "error", "Please log in with a client account to book a car.");
    }

    // 2. Kontrollo datat
    const today = new Date().toISOString().slice(0, 10);
    if (start_date < today) {
        return back(res, "/booking.html", "error", "The pick-up date can't be in the past.");
    }

    const days = (new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24);
    if (!(days > 0)) {
        return back(res, "/booking.html", "error", "The return date must be after the pick-up date.");
    }

    try {
        const pool = await db;

        // 3. Merr cmimin e vetures nga databaza
        const result = await pool.request()
            .input("id", car_id)
            .query("SELECT price_per_day, status FROM cars WHERE id = @id");

        const car = result.recordset[0];
        if (!car || car.status === "MAINTENANCE") {
            return back(res, "/booking.html", "error", "This car can't be booked right now.");
        }

        // 4. Llogarit totalin dhe ruaje rezervimin
        const total = days * car.price_per_day;

        await pool.request()
            .input("user_id", user.id)
            .input("car_id", car_id)
            .input("location_id", location_id)
            .input("start_date", start_date)
            .input("end_date", end_date)
            .input("total", total)
            .query(`INSERT INTO reservations (user_id, car_id, pickup_location_id, start_date, end_date, total_price)
                    VALUES (@user_id, @car_id, @location_id, @start_date, @end_date, @total)`);

        back(res, "/my-reservations.html", "success",
            "Your reservation was sent! Total: €" + total + ". You will see here when we confirm it.");
    } catch (err) {
        // Trigger-i ne databaze ndalon rezervimet qe mbivendosen
        if (err.message.includes("already booked")) {
            return back(res, "/booking.html?car=" + car_id, "error",
                "This car is already booked for these dates. Please choose other dates or another car.");
        }
        back(res, "/booking.html", "error", err.message);
    }
});

// ---------- My reservations (klienti) ----------

// Rezervimet e klientit qe eshte i kycur
app.get("/api/my-reservations", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Please log in" });
    }

    const pool = await db;
    const result = await pool.request()
        .input("user_id", req.session.user.id)
        .query(`
            SELECT r.id,
                   c.brand + ' ' + c.model AS car,
                   c.image_url,
                   l.name AS location,
                   CONVERT(VARCHAR(10), r.start_date, 104) AS start_date,
                   CONVERT(VARCHAR(10), r.end_date, 104) AS end_date,
                   r.total_price, r.status
            FROM reservations r
            JOIN cars c ON c.id = r.car_id
            JOIN locations l ON l.id = r.pickup_location_id
            WHERE r.user_id = @user_id
            ORDER BY r.created_at DESC
        `);
    res.json(result.recordset);
});

// Klienti anulon rezervimin e vet (vetem kur eshte PENDING)
app.post("/api/my-reservations/:id/cancel", async (req, res) => {
    if (!req.session.user) {
        return back(res, "/login.html", "error", "Please log in first.");
    }

    const pool = await db;
    const result = await pool.request()
        .input("id", req.params.id)
        .input("user_id", req.session.user.id)
        .query(`UPDATE reservations SET status = 'CANCELLED'
                WHERE id = @id AND user_id = @user_id AND status = 'PENDING'`);

    // rowsAffected = sa rreshta u ndryshuan (0 = nuk eshte e tija ose nuk eshte me PENDING)
    if (result.rowsAffected[0] === 0) {
        return back(res, "/my-reservations.html", "error", "This reservation can't be cancelled.");
    }

    back(res, "/my-reservations.html", "success", "Your reservation was cancelled.");
});

// ---------- Veturat, kategorite, lokacionet ----------

// Veturat, me filtra opsionale nga adresa, p.sh.
// /api/cars?category=5&transmission=AUTOMATIC&max_price=60&from=2026-12-10&to=2026-12-13
app.get("/api/cars", async (req, res) => {
    const f = req.query;   // filtrat qe vijne nga adresa

    try {
        const pool = await db;
        const request = pool.request();

        // Fillojme me "te gjitha" dhe shtojme nje kusht per secilin filter te zgjedhur
        let where = "WHERE 1 = 1";

        if (f.category) {
            where += " AND c.category_id = @category";
            request.input("category", f.category);
        }
        if (f.location) {
            where += " AND c.location_id = @location";
            request.input("location", f.location);
        }
        if (f.transmission) {
            where += " AND c.transmission = @transmission";
            request.input("transmission", f.transmission);
        }
        if (f.fuel) {
            where += " AND c.fuel_type = @fuel";
            request.input("fuel", f.fuel);
        }
        if (f.max_price) {
            where += " AND c.price_per_day <= @max_price";
            request.input("max_price", f.max_price);
        }

        // Nese jane zgjedhur datat: vetem veturat e lira ne ato data
        if (f.from && f.to) {
            where += ` AND c.status <> 'MAINTENANCE'
                       AND NOT EXISTS (
                           SELECT 1 FROM reservations r
                           WHERE r.car_id = c.id
                             AND r.status IN ('PENDING', 'CONFIRMED')
                             AND r.start_date < @to
                             AND @from < r.end_date
                       )`;
            request.input("from", f.from);
            request.input("to", f.to);
        }

        const result = await request.query(`
            SELECT c.id, c.brand, c.model, c.year, c.seats, c.transmission,
                   c.fuel_type, c.price_per_day, c.image_url,
                   ${CAR_STATUS} AS status,
                   cat.name AS category
            FROM cars c
            JOIN categories cat ON cat.id = c.category_id
            ${where}
            ORDER BY c.price_per_day
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Datat kur nje veture eshte e zene (per faqen Book a car)
// Kthen vetem datat, pa emrat e klienteve
app.get("/api/cars/:id/booked", async (req, res) => {
    const pool = await db;
    const result = await pool.request()
        .input("id", req.params.id)
        .query(`
            SELECT CONVERT(VARCHAR(10), start_date, 104) AS start_date,
                   CONVERT(VARCHAR(10), end_date, 104) AS end_date
            FROM reservations
            WHERE car_id = @id
              AND status IN ('PENDING', 'CONFIRMED')
              AND end_date > CAST(GETDATE() AS DATE)
            ORDER BY reservations.start_date
        `);
    res.json(result.recordset);
});

// Nje veture (per formen Edit)
app.get("/api/cars/:id", adminOnly, async (req, res) => {
    const pool = await db;
    const result = await pool.request()
        .input("id", req.params.id)
        .query("SELECT * FROM cars WHERE id = @id");
    res.json(result.recordset[0] || null);
});

app.get("/api/categories", async (req, res) => {
    const pool = await db;
    const result = await pool.request().query("SELECT id, name FROM categories ORDER BY id");
    res.json(result.recordset);
});

app.get("/api/locations", async (req, res) => {
    const pool = await db;
    const result = await pool.request().query("SELECT * FROM locations ORDER BY id");
    res.json(result.recordset);
});

// ---------- Dashboard (vetem admini) ----------

// Numrat ne Overview
app.get("/api/stats", adminOnly, async (req, res) => {
    const pool = await db;
    const result = await pool.request().query(`
        SELECT
            (SELECT COUNT(*) FROM cars) AS cars,
            (SELECT COUNT(*) FROM cars c WHERE ${CAR_STATUS} = 'AVAILABLE') AS available,
            (SELECT COUNT(*) FROM reservations WHERE status = 'PENDING') AS pending,
            (SELECT COUNT(*) FROM users WHERE role = 'CLIENT') AS clients
    `);
    res.json(result.recordset[0]);
});

// Te gjitha rezervimet, me emrin e klientit, veturen dhe lokacionin
app.get("/api/reservations", adminOnly, async (req, res) => {
    const pool = await db;
    const result = await pool.request().query(`
        SELECT r.id,
               u.first_name + ' ' + u.last_name AS client,
               c.brand + ' ' + c.model AS car,
               l.name AS location,
               CONVERT(VARCHAR(10), r.start_date, 104) AS start_date,
               CONVERT(VARCHAR(10), r.end_date, 104) AS end_date,
               r.total_price, r.status
        FROM reservations r
        JOIN users u ON u.id = r.user_id
        JOIN cars c ON c.id = r.car_id
        JOIN locations l ON l.id = r.pickup_location_id
        ORDER BY r.created_at DESC
    `);
    res.json(result.recordset);
});

// Confirm / Cancel nje rezervim
app.post("/api/reservations/:id/status", adminOnly, async (req, res) => {
    const status = req.body.status;

    if (status !== "CONFIRMED" && status !== "CANCELLED") {
        return back(res, "/dashboard-reservations.html", "error", "Unknown status.");
    }

    try {
        const pool = await db;
        await pool.request()
            .input("id", req.params.id)
            .input("status", status)
            .query("UPDATE reservations SET status = @status WHERE id = @id");

        back(res, "/dashboard-reservations.html", "success", "Reservation updated.");
    } catch (err) {
        back(res, "/dashboard-reservations.html", "error", err.message);
    }
});

// Klientet, me numrin e rezervimeve te secilit
app.get("/api/clients", adminOnly, async (req, res) => {
    const pool = await db;
    const result = await pool.request().query(`
        SELECT u.id,
               u.first_name + ' ' + u.last_name AS name,
               u.email, u.phone,
               CONVERT(VARCHAR(10), u.created_at, 104) AS joined,
               (SELECT COUNT(*) FROM reservations r WHERE r.user_id = u.id) AS reservations
        FROM users u
        WHERE u.role = 'CLIENT'
        ORDER BY u.created_at DESC
    `);
    res.json(result.recordset);
});

// Te dhenat e formes Add car / Edit car
function carData(request, form) {
    return request
        .input("category_id", form.category_id)
        .input("location_id", form.location_id)
        .input("brand", form.brand)
        .input("model", form.model)
        .input("year", form.year)
        .input("plate", form.plate || null)
        .input("transmission", form.transmission)
        .input("fuel", form.fuel_type)
        .input("seats", form.seats)
        .input("price", form.price)
        .input("image", form.image || null)
        .input("status", form.status);
}

// Shto veture
app.post("/api/cars", adminOnly, async (req, res) => {
    try {
        const pool = await db;
        await carData(pool.request(), req.body).query(`
            INSERT INTO cars (category_id, location_id, brand, model, year, plate_number,
                              transmission, fuel_type, seats, price_per_day, image_url, status)
            VALUES (@category_id, @location_id, @brand, @model, @year, @plate,
                    @transmission, @fuel, @seats, @price, @image, @status)
        `);
        back(res, "/dashboard-cars.html", "success", "The car was added.");
    } catch (err) {
        back(res, "/dashboard-add-car.html", "error", err.message);
    }
});

// Ndrysho veture
app.post("/api/cars/:id", adminOnly, async (req, res) => {
    try {
        const pool = await db;
        await carData(pool.request(), req.body)
            .input("id", req.params.id)
            .query(`
                UPDATE cars SET category_id = @category_id, location_id = @location_id,
                       brand = @brand, model = @model, year = @year, plate_number = @plate,
                       transmission = @transmission, fuel_type = @fuel, seats = @seats,
                       price_per_day = @price, image_url = @image, status = @status
                WHERE id = @id
            `);
        back(res, "/dashboard-cars.html", "success", "The car was updated.");
    } catch (err) {
        back(res, "/dashboard-add-car.html", "error", err.message);
    }
});

// Fshij veture
app.post("/api/cars/:id/delete", adminOnly, async (req, res) => {
    try {
        const pool = await db;
        await pool.request()
            .input("id", req.params.id)
            .query("DELETE FROM cars WHERE id = @id");
        back(res, "/dashboard-cars.html", "success", "The car was deleted.");
    } catch (err) {
        back(res, "/dashboard-cars.html", "error", "This car has reservations, so it can't be deleted.");
    }
});

// Raportet per dashboardin
app.get("/api/reports", adminOnly, async (req, res) => {
    const pool = await db;

    // 1. Te ardhurat totale (rezervimet e konfirmuara dhe te perfunduara)
    const total = await pool.request().query(`
        SELECT ISNULL(SUM(total_price), 0) AS revenue, COUNT(*) AS bookings
        FROM reservations
        WHERE status IN ('CONFIRMED', 'COMPLETED')
    `);

    // 2. Te ardhurat sipas muajit
    const byMonth = await pool.request().query(`
        SELECT FORMAT(start_date, 'MM.yyyy') AS month,
               SUM(total_price) AS revenue,
               COUNT(*) AS bookings
        FROM reservations
        WHERE status IN ('CONFIRMED', 'COMPLETED')
        GROUP BY FORMAT(start_date, 'MM.yyyy'), YEAR(start_date), MONTH(start_date)
        ORDER BY YEAR(start_date), MONTH(start_date)
    `);

    // 3. 5 veturat me me shume rezervime
    const topCars = await pool.request().query(`
        SELECT TOP 5 c.brand + ' ' + c.model AS car, COUNT(*) AS bookings
        FROM reservations r
        JOIN cars c ON c.id = r.car_id
        WHERE r.status <> 'CANCELLED'
        GROUP BY c.brand, c.model
        ORDER BY COUNT(*) DESC
    `);

    // 4. Rezervimet sipas statusit
    const byStatus = await pool.request().query(`
        SELECT status, COUNT(*) AS bookings
        FROM reservations
        GROUP BY status
    `);

    // 5. Rezervimet sipas lokacionit
    const byLocation = await pool.request().query(`
        SELECT l.name AS location, COUNT(r.id) AS bookings
        FROM locations l
        LEFT JOIN reservations r ON r.pickup_location_id = l.id AND r.status <> 'CANCELLED'
        GROUP BY l.name
        ORDER BY COUNT(r.id) DESC
    `);

    res.json({
        revenue: total.recordset[0].revenue,
        bookings: total.recordset[0].bookings,
        byMonth: byMonth.recordset,
        topCars: topCars.recordset,
        byStatus: byStatus.recordset,
        byLocation: byLocation.recordset
    });
});

// Mesazhet nga forma Contact
app.get("/api/messages", adminOnly, async (req, res) => {
    const pool = await db;
    const result = await pool.request().query(`
        SELECT id, name, email, subject, message,
               FORMAT(created_at, 'dd.MM.yyyy HH:mm') AS sent
        FROM contact_messages
        ORDER BY created_at DESC
    `);
    res.json(result.recordset);
});

// Fshij nje mesazh
app.post("/api/messages/:id/delete", adminOnly, async (req, res) => {
    const pool = await db;
    await pool.request()
        .input("id", req.params.id)
        .query("DELETE FROM contact_messages WHERE id = @id");

    back(res, "/dashboard-messages.html", "success", "The message was deleted.");
});

// Shto lokacion
app.post("/api/locations", adminOnly, async (req, res) => {
    const { name, city, address, phone } = req.body;

    try {
        const pool = await db;
        await pool.request()
            .input("name", name)
            .input("city", city)
            .input("address", address || null)
            .input("phone", phone || null)
            .query("INSERT INTO locations (name, city, address, phone) VALUES (@name, @city, @address, @phone)");

        back(res, "/dashboard-locations.html", "success", "The location was added.");
    } catch (err) {
        back(res, "/dashboard-locations.html", "error", err.message);
    }
});

// ---------- Nis serverin ----------

app.listen(PORT, () => {
    console.log("RentACar is running at http://localhost:" + PORT);
});
