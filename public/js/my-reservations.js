// My reservations: rezervimet e klientit qe eshte i kycur

// Tekst i qarte per secilin status
const statusText = {
    PENDING: "Waiting for confirmation",
    CONFIRMED: "Confirmed",
    CANCELLED: "Cancelled",
    COMPLETED: "Completed"
};

fetch("/api/my-reservations")
    .then(response => response.json())
    .then(reservations => {
        const rows = document.getElementById("my-rows");

        if (reservations.length === 0) {
            rows.innerHTML = '<tr><td class="empty" colspan="7">You have no reservations yet.</td></tr>';
            return;
        }

        let html = "";

        reservations.forEach(r => {
            // Klienti mund ta anuloje vetem rezervimin qe pret konfirmim
            let action = "";
            if (r.status === "PENDING") {
                action = `
                    <form class="inline" method="post" action="/api/my-reservations/${r.id}/cancel"
                          onsubmit="return confirm('Cancel this reservation?')">
                        <button class="btn-small btn-red" type="submit">Cancel</button>
                    </form>`;
            }

            html += `
                <tr>
                    <td><img class="thumb" src="${r.image_url}" alt=""> ${esc(r.car)}</td>
                    <td>${esc(r.location)}</td>
                    <td>${r.start_date}</td>
                    <td>${r.end_date}</td>
                    <td>€${r.total_price}</td>
                    <td><span class="status ${r.status.toLowerCase()}">${statusText[r.status]}</span></td>
                    <td>${action}</td>
                </tr>`;
        });

        rows.innerHTML = html;
    });
