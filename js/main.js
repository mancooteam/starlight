document.addEventListener('DOMContentLoaded', async () => {
    const auth = await getAuth();
    renderAuthUI(auth);

    const container = document.getElementById('character-container');
    const res = await fetch('api/characters.php');
    const chars = await res.json();
    window.allChars = chars;
    renderGrid(chars);

    document.getElementById('main-search').addEventListener('input', e => {
        const term = e.target.value.toLowerCase();
        renderGrid(window.allChars.filter(c => c.imie.toLowerCase().includes(term) || c.klan.toLowerCase().includes(term)));
    });
});

function renderAuthUI(auth) {
    const box = document.getElementById('auth-buttons');
    if (auth.loggedIn) {
        box.innerHTML = `<a href="moje_postacie.html" class="btn btn-sm btn-outline-success me-2">Moje</a><button onclick="logout()" class="btn btn-sm btn-outline-danger">Wyloguj</button>`;
        document.getElementById('admin-actions').innerHTML = `<a href="editor.html" class="btn btn-primary">+ Dodaj Postać</a>`;
    } else {
        box.innerHTML = `<a href="login.html" class="btn btn-sm btn-outline-light me-1">Login</a><a href="register.html" class="btn btn-sm btn-primary">Join</a>`;
    }
}

function renderGrid(chars) {
    const container = document.getElementById('character-container');
    container.innerHTML = chars.map(c => `
        <div class="col-6 col-md-3 mb-3">
            <div class="card h-100 character-card shadow-sm" style="border-top: 5px solid ${getGroupColor(c.klan)}" onclick="location.href='postac.html?id=${c.id_postaci}'">
                <img src="${c.url_awatara || 'https://via.placeholder.com/150'}" class="card-img-top" style="height:150px; object-fit:cover;">
                <div class="card-body p-2 text-center">
                    <h6 class="mb-0 ${getGroupStyleClass(c.klan)}">${c.imie}</h6>
                    <div class="small text-muted" style="font-size:0.7rem">${c.ranga}</div>
                </div>
            </div>
        </div>
    `).join('');
}
async function logout() { await fetch('api/auth.php?action=logout'); location.reload(); }