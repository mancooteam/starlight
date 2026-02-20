let currentUser = { loggedIn: false };

document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    await checkAuth();
    // Tutaj możesz dodać fetchCharacters();
}

async function checkAuth() {
    const res = await fetch('api/check_auth.php');
    currentUser = await res.json();
    renderNavbar();
}

function renderNavbar() {
    const div = document.getElementById('auth-buttons');
    if (currentUser.loggedIn) {
        div.innerHTML = `<span class="me-2 text-secondary">${currentUser.username}</span>
                         <button class="btn btn-sm btn-outline-danger" onclick="logout()">Wyloguj</button>`;
    } else {
        div.innerHTML = `<button class="btn btn-sm btn-primary me-2" data-bs-toggle="modal" data-bs-target="#loginModal">Logowanie</button>
                         <button class="btn btn-sm btn-outline-light" data-bs-toggle="modal" data-bs-target="#registerModal">Rejestracja</button>`;
    }
}

// Obsługa Rejestracji
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('regUser').value;
    const password = document.getElementById('regPass').value;
    if(password !== document.getElementById('regPassConfirm').value) {
        document.getElementById('registerError').innerText = "Hasła nie pasują"; return;
    }

    const res = await fetch('api/register.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password})
    });
    const data = await res.json();
    if(data.success) { alert("Gotowe!"); location.reload(); }
    else { document.getElementById('registerError').innerText = data.error; }
});

// Obsługa Logowania
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUser').value;
    const password = document.getElementById('loginPass').value;

    const res = await fetch('api/login.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password})
    });
    const data = await res.json();
    if(data.success) { location.reload(); }
    else { document.getElementById('loginError').innerText = data.error; }
});

function logout() {
    fetch('api/logout.php').then(() => location.reload());
}