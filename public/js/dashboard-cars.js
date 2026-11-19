// Merr veturat nga databaza dhe i shfaq ne tabelen e dashboardit

fetch("/api/cars")
    .then(response => response.json())
    .then(cars => {
        const rows = document.getElementById("car-rows");

        if (cars.length === 0) {
            rows.innerHTML = '<tr><td class="empty" colspan="10">No cars yet.</td></tr>';
            return;
        }

        let html = "";

        cars.forEach((car, i) => {
            html += `
                <tr>
                    <td>${i + 1}</td>
                    <td>${esc(car.brand)} ${esc(car.model)}</td>
                    <td>${esc(car.category)}</td>
                    <td>${car.year}</td>
                    <td>${car.seats}</td>
                    <td>${car.transmission}</td>
                    <td>${car.fuel_type}</td>
                    <td>€${car.price_per_day}</td>
                    <td><span class="status ${car.status.toLowerCase()}">${car.status}</span></td>
                    <td>
                        <a class="btn-small" href="dashboard-add-car.html?id=${car.id}">Edit</a>
                        <form class="inline" method="post" action="/api/cars/${car.id}/delete"
                              onsubmit="return confirm('Delete this car?')">
                            <button class="btn-small btn-red" type="submit">Delete</button>
                        </form>
                    </td>
                </tr>`;
        });

        rows.innerHTML = html;
    });
