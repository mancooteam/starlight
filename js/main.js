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

// INICJALIZACJA - Start wszystkiego
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();      // Sprawdź kto jest zalogowany
    await fetchCharacters(); // Pobierz i pokaż postacie
});

// SPRAWDZANIE SESJI
async function checkAuth() {
    try {
        const response = await fetch('api/check_auth.php');
        const data = await response.json();
        if (data.loggedIn) {
            currentUser = data;
        }
    } catch (e) { console.error("Błąd sesji"); }
    renderNavbar();
}

function renderNavbar() {
    const div = document.getElementById('auth-buttons');
    if (currentUser.loggedIn) {
        div.innerHTML = `
            <span class="me-2 text-secondary small">Witaj, <b>${currentUser.username}</b></span>
            <button class="btn btn-sm btn-outline-danger" onclick="logout()">Wyloguj</button>`;
    } else {
        div.innerHTML = `
            <button class="btn btn-sm btn-primary me-2" data-bs-toggle="modal" data-bs-target="#loginModal">Logowanie</button>
            <button class="btn btn-sm btn-outline-light" data-bs-toggle="modal" data-bs-target="#registerModal">Rejestracja</button>`;
    }
}

// POBIERANIE POSTACI (TO TU BYŁ PROBLEM)
async function fetchCharacters() {
    const container = document.getElementById('characters-container');
    container.innerHTML = '<div class="text-center w-100"><div class="spinner-border text-light"></div></div>';

    try {
        const response = await fetch('api/get_characters.php');
        const characters = await response.json();

        container.innerHTML = ''; // Czyścimy spinner

        if (!characters || characters.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">Brak postaci w bazie danych.</p>';
            return;
        }

        characters.forEach(char => {
            const color = klanKolory[char.klan] || '#444';
            // Sprawdź czy użytkownik może edytować (Admin lub Właściciel)
            const canManage = currentUser.role === 'admin' || (currentUser.loggedIn && currentUser.id == char.id_wlasciciela);

            const card = `
                <div class="col-md-4 col-lg-3">
                    <div class="card bg-dark text-light h-100 shadow" style="border-top: 5px solid ${color} !important; border-radius: 10px; overflow: hidden;">
                        <img src="${char.url_awatara || 'https://via.placeholder.com/300'}" class="card-img-top" style="height: 200px; object-fit: cover;">
                        <div class="card-body text-center">
                            <h5 class="fw-bold mb-1" style="color: ${color}">${char.imie}</h5>
                            <div class="badge rounded-pill mb-2" style="background-color: ${color}">${char.klan}</div>
                            <p class="small text-uppercase mb-0 text-muted">${char.ranga}</p>
                            ${canManage ? `
                                <div class="mt-3 pt-2 border-top border-secondary">
                                    <button class="btn btn-sm btn-warning me-1">Edytuj</button>
                                    <button class="btn btn-sm btn-danger">Usuń</button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>`;
            container.innerHTML += card;
        });
    } catch (e) {
        container.innerHTML = '<p class="text-center text-danger">Błąd połączenia z bazą danych.</p>';
        console.error(e);
    }
}

// OBSŁUGA LOGOWANIA I REJESTRACJI (Nasłuchiwacze)
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
    if(data.success) location.reload();
    else document.getElementById('loginError').innerText = data.error;
});

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
    if(data.success) { alert("Konto założone!"); location.reload(); }
    else document.getElementById('registerError').innerText = data.error;
});

function logout() {
    fetch('api/logout.php').then(() => location.reload());
}