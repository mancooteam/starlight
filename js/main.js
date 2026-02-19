async function load() {
    const res = await fetch('api/get_characters.php');
    const data = await res.json();
    const box = document.getElementById('auth-box');

    // Nawigacja
    if(data.session.isLoggedIn) {
        box.innerHTML = `<a href="add.html" class="btn btn-success me-2">Dodaj</a><button onclick="location.href='api/logout.php'" class="btn btn-danger">Wyloguj</button>`;
    } else {
        box.innerHTML = `<a href="login.html" class="btn btn-primary me-2">Logowanie</a><a href="register.html" class="btn btn-outline-light">Rejestracja</a>`;
    }

    // Karty Postaci
    const list = document.getElementById('char-list');
    let deleteBtn = "";
    if (user.role === 'administrator' || user.id == char.id_wlasciciela) {
        deleteBtn = `
        <br><button onclick="deleteCharacter('${char.id_postaci}')" class="btn btn-sm btn-danger mt-2 w-100">
            Usuń Postać
        </button>`;
    }
    data.chars.forEach(c => {
        list.innerHTML += `
            <div class="col-md-3 mb-4">
                <div class="card h-100">
                    <img src="${c.url_awatara || 'https://via.placeholder.com/150'}" class="card-img-top">
                    <div class="card-body">
                        <h5>${c.imie}</h5>
                        <p class="small text-secondary">${c.ranga} | ${c.klan}</p>
                        <a href="character.html?id=${c.id_postaci}" class="btn btn-sm btn-info w-100">Zobacz profil</a> ${deleteBtn}
                    </div>
                </div>
            </div>`;
    });
}

async function deleteCharacter(id) {
    if (!confirm("Czy na pewno chcesz na zawsze usunąć tę postać? Tej operacji nie da się cofnąć.")) {
        return;
    }

    try {
        const response = await fetch('api/delete_character.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_postaci: id })
        });

        const result = await response.json();

        if (result.status === 'success') {
            alert(result.message);
            location.reload(); // Odśwież stronę, aby zaktualizować listę
        } else {
            alert("Błąd: " + result.message);
        }
    } catch (err) {
        alert("Wystąpił błąd podczas komunikacji z serwerem.");
    }
}

load();