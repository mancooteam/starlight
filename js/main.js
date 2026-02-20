// 1. Konfiguracja kolorów i danych stałych
const klanKolory = {
    "Gwiezdny Klan": "#5C5AA6",
    "Pustka": "#6C8570",
    "Plemię Wiecznych Łowów": "#886CAB",
    "Ciemny Las": "#8F534B",
    "Klan Cienia": "#E38F9C",
    "Klan Gromu": "#FFCE7A",
    "Klan Rzeki": "#7898FF",
    "Klan Wichru": "#A3E0D5",
    "Plemię Niedźwiedzich Kłów": "#ffffff",
    "Bractwo Krwi": "#CA4250",
    "Samotnik": "#7DBF65",
    "Nieaktywny": "#828282",
    "NPC": "#aaaaaa"
};

// Globalna zmienna przechowująca dane o zalogowanym użytkowniku
let currentUser = {
    loggedIn: false,
    id: null,
    username: '',
    role: 'gosc'
};

// 2. Inicjalizacja przy ładowaniu strony
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();      // Najpierw sprawdź kim jesteśmy
    await fetchCharacters(); // Potem pobierz postacie
});

// 3. Zarządzanie autoryzacją
async function checkAuth() {
    try {
        const response = await fetch('api/check_auth.php');
        const data = await response.json();

        if (data.user_id) {
            currentUser = {
                loggedIn: true,
                id: data.user_id,
                username: data.username,
                role: data.role
            };
        }
        renderNavbar();
    } catch (error) {
        console.error("Błąd autoryzacji:", error);
    }
}

function renderNavbar() {
    const authDiv = document.getElementById('auth-buttons');
    if (currentUser.loggedIn) {
        authDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="me-3 text-light small">Zalogowany jako: <strong class="text-info">${currentUser.username}</strong></span>
                ${currentUser.role === 'admin' || currentUser.role === 'uzytkownik' ?
            '<button class="btn btn-success btn-sm me-2" onclick="showAddModal()">+ Dodaj Postać</button>' : ''}
                <button class="btn btn-outline-danger btn-sm" onclick="logout()">Wyloguj</button>
            </div>
        `;
    } else {
        authDiv.innerHTML = `
            <button class="btn btn-primary btn-sm me-2" data-bs-toggle="modal" data-bs-target="#loginModal">Zaloguj</button>
            <button class="btn btn-outline-light btn-sm" data-bs-toggle="modal" data-bs-target="#registerModal">Zarejestruj</button>
        `;
    }
}

// 4. Pobieranie i wyświetlanie postaci
async function fetchCharacters() {
    const container = document.getElementById('characters-container');
    container.innerHTML = '<div class="text-center w-100"><div class="spinner-border" role="status"></div></div>';

    try {
        const response = await fetch('api/get_characters.php');
        const characters = await response.json();

        container.innerHTML = '';

        if (characters.length === 0) {
            container.innerHTML = '<p class="text-center">Brak zapisanych postaci.</p>';
            return;
        }

        characters.forEach(char => {
            const color = klanKolory[char.klan] || '#444';

            // Logika uprawnień: Admin może wszystko, Użytkownik tylko swoje (id_wlasciciela)
            const isOwner = currentUser.loggedIn && (parseInt(currentUser.id) === parseInt(char.id_wlasciciela));
            const isAdmin = currentUser.role === 'admin';
            const canManage = isAdmin || isOwner;

            const actionButtons = canManage ? `
                <div class="card-footer bg-transparent border-top-0 d-flex justify-content-center gap-2 pb-3">
                    <button class="btn btn-sm btn-warning" onclick="editCharacter('${char.id_postaci}')">Edytuj</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCharacter('${char.id_postaci}')">Usuń</button>
                </div>
            ` : '';

            const cardHtml = `
                <div class="col-md-6 col-lg-4 col-xl-3">
                    <div class="card bg-dark text-light border-0 h-100 shadow-lg character-card" style="border-top: 4px solid ${color} !important;">
                        <div class="position-relative">
                            <img src="${char.url_awatara || 'https://via.placeholder.com/300x300?text=Brak+Avataru'}" 
                                 class="card-img-top" alt="${char.imie}" 
                                 style="height: 250px; object-fit: cover; filter: brightness(0.9);">
                            <span class="badge position-absolute top-0 end-0 m-2" style="background-color: ${color}">${char.klan}</span>
                        </div>
                        <div class="card-body text-center">
                            <h5 class="card-title mb-1 fw-bold">${char.imie}</h5>
                            <p class="text-muted small mb-2">${char.ranga}</p>
                            <p class="card-text small text-secondary" style="font-style: italic;">
                                ${char.cechy ? char.cechy : 'Brak przypisanych cech'}
                            </p>
                        </div>
                        ${actionButtons}
                    </div>
                </div>
            `;
            container.innerHTML += cardHtml;
        });
    } catch (error) {
        container.innerHTML = `<p class="text-danger text-center">Błąd ładowania: ${error.message}</p>`;
    }
}

// 5. Funkcje pomocnicze (do zaimplementowania w kolejnym kroku)
function logout() {
    fetch('api/logout.php').then(() => window.location.reload());
}

function editCharacter(id) {
    console.log("Edycja postaci:", id);
    // Tutaj otworzymy modal z formularzem wypełnionym danymi
}

function deleteCharacter(id) {
    if(confirm("Czy na pewno chcesz usunąć tę postać?")) {
        console.log("Usuwanie postaci:", id);
        // Tutaj wyślemy request DELETE do API
    }
}