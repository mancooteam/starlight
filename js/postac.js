document.addEventListener('DOMContentLoaded', async () => {
    const id = new URLSearchParams(window.location.search).get('id');
    const auth = await getAuth();
    const res = await fetch(`api/characters.php?id=${id}`);
    const char = await res.json();

    if(char.error) return location.href = 'index.html';

    document.getElementById('character-content').classList.remove('d-none');

    // Dane podstawowe
    document.getElementById('char-img').src = char.url_awatara || 'https://via.placeholder.com/400';
    const nameEl = document.getElementById('char-name');
    nameEl.innerText = char.imie;
    nameEl.className = 'group-name ' + getGroupStyle(char.klan).class;
    document.getElementById('main-card').style.borderTop = `8px solid ${getGroupStyle(char.klan).color}`;
    document.getElementById('char-meta').innerText = `${char.ranga} • ${char.klan}`;
    document.getElementById('char-desc').innerText = char.opis || "Brak opisu postaci.";

    // Atrybuty (0-100/300)
    const stats = [
        {n: 'Siła', v: char.sila, m: 100},
        {n: 'Zręczność', v: char.zrecznosc, m: 100},
        {n: 'HP', v: char.hp, m: 300},
        {n: 'Wytrzymałość', v: char.wytrzymalosc, m: 300}
    ];
    document.getElementById('stats-box').innerHTML = stats.map(s => `
        <div class="mb-3">
            <div class="d-flex justify-content-between small mb-1"><span>${s.n}</span><span class="text-accent">${s.v}/${s.m}</span></div>
            <div class="progress"><div class="progress-bar" style="width:${(s.v/s.m)*100}%"></div></div>
        </div>
    `).join('');

    // Cechy
    if(char.cechy) {
        document.getElementById('traits-box').innerHTML = char.cechy.map(t => {
            const color = t.typ === 'negatywna' ? '#dc3545' : (t.typ === 'mieszana' ? '#ffc107' : '#96C433');
            return `<span class="badge-trait" style="border-color:${color}; color:${color}">${t.nazwa}</span>`;
        }).join('');
    }

    // Inne postacie autora
    const otherRes = await fetch(`api/characters.php?owner_id=${char.id_wlasciciela}`);
    const others = await otherRes.json();
    document.getElementById('author-chars').innerHTML = others
        .filter(c => c.id_postaci !== char.id_postaci)
        .map(c => `
            <a href="postac.html?id=${c.id_postaci}" class="mini-char-link">
                <img src="${c.url_awatara}" class="rounded-circle me-3" style="width:32px; height:32px; object-fit:cover;">
                <div class="small fw-bold">${c.imie}</div>
            </a>
        `).join('');
});