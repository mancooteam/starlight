document.addEventListener('DOMContentLoaded', async () => {
    const auth = await getAuth();
    renderAuthUI(auth);

    try {
        const res = await fetch('api/characters.php');
        const chars = await res.json();
        window.allChars = chars;
        renderGrid(chars);
    } catch(e) {
        document.getElementById('character-container').innerHTML = "<p class='text-center'>Błąd ładowania postaci.</p>";
    }

    document.getElementById('main-search').addEventListener('input', e => {
        const term = e.target.value.toLowerCase();
        const filtered = window.allChars.filter(c =>
            c.imie.toLowerCase().includes(term) || c.klan.toLowerCase().includes(term)
        );
        renderGrid(filtered);
    });
});

function renderAuthUI(auth) {
    const box = document.getElementById('auth-buttons');
    if (auth.loggedIn) {
        box.innerHTML = `<span class="text-white me-2 small">${auth.nazwa}</span><button onclick="logout()" class="btn btn-sm btn-outline-danger">Wyloguj</button>`;
        if (auth.rola === 'administrator') box.innerHTML = `<a href="zarzadzanie_uzytkownikami.html" class="btn btn-sm btn-outline-warning me-2">Admin</a>` + box.innerHTML;
        document.getElementById('admin-actions').innerHTML = `<a href="editor.html" class="btn btn-primary">+ Dodaj Postać</a>`;
    } else {
        box.innerHTML = `<a href="login.html" class="btn btn-sm btn-outline-light me-1">Login</a><a href="register.html" class="btn btn-sm btn-primary">Dołącz</a>`;
    }
}

function renderGrid(chars) {
    const container = document.getElementById('character-container');
    if (!chars || chars.length === 0) {
        container.innerHTML = "<p class='text-center mt-5 text-muted'>Brak postaci do wyświetlenia.</p>";
        return;
    }

    container.innerHTML = chars.map(c => {
        const accentColor = getGroupColor(c.klan);
        const groupClass = getGroupStyleClass(c.klan);

        return `
        <div class="col-md-3 mb-4">
            <div class="card h-100 character-card" style="border-top: 5px solid ${accentColor}" onclick="location.href='postac.html?id=${c.id_postaci}'">
                <img src="${c.url_awatara || 'https://via.placeholder.com/150'}" class="card-img-top" style="height:160px; object-fit:cover;">
                <div class="card-body">
                    <h6 class="mb-1 ${groupClass}">${c.imie}</h6>
                    <div class="small fw-bold" style="color:var(--em1)">${c.klan}</div>
                    <div class="small text-muted">${c.ranga}</div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

async function logout() { await fetch('api/auth.php?action=logout'); location.reload(); }