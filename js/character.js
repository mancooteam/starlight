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

    if (!charId) {
        location.href = 'index.html';
        return;
    }

    try {
        const res = await fetch(`api/get_character_details.php?id=${charId}`);
        const data = await res.json();

        if (data.status !== 'success') {
            document.body.innerHTML = `<div class="container py-5 text-center"><h1>${data.message}</h1><a href="index.html">Powrót</a></div>`;
            return;
        }

        const c = data.character;
        const accent = klanColors[c.klan] || "#828282";

        // Renderowanie nagłówka akcji
        let actionBtns = `<a href="index.html" class="btn btn-outline-light btn-sm me-2">← Katalog</a>`;
        if (data.viewer.is_owner || data.viewer.is_admin) {
            actionBtns += `<a href="edit.html?id=${c.id_postaci}" class="btn btn-sm" style="background-color: ${accent}; color: #000; font-weight:bold;">Edytuj</a>`;
        }
        document.getElementById('action-buttons').innerHTML = actionBtns;

        // Cechy
        const traitHtml = data.traits.map(t => {
            let color = 'secondary';
            if (t.typ === 'pozytywna') color = 'success';
            if (t.typ === 'mieszana') color = 'info';
            if (t.typ === 'negatywna') color = 'warning text-dark';
            if (t.typ === 'ciezka_negatywna') color = 'danger';
            return `<span class="badge me-1 mb-1 bg-${color}">${t.nazwa}</span>`;
        }).join('') || '<span class="text-muted small">Brak cech</span>';

        // Główne treści
        document.getElementById('character-content').innerHTML = `
            <div class="row g-4 mt-2">
                <div class="col-md-4 text-center">
                    <img src="${c.url_awatara || 'https://via.placeholder.com/400'}" class="img-fluid rounded shadow-lg mb-3" style="border: 4px solid ${accent};">
                    <div class="card p-3 bg-dark border-secondary">
                        <h6 style="color: ${accent};">Cechy Postaci</h6>
                        <div class="d-flex flex-wrap justify-content-center">${traitHtml}</div>
                    </div>
                </div>
                <div class="col-md-8">
                    <h1 class="display-4 fw-bold mb-0" style="color: ${accent}; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">${c.imie}</h1>
                    <p class="lead" style="color: ${accent}; opacity: 0.9;">${c.klan} — <strong>${c.ranga}</strong></p>
                    
                    <div class="card p-3 mb-4 bg-dark border-secondary">
                        <h5 style="color: ${accent}; border-bottom: 1px solid ${accent}; padding-bottom: 5px;">Opis</h5>
                        <p style="white-space: pre-wrap;" class="mt-2">${c.opis || 'Ten kot nie posiada jeszcze opisu.'}</p>
                    </div>

                    <h5 class="mb-3" style="color: ${accent};">Atrybuty</h5>
                    <div class="row g-2 mb-4">
                        ${renderStat('Siła', c.sila, accent)} ${renderStat('Zręczność', c.zrecznosc, accent)}
                        ${renderStat('Szybkość', c.szybkosc, accent)} ${renderStat('Odporność', c.odpornosc, accent)}
                        ${renderStat('HP', c.hp, accent)} ${renderStat('Wytrzym.', c.wytrzymalosc, accent)}
                    </div>

                    <h5 class="mb-3" style="color: ${accent};">Umiejętności</h5>
                    <div class="row g-2">
                        ${renderSkill('Łowienie', c.u_lowienie, accent)} ${renderSkill('Pływanie', c.u_plywanie, accent)}
                        ${renderSkill('Skradanie', c.u_skradanie, accent)} ${renderSkill('Tropienie', c.u_tropienie, accent)}
                        ${renderSkill('Wspinaczka', c.u_wspinaczka, accent)} ${renderSkill('Zielarstwo', c.u_zielarstwo, accent)}
                    </div>
                </div>
            </div>
            <h3 class="mt-5 pb-2" style="color: ${accent}; border-bottom: 2px solid ${accent};">Inne postacie tego gracza</h3>
            <div class="row mt-3" id="others-list"></div>
        `;

        const othersBox = document.getElementById('others-list');
        if (data.other_characters.length === 0) othersBox.innerHTML = '<p class="text-muted ms-2">Brak innych postaci tego właściciela.</p>';
        data.other_characters.forEach(o => {
            othersBox.innerHTML += `
                <div class="col-md-2 col-4 mb-3 text-center">
                    <a href="character.html?id=${o.id_postaci}" class="text-decoration-none">
                        <img src="${o.url_awatara || 'https://via.placeholder.com/100'}" class="rounded-circle mb-2" style="width: 70px; height: 70px; object-fit: cover; border: 2px solid ${klanColors[o.klan] || '#828282'}">
                        <small class="text-light d-block text-truncate">${o.imie}</small>
                    </a>
                </div>`;
        });

    } catch (err) {
        console.error(err);
    }
});

function renderStat(label, val, accent) {
    return `<div class="col-md-2 col-4"><div class="p-2 rounded text-center" style="background: rgba(255,255,255,0.05); border: 1px solid ${accent};">
            <small class="d-block text-muted" style="font-size: 0.7rem;">${label}</small>
            <span style="color: ${accent}; font-weight: bold; font-size: 1.1rem;">${val}</span></div></div>`;
}

function renderSkill(label, val, accent) {
    return `<div class="col-md-4 col-6"><div class="p-2 rounded d-flex justify-content-between align-items-center" style="background: rgba(255,255,255,0.05); border-left: 3px solid ${accent};">
            <small>${label}</small><span style="color: ${accent}; font-weight: bold;">${val}</span></div></div>`;
}