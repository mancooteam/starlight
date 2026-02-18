/**
 * ST_HUB - Główna logika strony (index.html)
 */

document.addEventListener('DOMContentLoaded', async () => {
    console.log("Inicjalizacja strony głównej...");

    // 1. Sprawdź status logowania
    const auth = await getAuth();
    renderAuthUI(auth);

    const container = document.getElementById('character-container');
    if (!container) return;

    try {
        // 2. Pobierz wszystkie postacie z API
        const res = await fetch('api/characters.php');
        const chars = await res.json();

        window.allChars = Array.isArray(chars) ? chars : [];

        if (window.allChars.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-muted">Baza postaci jest obecnie pusta.</p>
                </div>`;
            return;
        }

        // 3. Wyświetl postacie
        renderGrid(window.allChars);

    } catch (e) {
        console.error("Błąd ładowania danych:", e);
        container.innerHTML = "<p class='text-center text-danger'>Błąd połączenia z bazą danych.</p>";
    }

    // 4. Obsługa wyszukiwarki (Imię lub Klan)
    const searchInput = document.getElementById('main-search');
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            const term = e.target.value.toLowerCase();
            const filtered = window.allChars.filter(c =>
                (c.imie && c.imie.toLowerCase().includes(term)) ||
                (c.klan && c.klan.toLowerCase().includes(term))
            );
            renderGrid(filtered);
        });
    }
});

/**
 * Renderuje przyciski w nawigacji i akcje administratora
 */
function renderAuthUI(auth) {
    const authBox = document.getElementById('auth-buttons');
    const adminBox = document.getElementById('admin-actions');

    if (!authBox) return;

    if (auth.loggedIn) {
        // Widok dla zalogowanego
        authBox.innerHTML = `
            <a href="moje_postacie.html" class="btn btn-sm btn-outline-success me-2">Moje Postacie</a>
            <span class="text-white me-2 small d-none d-md-inline">${auth.nazwa}</span>
            <button onclick="logout()" class="btn btn-sm btn-outline-danger">Wyloguj</button>
        `;

        // Przycisk dodawania postaci (widoczny w nagłówku index.html)
        if (adminBox) {
            adminBox.innerHTML = `
                <a href="editor.html" class="btn btn-primary px-4 fw-bold">+ DODAJ NOWĄ POSTAĆ</a>
            `;
        }

        // Jeśli to admin, dodaj przycisk panelu
        if (auth.rola === 'administrator') {
            authBox.insertAdjacentHTML('afterbegin', `
                <a href="zarzadzanie_uzytkownikami.html" class="btn btn-sm btn-outline-warning me-2">Admin</a>
            `);
        }
    } else {
        // Widok dla gościa
        authBox.innerHTML = `
            <a href="login.html" class="btn btn-sm btn-outline-light me-1">Logowanie</a>
            <a href="register.html" class="btn btn-sm btn-primary">Dołącz do nas</a>
        `;
        if (adminBox) adminBox.innerHTML = `<p class="text-muted small">Zaloguj się, aby tworzyć własne postacie.</p>`;
    }
}

/**
 * Generuje karty postaci w systemie kafelkowym
 */
function renderGrid(chars) {
    const container = document.getElementById('character-container');
    if (!container) return;

    container.innerHTML = chars.map(c => {
        // Pobieramy kolory i klasy z utils.js
        const accentColor = getGroupColor(c.klan);
        const groupClass = getGroupStyleClass(c.klan);
        const avatar = c.url_awatara || 'https://via.placeholder.com/200x250';

        return `
        <div class="col-6 col-md-4 col-lg-3 mb-4">
            <div class="card h-100 character-card shadow-sm" 
                 style="border-top: 5px solid ${accentColor} !important;"
                 onclick="window.location.href='postac.html?id=${c.id_postaci}'">
                
                <div class="position-relative">
                    <img src="${avatar}" class="card-img-top" style="height:180px; object-fit:cover;" alt="${c.imie}">
                </div>

                <div class="card-body p-2 text-center">
                    <h6 class="mb-1 group-name ${groupClass}" style="font-size: 0.95rem;">
                        ${c.imie}
                    </h6>
                    <div class="x-small fw-bold" style="color:var(--em1); font-size: 0.75rem;">
                        ${c.klan}
                    </div>
                    <div class="x-small text-muted" style="font-size: 0.7rem;">
                        ${c.ranga}
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

/**
 * Funkcja wylogowania
 */
async function logout() {
    try {
        await fetch('api/auth.php?action=logout');
        window.location.reload();
    } catch (e) {
        console.error("Błąd wylogowania:", e);
    }
}