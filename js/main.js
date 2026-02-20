const klanKolory = {
    "Gwiezdny Klan": "#5C5AA6", "Pustka": "#6C8570", "Plemię Wiecznych Łowów": "#886CAB",
    "Ciemny Las": "#8F534B", "Klan Cienia": "#E38F9C", "Klan Gromu": "#FFCE7A",
    "Klan Rzeki": "#7898FF", "Klan Wichru": "#A3E0D5", "Plemię Niedźwiedzich Kłów": "#ffffff",
    "Bractwo Krwi": "#CA4250", "Samotnik": "#7DBF65", "Nieaktywny": "#828282", "NPC": "#aaaaaa"
};

const listaCech = [
    {id:1, n:"Ostre kły", t:"pozytywna"}, {id:2, n:"Ostre pazury", t:"pozytywna"}, {id:3, n:"Twarda skóra", t:"pozytywna"},
    {id:4, n:"Cichy krok", t:"pozytywna"}, {id:5, n:"Wspinacz", t:"pozytywna"}, {id:6, n:"Psi węch", t:"pozytywna"},
    {id:7, n:"Sokoli wzrok", t:"pozytywna"}, {id:8, n:"Króliczy słuch", t:"pozytywna"}, {id:9, n:"Końskie zdrowie", t:"pozytywna"},
    {id:10, n:"Śliska sprawa", t:"mieszana"}, {id:11, n:"Zapaśnik", t:"mieszana"}, {id:12, n:"Instynkt przetrwania", t:"mieszana"},
    {id:13, n:"Refleks", t:"mieszana"}, {id:14, n:"Długodystansowiec", t:"mieszana"}, {id:15, n:"Sprinter", t:"mieszana"},
    {id:16, n:"Nocny łowca", t:"mieszana"}, {id:17, n:"Światłowidzenie", t:"mieszana"}, {id:18, n:"Gorąca krew", t:"mieszana"},
    {id:19, n:"Zimna krew", t:"mieszana"}, {id:20, n:"Leśny cień", t:"mieszana"}, {id:21, n:"Dziecko wiatru", t:"mieszana"},
    {id:22, n:"Duch gór", t:"mieszana"}, {id:23, n:"Strażnik doliny", t:"mieszana"}, {id:24, n:"Suche łapy", t:"mieszana"},
    {id:25, n:"Ryba w wodzie", t:"mieszana"}, {id:26, n:"Tępe kły", t:"negatywna"}, {id:27, n:"Tępe pazury", t:"negatywna"},
    {id:28, n:"Wrażliwa skóra", t:"negatywna"}, {id:29, n:"Brak ogona", t:"negatywna"}, {id:30, n:"Kulawa noga", t:"negatywna"},
    {id:31, n:"Ciężki krok", t:"negatywna"}, {id:32, n:"Ciamajda", t:"negatywna"}, {id:33, n:"Nadwrażliwy węch", t:"negatywna"},
    {id:34, n:"Stępiony węch", t:"negatywna"}, {id:35, n:"Nadwrażliwy wzrok", t:"negatywna"}, {id:36, n:"Słaby wzrok - jednostronny", t:"negatywna"},
    {id:37, n:"Słaby wzrok - obustronny", t:"negatywna"}, {id:38, n:"Nadwrażliwy słuch", t:"negatywna"},
    {id:39, n:"Słaby słuch - jednostronny", t:"negatywna"}, {id:40, n:"Słaby słuch - obustronny", t:"negatywna"},
    {id:41, n:"Wątłe zdrowie", t:"negatywna"}, {id:42, n:"Wrażliwy brzuch", t:"negatywna"}, {id:43, n:"Słaba głowa", t:"negatywna"},
    {id:44, n:"Bezpłodność", t:"negatywna"}, {id:45, n:"Brak łapy", t:"ciezka_negatywna"}, {id:46, n:"Brak węchu", t:"ciezka_negatywna"},
    {id:47, n:"Ślepota - jednostronna", t:"ciezka_negatywna"}, {id:48, n:"Ślepota - obustronna", t:"ciezka_negatywna"},
    {id:49, n:"Głuchota - jednostronna", t:"ciezka_negatywna"}, {id:50, n:"Głuchota - obustronna", t:"ciezka_negatywna"}, {id:51, n:"Albinizm", t:"ciezka_negatywna"}
];

