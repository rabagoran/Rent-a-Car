// Lokacionet nga databaza

fetch("/api/locations")
    .then(response => response.json())
    .then(locations => {
        const rows = document.getElementById("location-rows");

        if (locations.length === 0) {
            rows.innerHTML = '<tr><td class="empty" colspan="5">No locations yet.</td></tr>';
            return;
        }

        let html = "";

        locations.forEach((l, i) => {
            html += `
                <tr>
                    <td>${i + 1}</td>
                    <td>${esc(l.name)}</td>
                    <td>${esc(l.city)}</td>
                    <td>${esc(l.address || "-")}</td>
                    <td>${esc(l.phone || "-")}</td>
                </tr>`;
        });

        rows.innerHTML = html;
    });
