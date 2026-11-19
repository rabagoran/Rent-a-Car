// Klientet nga databaza

fetch("/api/clients")
    .then(response => response.json())
    .then(clients => {
        const rows = document.getElementById("client-rows");

        if (clients.length === 0) {
            rows.innerHTML = '<tr><td class="empty" colspan="6">No clients yet.</td></tr>';
            return;
        }

        let html = "";

        clients.forEach((c, i) => {
            html += `
                <tr>
                    <td>${i + 1}</td>
                    <td>${esc(c.name)}</td>
                    <td>${esc(c.email)}</td>
                    <td>${esc(c.phone || "-")}</td>
                    <td>${c.reservations}</td>
                    <td>${c.joined}</td>
                </tr>`;
        });

        rows.innerHTML = html;
    });
