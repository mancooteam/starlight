document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const charId = urlParams.get('id');

    // 1. Ładujemy listę cech z bazy danych
    await loadTraits();

    // 2. Jeśli mamy ID, ładujemy dane do edycji
    if (charId) {
        loadCharacterData(charId);
    }

    // Podgląd obrazka
    document.getElementById('url_awatara').addEventListener('input', function() {
        document.getElementById('preview-img').src = this.value || 'https://via.placeholder.com/150';
    });
});

async function loadTraits() {
    // Uwaga: potrzebujemy akcji w PHP która zwróci listę wszystkich cech
    const res = await fetch('api/characters.php?action=get_all_traits');
    const traits = await res.json();
    const container = document.getElementById('traits-list');

    container.innerHTML = traits.map(t => `
        <div class="col-md-3">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" name="cechy[]" value="${t.id}" id="t${t.id}">
                <label class="form-check-label small" for="t${t.id}">${t.nazwa}</label>
            </div>
        </div>
    `).join('');
}

async function loadCharacterData(id) {
    const res = await fetch(`api/characters.php?id=${id}`);
    const char = await res.json();

    document.getElementById('editor-title').innerText = "Edytuj Postać: " + char.imie;
    document.getElementById('id_postaci').value = char.id_postaci;
    document.getElementById('id_postaci').readOnly = true; // Nie pozwalamy zmieniać klucza głównego

    // Wypełnianie pól formularza
    const form = document.getElementById('editor-form');
    form.imie.value = char.imie;
    form.ranga.value = char.ranga;
    form.klan.value = char.klan;
    form.plec.value = char.plec;
    form.url_awatara.value = char.url_awatara;
    form.preview_img.src = char.url_awatara;
    form.opis.value = char.opis;
    form.sila.value = char.sila;
    form.zrecznosc.value = char.zrecznosc;
    form.szybkosc.value = char.szybkosc;
    form.odpornosc.value = char.odpornosc;
    form.hp.value = char.hp;
    form.wytrzymalosc.value = char.wytrzymalosc;

    // Zaznaczanie cech, które postać już posiada
    char.cechy.forEach(c_name => {
        const checkboxes = document.querySelectorAll('input[name="cechy[]"]');
        checkboxes.forEach(cb => {
            if(cb.nextElementSibling.innerText === c_name.nazwa) cb.checked = true;
        });
    });
}

// Obsługa wysyłki
document.getElementById('editor-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const res = await fetch('api/characters.php', {
        method: 'POST',
        body: formData
    });

    const result = await res.json();
    if (result.success) {
        alert(result.success);
        window.location.href = 'postac.html?id=' + formData.get('id_postaci');
    } else {
        alert("Błąd: " + result.error);
    }
});