let currentChar = null;

document.addEventListener('DOMContentLoaded', async () => {
    const id = new URLSearchParams(window.location.search).get('id');
    if(!id) return location.href = 'index.html';

    const auth = await getAuth();
    const res = await fetch(`api/characters.php?id=${id}`);
    currentChar = await res.json();

    document.getElementById('loading-spinner').classList.add('d-none');
    document.getElementById('character-content').classList.remove('d-none');

    // Render danych podstawowych
    const nameEl = document.getElementById('char-name');
    nameEl.innerText = currentChar.imie;
    nameEl.className = 'group-name ' + getGroupStyleClass(currentChar.klan);
    document.getElementById('profile-accent-card').style.borderTop = `6px solid ${getGroupColor(currentChar.klan)}`;
    document.getElementById('char-avatar').src = currentChar.url_awatara || 'https://via.placeholder.com/400';
    document.getElementById('char-basic').innerText = `${currentChar.ranga} • ${currentChar.klan}`;
    document.getElementById('char-description').innerText = currentChar.opis;

    // Statystyki (Skalowanie 100/300)
    const stats = [
        {n: 'Siła', v: currentChar.sila, m: 100},
        {n: 'Zręczność', v: currentChar.zrecznosc, m: 100},
        {n: 'HP', v: currentChar.hp, m: 300},
        {n: 'Wytrzymałość', v: currentChar.wytrzymalosc, m: 300}
    ];
    document.getElementById('stats-container').innerHTML = stats.map(s => `
        <div class="mb-3">
            <div class="d-flex justify-content-between x-small"><span>${s.n}</span><span>${s.v}/${s.m}</span></div>
            <div class="stats-bar"><div class="stats-fill" style="width: ${(s.v/s.m)*100}%"></div></div>
        </div>
    `).join('');

    // Umiejętności (Kropki)
    const skills = [
        {l: 'Tropienie', v: currentChar.u_tropienie},
        {l: 'Skradanie', v: currentChar.u_skradanie},
        {l: 'Łowienie', v: currentChar.u_lowienie}
    ];
    document.getElementById('skills-container').innerHTML = skills.map(s => `
        <div class="d-flex justify-content-between mb-1">
            <span class="small">${s.l}</span>
            <span class="text-success">${'●'.repeat(s.v)}${'○'.repeat(3-s.v)}</span>
        </div>
    `).join('');

    // Cechy
    if(currentChar.cechy) {
        document.getElementById('traits-container').innerHTML = currentChar.cechy.map(t => {
            let color = t.typ === 'negatywna' ? '#dc3545' : '#96C433';
            return `<span class="trait-badge" style="border-color:${color}; color:${color}">${t.nazwa}</span>`;
        }).join('');
    }
});

// SILNIK MISTRZA GRY
function processGMAction() {
    const dice = parseInt(document.getElementById('mg-dice-input').value);
    const mode = document.getElementById('mg-action-type').value;
    const resultBox = document.getElementById('mg-interpretation');

    if(isNaN(dice)) return alert("Wpisz wynik rzutu!");

    const level = currentChar.poziom || 1;
    const skillVal = mode === 'lowienie' ? currentChar.u_lowienie : currentChar.u_tropienie;
    const skillBonus = [0, 1, 3, 5][skillVal] || 0;

    const total = dice + skillBonus + level;

    const table = {
        1: "Niespodzianka", 2: "Przeciwnik", 3: "Przeciwnik", 5: "Zwierzyna", 9: "Zwierzyna", 16: "Zwierzyna"
    };

    let outcome = total >= 30 ? "Zwierzyna" : (table[total] || "Nic");

    resultBox.innerHTML = `
        <div class="p-3 border border-secondary rounded">
            <div class="small text-muted">Suma: ${dice} + Bonus(${skillBonus}) + Level(${level}) = <strong>${total}</strong></div>
            <h3 class="text-white mt-2">${outcome.toUpperCase()}</h3>
        </div>
    `;
}