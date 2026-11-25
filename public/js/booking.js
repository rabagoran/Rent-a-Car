// Forma Book a car: veturat dhe lokacionet nga databaza + llogaritja e cmimit

const carSelect = document.getElementById("car-select");
const locationSelect = document.getElementById("location-select");
const startDate = document.getElementById("start-date");
const endDate = document.getElementById("end-date");

// 1. Mbush listen e veturave (pa ato ne servis)
fetch("/api/cars")
    .then(response => response.json())
    .then(cars => {
        let html = "";

        cars.forEach(car => {
            if (car.status !== "MAINTENANCE") {
                html += `<option value="${car.id}" data-price="${car.price_per_day}">
                            ${esc(car.brand)} ${esc(car.model)} - €${car.price_per_day} / day
                         </option>`;
            }
        });

        carSelect.innerHTML = html;

        // Nese erdhem nga butoni "Book" (booking.html?car=5), zgjedh ate veture
        if (params.get("car")) {
            carSelect.value = params.get("car");
        }

        updatePrice();
        showBookedDates();
    });

// Trego datat kur vetura e zgjedhur eshte e zene
function showBookedDates() {
    const box = document.getElementById("booked-dates");

    fetch("/api/cars/" + carSelect.value + "/booked")
        .then(response => response.json())
        .then(bookings => {
            if (bookings.length === 0) {
                box.textContent = "This car is free on all dates.";
                return;
            }

            const dates = bookings.map(b => b.start_date + " - " + b.end_date);
            box.innerHTML = "<strong>Already booked:</strong> " + dates.join(", ");
        });
}

carSelect.addEventListener("change", showBookedDates);

// 2. Mbush listen e lokacioneve
fetch("/api/locations")
    .then(response => response.json())
    .then(locations => {
        let html = "";

        locations.forEach(l => {
            html += `<option value="${l.id}">${esc(l.name)}</option>`;
        });

        locationSelect.innerHTML = html;
    });

// 3. Datat nuk mund te jene ne te kaluaren
const today = new Date().toISOString().slice(0, 10);
startDate.min = today;
endDate.min = today;

// Nese erdhem nga kerkimi me data (booking.html?car=5&from=...&to=...), plotesoji
if (params.get("from")) {
    startDate.value = params.get("from");
}
if (params.get("to")) {
    endDate.value = params.get("to");
}

// 4. Llogarit cmimin: ditet x cmimi per dite
function updatePrice() {
    const selected = carSelect.options[carSelect.selectedIndex];
    if (!selected) {
        return;
    }

    const price = Number(selected.dataset.price);
    document.getElementById("price-day").textContent = "€" + price;

    const days = (new Date(endDate.value) - new Date(startDate.value)) / (1000 * 60 * 60 * 24);

    if (days > 0) {
        document.getElementById("days").textContent = days;
        document.getElementById("total").textContent = "€" + (days * price);
    } else {
        document.getElementById("days").textContent = "-";
        document.getElementById("total").textContent = "€0";
    }
}

// Rillogarit sa here ndryshon vetura ose datat
carSelect.addEventListener("change", updatePrice);
startDate.addEventListener("change", updatePrice);
endDate.addEventListener("change", updatePrice);

// 5. Nese nuk je i kycur, trego qe duhet log in (vetem kur s'ka mesazh tjeter)
fetch("/api/me")
    .then(response => response.json())
    .then(user => {
        if (!user && !messageBox.textContent) {
            messageBox.innerHTML = 'Please <a href="login.html">log in</a> to book a car. ' +
                                   'No account? <a href="signup.html">Sign up</a>.';
            messageBox.className = "message error";
        }
    });
