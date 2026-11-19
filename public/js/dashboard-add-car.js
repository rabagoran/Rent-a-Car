// Forma Add car / Edit car

const form = document.getElementById("car-form");
const carId = params.get("id");   // p.sh. dashboard-add-car.html?id=5  ("params" vjen nga helpers.js)

// 1. Mbush listen e kategorive nga databaza
fetch("/api/categories")
    .then(response => response.json())
    .then(categories => {
        let html = "";
        categories.forEach(c => {
            html += `<option value="${c.id}">${esc(c.name)}</option>`;
        });
        document.getElementById("category-select").innerHTML = html;

        // 2. Mbush listen e lokacioneve nga databaza
        return fetch("/api/locations");
    })
    .then(response => response.json())
    .then(locations => {
        let html = "";
        locations.forEach(l => {
            html += `<option value="${l.id}">${esc(l.name)}</option>`;
        });
        document.getElementById("location-select").innerHTML = html;

        // 3. Nese ka ?id= ne adrese, kjo eshte Edit: mbush formen me veturen
        if (carId) {
            loadCar();
        }
    });

function loadCar() {
    document.getElementById("form-title").textContent = "Edit car";
    document.getElementById("save-button").textContent = "Save changes";
    form.action = "/api/cars/" + carId;

    fetch("/api/cars/" + carId)
        .then(response => response.json())
        .then(car => {
            form.brand.value = car.brand;
            form.model.value = car.model;
            form.category_id.value = car.category_id;
            form.location_id.value = car.location_id;
            form.year.value = car.year;
            form.plate.value = car.plate_number || "";
            form.seats.value = car.seats;
            form.transmission.value = car.transmission;
            form.fuel_type.value = car.fuel_type;
            form.price.value = car.price_per_day;
            form.status.value = car.status;
            form.image.value = car.image_url || "";
        });
}
