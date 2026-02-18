document.addEventListener('DOMContentLoaded', async () => {
    const auth = await getAuth();
    if (!auth.loggedIn) return window.location.href = 'login.html';

    // 1. Wypełnij listy Klanów i Rang
    document.getElementById('klan_select').innerHTML = Groups.map(g => `<option value="${g}">${g}</option>`).join('');
    document.getElementById('ranga_select').innerHTML = Ranks.map(r => `<option value="${r}">${r}</option>`).join('');

    // 2. Generuj pola statystyk (limit 100/300)
    const statsDef = [
        { id: 'sila', l: 'Siła', m: 100 }, { id: 'zrecznosc', l: 'Zręczność', m: 100 },
        { id: 'szybkosc', l: 'Szybkość', m: 100 }, { id: 'odpornosc', l: 'Odporność', m: 100 },
        { id: 'hp', l: 'HP', m: 300 }, { id: 'wytrzymalosc', l: 'Wytrzymałość', m: 300 }
    ];
    document.getElementById('stats-inputs').innerHTML = statsDef.map(s => `
        <div class="col-md-4 col-6">
            <label class="small">${s.l} (max ${s.m})</label>
            <input type="number" name="${s.id}" class="form-control bg-dark text-white border-secondary" value="0" min="0" max="${s.m}">
        </div>
    `).join('');

    // 3. Pobierz WSZYSTKIE dostępne cechy z bazy
    const traitsRes = await fetch('api/characters.php?action=get_all_traits');
    const allTraits = await traitsRes.json();
    document.getElementById('traits-list').innerHTML = allTraits.map(t => `
        <div class="col-md-4 col-6">
            <div class="form-check">
                <input class="form-check-input trait-cb" type="checkbox" name="cechy[]" value="${t.id}" id="tr${t.id}">
                <label class="form-check-label small" for="tr${t.id}">${t.nazwa}</label>
            </div>
        </div>
    `).join('');

    // 4. Jeśli edytujemy, załaduj dane postaci
    const id = new URLSearchParams(window.location.search).get('id');
    if (id) {
        const res = await fetch(`api/characters.php?id=${id}`);
        const char = await res.json();

        if (char.error) return showToast(char.error, 'danger');

        const f = document.getElementById('editor-form');
        document.getElementById('editor-title').innerText = "Edytuj: " + char.imie;
        f.id_postaci.value = char.id_postaci;
        f.id_postaci.readOnly = true;

        f.imie.value = char.imie;
        f.klan.value = char.klan;
        f.ranga.value = char.ranga;
        f.url_awatara.value = char.url_awatara;
        f.plec.value = char.plec;
        f.opis.value = char.opis;

        // Ustaw statystyki
        statsDef.forEach(s => f[s.id].value = char[s.id]);

        // Zaznacz cechy, które postać już ma
        if (char.cechy) {
            char.cechy.forEach(c => {
                const cb = document.getElementById('tr' + c.id);
                if (cb) cb.checked = true;
            });
        }
    }

    // 5. Obsługa zapisu
    document.getElementById('editor-form').addEventListener('submit', async e => {
        e.preventDefault();
        const res = await fetch('api/characters.php', { method: 'POST', body: new FormData(e.target) });
        const result = await res.json();
        if (result.success) {
            showToast(result.success);
            setTimeout(() => location.href = 'postac.html?id=' + e.target.id_postaci.value, 1000);
        } else showToast(result.error, 'danger');
    });
});