/**
 * ST_HUB - Logika Edytora Postaci
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Sprawdzenie, czy użytkownik jest zalogowany
    const auth = await getAuth();
    if (!auth.loggedIn) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Inicjalizacja list i pól
    populateSelects();
    generateStatInputs();
    await loadTraitsLibrary();

    // 3. Sprawdzenie trybu (Tworzenie vs Edycja)
    const urlParams = new URLSearchParams(window.location.search);
    const charId = urlParams.get('id');

    if (charId) {
        await loadCharacterData(charId, auth);
    }

    // 4. Obsługa wysyłki formularza
    setupFormSubmission();
});

/**
 * Wypełnia listy rozwijane Klanów i Rang danymi z utils.js
 */
function populateSelects() {
    const klanSelect = document.getElementById('klan_select');
    const rangaSelect = document.getElementById('ranga_select');

    if (klanSelect) {
        klanSelect.innerHTML = Groups.map(g => `<option value="${g}">${g}</option>`).join('');
    }

    if (rangaSelect) {
        rangaSelect.innerHTML = Ranks.map(r => `<option value="${r}">${r}</option>`).join('');
    }
}

/**
 * Generuje 6 pól numerycznych dla statystyk
 */
function generateStatInputs() {
    const container = document.getElementById('stats-inputs');
    const stats = [
        { id: 'sila', label: 'Siła', max: 70 },
        { id: 'zrecznosc', label: 'Zręczność', max: 70 },
        { id: 'szybkosc', label: 'Szybkość', max: 70 },
        { id: 'odpornosc', label: 'Odporność', max: 70 },
        { id: 'hp', label: 'Punkty Życia (HP)', max: 300 }, // Odblokowano do 300
        { id: 'wytrzymalosc', label: 'Wytrzymałość', max: 300 } // Odblokowano do 300
    ];

    if (container) {
        container.innerHTML = stats.map(s => `
            <div class="col-md-4 col-6 mb-2">
                <label class="small text-muted">${s.label} (max ${s.max})</label>
                <input type="number" name="${s.id}" class="form-control bg-dark text-white border-secondary" 
                       value="0" min="0" max="${s.max}">
            </div>
        `).join('');
    }
}

/**
 * Pobiera listę wszystkich cech z bazy danych
 */
async function loadTraitsLibrary() {
    try {
        const res = await fetch('api/characters.php?action=get_all_traits');
        const traits = await res.json();
        const container = document.getElementById('traits-list');

        if (container) {
            container.innerHTML = traits.map(t => `
                <div class="col-md-4 col-6">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="cechy[]" value="${t.id}" id="trait-${t.id}">
                        <label class="form-check-label small" for="trait-${t.id}">${t.nazwa}</label>
                    </div>
                </div>
            `).join('');
        }
    } catch (e) {
        showToast("Nie udało się załadować cech", "danger");
    }
}

/**
 * Pobiera dane postaci i wypełnia formularz (Tryb Edycji)
 */
async function loadCharacterData(id, auth) {
    try {
        const res = await fetch(`api/characters.php?id=${id}`);
        const char = await res.json();

        if (char.error) {
            showToast(char.error, "danger");
            return;
        }

        // Blokada edycji cudzych postaci dla zwykłych użytkowników
        if (auth.rola !== 'administrator' && char.id_wlasciciela != auth.id) {
            showToast("Nie masz uprawnień do edycji tej postaci", "danger");
            setTimeout(() => window.location.href = 'index.html', 1500);
            return;
        }

        document.getElementById('editor-title').innerText = "Edytuj Postać: " + char.imie;

        const form = document.getElementById('editor-form');
        form.id_postaci.value = char.id_postaci;
        form.id_postaci.readOnly = true; // Manualne ID jest niezmienne po utworzeniu

        form.imie.value = char.imie;
        form.klan.value = char.klan;
        form.ranga.value = char.ranga;
        form.url_awatara.value = char.url_awatara;
        form.plec.value = char.plec;
        form.opis.value = char.opis;

        // Wypełnianie statystyk
        ['sila', 'zrecznosc', 'szybkosc', 'odpornosc', 'hp', 'wytrzymalosc'].forEach(stat => {
            form[stat].value = char[stat];
        });

        // Zaznaczanie posiadanych cech
        if (char.cechy) {
            char.cechy.forEach(trait => {
                const checkbox = Array.from(document.querySelectorAll('.form-check-label'))
                    .find(el => el.innerText === trait.nazwa);
                if (checkbox) {
                    const inputId = checkbox.getAttribute('for');
                    document.getElementById(inputId).checked = true;
                }
            });
        }
    } catch (e) {
        showToast("Błąd podczas ładowania danych postaci", "danger");
    }
}

/**
 * Obsługuje wysyłanie formularza metodą POST
 */
function setupFormSubmission() {
    const form = document.getElementById('editor-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        try {
            const res = await fetch('api/characters.php', {
                method: 'POST',
                body: formData
            });
            const result = await res.json();

            if (result.success) {
                showToast(result.success, "success");
                setTimeout(() => window.location.href = 'postac.html?id=' + formData.get('id_postaci'), 1500);
            } else {
                showToast(result.error, "danger");
            }
        } catch (error) {
            showToast("Błąd zapisu. Sprawdź połączenie z bazą.", "danger");
        }
    });
}