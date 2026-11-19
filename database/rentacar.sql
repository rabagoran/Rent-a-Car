-- =============================================
-- RentACar - databaza RENTACAR1 (Microsoft SQL Server)
-- Hape ne SSMS, kopjoje te gjithe dhe shtyp Execute (F5).
-- Ekzekutoje vetem nje here, ne databazen e zbrazet.
-- =============================================

USE RENTACAR1;
GO

-- ---------- 1. Perdoruesit (klientet dhe administratori) ----------
CREATE TABLE users (
    id             INT IDENTITY(1,1) PRIMARY KEY,
    first_name     NVARCHAR(50)  NOT NULL,
    last_name      NVARCHAR(50)  NOT NULL,
    email          NVARCHAR(150) NOT NULL UNIQUE,
    phone          NVARCHAR(30)  NULL,
    password_hash  NVARCHAR(255) NOT NULL,          -- fjalekalimi ruhet i hash-uar, jo si tekst
    role           NVARCHAR(10)  NOT NULL DEFAULT 'CLIENT'
                   CHECK (role IN ('CLIENT', 'ADMIN')),
    created_at     DATETIME2     NOT NULL DEFAULT SYSDATETIME()
);

-- ---------- 2. Kategorite e veturave ----------
CREATE TABLE categories (
    id    INT IDENTITY(1,1) PRIMARY KEY,
    name  NVARCHAR(50) NOT NULL UNIQUE
);

-- ---------- 3. Lokacionet (ku merret dhe kthehet vetura) ----------
CREATE TABLE locations (
    id       INT IDENTITY(1,1) PRIMARY KEY,
    name     NVARCHAR(100) NOT NULL,
    city     NVARCHAR(60)  NOT NULL,
    address  NVARCHAR(200) NULL,
    phone    NVARCHAR(30)  NULL
);

-- ---------- 4. Veturat ----------
CREATE TABLE cars (
    id             INT IDENTITY(1,1) PRIMARY KEY,
    category_id    INT           NOT NULL REFERENCES categories(id),
    location_id    INT           NOT NULL REFERENCES locations(id),
    brand          NVARCHAR(50)  NOT NULL,
    model          NVARCHAR(50)  NOT NULL,
    year           SMALLINT      NOT NULL CHECK (year BETWEEN 1990 AND 2100),
    plate_number   NVARCHAR(15)  NULL,
    transmission   NVARCHAR(10)  NOT NULL CHECK (transmission IN ('MANUAL', 'AUTOMATIC')),
    fuel_type      NVARCHAR(10)  NOT NULL CHECK (fuel_type IN ('PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC')),
    seats          TINYINT       NOT NULL CHECK (seats BETWEEN 2 AND 9),
    price_per_day  DECIMAL(8,2)  NOT NULL CHECK (price_per_day > 0),
    image_url      NVARCHAR(300) NULL,
    status         NVARCHAR(12)  NOT NULL DEFAULT 'AVAILABLE'
                   CHECK (status IN ('AVAILABLE', 'RENTED', 'MAINTENANCE'))
);

-- ---------- 5. Rezervimet ----------
CREATE TABLE reservations (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    user_id             INT           NOT NULL REFERENCES users(id),
    car_id              INT           NOT NULL REFERENCES cars(id),
    pickup_location_id  INT           NOT NULL REFERENCES locations(id),
    start_date          DATE          NOT NULL,
    end_date            DATE          NOT NULL,
    total_price         DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    status              NVARCHAR(10)  NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
    created_at          DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT ck_dates CHECK (end_date > start_date)
);

-- ---------- 6. Mesazhet nga faqja Contact ----------
CREATE TABLE contact_messages (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100)  NOT NULL,
    email       NVARCHAR(150)  NOT NULL,
    subject     NVARCHAR(150)  NOT NULL,
    message     NVARCHAR(2000) NOT NULL,
    created_at  DATETIME2      NOT NULL DEFAULT SYSDATETIME()
);
GO

