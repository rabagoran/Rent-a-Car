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

## Next step

Booking: save reservations from `booking.html`.
