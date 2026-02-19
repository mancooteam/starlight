document.addEventListener('DOMContentLoaded', () => {
    loadCharacters();
});

async function loadCharacters() {
    const container = document.getElementById('character-container');
    const authNav = document.getElementById('auth-nav');

    try {
        const response = await fetch('api/get_characters.php');
        const result = await response.json();

        if (result.status === 'success') {
            const {data, user} = result;

            // 1. Obsługa nawigacji w zależności od roli
            renderNav(user, authNav);

            // 2. Renderowanie kart postaci
            container.innerHTML = ''; // Czyścimy loader
            data.forEach(char => {
                container.innerHTML += createCharacterCard(char, user);
            });
        }
    } catch (error) {
        container.innerHTML = `<div class="alert alert-danger">Błąd ładowania danych.</div>`;
    }
}

function renderNav(user, navElement) {
    if (user.logged_in) {
        navElement.innerHTML = `
            <span class="me-3">Rola: <strong>${user.role}</strong></span>
            <a href="add.html" class="btn btn-sm btn-success">Dodaj postać</a>
            <button onclick="logout()" class="btn btn-sm btn-outline-danger ms-2">Wyloguj</button>
        `;
    } else {
        navElement.innerHTML = `<a href="login.html" class="btn btn-sm btn-primary">Zaloguj się</a>`;
    }
}

function createCharacterCard(char, user) {
    // Sprawdzanie uprawnień do edycji
    const canEdit = user.role === 'administrator' || (user.logged_in && user.id == char.id_wlasciciela);

    const adminButtons = canEdit ? `
        <div class="card-footer bg-transparent border-secondary">
            <button class="btn btn-sm btn-warning w-100 mb-1">Edytuj</button>
            ${user.role === 'administrator' ? '<button class="btn btn-sm btn-danger w-100">Usuń</button>' : ''}
        </div>
    ` : '';
    const cardHtml = `
    <div class="col-md-4 col-lg-3 mb-4">
        <a href="character.html?id=${char.id_postaci}" class="text-decoration-none">
            <div class="card bg-secondary text-white h-100 shadow clickable-card">
             <div class="col-md-4 col-lg-3 mb-4">
            <div class="card bg-secondary text-white h-100 shadow">
                <img src="${char.url_awatara || 'https://via.placeholder.com/350x350?text=Brak+Avataru'}" 
                     class="card-img-top" alt="${char.imie}" style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title text-warning">${char.imie}</h5>
                    <p class="card-text mb-1"><small>Klan:</small> <strong>${char.klan}</strong></p>
                    <p class="card-text"><small>Ranga:</small> <span class="badge bg-dark">${char.ranga}</span></p>
                </div>
                ${adminButtons}
            </div>
        </div>
            </div>
        </a>
    </div>
`;

    return cardHtml;
}