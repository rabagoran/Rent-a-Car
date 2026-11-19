// Nese perdoruesi eshte i kycur, "Log in" ne menu behet "Log out"

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
    });
