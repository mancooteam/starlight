document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('my-characters-container');
    const loadingSpinner = document.getElementById('loading-spinner');

    try {
        // 1. Pobierz status sesji
        const auth = await getAuth();

        // 2. Jeśli nie zalogowany - przekieruj
        if (!auth.loggedIn) {
            window.location.href = 'login.html';
            return;
        }

        // (Opcjonalnie) Odśwież pasek nawigacji danymi użytkownika
        if (typeof renderAuthUI === 'function') {
            renderAuthUI(auth);
        }

        // 3. Pobierz postacie tylko dla zalogowanego ID
        const res = await fetch(`api/characters.php?owner_id=${auth.id}`);

        if (!res.ok) throw new Error("Błąd serwera przy pobieraniu postaci.");

        const myChars = await res.json();

        // 4. Sprawdź czy użytkownik ma jakieś postacie
        if (!myChars || myChars.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center mt-5">
                    <p class='text-muted'>Nie stworzyłeś jeszcze żadnej postaci.</p>
                    <a href="editor.html" class="btn btn-outline-success btn-sm">Stwórz pierwszą postać</a>
                </div>`;
            return;
        }

        // 5. Renderuj kafelki
        container.innerHTML = myChars.map(c => {
            const accentColor = getGroupColor(c.klan);
            const groupClass = getGroupStyleClass(c.klan);
            const avatar = c.url_awatara || 'https://via.placeholder.com/150';

            return `
                <div class="col-md-3 mb-4">
                    <div class="card h-100 character-card shadow-sm" style="border-top: 6px solid ${accentColor} !important;">
                        <img src="${avatar}" class="card-img-top" style="height:160px; object-fit:cover;" alt="${c.imie}">
                        <div class="card-body text-center p-2">
                            <h6 class="mb-1 ${groupClass}">${c.imie}</h6>
                            <div class="x-small text-muted mb-2" style="font-size: 0.75rem;">${c.ranga}</div>
                            
                            <div class="d-grid gap-2">
                                <a href="postac.html?id=${c.id_postaci}" class="btn btn-sm btn-outline-light">Profil</a>
                                <a href="editor.html?id=${c.id_postaci}" class="btn btn-sm btn-warning fw-bold">EDYTUJ</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error("Błąd ładowania moje_postacie.js:", error);
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center mt-5 text-danger">
                    <p>Wystąpił błąd podczas łączenia z bazą danych Aiven. Spróbuj odświeżyć stronę.</p>
                </div>`;
        }
    } finally {
        // ZAWSZE ukryj spinner po zakończeniu (sukces lub błąd)
        if (loadingSpinner) {
            loadingSpinner.classList.add('d-none');
        }
    }
});