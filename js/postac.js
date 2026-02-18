document.addEventListener('DOMContentLoaded', async () => {
    const id = new URLSearchParams(window.location.search).get('id');
    const auth = await getAuth();
    const char = await (await fetch(`api/characters.php?id=${id}`)).json();

    document.getElementById('loading-spinner').classList.add('d-none');
    document.getElementById('character-content').classList.remove('d-none');

    document.getElementById('char-name').innerText = char.imie;
    document.getElementById('char-name').className = 'group-name ' + getGroupStyleClass(char.klan);
    document.getElementById('profile-accent-card').style.borderTopColor = getGroupColor(char.klan);
    document.getElementById('char-avatar').src = char.url_awatara || 'https://via.placeholder.com/400';
    document.getElementById('char-basic').innerText = `${char.ranga} • ${char.klan}`;
    document.getElementById('char-description').innerText = char.opis;

    if (auth.loggedIn && (auth.id == char.id_wlasciciela || auth.rola === 'administrator')) {
        document.getElementById('edit-button-container').innerHTML = `<a href="editor.html?id=${char.id_postaci}" class="btn btn-warning btn-sm">EDYTUJ</a>`;
    }

    // Statystyki
    const sDef = [{n:'Siła',v:char.sila,m:100},{n:'HP',v:char.hp,m:300},{n:'Wytrzymałość',v:char.wytrzymalosc,m:300}];
    document.getElementById('stats-container').innerHTML = sDef.map(s => `
        <div class="mb-2">
            <div class="d-flex justify-content-between small"><span>${s.n}</span><span>${s.v}/${s.m}</span></div>
            <div class="stats-bar"><div class="stats-fill" style="width:${(s.v/s.m)*100}%"></div></div>
        </div>
    `).join('');

    // Umiejętności
    const bMap = { 0:0, 1:1, 2:3, 3:5 };
    document.getElementById('skills-container').innerHTML = SkillsDef.map(s => {
        const val = char[s.id] || 0;
        return `<div class="d-flex justify-content-between x-small mb-1">
            <span>${s.l}</span>
            <span class="text-success fw-bold">${'●'.repeat(val)}${'○'.repeat(3-val)} (+${bMap[val]})</span>
        </div>`;
    }).join('');
});