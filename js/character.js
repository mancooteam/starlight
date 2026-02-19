const klanColors = {
    "Gwiezdny Klan": "#5C5AA6",
    "Pustka": "#6C8570",
    "Plemię Wiecznych Łowów": "#886CAB",
    "Ciemny Las": "#8F534B",
    "Klan Cienia": "#E38F9C",
    "Klan Gromu": "#FFCE7A",
    "Klan Rzeki": "#7898FF",
    "Klan Wichru": "#A3E0D5",
    "Plemię Niedźwiedzich Kłów": "#ffffff",
    "Bractwo Krwi": "#CA4250",
    "Samotnik": "#7DBF65",
    "Nieaktywny": "#828282",
    "NPC": "#828282"
};

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const charId = params.get('id');
    if (!charId) { location.href = 'index.html'; return; }

    const res = await fetch(`api/get_character_details.php?id=${charId}`);
    const data = await res.json();
    if (data.status !== 'success') return;

    const c = data.character;
    const accent = klanColors[c.klan] || "#828282";

    if (data.viewer.is_owner || data.viewer.is_admin) {
        document.getElementById('action-buttons').innerHTML += `
            <a href="edit.html?id=${c.id_postaci}" class="btn btn-sm" style="background-color: ${accent}; color: #000;">Edytuj</a>`;
    }

    const traitHtml = data.traits.map(t => {
        let color = 'secondary';
        if (t.typ === 'pozytywna') color = 'success';
        if (t.typ === 'mieszana') color = 'info';
        if (t.typ === 'negatywna') color = 'warning text-dark';
        if (t.typ === 'ciezka_negatywna') color = 'danger';
        return `<span class="badge trait-badge bg-${color}">${t.nazwa}</span>`;
    }).join('') || '<span class="text-muted small">Brak cech specjalnych</span>';

    document.getElementById('character-content').innerHTML = `
        <div class="row g-4">
            <div class="col-md-4 text-center">
                <img src="${c.url_awatara || 'https://via.placeholder.com/400'}" class="img-fluid rounded shadow-lg mb-3" style="border: 4px solid ${accent};">
                <div class="card p-3">
                    <h6 style="color: ${accent};">Cechy Postaci</h6>
                    <div class="d-flex flex-wrap justify-content-center">${traitHtml}</div>
                </div>
            </div>
            
            <div class="col-md-8">
                <h1 class="display-4 mb-0" style="color: ${accent};">${c.imie}</h1>
                <p class="lead" style="color: ${accent}; opacity: 0.8;">${c.klan} — <strong>${c.ranga}</strong></p>
                <div class="card p-3 mb-4">
                    <h5 style="color: ${accent}; border-bottom: 1px solid ${accent};">Opis</h5>
                    <p style="white-space: pre-wrap;">${c.opis || 'Brak opisu.'}</p>
                </div>

                <h5 class="mb-3" style="color: ${accent};">Atrybuty</h5>
                <div class="row g-2 mb-4">
                    ${renderStat('Siła', c.sila, accent)} ${renderStat('Zreczność', c.zrecznosc, accent)}
                    ${renderStat('Szybkość', c.szybkosc, accent)} ${renderStat('Odporność', c.odpornosc, accent)}
                    ${renderStat('HP', c.hp, accent)} ${renderStat('Wytrzymałość', c.wytrzymalosc, accent)}
                </div>

                <h5 class="mb-3" style="color: ${accent};">Umiejętności</h5>
                <div class="row g-2">
                    ${renderSkill('Łowienie', c.u_lowienie, accent)} ${renderSkill('Pływanie', c.u_plywanie, accent)}
                    ${renderSkill('Skradanie', c.u_skradanie, accent)} ${renderSkill('Tropienie', c.u_tropienie, accent)}
                    ${renderSkill('Wspinaczka', c.u_wspinaczka, accent)} ${renderSkill('Zielarstwo', c.u_zielarstwo, accent)}
                </div>
            </div>
        </div>
        <h3 class="mt-5 text-warning border-bottom border-secondary pb-2">Inne postacie tego gracza</h3>
        <div class="row mt-3" id="others-list"></div>
    `;

    const othersBox = document.getElementById('others-list');
    data.other_characters.forEach(o => {
        othersBox.innerHTML += `
            <div class="col-md-2 col-6 mb-3">
                <a href="character.html?id=${o.id_postaci}" class="text-decoration-none">
                    <div class="card h-100 text-center p-2 border-0 bg-dark">
                        <img src="${o.url_awatara || 'https://via.placeholder.com/100'}" class="rounded-circle mx-auto mb-2" style="width: 70px; height: 70px; object-fit: cover; border: 2px solid ${klanColors[o.klan] || '#828282'}">
                        <small class="text-white d-block text-truncate">${o.imie}</small>
                    </div>
                </a>
            </div>`;
    });
});

function renderStat(label, val, accent) {
    return `<div class="col-md-2 col-4"><div class="stat-box" style="border-color: ${accent};"><small class="d-block text-muted">${label}</small><span style="color: ${accent}; font-weight: bold; font-size: 1.2rem;">${val}</span></div></div>`;
}

function renderSkill(label, val, accent) {
    return `<div class="col-md-4 col-6"><div class="p-2 bg-dark rounded border small d-flex justify-content-between" style="border-color: ${accent};">
            <span>${label}:</span> <span style="color: ${accent}; fw-bold">${val}</span></div></div>`;
}