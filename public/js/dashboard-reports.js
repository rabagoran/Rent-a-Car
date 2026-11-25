// Reports: numrat dhe grafiket me shirita

// Vizaton nje liste me shirita: sa me i madh numri, aq me i gjate shiriti
// rows = lista, labelKey = emri, valueKey = numri, money = a eshte ne euro
function bars(boxId, rows, labelKey, valueKey, money) {
    const box = document.getElementById(boxId);

    if (rows.length === 0) {
        box.innerHTML = '<p class="empty">No data yet.</p>';
        return;
    }

    // Numri me i madh = 100% gjeresi
    const max = Math.max(...rows.map(r => r[valueKey]));

    let html = "";

    rows.forEach(r => {
        const width = max > 0 ? (r[valueKey] / max) * 100 : 0;
        const value = money ? "€" + r[valueKey] : r[valueKey];

        html += `
            <div class="bar-row">
                <span class="bar-label">${esc(r[labelKey])}</span>
                <div class="bar"><div class="bar-fill" style="width: ${width}%"></div></div>
                <span class="bar-value">${value}</span>
            </div>`;
    });

    box.innerHTML = html;
}

fetch("/api/reports")
    .then(response => response.json())
    .then(report => {
        // 1. Numrat kryesore
        document.getElementById("revenue").textContent = "€" + report.revenue;
        document.getElementById("bookings").textContent = report.bookings;

        const average = report.bookings > 0 ? Math.round(report.revenue / report.bookings) : 0;
        document.getElementById("average").textContent = "€" + average;

        if (report.topCars.length > 0) {
            document.getElementById("top-car").textContent = report.topCars[0].car;
        }

        // 2. Grafiket
        bars("by-month", report.byMonth, "month", "revenue", true);
        bars("top-cars", report.topCars, "car", "bookings", false);
        bars("by-status", report.byStatus, "status", "bookings", false);
        bars("by-location", report.byLocation, "location", "bookings", false);
    });
