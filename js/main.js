/**
 * ST_HUB - Główna logika strony (index.html)
 * Zarządza wyświetlaniem postaci, statystykami klanowymi oraz interfejsem użytkownika.
 */

document.addEventListener('DOMContentLoaded', async () => {
    console.log("Inicjalizacja ST_HUB...");

    // 1. Sprawdź status logowania i dostosuj nawigację
    const auth = await getAuth();
    renderAuthUI(auth);

    // 2. Pobierz postacie z API
    const container = document.getElementById('character-container');
    if (!container) return;

    try {
        const res = await fetch('api/characters.php');
        const chars = await res.json();

        // Zapisz globalnie dla wyszukiwarki
        window.allChars = Array.isArray(chars) ? chars : [];

        if (window.allChars.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-inbox text-muted" style="font-size: 3rem;"></i>
                    <p class="text-muted mt-3">Rejestr postaci jest obecnie pusty.</p>
                </div>`;
            return;
        }

        // 3. Renderuj Statystyki i Siatkę Postaci
        renderStatsDashboard(window.allChars);
        renderGrid(window.allChars);

    } catch (e) {
        console.error("Błąd ładowania danych:", e);
        container.innerHTML = `
            <div class="col-12 text-center text-danger py-5">
                <i class="bi bi-exclamation-triangle fs-1"></i>
                <p class="mt-2">Błąd połączenia z bazą danych Aiven.</p>
            </div>`;
    }

    // 4. Obsługa wyszukiwarki
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
 * Renderuje dynamiczny panel statystyk na górze strony
 */
function renderStatsDashboard(chars) {
    const dash = document.getElementById('stats-dashboard');
    const totalCount = document.getElementById('total-chars-count');
    const clanList = document.getElementById('clan-stats-list');

    if (!dash || !totalCount || !clanList) return;

    // Licznik ogólny
    totalCount.innerText = chars.length;

    // Agregacja klanów
    const stats = {};
    chars.forEach(c => {
        const klan = c.klan || "Bez klanu";
        stats[klan] = (stats[klan] || 0) + 1;
    });

    // Renderowanie odznak klanowych
    clanList.innerHTML = Object.entries(stats)
        .sort((a, b) => b[1] - a[1]) // Sortowanie od najliczniejszych
        .map(([name, count]) => {
            const color = getGroupColor(name);
            return `
                <div class="badge rounded-pill d-flex align-items-center p-2" 
                     style="background: rgba(0,0,0,0.3); border: 1px solid ${color}66; transition: 0.3s;">
                    <span class="me-2" style="color:${color}; font-weight: 800;">${count}</span>
                    <span class="small text-white-50">${name}</span>
                </div>
            `;
        }).join('');

    dash.classList.remove('d-none'); // Pokaż panel po załadowaniu
}

/**
 * Generuje kafelki postaci
 */
function renderGrid(chars) {
    const container = document.getElementById('character-container');
    if (!container) return;

    if (chars.length === 0) {
        container.innerHTML = `<div class="col-12 text-center py-5 text-muted">Nie znaleziono wojowników spełniających kryteria.</div>`;
        return;
    }

    container.innerHTML = chars.map(c => {
        const accentColor = getGroupColor(c.klan);
        const groupClass = getGroupStyleClass(c.klan);
        const avatar = c.url_awatara || 'https://via.placeholder.com/300x400?text=Brak+Awatara';

        return `
        <div class="col-6 col-md-4 col-lg-3">
            <div class="card h-100 character-card shadow-sm" 
                 style="border-top: 5px solid ${accentColor} !important; cursor: pointer;"
                 onclick="window.location.href='postac.html?id=${c.id_postaci}'">
                
                <div class="position-relative overflow-hidden">
                    <img src="${avatar}" class="card-img-top" style="height:220px; object-fit:cover;" alt="${c.imie}">
                </div>

                <div class="card-body p-3 text-center">
                    <h6 class="mb-1 group-name ${groupClass}">
                        ${c.imie}
                    </h6>
                    <div class="small fw-bold opacity-75" style="color:${accentColor}; font-size: 0.75rem;">
                        ${c.klan}
                    </div>
                    <div class="x-small text-muted mt-1" style="font-size: 0.7rem;">
                        ${c.ranga}
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

/**
 * Zarządza przyciskami logowania, admina i profilu
 */
function renderAuthUI(auth) {
    const authBox = document.getElementById('auth-buttons');
    const adminTools = document.getElementById('admin-tools');

    if (!authBox) return;

    if (auth.loggedIn) {
        // Widok dla zalogowanego
        authBox.innerHTML = `
            <a href="moje_postacie.html" class="btn btn-sm btn-outline-success me-2">
                <i class="bi bi-person-circle me-1"></i> Moje Postacie
            </a>
            <button onclick="logout()" class="btn btn-sm btn-outline-danger">
                <i class="bi bi-box-arrow-right"></i>
            </button>
        `;

        // Narzędzia administratora
        if (auth.rola === 'administrator') {
            if (adminTools) adminTools.classList.remove('d-none');
        }
    } else {
        // Widok dla gościa
        authBox.innerHTML = `
            <a href="login.html" class="btn btn-sm btn-primary px-3">
                <i class="bi bi-person-lock me-1"></i> Zaloguj się
            </a>
        `;
    }
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