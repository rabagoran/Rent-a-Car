// Rezervimet: tabela, numrat dhe butonat Confirm / Cancel

// Krijon nje buton qe ndryshon statusin e rezervimit
function statusButton(id, status, text, color) {
    return `
        <form class="inline" method="post" action="/api/reservations/${id}/status">
            <input type="hidden" name="status" value="${status}">
            <button class="btn-small ${color}" type="submit">${text}</button>
        </form>`;
}

fetch("/api/reservations")
    .then(response => response.json())
    .then(reservations => {
        // 1. Numrat lart
        document.getElementById("count-all").textContent = reservations.length;
        document.getElementById("count-pending").textContent =
            reservations.filter(r => r.status === "PENDING").length;
        document.getElementById("count-confirmed").textContent =
            reservations.filter(r => r.status === "CONFIRMED").length;
        document.getElementById("count-cancelled").textContent =
            reservations.filter(r => r.status === "CANCELLED").length;

        // 2. Tabela
        const rows = document.getElementById("reservation-rows");

        if (reservations.length === 0) {
            rows.innerHTML = '<tr><td class="empty" colspan="9">No reservations yet.</td></tr>';
            return;
        }

        let html = "";

        reservations.forEach(r => {
            // Butonat qe shfaqen varen nga statusi
            let actions = "-";
            if (r.status === "PENDING") {
                actions = statusButton(r.id, "CONFIRMED", "Confirm", "") +
                          statusButton(r.id, "CANCELLED", "Cancel", "btn-red");
            } else if (r.status === "CONFIRMED") {
                actions = statusButton(r.id, "CANCELLED", "Cancel", "btn-red");
            }

            html += `
                <tr>
                    <td>${r.id}</td>
                    <td>${esc(r.client)}</td>
                    <td>${esc(r.car)}</td>
                    <td>${esc(r.location)}</td>
                    <td>${r.start_date}</td>
                    <td>${r.end_date}</td>
                    <td>€${r.total_price}</td>
                    <td><span class="status ${r.status.toLowerCase()}">${r.status}</span></td>
                    <td>${actions}</td>
                </tr>`;
        });

        rows.innerHTML = html;
    });
