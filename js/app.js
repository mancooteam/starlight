/**
 * Konfiguracja kolorów dla klanów Starlight RP
 */
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
    "Nieaktywny": "#828282"
};

/**
 * Funkcja pomocnicza: Oblicza czy tekst na danym kolorze tła
 * powinien być czarny czy biały dla zachowania kontrastu.
 */
function getContrastYIQ(hexcolor) {
    if (!hexcolor) return 'white';
    hexcolor = hexcolor.replace("#", "");
    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'black' : 'white';
}

/**
 * Pobieranie danych z backendu PHP
 */
async function fetchCharacters() {
    const container = document.getElementById('character-list');

    try {
        const response = await fetch('get_characters.php');
        if (!response.ok) throw new Error('Błąd sieci');

        const result = await response.json();

        if (result.status === 'success') {
            displayCharacters(result.data, result.current_user, result.role);
            updateAuthUI(result.role);
        } else {
            container.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
        }
    } catch (error) {
        console.error('Błąd:', error);
        container.innerHTML = `<div class="alert alert-danger">Nie udało się załadować postaci. Upewnij się, że get_characters.php działa.</div>`;
    }
}

/**
 * Renderowanie kart postaci w HTML
 */
function displayCharacters(chars, currentUserId, role) {
    const container = document.getElementById('character-list');
    container.innerHTML = '';

    if (chars.length === 0) {
        container.innerHTML = '<div class="text-center">Brak postaci w bazie danych.</div>';
        return;
    }

    chars.forEach(char => {
        // Dopasowanie koloru akcentu
        const kolorAkcentu = klanKolory[char.klan] || "#828282";
        const tekstKontrastowy = getContrastYIQ(kolorAkcentu);

        // Logika uprawnień: Admin może wszystko, użytkownik tylko swoje
        const canEdit = (role === 'admin' || (currentUserId && char.id_wlasciciela == currentUserId));
        const canDelete = (role === 'admin');

        const cardHtml = `
            <div class="col-md-4 col-lg-3">
                <div class="card h-100 shadow-sm" style="border-top: 5px solid ${kolorAkcentu};">
                    <div class="position-relative">
                        <img src="${char.url_awatara || 'https://via.placeholder.com/300x400?text=Brak+Avataru'}" 
                             class="card-img-top avatar-img" 
                             alt="${char.imie}"
                             style="height: 250px; object-fit: cover;">
                        <span class="position-absolute top-0 end-0 m-2 badge rounded-pill" 
                              style="background-color: ${kolorAkcentu}; border: 1px solid rgba(0,0,0,0.2); width: 15px; height: 15px; padding: 0;">
                            &nbsp;
                        </span>
                    </div>
                    <div class="card-body text-center d-flex flex-column">
                        <h5 class="card-title mb-1" style="color: ${kolorAkcentu === '#ffffff' ? '#ddd' : kolorAkcentu}; font-weight: bold;">
                            ${char.imie}
                        </h5>
                        <div class="mb-2">
                            <span class="badge" style="background-color: ${kolorAkcentu}; color: ${tekstKontrastowy}; font-size: 0.7rem;">
                                ${char.ranga}
                            </span>
                        </div>
                        <p class="card-text small text-muted mb-3">
                            Frakcja: <strong>${char.klan || 'Brak'}</strong>
                        </p>
                        
                        <div class="mt-auto pt-2 border-top">
                            ${canEdit ? `<button class="btn btn-sm btn-outline-warning me-1">Edytuj</button>` : ''}
                            ${canDelete ? `<button class="btn btn-sm btn-outline-danger">Usuń</button>` : ''}
                            ${!canEdit && !canDelete ? `<button class="btn btn-sm btn-outline-light disabled">Tylko podgląd</button>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cardHtml;
    });
}

/**
 * Aktualizacja widoczności przycisków w zależności od roli
 */
function updateAuthUI(role) {
    const addBtn = document.getElementById('add-char-btn');
    if (addBtn) {
        if (role === 'admin' || role === 'user') {
            addBtn.classList.remove('d-none');
        } else {
            addBtn.classList.add('d-none');
        }
    }
}

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', fetchCharacters);