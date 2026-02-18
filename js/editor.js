document.addEventListener('DOMContentLoaded', async () => {
    const auth = await getAuth();
    if (!auth.loggedIn) return window.location.href = 'login.html';

    // 1. Inicjalizacja stałych
    document.getElementById('klan_select').innerHTML = Groups.map(g => `<option value="${g}">${g}</option>`).join('');
    document.getElementById('ranga_select').innerHTML = Ranks.map(r => `<option value="${r}">${r}</option>`).join('');

    // 2. Statystyki
    const sDef = [{id:'sila',l:'Siła',m:100},{id:'zrecznosc',l:'Zręczność',m:100},{id:'szybkosc',l:'Szybkość',m:100},{id:'odpornosc',l:'Odporność',m:100},{id:'hp',l:'HP',m:300},{id:'wytrzymalosc',l:'W',m:300}];
    document.getElementById('stats-inputs').innerHTML = sDef.map(s => `
        <div class="col-md-4 col-6"><label class="small text-muted">${s.l}</label>
        <input type="number" name="${s.id}" class="form-control bg-dark text-white border-secondary" value="0" min="0" max="${s.m}"></div>
    `).join('');

    // 3. Umiejętności (NOWE)
    document.getElementById('skills-inputs').innerHTML = SkillsConfig.map(s => `
        <div class="col-md-4 col-6">
            <label class="small text-muted">${s.label}</label>
            <select name="${s.id}" class="form-select bg-dark text-white border-secondary">
                <option value="0">Poziom 0 (+0)</option>
                <option value="1">Poziom 1 (+1)</option>
                <option value="2">Poziom 2 (+3)</option>
                <option value="3">Poziom 3 (+5)</option>
            </select>
        </div>
    `).join('');

    // 4. Cechy i ładowanie danych
    const traitsRes = await fetch('api/characters.php?action=get_all_traits');
    const allTraits = await traitsRes.json();
    document.getElementById('traits-list').innerHTML = allTraits.map(t => `<div class="col-md-4 col-6"><div class="form-check"><input class="form-check-input" type="checkbox" name="cechy[]" value="${t.id}" id="tr${t.id}"><label class="form-check-label small" for="tr${t.id}">${t.nazwa}</label></div></div>`).join('');

    const id = new URLSearchParams(window.location.search).get('id');
    if (id) {
        const char = await (await fetch(`api/characters.php?id=${id}`)).json();
        const f = document.getElementById('editor-form');
        f.id_postaci.value = char.id_postaci; f.id_postaci.readOnly = true;
        f.imie.value = char.imie; f.klan.value = char.klan; f.ranga.value = char.ranga;
        f.url_awatara.value = char.url_awatara; f.opis.value = char.opis; f.plec.value = char.plec;
        sDef.forEach(s => f[s.id].value = char[s.id]);
        SkillsConfig.forEach(s => f[s.id].value = char[s.id]); // Wczytywanie umiejętności
        if (char.cechy) char.cechy.forEach(c => { const cb = document.getElementById('tr'+c.id); if(cb) cb.checked = true; });
    }

    document.getElementById('editor-form').addEventListener('submit', async e => {
        e.preventDefault();
        const res = await fetch('api/characters.php', { method: 'POST', body: new FormData(e.target) });
        const data = await res.json();
        if (data.success) { showToast(data.success); setTimeout(() => location.href = 'postac.html?id=' + e.target.id_postaci.value, 1000); } else showToast(data.error, 'danger');
    });
});