let currentUser = { loggedIn: false, id: null, role: 'gosc' };

// --- INICJALIZACJA ---
document.addEventListener('DOMContentLoaded', async () => {
    renderCechyList();
    await checkAuth();
    await fetchCharacters();
});

async function checkAuth() {
    try {
        const res = await fetch('api/check_auth.php');
        const data = await res.json();
        if (data.loggedIn) currentUser = data;
        renderNavbar();
    } catch (e) { console.error("Błąd sesji"); }
}

function renderNavbar() {
    const div = document.getElementById('auth-buttons');
    if (currentUser.loggedIn) {
        div.innerHTML = `
            <span class="me-3 small">Witaj, <b>${currentUser.username}</b></span>
            <button class="btn btn-sm btn-success me-2" onclick="showAddModal()">+ Dodaj Postać</button>
            <button class="btn btn-sm btn-outline-danger" onclick="logout()">Wyloguj</button>`;
    } else {
        div.innerHTML = `
            <button class="btn btn-sm btn-primary me-2" data-bs-toggle="modal" data-bs-target="#loginModal">Logowanie</button>
            <button class="btn btn-sm btn-outline-light" data-bs-toggle="modal" data-bs-target="#registerModal">Rejestracja</button>`;
    }
}

// --- POSTACIE ---
async function fetchCharacters() {
    const container = document.getElementById('characters-container');
    container.innerHTML = '<div class="text-center w-100"><div class="spinner-border text-primary"></div></div>';

    try {
        const response = await fetch('api/get_characters.php');
        const characters = await response.json();
        container.innerHTML = '';

        characters.forEach(char => {
            const color = klanKolory[char.klan] || '#444';
            const isOwner = currentUser.loggedIn && (currentUser.id == char.id_wlasciciela);
            const isAdmin = currentUser.role === 'admin' || currentUser.role === 'administrator';
            const canManage = isOwner || isAdmin;

            container.innerHTML += `
                <div class="col-md-4 col-lg-3">
                    <div class="card character-card h-100 shadow" style="border-top: 5px solid ${color} !important;">
                        <img src="${char.url_awatara || 'https://via.placeholder.com/300'}" class="card-img-top">
                        <div class="card-body text-center">
                            <h5 class="fw-bold mb-1" style="color: ${color}">${char.imie}</h5>
                            <div class="badge rounded-pill mb-2" style="background-color: ${color}">${char.klan}</div>
                            <p class="small text-uppercase mb-0 text-secondary">${char.ranga}</p>
                            ${canManage ? `
                                <div class="mt-3 pt-2 border-top border-secondary d-flex justify-content-center gap-2">
                                    <button class="btn btn-sm btn-warning" onclick="editChar('${char.id_postaci}')">Edytuj</button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteChar('${char.id_postaci}')">Usuń</button>
                                </div>` : ''}
                        </div>
                    </div>
                </div>`;
        });
    } catch (e) { container.innerHTML = '<p class="text-danger">Błąd ładowania.</p>'; }
}

// --- FUNKCJE AKCJI ---
function showAddModal() { new bootstrap.Modal(document.getElementById('addCharacterModal')).show(); }

async function deleteChar(id) {
    if (!confirm("Usunąć tę postać?")) return;
    const res = await fetch('api/delete_character.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ id_postaci: id })
    });
    const result = await res.json();
    if(result.success) location.reload();
    else alert(result.error);
}

function editChar(id) { alert("Funkcja edycji dla ID: " + id + " będzie dostępna wkrótce!"); }

function renderCechyList() {
    listaCech.forEach(c => {
        const target = document.getElementById('cat-' + c.t);
        if (target) {
            target.innerHTML += `
                <div class="form-check small">
                    <input class="form-check-input" type="checkbox" name="cechy" value="${c.id}" id="c${c.id}">
                    <label class="form-check-label" for="c${c.id}">${c.n}</label>
                </div>`;
        }
    });
}

// --- FORMULARZE ---
document.getElementById('addCharacterForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.cechy = Array.from(formData.getAll('cechy'));

    const res = await fetch('api/add_character.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    const result = await res.json();
    if(result.success) location.reload();
    else alert(result.error);
});

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
    if(data.success) { alert("Zarejestrowano!"); location.reload(); }
    else document.getElementById('registerError').innerText = data.error;
});

function logout() { fetch('api/logout.php').then(() => location.reload()); }