-- E njejta veture nuk mund te rezervohet dy here ne data qe mbivendosen.
CREATE TRIGGER trg_no_overlap ON reservations
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN reservations r
          ON r.car_id = i.car_id
         AND r.id <> i.id
         AND r.status <> 'CANCELLED'
         AND i.status <> 'CANCELLED'
         AND r.start_date < i.end_date
         AND i.start_date < r.end_date
    )
    BEGIN
        RAISERROR (N'This car is already booked for these dates.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

-- =============================================
-- Te dhenat fillestare
-- =============================================

INSERT INTO categories (name) VALUES
    (N'Mini'), (N'Economy'), (N'Compact'), (N'Comfort'), (N'SUV'),
    (N'Premium'), (N'Premium SUV'), (N'Electric'), (N'Sports');

-- Te njejtat lokacione si ne faqen Book a car
INSERT INTO locations (name, city) VALUES
    (N'Prishtina',         N'Prishtina'),
    (N'Prishtina Airport', N'Prishtina'),
    (N'Prizren',           N'Prizren'),
    (N'Peja',              N'Peja');

INSERT INTO cars (category_id, location_id, brand, model, year, transmission, fuel_type, seats, price_per_day, image_url) VALUES
    (1, 1, N'Fiat', N'Panda', 2021, N'MANUAL', N'PETROL', 4, 27, N'images/cars/fiat-panda.jpg'),
    (1, 2, N'Fiat', N'500', 2020, N'MANUAL', N'PETROL', 4, 29, N'images/cars/fiat-500.jpg'),
    (1, 3, N'Mini', N'Cooper', 2024, N'AUTOMATIC', N'PETROL', 4, 52, N'images/cars/mini-cooper.jpg'),
    (2, 4, N'Citroën', N'C3', 2024, N'MANUAL', N'PETROL', 5, 31, N'images/cars/citroen-c3.jpg'),
    (2, 1, N'Toyota', N'Yaris', 2021, N'AUTOMATIC', N'HYBRID', 5, 32, N'images/cars/toyota-yaris.jpg'),
    (2, 2, N'Opel', N'Corsa', 2021, N'MANUAL', N'PETROL', 5, 33, N'images/cars/opel-corsa.jpg'),
    (2, 3, N'Renault', N'Clio', 2023, N'MANUAL', N'DIESEL', 5, 34, N'images/cars/renault-clio.jpg'),
    (2, 4, N'Peugeot', N'208', 2022, N'AUTOMATIC', N'PETROL', 5, 36, N'images/cars/peugeot-208.jpg'),
    (3, 1, N'Volkswagen', N'Golf', 2021, N'MANUAL', N'DIESEL', 5, 42, N'images/cars/volkswagen-golf.jpg'),
    (3, 2, N'Audi', N'A3', 2022, N'AUTOMATIC', N'PETROL', 5, 72, N'images/cars/audi-a3.jpg'),
    (3, 3, N'Mercedes-Benz', N'A-Class', 2021, N'AUTOMATIC', N'PETROL', 5, 79, N'images/cars/mercedes-benz-a-class.jpg'),
    (4, 4, N'Toyota', N'Corolla', 2022, N'AUTOMATIC', N'HYBRID', 5, 46, N'images/cars/toyota-corolla.jpg'),
    (4, 1, N'Škoda', N'Octavia', 2022, N'MANUAL', N'DIESEL', 5, 49, N'images/cars/skoda-octavia.jpg'),
    (5, 2, N'Dacia', N'Duster', 2024, N'MANUAL', N'PETROL', 5, 48, N'images/cars/dacia-duster.jpg'),
    (5, 3, N'Kia', N'Sportage', 2025, N'AUTOMATIC', N'HYBRID', 5, 61, N'images/cars/kia-sportage.jpg'),
    (5, 4, N'Nissan', N'Qashqai', 2024, N'AUTOMATIC', N'HYBRID', 5, 62, N'images/cars/nissan-qashqai.jpg'),
    (5, 1, N'Hyundai', N'Tucson', 2024, N'AUTOMATIC', N'HYBRID', 5, 64, N'images/cars/hyundai-tucson.jpg'),
    (5, 2, N'Peugeot', N'3008', 2024, N'AUTOMATIC', N'HYBRID', 5, 65, N'images/cars/peugeot-3008.jpg'),
    (5, 3, N'Mazda', N'CX-5', 2024, N'AUTOMATIC', N'PETROL', 5, 67, N'images/cars/mazda-cx-5.jpg'),
    (5, 4, N'Jeep', N'Compass', 2019, N'AUTOMATIC', N'PETROL', 5, 68, N'images/cars/jeep-compass.jpg'),
    (5, 1, N'Volkswagen', N'Tiguan', 2024, N'AUTOMATIC', N'DIESEL', 5, 70, N'images/cars/volkswagen-tiguan.jpg'),
    (6, 2, N'BMW', N'3 Series', 2022, N'AUTOMATIC', N'DIESEL', 5, 74, N'images/cars/bmw-3-series.jpg'),
    (6, 3, N'BMW', N'5 Series', 2024, N'AUTOMATIC', N'PETROL', 5, 105, N'images/cars/bmw-5-series.jpg'),
    (7, 4, N'Volvo', N'XC40', 2019, N'AUTOMATIC', N'PETROL', 5, 86, N'images/cars/volvo-xc40.jpg'),
    (7, 1, N'Audi', N'Q5', 2025, N'AUTOMATIC', N'DIESEL', 5, 98, N'images/cars/audi-q5.jpg'),
    (7, 2, N'Land Rover', N'Range Rover Evoque', 2019, N'AUTOMATIC', N'PETROL', 5, 119, N'images/cars/range-rover-evoque.jpg'),
    (8, 3, N'Tesla', N'Model 3', 2023, N'AUTOMATIC', N'ELECTRIC', 5, 89, N'images/cars/tesla-model-3.jpg'),
    (9, 4, N'Ford', N'Mustang', 2025, N'AUTOMATIC', N'PETROL', 4, 110, N'images/cars/ford-mustang.jpg');
GO

-- Kontrollo qe gjithcka u krijua:
SELECT 'categories' AS tabela, COUNT(*) AS rreshta FROM categories
UNION ALL SELECT 'locations', COUNT(*) FROM locations
UNION ALL SELECT 'cars',      COUNT(*) FROM cars;
