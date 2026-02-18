document.addEventListener('DOMContentLoaded', async () => {
    // 1. Sprawdź czy użytkownik jest zalogowany
    const auth = await getAuth();
    if (!auth.loggedIn) {
        window.location.href = 'login.html';
        return;
    }

    // Wyświetl nawigację
    renderAuthUI(auth);

    // 2. Pobierz tylko postacie zalogowanego użytkownika
    try {
        const res = await fetch(`api/characters.php?owner_id=${auth.id}`);
        const myChars = await res.json();

        document.getElementById('loading-spinner').classList.add('d-none');
        renderMyGrid(myChars);
    } catch (e) {
        showToast("Błąd podczas pobierania Twoich postaci", "danger");
    }
});

/**
 * Renderuje nawigację (możesz skopiować to z main.js lub przenieść do utils)
 */
function renderAuthUI(auth) {
    const box = document.getElementById('auth-buttons');
    if (box) {
        box.innerHTML = `
            <span class="text-white me-2 small">${auth.nazwa}</span>
            <a href="index.html" class="btn btn-sm btn-outline-light me-1">Wszystkie</a>
            <button onclick="logout()" class="btn btn-sm btn-outline-danger">Wyloguj</button>
        `;
    }
}

/**
 * Renderuje siatkę postaci z bezpośrednim przyciskiem EDYTUJ
 */
function renderMyGrid(chars) {
    const container = document.getElementById('my-characters-container');

    if (!chars || chars.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted">Nie masz jeszcze żadnych postaci.</p>
                <a href="editor.html" class="btn btn-outline-success">Stwórz swoją pierwszą postać</a>
            </div>
        `;
        return;
    }

    container.innerHTML = chars.map(c => {
        const accentColor = getGroupColor(c.klan);
        const groupClass = getGroupStyleClass(c.klan);

        return `
        <div class="col-md-4 col-lg-3 mb-4">
            <div class="card h-100 character-card" style="border-top: 6px solid ${accentColor} !important;">
                <img src="${c.url_awatara || 'https://via.placeholder.com/150'}" class="card-img-top" style="height:180px; object-fit:cover;">
                <div class="card-body text-center p-3">
                    <h6 class="mb-1 ${groupClass}">${c.imie}</h6>
                    <div class="small text-muted mb-3">${c.ranga}</div>
                    
                    <div class="d-grid gap-2">
                        <a href="postac.html?id=${c.id_postaci}" class="btn btn-sm btn-outline-light">Zobacz Profil</a>
                        <a href="editor.html?id=${c.id_postaci}" class="btn btn-sm btn-warning fw-bold">EDYTUJ</a>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

async function logout() {
    await fetch('api/auth.php?action=logout');
    location.reload();
}