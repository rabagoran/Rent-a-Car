// Mesazhet nga forma Contact

fetch("/api/messages")
    .then(response => response.json())
    .then(messages => {
        const rows = document.getElementById("message-rows");

        if (messages.length === 0) {
            rows.innerHTML = '<tr><td class="empty" colspan="6">No messages yet.</td></tr>';
            return;
        }

        let html = "";

        messages.forEach(m => {
            html += `
                <tr>
                    <td>${m.sent}</td>
                    <td>${esc(m.name)}</td>
                    <td><a href="mailto:${esc(m.email)}">${esc(m.email)}</a></td>
                    <td>${esc(m.subject)}</td>
                    <td class="wrap">${esc(m.message)}</td>
                    <td>
                        <form class="inline" method="post" action="/api/messages/${m.id}/delete"
                              onsubmit="return confirm('Delete this message?')">
                            <button class="btn-small btn-red" type="submit">Delete</button>
                        </form>
                    </td>
                </tr>`;
        });

        rows.innerHTML = html;
    });
