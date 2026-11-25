// Merr veturat nga databaza dhe i shfaq si karta
// (ne cars.html te gjitha, ne index.html vetem 4)

const carList = document.getElementById("car-list");
const limit = carList.dataset.limit;

fetch("/api/cars")
    .then(response => response.json())
    .then(cars => {
        if (limit) {
            cars = cars.slice(0, limit);
        }

        let html = "";

        cars.forEach(car => {
            html += `
                <div class="car">
                    <img src="${car.image_url}" alt="${car.brand} ${car.model}">
                    <div class="car-info">
                        <h3>${car.brand} ${car.model}</h3>
                        <p>${car.category} · ${car.seats} seats · ${car.transmission}</p>
                        <div class="car-price">
                            <strong>€${car.price_per_day} / day</strong>
                            <a class="btn" href="booking.html?car=${car.id}">Book</a>
                        </div>
                    </div>
                </div>`;
        });

        carList.innerHTML = html;
    });
