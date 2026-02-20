document.addEventListener('DOMContentLoaded', async () => {
    // 1. Sprawdź autoryzację
    const auth = await getAuth();

    if (!auth.loggedIn) {
        // Jeśli nie jest zalogowany, wyrzuć do logowania
        window.location.href = 'login.html';
        return;
    }

    const container = document.getElementById('my-characters-container');
    const spinner = document.getElementById('loading-spinner');
    const countLabel = document.getElementById('collection-count');

    try {
        // 2. Pobierz postacie tylko dla zalogowanego ID
        const res = await fetch(`api/characters.php?owner_id=${auth.id}`);
        const myChars = await res.json();

        // Ukryj spinner i pokaż kontener
        spinner.classList.add('d-none');
        container.classList.remove('d-none');

        // 3. Obsługa pustej kolekcji
        if (!myChars || myChars.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5 border border-secondary border-dashed rounded-4" style="border-style: dashed !important;">
                    <i class="bi bi- folder2-open text-muted mb-3" style="font-size: 3rem;"></i>
                    <h5 class="text-white">Twoja jaskinia jest pusta</h5>
                    <p class="text-muted small">Nie stworzyłeś jeszcze żadnego wojownika.</p>
                    <a href="editor.html" class="btn btn-success px-4 mt-2 fw-bold">STWÓRZ PIERWSZĄ POSTAĆ</a>
                </div>`;
            return;
        }

        // 4. Renderowanie kart
        countLabel.innerText = `${myChars.length} postaci`;

        container.innerHTML = myChars.map(c => {
            const color = getGroupColor(c.klan);
            const groupClass = getGroupStyleClass(c.klan);
            const avatar = c.url_awatara || 'https://via.placeholder.com/300x400?text=Brak+Awatara';

            return `
            <div class="col-6 col-md-4 col-lg-3">
                <div class="card h-100 character-card shadow border-0 bg-dark" 
                     style="border-top: 5px solid ${color} !important;">
                    
                    <div class="position-relative overflow-hidden">
                        <img src="${avatar}" class="card-img-top" style="height:180px; object-fit:cover;" alt="${c.imie}">
                        <div class="position-absolute top-0 end-0 p-2">
                            <span class="badge bg-black bg-opacity-75 small">${c.klan}</span>
                        </div>
                    </div>

                    <div class="card-body p-3 text-center">
                        <h6 class="mb-1 ${groupClass}">${c.imie}</h6>
                        <div class="x-small text-muted mb-3" style="font-size: 0.75rem;">${c.ranga}</div>
                        
                        <div class="d-grid gap-2">
                            <a href="postac.html?id=${c.id_postaci}" class="btn btn-sm btn-outline-light py-1">
                                <i class="bi bi-eye"></i> Podgląd
                            </a>
                            <a href="editor.html?id=${c.id_postaci}" class="btn btn-sm btn-warning fw-bold py-1">
                                <i class="bi bi-pencil"></i> EDYTUJ
                            </a>
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');

    } catch (e) {
        console.error("Błąd ładowania kolekcji:", e);
        spinner.innerHTML = `<p class="text-danger small"><i class="bi bi-exclamation-octagon me-2"></i>Błąd podczas pobierania danych.</p>`;
    }
});