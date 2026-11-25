// Nese perdoruesi eshte i kycur, "Log in" ne menu behet "Log out"
// dhe klienti sheh edhe linkun "My reservations"

fetch("/api/me")
    .then(response => response.json())
    .then(user => {
        if (!user) {
            return;
        }

        const link = document.querySelector('header a[href="login.html"]');
        link.textContent = "Log out";
        link.href = "/api/logout";
        link.classList.remove("active");

        // Per klientin: shto "My reservations" para "Log out"
        if (user.role === "CLIENT") {
            const item = document.createElement("li");
            item.innerHTML = '<a href="my-reservations.html">My reservations</a>';

            if (window.location.pathname.endsWith("my-reservations.html")) {
                item.firstChild.classList.add("active");
            }

            link.parentElement.before(item);
        }
    });
