document.addEventListener('DOMContentLoaded', async () => {
    const auth = await getAuth();
    renderAuthUI(auth);
    const r = await fetch('api/characters.php');
    const chars = await r.json();
    window.allChars = chars;
    renderGrid(chars);

    document.getElementById('main-search').addEventListener('input', e => {
        const filtered = window.allChars.filter(c =>
            c.imie.toLowerCase().includes(e.target.value.toLowerCase()) ||
            c.klan.toLowerCase().includes(e.target.value.toLowerCase())
        );
        renderGrid(filtered);
    });
});

function renderAuthUI(auth) {
    const box = document.getElementById('auth-buttons');
    if (auth.loggedIn) {
        box.innerHTML = `<span class="text-white me-2">${auth.nazwa}</span><button onclick="logout()" class="btn btn-sm btn-outline-danger">Wyloguj</button>`;
        if (auth.rola === 'administrator') box.innerHTML = `<a href="zarzadzanie_uzytkownikami.html" class="btn btn-sm btn-outline-warning me-2">Admin</a>` + box.innerHTML;
        document.getElementById('admin-actions').innerHTML = `<a href="editor.html" class="btn btn-primary">+ Dodaj Postać</a>`;
    } else {
        box.innerHTML = `<a href="login.html" class="btn btn-sm btn-outline-light me-1">Login</a><a href="register.html" class="btn btn-sm btn-primary">Register</a>`;
    }
}

function renderGrid(chars) {
    const g = document.getElementById('character-container');
    g.innerHTML = chars.map(c => `
        <div class="col-md-3 mb-4">
            <div class="card h-100 character-card ${getGroupClass(c.klan)}" onclick="location.href='postac.html?id=${c.id_postaci}'">
                <img src="${c.url_awatara}" class="card-img-top" style="height:160px; object-fit:cover;">
                <div class="card-body">
                    <h6 class="mb-1">${c.imie}</h6>
                    <div class="small fw-bold" style="color:var(--em1)">${c.klan}</div>
                    <div class="small text-muted">${c.ranga}</div>
                </div>
            </div>
        </div>
    `).join('');
}

async function logout() { await fetch('api/auth.php?action=logout'); location.reload(); }