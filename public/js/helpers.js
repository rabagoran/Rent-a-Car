// Ndihmese qe perdoren ne disa faqe

// 1. Shfaq mesazhin qe vjen nga serveri ne adrese: ?error=... ose ?success=...
const params = new URLSearchParams(window.location.search);
const messageBox = document.getElementById("message");

if (messageBox && params.get("error")) {
    messageBox.textContent = params.get("error");
    messageBox.className = "message error";
}

if (messageBox && params.get("success")) {
    messageBox.textContent = params.get("success");
    messageBox.className = "message success";
}

// 2. E ben tekstin te sigurt para se ta vendosim ne HTML
//    (p.sh. nese dikush shkruan <script> si emer)
function esc(text) {
    const div = document.createElement("div");
    div.textContent = text === null ? "" : text;
    return div.innerHTML;
}
