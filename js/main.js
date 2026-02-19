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

async function load() {
    const list = document.getElementById('char-list');
    const authBox = document.getElementById('auth-box');

    try {
        const res = await fetch('api/get_characters.php');
        const data = await res.json();

        if(data.session && data.session.isLoggedIn) {
            authBox.innerHTML = `
                <span class="me-2 text-info">Witaj, ${data.session.role}!</span>
                <a href="add.html" class="btn btn-success btn-sm me-2">Dodaj Postać</a>
                <button onclick="logout()" class="btn btn-danger btn-sm">Wyloguj</button>`;
        } else {
            authBox.innerHTML = `
                <a href="login.html" class="btn btn-primary btn-sm me-2">Logowanie</a>
                <a href="register.html" class="btn btn-outline-light btn-sm">Rejestracja</a>`;
        }

        if (data.chars.length === 0) {
            list.innerHTML = '<div class="col-12 text-center py-5">Baza postaci jest pusta.</div>';
            return;
        }

        list.innerHTML = '';
        data.chars.forEach(c => {
            const accent = klanColors[c.klan] || "#828282";
            list.innerHTML += `
                <div class="col-md-3 mb-4">
                    <div class="card h-100 shadow-sm" style="border-top: 5px solid ${accent};">
                        <img src="${c.url_awatara || 'https://via.placeholder.com/300x200?text=Brak+Avataru'}" 
                             class="card-img-top" style="height: 200px; object-fit: cover;">
                        <div class="card-body bg-dark text-white">
                            <h5 style="color: ${accent};">${c.imie}</h5>
                            <p class="card-text mb-1"><small>Klan:</small> ${c.klan}</p>
                            <p class="card-text mb-3"><small>Ranga:</small> <span class="badge" style="background-color: ${accent}; color: #000;">${c.ranga}</span></p>
                            <a href="character.html?id=${c.id_postaci}" class="btn btn-sm btn-outline-light w-100" style="border-color: ${accent}; color: ${accent};">Zobacz Profil</a>
                        </div>
                    </div>
                </div>`;
        });
    } catch (err) { console.error(err); }
}

function logout() { fetch('api/logout.php').then(() => location.href = 'index.html'); }
document.addEventListener('DOMContentLoaded', load);