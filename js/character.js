const klanColors = {
    "Gwiezdny Klan": "#5C5AA6", "Pustka": "#6C8570", "Plemię Wiecznych Łowów": "#886CAB",
    "Ciemny Las": "#8F534B", "Klan Cienia": "#E38F9C", "Klan Gromu": "#FFCE7A",
    "Klan Rzeki": "#7898FF", "Klan Wichru": "#A3E0D5", "Plemię Niedźwiedzich Kłów": "#ffffff",
    "Bractwo Krwi": "#CA4250", "Samotnik": "#7DBF65", "Nieaktywny": "#828282", "NPC": "#828282"
};

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const charId = params.get('id');
    if (!charId) { location.href = 'index.html'; return; }

    try {
        const res = await fetch(`api/get_character_details.php?id=${charId}`);
        const data = await res.json();

        if (data.status !== 'success') {
            document.getElementById('character-content').innerHTML = `<h2 class="text-center mt-5">${data.message}</h2>`;
            return;
        }

        const c = data.character;
        const accent = klanColors[c.klan] || "#828282";

        // Przycisk edycji na profilu
        let actionBtns = `<a href="index.html" class="btn btn-outline-light btn-sm me-2">← Katalog</a>`;
        if (data.viewer.is_owner || data.viewer.is_admin) {
            actionBtns += `<a href="edit.html?id=${c.id_postaci}" class="btn btn-sm px-4" style="background-color: ${accent}; color: #000; font-weight:bold;">Edytuj Postać</a>`;
        }
        document.getElementById('action-buttons').innerHTML = actionBtns;

        // Renderowanie treści (skrócone dla przejrzystości, zawiera wszystkie Twoje pola)
        document.getElementById('character-content').innerHTML = `
            <div class="row g-4 mt-2">
                <div class="col-md-4 text-center">
                    <img src="${c.url_awatara || 'https://via.placeholder.com/400'}" class="img-fluid rounded shadow-lg mb-3" style="border: 4px solid ${accent};">
                </div>
                <div class="col-md-8">
                    <h1 class="display-4 fw-bold" style="color: ${accent};">${c.imie}</h1>
                    <p class="lead" style="color: ${accent};">${c.klan} — <strong>${c.ranga}</strong></p>
                    <div class="card p-3 mb-4 bg-dark border-secondary">
                        <h5 style="color: ${accent}; border-bottom: 1px solid ${accent};">Opis</h5>
                        <p class="mt-2">${c.opis || 'Brak opisu.'}</p>
                    </div>
                    <div class="row g-2 mb-4">
                        ${renderStat('Siła', c.sila, accent)} ${renderStat('HP', c.hp, accent)} 
                        ${renderStat('Zręczność', c.zrecznosc, accent)} ${renderStat('Szybkość', c.szybkosc, accent)}
                    </div>
                </div>
            </div>`;
    } catch (err) { console.error(err); }
});

function renderStat(label, val, accent) {
    return `<div class="col-4"><div class="p-2 rounded text-center" style="border: 1px solid ${accent};">
            <small class="d-block text-muted">${label}</small><span style="color: ${accent}; font-weight: bold;">${val}</span></div></div>`;
}