document.addEventListener('DOMContentLoaded', async () => {
    const auth = await getAuth();
    if (!auth.loggedIn) return window.location.href = 'login.html';

    // Generowanie list
    document.getElementById('klan_select').innerHTML = Groups.map(g => `<option value="${g}">${g}</option>`).join('');
    document.getElementById('ranga_select').innerHTML = Ranks.map(r => `<option value="${r}">${r}</option>`).join('');

    const sDef = [{id:'sila',l:'Siła',m:100},{id:'zrecznosc',l:'Zręczność',m:100},{id:'szybkosc',l:'Szybkość',m:100},{id:'odpornosc',l:'Odporność',m:100},{id:'hp',l:'HP',m:300},{id:'wytrzymalosc',l:'Wytrzymałość',m:300}];
    document.getElementById('stats-inputs').innerHTML = sDef.map(s => `<div class="col-4"><label class="x-small">${s.l}</label><input type="number" name="${s.id}" class="form-control form-control-sm bg-dark text-white" value="0" max="${s.m}"></div>`).join('');

    document.getElementById('skills-inputs').innerHTML = SkillsDef.map(s => `<div class="col-4"><label class="x-small">${s.l}</label><select name="${s.id}" class="form-select form-select-sm bg-dark text-white"><option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option></select></div>`).join('');

    // Wczytywanie cech i danych postaci...
    const id = new URLSearchParams(window.location.search).get('id');
    if (id) {
        const char = await (await fetch(`api/characters.php?id=${id}`)).json();
        const f = document.getElementById('editor-form');
        f.id_postaci.value = char.id_postaci; f.id_postaci.readOnly = true;
        f.imie.value = char.imie; f.klan.value = char.klan; f.ranga.value = char.ranga;
        f.url_awatara.value = char.url_awatara; f.opis.value = char.opis; f.plec.value = char.plec;
        sDef.forEach(s => f[s.id].value = char[s.id]);
        SkillsDef.forEach(s => f[s.id].value = char[s.id]);
    }

    document.getElementById('editor-form').addEventListener('submit', async e => {
        e.preventDefault();
        const res = await fetch('api/characters.php', { method: 'POST', body: new FormData(e.target) });
        const r = await res.json();
        if(r.success) location.href = 'postac.html?id=' + e.target.id_postaci.value;
    });
});