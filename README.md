# RentACar

Car rental website - student project.

## Step 1: HTML and CSS

The website pages are in the `public/` folder. All pages are linked, so you can click through the whole site.

### Public pages

- `index.html` - home page
- `cars.html` - all cars
- `booking.html` - book a car
- `about.html`, `terms.html`, `contact.html`, `photo-credits.html`
- `login.html`, `signup.html`

### Dashboard (admin only)

- `dashboard.html` - overview
- `dashboard-cars.html` - cars list (edit, delete)
- `dashboard-add-car.html` - add or edit a car
- `dashboard-reservations.html` - reservations (confirm, cancel)
- `dashboard-clients.html` - clients
- `dashboard-locations.html` - locations

### CSS

- `public/style.css` - styles for all pages
- `public/dashboard.css` - extra styles for the dashboard

Car photos are in `public/images/cars/`.

## Step 2: Database connection

The database is **RENTACAR1** on SQL Server (`LAPTOP-L0TRSPBA`, Windows Authentication).

1. Run `database/rentacar.sql` once in SSMS to create the tables and the cars.
2. Install the packages: `npm install`
3. Create the admin account: `node create-admin.js EMAIL PASSWORD`
4. Start the server: `npm start`
5. Open <http://localhost:4500>

The site must be opened through the server (not by double-clicking the files).

## Step 3: Accounts and dashboard

- **Sign up** saves a new client in `users`. Passwords are saved hashed, never as plain text.
- **Log in**: the admin goes to the dashboard, a client goes back to the site.
- **Log out** ends the session.
- Only the admin can open the dashboard pages.
- The dashboard shows real data from the database: counts, cars, reservations, clients and locations.
- The admin can add, edit and delete cars, confirm or cancel reservations, and add locations.
- The **Contact** form saves messages in `contact_messages`.

### Server files

- `server.js` - the web server and all `/api/...` addresses
- `db.js` - the connection to the database
- `password.js` - hashes and checks passwords
- `create-admin.js` - creates the admin account

### Browser files (`public/js/`)

- `helpers.js` - shows form messages and makes text safe for HTML
- `nav.js` - changes "Log in" to "Log out" when you are logged in
- `cars.js` - cars on `index.html` and `cars.html`
- `dashboard.js`, `dashboard-cars.js`, `dashboard-add-car.js`, `dashboard-reservations.js`, `dashboard-clients.js`, `dashboard-locations.js` - one file for each dashboard page

## Step 4: Booking

- `booking.html` takes the cars and locations from the database.
- The price is shown while you choose: days × price per day.
- Only logged-in clients can book. The reservation is saved as **PENDING**, and the admin confirms or cancels it in the dashboard.
- The same car can't be booked twice for dates that overlap (a trigger in the database blocks it), and the page shows a clear message.
- The **Book** button on each car opens the booking page with that car already selected (`booking.html?car=ID`).
- `public/js/booking.js` fills the form and calculates the price.

## Step 5: My reservations and Messages

- `my-reservations.html` - a logged-in client sees their own bookings and the status (waiting for confirmation, confirmed, cancelled). A booking that is still waiting can be cancelled by the client.
- After booking, the client goes straight to **My reservations**. The menu shows a **My reservations** link when a client is logged in.
- `dashboard-messages.html` - the admin reads the messages sent from the Contact page and can delete them.
- `public/js/my-reservations.js` and `public/js/dashboard-messages.js` fill these pages from the database.

## Step 7: Search, reports and new design

- **Search and filters**: the home page search (location and dates) opens `cars.html` with only the cars that are free on those dates. `cars.html` also filters by category, transmission, fuel and max price. The filters go in the address (`cars.html?category=5&from=...`), and `/api/cars` reads them.
- The **Book** button takes the chosen dates to `booking.html`.
- **Reports** (`dashboard-reports.html`): total revenue, confirmed bookings, average booking, most booked car, revenue by month, and bookings by car, status and location.
- **Design**: new fonts (Playfair Display for titles, Inter for text), a calm navy and soft gold colour palette, rounded cards with soft shadows, and a cleaner header, hero, forms and dashboard.

## Step 6: Car availability

- On `booking.html`, under the chosen car, the page shows the dates when the car is already booked (pending or confirmed), so the client can pick free dates.
- A car shows **RENTED** automatically on the days of a confirmed reservation, and goes back to **AVAILABLE** after. A car in **MAINTENANCE** stays in maintenance. The "Available cars" count on the dashboard uses the same rule.
