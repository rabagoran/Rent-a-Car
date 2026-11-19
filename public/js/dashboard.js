// Overview: numrat dhe 5 rezervimet e fundit

// 1. Numrat
fetch("/api/stats")
    .then(response => response.json())
    .then(stats => {
        document.getElementById("stat-cars").textContent = stats.cars;
        document.getElementById("stat-available").textContent = stats.available;
        document.getElementById("stat-pending").textContent = stats.pending;
        document.getElementById("stat-clients").textContent = stats.clients;

        document.getElementById("fleet-text").textContent =
            "There are " + stats.cars + " cars in the fleet. " + stats.available + " of them are available.";
    });

// 2. Rezervimet e fundit
fetch("/api/reservations")
    .then(response => response.json())
    .then(reservations => {
        const rows = document.getElementById("latest-rows");

        if (reservations.length === 0) {
            rows.innerHTML = '<tr><td class="empty" colspan="6">No reservations yet.</td></tr>';
            return;
        }

        let html = "";

        reservations.slice(0, 5).forEach(r => {
            html += `
                <tr>
                    <td>${r.id}</td>
                    <td>${esc(r.client)}</td>
                    <td>${esc(r.car)}</td>
                    <td>${r.start_date} - ${r.end_date}</td>
                    <td>€${r.total_price}</td>
                    <td><span class="status ${r.status.toLowerCase()}">${r.status}</span></td>
                </tr>`;
        });

        rows.innerHTML = html;
    });
