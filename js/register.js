document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    const avatarUrl = document.getElementById('reg-avatar').value;
    const msgDiv = document.getElementById('reg-msg');

    // Walidacja po stronie klienta
    if (password !== confirm) {
        showMsg("Hasła nie są identyczne!", "alert-danger");
        return;
    }

    try {
        const response = await fetch('api/register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                password: password,
                avatar_url: avatarUrl
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            showMsg(result.message, "alert-success");
            // Przekierowanie do logowania po 2 sekundach
            setTimeout(() => window.location.href = 'login.html', 2000);
        } else {
            showMsg(result.message, "alert-danger");
        }
    } catch (err) {
        showMsg("Błąd połączenia z serwerem.", "alert-danger");
    }
});

function showMsg(text, type) {
    const msgDiv = document.getElementById('reg-msg');
    msgDiv.textContent = text;
    msgDiv.className = `alert ${type} py-2`;
    msgDiv.classList.remove('d-none');
}