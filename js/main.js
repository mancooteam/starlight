document.addEventListener('DOMContentLoaded', async () => {
    await checkUserStatus();
    await loadCharacters();
});

async function checkUserStatus() {
    try {
        const res = await fetch('api/auth.php?action=status');
        const user = await res.json();
        renderNavbar(user);
        return user;
    } catch (e) {
        showToast("Błąd autoryzacji", "danger");
    }
}

async function loadCharacters() {
    const container = document.getElementById('character-container');
    try {
        const res = await fetch('api/characters.php');
        const characters = await res.json();
        renderCharactersList(characters);
    } catch (e) {
        showToast("Nie udało się pobrać postaci", "danger");
    }
}

async function handleLogout() {
    if (!confirm("Czy na pewno chcesz się wylogować?")) return;
    try {
        await fetch('api/auth.php?action=logout');
        showToast("Wylogowano pomyślnie", "success");
        setTimeout(() => location.reload(), 1000);
    } catch (e) {
        showToast("Błąd podczas wylogowywania", "danger");
    }
}
// ... reszta funkcji renderujących bez zmian ...
const AppState = {
    user: null,
    allCharacters: [],
    filters: {
        search: '',
        klan: 'all'
    }
};

// --- INICJALIZACJA ---
document.addEventListener('DOMContentLoaded', async () => {
    await checkUserStatus();
    await loadCharacters();
    setupEventListeners();
});

// --- API: STATUS UŻYTKOWNIKA ---
async function checkUserStatus() {
    try {
        const response = await fetch('api/auth.php?action=status');
        AppState.user = await response.json();
        renderNavbar();
    } catch (error) {
        console.error("Błąd autoryzacji:", error);
        AppState.user = { loggedIn: false, rola: 'gosc' };
    }
}

// --- API: POBIERANIE POSTACI ---
async function loadCharacters() {
    const container = document.getElementById('character-container');

    try {
        const response = await fetch('api/characters.php');
        AppState.allCharacters = await response.json();
        renderCharacters();
    } catch (error) {
        container.innerHTML = `<div class="col-12 text-center text-danger">Błąd połączenia z bazą danych.</div>`;
    }
}

// --- UI: RENDEROWANIE NAWIGACJI ---
function renderNavbar() {
    const authContainer = document.getElementById('auth-buttons');
    const adminActions = document.getElementById('admin-actions');
    const { user } = AppState;

    if (user.loggedIn) {
        // Widok dla zalogowanego (User/Admin)
        let adminLinks = '';
        if (user.rola === 'administrator') {
            adminLinks = `<a href="zarzadzanie_uzytkownikami.html" class="btn btn-sm btn-outline-warning me-2">Panel Admina</a>`;
        }

        authContainer.innerHTML = `
            <div class="d-flex align-items-center">
                ${adminLinks}
                <span class="text-light d-none d-sm-inline me-3">Witaj, <b>${user.nazwa}</b></span>
                <button onclick="handleLogout()" class="btn btn-sm btn-outline-danger">Wyloguj</button>
            </div>
        `;

        adminActions.innerHTML = `
            <a href="editor.html" class="btn btn-primary px-4 py-2" style="background-color: var(--em2); border:none;">
                + Stwórz nową postać
            </a>
        `;
    } else {
        // Widok dla Gościa
        authContainer.innerHTML = `
            <a href="login.html" class="btn btn-sm btn-outline-light me-2">Zaloguj się</a>
            <a href="register.html" class="btn btn-sm btn-primary" style="background-color: var(--em2); border:none;">Dołącz do nas</a>
        `;
    }
}

// --- UI: RENDEROWANIE KART POSTACI ---
function renderCharacters() {
    const container = document.getElementById('character-container');

    // Filtrowanie danych
    const filtered = AppState.allCharacters.filter(char => {
        const matchesSearch = char.imie.toLowerCase().includes(AppState.filters.search.toLowerCase()) ||
            char.klan.toLowerCase().includes(AppState.filters.search.toLowerCase());
        const matchesKlan = AppState.filters.klan === 'all' || char.klan === AppState.filters.klan;
        return matchesSearch && matchesKlan;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div class="col-12 text-center py-5 text-muted">Nie znaleziono żadnych postaci spełniających kryteria.</div>`;
        return;
    }

    container.innerHTML = filtered.map(char => `
        <div class="col-md-4 col-lg-3 fade-in">
            <div class="card h-100 character-card">
                <div class="position-relative">
                    <img src="${char.url_awatara}" class="card-img-top character-icon" alt="${char.imie}" loading="lazy">
                    <span class="badge position-absolute top-0 end-0 m-2" style="background: var(--tlo4); border: 1px solid var(--em2);">
                        ${char.klan}
                    </span>
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title" style="color: var(--em2)">${char.imie}</h5>
                    <p class="card-text small text-secondary mb-3">${char.ranga}</p>
                    <div class="mt-auto d-grid">
                        <a href="postac.html?id=${char.id_postaci}" class="btn btn-outline-light btn-sm">Zobacz profil</a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// --- LOGIKA FILTROWANIA ---
function setupEventListeners() {
    // Możesz dodać te elementy do swojego index.html w sekcji wyszukiwania
    const searchInput = document.getElementById('main-search');
    const klanFilter = document.getElementById('klan-filter');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            AppState.filters.search = e.target.value;
            renderCharacters();
        });
    }

    if (klanFilter) {
        klanFilter.addEventListener('change', (e) => {
            AppState.filters.klan = e.target.value;
            renderCharacters();
        });
    }
}

// --- WYLOGOWANIE ---
async function handleLogout() {
    if (!confirm("Czy na pewno chcesz się wylogować?")) return;

    try {
        await fetch('api/auth.php?action=logout');
        window.location.reload();
    } catch (error) {
        console.error("Błąd podczas wylogowywania");
    }
}