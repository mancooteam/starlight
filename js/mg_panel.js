let selectedPostac = null;
const ATTR_MODS = [0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 11, 11];

document.addEventListener('DOMContentLoaded', async () => {
    const res = await fetch('api/characters.php');
    const chars = await res.json();
    const sel = document.getElementById('char-selector');
    sel.innerHTML = '<option value="">--- Wybierz postać ---</option>' +
        chars.map(c => `<option value="${c.id_postaci}">${c.imie}</option>`).join('');

    sel.addEventListener('change', async (e) => {
        if(!e.target.value) return;
        const r = await fetch(`api/characters.php?id=${e.target.value}`);
        selectedPostac = await r.json();
        calculateBonuses();
    });
});

function updateUI() {
    const mode = document.getElementById('action-mode').value;
    const combatBox = document.getElementById('combat-inputs');
    // Pokaż pola przeciwnika tylko przy ataku/obrażeniach
    combatBox.className = (['atak', 'blok', 'unik'].includes(mode)) ? 'd-block' : 'd-none';
    calculateBonuses();
}

function getStatMod(val) {
    return ATTR_MODS[Math.min(val, 70)] || 0;
}

function calculateBonuses() {
    if(!selectedPostac) return;
    const mode = document.getElementById('action-mode').value;
    const traits = selectedPostac.cechy ? selectedPostac.cechy.map(t => t.nazwa) : [];

    let mods = [];
    let total = 0;

    // Podstawowe statystyki
    if (mode === 'atak') total += getStatMod(selectedPostac.zrecznosc);
    if (mode === 'blok') total += getStatMod(selectedPostac.odpornosc);
    if (mode === 'unik') total += getStatMod(selectedPostac.szybkosc);
    if (mode === 'zaskoczenie') total += (parseInt(selectedPostac.u_skradanie) === 1 ? 1 : (parseInt(selectedPostac.u_skradanie) === 2 ? 3 : (parseInt(selectedPostac.u_skradanie) === 3 ? 5 : 0)));

    // Modyfikatory Cech
    if (traits.includes('Cichy krok') && ['schwytanie', 'zaskoczenie'].includes(mode)) { mods.push("Cichy krok (+3)"); total += 3; }
    if (traits.includes('Ciężki krok') && ['schwytanie', 'zaskoczenie'].includes(mode)) { mods.push("Ciężki krok (-3)"); total -= 3; }
    if (traits.includes('Sokoli wzrok') && ['atak', 'unik'].includes(mode)) { mods.push("Sokoli wzrok (+2)"); total += 2; }
    if (traits.includes('Kulawa noga') && ['atak', 'unik', 'ucieczka'].includes(mode)) { mods.push("Kulawa noga (-3)"); total -= 3; }
    if (traits.includes('Zapaśnik') && mode === 'blok') { mods.push("Zapaśnik (+2)"); total += 2; }

    document.getElementById('bonus-tags').innerHTML = mods.map(m => `<span class="badge bg-secondary">${m}</span>`).join('');
    document.getElementById('total-modifier').innerText = (total >= 0 ? '+' : '') + total;
    return total;
}

function rollD6(num) {
    let sum = 0;
    for(let i=0; i<num; i++) sum += Math.floor(Math.random()*6)+1;
    return sum;
}

function processGMAction() {
    const roll = parseInt(document.getElementById('mg-roll').value);
    if(isNaN(roll)) return alert("Wpisz wynik rzutu!");

    const mode = document.getElementById('action-mode').value;
    const bonus = calculateBonuses();
    const final = roll + bonus;
    const display = document.getElementById('result-display');

    let html = `<div class="w-100">`;

    if (mode === 'zaskoczenie') {
        const success = final >= 10;
        html += `<h2 class="${success ? 'text-success' : 'text-danger'}">${success ? 'ZASKOCZENIE UDANE' : 'NIEUDANE'}</h2>`;
        html += `<p>Wynik: ${final} (Rzut: ${roll} + Bonus: ${bonus})</p>`;
    }
    else if (['atak', 'blok', 'unik'].includes(mode)) {
        let quality = "Porażka";
        let badge = "badge-fail";
        if (final >= 19) { quality = "KRYTYCZNY"; badge = "badge-crit"; }
        else if (final >= 13) { quality = "UDANY"; badge = "badge-hit"; }
        else if (final >= 9) { quality = "SŁABY (50%)"; badge = "badge-weak"; }

        html += `<span class="badge ${badge} fs-5 mb-2">${quality}</span>`;
        html += `<h3>Wynik Celności: ${final}</h3>`;

        if (final >= 9) {
            const enemyRes = parseInt(document.getElementById('enemy-def').value) || 0;
            const dmg = calculateDamage(quality, enemyRes);
            html += `<hr class="border-secondary"><div class="mt-3">${dmg.html}</div>`;
        }
    }

    display.innerHTML = html + `</div>`;
}

function calculateDamage(quality, enemyRes) {
    const s = parseInt(selectedPostac.sila) || 0;
    const rollsAtk = rollD6(6);
    const rollsDef = (quality === "KRYTYCZNY") ? rollD6(1) : rollD6(4);
    const defVal = (quality === "KRYTYCZNY") ? (rollsDef + (enemyRes * 0.5)) : (rollsDef + enemyRes);

    let baseDmg = (rollsAtk + s) - defVal;
    if (quality.includes("SŁABY")) baseDmg = Math.floor(baseDmg * 0.5);

    // Modyfikatory punktów czułych
    const isSensitive = document.getElementById('hit-sensitive').checked;
    if (isSensitive) baseDmg += 5;

    let wound = "Nieznaczne obrażenia";
    let bleed = 0;

    if (baseDmg >= 50) { wound = "Rana 4 Stopnia (Ciężka)"; bleed = isSensitive ? 6 : 5; }
    else if (baseDmg >= 40) { wound = "Rana 4 Stopnia"; bleed = isSensitive ? 6 : 5; }
    else if (baseDmg >= 30) { wound = "Rana 3 Stopnia"; bleed = isSensitive ? 4 : 3; }
    else if (baseDmg >= 20) { wound = "Rana 2 Stopnia"; bleed = isSensitive ? 3 : 2; }
    else if (baseDmg >= 10) { wound = "Rana 1 Stopnia"; bleed = 1; }

    return {
        val: baseDmg,
        html: `
            <div class="dice-box">
                <div class="fs-1 fw-bold text-white">${baseDmg} PD</div>
                <div class="text-warning fw-bold">${wound}</div>
                ${bleed > 0 ? `<div class="text-bleeding small">🩸 Krwawienie: -${bleed} HP/tura</div>` : ''}
                <div class="combat-log mt-2">
                    Atak: (6d6[${rollsAtk}] + Siła[${s}]) = ${rollsAtk+s}<br>
                    Obrona: (Oponent[${enemyRes}] + Rzut Obronny[${rollsDef}]) = ${defVal}
                </div>
            </div>`
    };
}