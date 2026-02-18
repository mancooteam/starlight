document.addEventListener('DOMContentLoaded', async () => {
    const id = new URLSearchParams(window.location.search).get('id');
    const auth = await getAuth();
    const res = await fetch(`api/characters.php?id=${id}`);
    const char = await res.json();

    if(char.error) return window.location.href = 'index.html';

    // UI State
    document.getElementById('loading-spinner').classList.add('d-none');
    document.getElementById('character-content').classList.remove('d-none');

    // Basic Data
    document.getElementById('char-name').innerText = char.imie;
    document.getElementById('char-name').className = 'group-name ' + getGroupStyleClass(char.klan);
    document.getElementById('profile-accent-card').style.borderTop = `8px solid ${getGroupColor(char.klan)}`;
    document.getElementById('char-avatar').src = char.url_awatara || 'https://via.placeholder.com/400';
    document.getElementById('char-basic').innerText = `${char.ranga} • ${char.klan}`;
    document.getElementById('char-description').innerText = char.opis;

    // Stats (0-300)
    const stats = [
        {label: 'Siła', v: char.sila, m: 100},
        {label: 'HP', v: char.hp, m: 300},
        {label: 'Wytrzymałość', v: char.wytrzymalosc, m: 300}
    ];
    document.getElementById('stats-container').innerHTML = stats.map(s => `
        <div class="mb-3">
            <div class="d-flex justify-content-between x-small"><span>${s.label}</span><span>${s.v}/${s.m}</span></div>
            <div class="stats-bar"><div class="stats-fill" style="width: ${(s.v/s.m)*100}%"></div></div>
        </div>
    `).join('');

    // Skills (0-3 dots)
    const skills = [
        {l: 'Tropienie', v: char.u_tropienie},
        {l: 'Skradanie', v: char.u_skradanie},
        {l: 'Łowienie', v: char.u_lowienie}
    ];
    document.getElementById('skills-container').innerHTML = skills.map(s => `
        <div class="d-flex justify-content-between mb-1">
            <span class="small">${s.l}</span>
            <span>${'<i class="bi bi-circle-fill skill-dot-active mx-1"></i>'.repeat(s.v)}${'<i class="bi bi-circle skill-dot-empty mx-1"></i>'.repeat(3-s.v)}</span>
        </div>
    `).join('');

    // Load Author's other characters
    loadAuthorOthers(char.id_wlasciciela, char.id_postaci);
});

async function loadAuthorOthers(ownerId, currentId) {
    const r = await fetch(`api/characters.php?owner_id=${ownerId}`);
    const list = await r.json();
    document.getElementById('other-chars-list').innerHTML = list
        .filter(c => c.id_postaci !== currentId)
        .map(c => `
            <a href="postac.html?id=${c.id_postaci}" class="d-flex align-items-center p-2 text-decoration-none rounded bg-dark border border-secondary border-opacity-10">
                <img src="${c.url_awatara}" class="rounded-circle me-3" style="width: 30px; height: 30px; object-fit: cover;">
                <div class="small text-white">${c.imie}</div>
            </a>
        `).join('');
}