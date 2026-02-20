document.addEventListener('DOMContentLoaded', async () => {
    const auth = await getAuth();
    if(!auth.loggedIn) return window.location.href = 'login.html';

    // Wypełnij listy klanów i rang z utils.js
    document.getElementById('klan-select').innerHTML = Groups.map(g => `<option value="${g}">${g}</option>`).join('');
    document.getElementById('ranga-select').innerHTML = Ranks.map(r => `<option value="${r}">${r}</option>`).join('');

    // Generuj pola statystyk (sila, hp, wyt.)
    const sDef = [{id:'sila',l:'Siła',m:100},{id:'hp',l:'Punkty Życia',m:300},{id:'wytrzymalosc',l:'Wytrzymałość',m:300}];
    document.getElementById('stats-inputs').innerHTML = sDef.map(s => `
        <div class="col-md-4"><label class="x-small text-muted">${s.l}</label>
        <input type="number" name="${s.id}" class="form-control bg-dark text-white border-secondary" value="0" max="${s.m}"></div>
    `).join('');

    // Generuj pola umiejętności (0-3)
    const skills = ['u_tropienie', 'u_skradanie', 'u_lowienie'];
    document.getElementById('skills-inputs').innerHTML = skills.map(s => `
        <div class="col-md-4"><label class="x-small text-muted">${s.replace('u_', '').toUpperCase()}</label>
        <select name="${s}" class="form-select bg-dark text-white border-secondary">
            <option value="0">Poziom 0</option><option value="1">Poziom 1</option>
            <option value="2">Poziom 2</option><option value="3">Poziom 3</option>
        </select></div>
    `).join('');

    // Jeśli edytujemy - wczytaj dane
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
        const res = await fetch(`api/characters.php?id=${id}`);
        const char = await res.json();
        const f = document.getElementById('editor-form');
        f.id_postaci.value = char.id_postaci;
        f.imie.value = char.imie;
        f.klan.value = char.klan;
        f.ranga.value = char.ranga;
        f.url_awatara.value = char.url_awatara;
        f.opis.value = char.opis;
        sDef.forEach(s => f[s.id].value = char[s.id]);
        skills.forEach(s => f[s].value = char[s]);
    }

    document.getElementById('editor-form').onsubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('api/characters.php', { method: 'POST', body: new FormData(e.target) });
        const data = await res.json();
        if(data.success) location.href = 'moje_postacie.html';
        else alert(data.error);
    };
});