const klanKolory = {
    "Gwiezdny Klan": "#5C5AA6",
    "Pustka": "#6C8570",
    "Plemię Wiecznych Łowów": "#886CAB",
    "Ciemny Las": "#8F534B",
    "Klan Cienia": "#E38F9C",
    "Klan Gromu": "#FFCE7A",
    "Klan Rzeki": "#7898FF",
    "Klan Wichru": "#A3E0D5",
    "Plemię Niedźwiedzich Kłów": "#ffffff",
    "Bractwo Krwi": "#CA4250",
    "Samotnik": "#7DBF65",
    "Nieaktywny": "#828282",
    "NPC": "#aaaaaa"
};

let currentUser = { loggedIn: false, id: null, username: '', role: 'gosc' };

// INICJALIZACJA
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    await fetchCharacters();
});

// SPRAWDZANIE SESJI
async function checkAuth() {
    try {
        const response = await fetch('api/check_auth.php');
        const data = await response.json();

        if (data.user_id) {
            currentUser = {
                loggedIn: true,
                id: data.user_id,
                username: data.username,
                role: data.role
            };
        }
    } catch (e) { console.error("Błąd sesji"); }
    renderNavbar();
}

function renderNavbar() {
    const authDiv = document.getElementById('auth-buttons');
    if (currentUser.loggedIn) {
        authDiv.innerHTML = `
            <span class="me-3 small text-secondary">Witaj, <b class="text-white">${currentUser.username}</b></span>
            <button class="btn btn-sm btn-outline-danger" onclick="logout()">Wyloguj</button>
        `;
    } else {
        authDiv.innerHTML = `
            <button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#loginModal">Zaloguj się</button>
        `;
    }
}

// POBIERANIE POSTACI
async function fetchCharacters() {
    const container = document.getElementById('characters-container');

    try {
        const response = await fetch('api/get_characters.php');
        const characters = await response.json();
        container.innerHTML = '';

        characters.forEach(char => {
            const color = klanKolory[char.klan] || '#444';
            const canManage = currentUser.role === 'admin' || (currentUser.loggedIn && currentUser.id == char.id_wlasciciela);

            const card = `
                <div class="col-md-4 col-lg-3">
                    <div class="card bg-dark text-light h-100 character-card shadow" style="border-top: 5px solid ${color} !important;">
                        <img src="${char.url_awatara || 'https://via.placeholder.com/300'}" class="card-img-top">
                        <div class="card-body text-center">
                            <h5 class="fw-bold mb-1" style="color: ${color}">${char.imie}</h5>
                            <div class="badge rounded-pill mb-2" style="background-color: ${color}">${char.klan}</div>
                            <p class="small text-uppercase mb-0">${char.ranga}</p>
                            ${canManage ? `
                                <div class="mt-3 pt-2 border-top border-secondary">
                                    <button class="btn btn-sm btn-warning">Edytuj</button>
                                    <button class="btn btn-sm btn-danger">Usuń</button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>`;
            container.innerHTML += card;
        });
    } catch (e) {
        container.innerHTML = '<p class="text-center text-danger">Błąd połączenia z API.</p>';
    }
}

// OBSŁUGA LOGOWANIA
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUser').value;
    const password = document.getElementById('loginPass').value;
    const errorDiv = document.getElementById('loginError');

    const response = await fetch('api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    if (result.success) {
        window.location.reload();
    } else {
        errorDiv.innerText = result.error || 'Błąd logowania';
    }
});

function logout() {
    fetch('api/logout.php').then(() => window.location.reload());
}