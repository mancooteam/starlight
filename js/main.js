document.addEventListener('DOMContentLoaded', async () => {
    console.log("Aplikacja startuje...");

    const auth = await getAuth();
    renderAuthUI(auth);

    const container = document.getElementById('character-container');
    if (!container) {
        console.error("BŁĄD: Nie znaleziono elementu #character-container w HTML!");
        return;
    }

    try {
        console.log("Pobieranie postaci z API...");
        const res = await fetch('api/characters.php');
        const chars = await res.json();

        console.log("Pobrano postaci:", chars.length, chars);
        window.allChars = chars;

        if (!Array.isArray(chars) || chars.length === 0) {
            container.innerHTML = "<div class='col-12 text-center mt-5'><p class='text-muted'>Baza postaci jest pusta.</p></div>";
            return;
        }

        renderGrid(chars);

    } catch(e) {
        console.error("Błąd podczas pobierania lub renderowania:", e);
        container.innerHTML = "<div class='col-12 text-center mt-5 text-danger'><p>Błąd krytyczny połączenia z API.</p></div>";
    }

    // Obsługa wyszukiwarki
    const searchInput = document.getElementById('main-search');
    if(searchInput) {
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

function renderAuthUI(auth) {
    const box = document.getElementById('auth-buttons');
    const adminBox = document.getElementById('admin-actions');
    if (!box) return;

    if (auth.loggedIn) {
        box.innerHTML = `<span class="text-white me-2 small">${auth.nazwa}</span><button onclick="logout()" class="btn btn-sm btn-outline-danger">Wyloguj</button>`;
        if (auth.rola === 'administrator') {
            box.innerHTML = `<a href="zarzadzanie_uzytkownikami.html" class="btn btn-sm btn-outline-warning me-2">Admin</a>` + box.innerHTML;
        }
        if(adminBox) adminBox.innerHTML = `<a href="editor.html" class="btn btn-primary px-4">+ Dodaj nową postać</a>`;
    } else {
        box.innerHTML = `<a href="login.html" class="btn btn-sm btn-outline-light me-1">Logowanie</a><a href="register.html" class="btn btn-sm btn-primary">Dołącz</a>`;
    }
}

function renderGrid(chars) {
    const container = document.getElementById('character-container');

    let html = "";
    chars.forEach(c => {
        const accentColor = getGroupColor(c.klan);
        const groupClass = getGroupStyleClass(c.klan);
        const avatar = c.url_awatara || 'https://via.placeholder.com/150';

        html += `
        <div class="col-6 col-md-4 col-lg-3 mb-4">
            <div class="card h-100 character-card shadow-sm" 
                 style="border-top: 5px solid ${accentColor} !important;" 
                 onclick="window.location.href='postac.html?id=${c.id_postaci}'">
                <img src="${avatar}" class="card-img-top" style="height:160px; object-fit:cover;" alt="${c.imie}">
                <div class="card-body p-2 text-center">
                    <h6 class="mb-1 ${groupClass}" style="font-size: 0.95rem;">${c.imie}</h6>
                    <div class="x-small fw-bold" style="color:var(--em1); font-size: 0.75rem;">${c.klan}</div>
                    <div class="x-small text-muted" style="font-size: 0.7rem;">${c.ranga}</div>
                </div>
            </div>
        </div>
        `;
    });
    container.innerHTML = html;
}

async function logout() {
    await fetch('api/auth.php?action=logout');
    location.reload();
}