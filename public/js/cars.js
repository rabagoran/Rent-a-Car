// Veturat nga databaza, me kerkim dhe filtra
// (ne cars.html te gjitha, ne index.html vetem 4)

const carList = document.getElementById("car-list");
const limit = carList.dataset.limit;
const filterForm = document.getElementById("filter-form");

// "MANUAL" -> "Manual"
function nice(text) {
    return text.charAt(0) + text.slice(1).toLowerCase();
}

// Mbush nje liste (select) nga databaza dhe zgjedh vleren qe eshte ne adrese
function fillSelect(selectId, url, paramName) {
    const select = document.getElementById(selectId);
    if (!select) {
        return;
    }

    fetch(url)
        .then(response => response.json())
        .then(items => {
            items.forEach(item => {
                select.innerHTML += `<option value="${item.id}">${esc(item.name)}</option>`;
            });
            select.value = params.get(paramName) || "";
        });
}

fillSelect("location-filter", "/api/locations", "location");
fillSelect("category-filter", "/api/categories", "category");

// Filtrat e tjere marrin vleren nga adresa (qe mos te humbin pas kerkimit)
if (filterForm) {
    ["from", "to", "transmission", "fuel", "max_price"].forEach(name => {
        if (filterForm[name] && params.get(name)) {
            filterForm[name].value = params.get(name);
        }
    });

    // Datat nuk mund te jene ne te kaluaren
    const today = new Date().toISOString().slice(0, 10);
    filterForm.from.min = today;
    filterForm.to.min = today;
}

// Butoni "Book" merr me vete edhe datat, nese jane zgjedhur
let dates = "";
if (params.get("from") && params.get("to")) {
    dates = "&from=" + params.get("from") + "&to=" + params.get("to");
}

// Kerko veturat me te njejtat filtra qe jane ne adrese (?category=...&from=...)
fetch("/api/cars" + window.location.search)
    .then(response => response.json())
    .then(cars => {
        if (limit) {
            cars = cars.slice(0, limit);
        }

        // Sa vetura u gjeten
        const count = document.getElementById("results-count");
        if (count) {
            count.textContent = cars.length + (cars.length === 1 ? " car found" : " cars found");
        }

        if (cars.length === 0) {
            carList.innerHTML = '<p class="no-results">No cars match your search. Try other dates or filters.</p>';
            return;
        }

        let html = "";

        cars.forEach(car => {
            html += `
                <div class="car">
                    <div class="car-image">
                        <img src="${car.image_url}" alt="${esc(car.brand)} ${esc(car.model)}">
                        <span class="car-tag">${esc(car.category)}</span>
                    </div>
                    <div class="car-info">
                        <h3>${esc(car.brand)} ${esc(car.model)}</h3>
                        <ul class="car-specs">
                            <li>${car.seats} seats</li>
                            <li>${nice(car.transmission)}</li>
                            <li>${nice(car.fuel_type)}</li>
                        </ul>
                        <div class="car-price">
                            <p><strong>€${car.price_per_day}</strong> / day</p>
                            <a class="btn btn-sm" href="booking.html?car=${car.id}${dates}">Book</a>
                        </div>
                    </div>
                </div>`;
        });

        carList.innerHTML = html;
    });
