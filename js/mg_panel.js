let allCharacters = [];
let selectedChar = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Pobierz wszystkie postacie
    const res = await fetch('api/characters.php');
    allCharacters = await res.json();

    const selector = document.getElementById('char-selector');
    selector.innerHTML += allCharacters.map(c => `<option value="${c.id_postaci}">${c.imie} (${c.klan})</option>`).join('');

    selector.addEventListener('change', e => {
        selectedChar = allCharacters.find(c => c.id_postaci === e.target.value);
        if (selectedChar) loadCharDetails();
    });
});

async function loadCharDetails() {
    // Pobierz pełne dane (z cechami)
    const res = await fetch(`api/characters.php?id=${selectedChar.id_postaci}`);
    selectedChar = await res.json();

    document.getElementById('char-mini-stats').innerHTML = `
        Poziom: ${selectedChar.poziom || 1} | Zr: ${selectedChar.zrecznosc} | Sz: ${selectedChar.szybkosc}
    `;
    updateBonuses();
}

function updateBonuses() {
    if (!selectedChar) return;

    const action = document.getElementById('action-type').value;
    const terrain = document.getElementById('terrain-type').value;
    const time = document.getElementById('time-type').value;

    let bonuses = [];
    let total = 0;

    // 1. Poziom Postaci
    const level = parseInt(selectedChar.poziom) || 1;
    bonuses.push({ name: 'Poziom', val: level });
    total += level;

    // 2. Umiejętności
    const skillMap = { 0: 0, 1: 1, 2: 3, 3: 5 };
    if (action === 'polowanie') {
        const val = skillMap[selectedChar.u_tropienie] || 0;
        bonuses.push({ name: 'Tropienie', val: val });
        total += val;
    } else if (action === 'lowienie') {
        const val = skillMap[selectedChar.u_lowienie] || 0;
        bonuses.push({ name: 'Łowienie', val: val });
        total += val;
    } else if (action === 'schwytanie') {
        const val = skillMap[selectedChar.u_skradanie] || 0;
        bonuses.push({ name: 'Skradanie', val: val });
        total += val;
        // Modyfikator Zręczności
        const zrBonus = getAttrMod(selectedChar.zrecznosc, 'zr');
        bonuses.push({ name: 'Bonus Zręczności', val: zrBonus });
        total += zrBonus;
    } else if (action === 'pogon') {
        const szBonus = getAttrMod(selectedChar.szybkosc, 'sz');
        bonuses.push({ name: 'Bonus Szybkości', val: szBonus });
        total += szBonus;
    }

    // 3. Cechy (Logika dynamiczna)
    const charTraits = selectedChar.cechy ? selectedChar.cechy.map(t => t.nazwa) : [];

    if (charTraits.includes('Psi węch')) { bonuses.push({ name: 'Psi węch', val: 2 }); total += 2; }
    if (charTraits.includes('Sokoli wzrok')) { bonuses.push({ name: 'Sokoli wzrok', val: 2 }); total += 2; }
    if (charTraits.includes('Króliczy słuch')) { bonuses.push({ name: 'Króliczy słuch', val: 3 }); total += 3; }

    if (time === 'noc' && charTraits.includes('Nocny łowca')) { bonuses.push({ name: 'Nocny łowca (Noc)', val: 2 }); total += 2; }
    if (time === 'dzien' && charTraits.includes('Nocny łowca')) { bonuses.push({ name: 'Nocny łowca (Dzień)', val: -2 }); total -= 2; }

    if (terrain === 'las' && charTraits.includes('Leśny cień')) { bonuses.push({ name: 'Leśny cień (Teren)', val: 1 }); total += 1; }
    if (terrain === 'rzeka' && charTraits.includes('Ryba w wodzie')) { bonuses.push({ name: 'Ryba w wodzie (Teren)', val: 1 }); total += 1; }

    // Renderowanie sugestii
    document.getElementById('bonus-list').innerHTML = bonuses.map(b =>
        `<span class="bonus-tag">${b.name}: ${b.val >= 0 ? '+' : ''}${b.val}</span>`
    ).join('');
    document.getElementById('total-bonus').innerText = (total >= 0 ? '+' : '') + total;
    window.currentTotalBonus = total;
}

function getAttrMod(val, type) {
    val = parseInt(val) || 0;
    if (type === 'zr') {
        if (val <= 4) return 0; if (val <= 8) return 1; if (val <= 12) return 2;
        if (val <= 17) return 3; if (val <= 22) return 4; if (val <= 27) return 5;
        return 6; // uproszczone na potrzeby przykładu
    }
    if (type === 'sz') {
        if (val <= 4) return 0; if (val <= 7) return 1; if (val <= 10) return 2;
        if (val <= 14) return 3; return 4;
    }
    return 0;
}

function interpretResult() {
    const dice = parseInt(document.getElementById('roll-input').value);
    if (isNaN(dice)) return alert("Wpisz wynik rzutu!");

    const action = document.getElementById('action-type').value;
    const finalScore = dice + window.currentTotalBonus;
    const box = document.getElementById('interpretation-box');

    let resultHtml = `<div class="p-3"><div class="small text-muted mb-1">Wynik końcowy: ${finalScore}</div>`;

    if (action === 'polowanie' || action === 'lowienie') {
        const map = {
            0: "NIC", 1: "NIESPODZIANKA", 2: "PRZECIWNIK", 3: "PRZECIWNIK", 4: "NIC", 5: "ZWIERZYNA",
            9: "ZWIERZYNA", 11: "PRZECIWNIK", 13: "ZWIERZYNA", 15: "NIESPODZIANKA", 16: "ZWIERZYNA", 17: "ZWIERZYNA", 20: "ZWIERZYNA"
        };
        let status = finalScore >= 30 ? "ZWIERZYNA" : (map[finalScore] || "NIC");
        resultHtml += `<h1 class="fw-bold ${status === 'NIC' ? 'text-secondary' : 'text-success'}">${status}</h1>`;
    } else {
        // Logika dla Schwytania/Pogoni
        if (finalScore <= 8) resultHtml += `<h1 class="text-danger">PORAŻKA (UCIEKŁO)</h1>`;
        else if (finalScore <= 15) resultHtml += `<h1 class="text-warning">POGOŃ TRWA</h1>`;
        else resultHtml += `<h1 class="text-success">SUKCES!</h1>`;
    }

    box.innerHTML = resultHtml + `</div>`;
}