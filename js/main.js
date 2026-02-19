async function load() {
    const list = document.getElementById('char-list');
    const authBox = document.getElementById('auth-box');

    try {
        const res = await fetch('api/get_characters.php');
        const text = await res.text(); // Pobieramy najpierw tekst, żeby sprawdzić czy nie ma tam błędów PHP

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("Serwer nie zwrócił poprawnego JSONa:", text);
            list.innerHTML = `<div class="alert alert-danger">Błąd serwera (szczegóły w konsoli F12)</div>`;
            return;
        }

        console.log("Dane z bazy:", data);

        // Obsługa nawigacji
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

        // Obsługa listy postaci
        if (data.status === 'error') {
            list.innerHTML = `<div class="alert alert-warning">Błąd API: ${data.message}</div>`;
            return;
        }

        if (data.chars.length === 0) {
            list.innerHTML = '<div class="col-12 text-center py-5">Baza postaci jest pusta.</div>';
            return;
        }

        list.innerHTML = ''; // Czyścimy listę przed renderowaniem
        data.chars.forEach(c => {
            list.innerHTML += `
                <div class="col-md-3 mb-4">
                    <div class="card h-100 shadow-sm border-secondary">
                        <img src="${c.url_awatara || 'https://via.placeholder.com/300x200?text=Brak+Avataru'}" 
                             class="card-img-top" style="height: 200px; object-fit: cover;">
                        <div class="card-body bg-dark text-white">
                            <h5 class="card-title text-warning">${c.imie}</h5>
                            <p class="card-text mb-1"><small>Klan:</small> ${c.klan}</p>
                            <p class="card-text mb-3"><small>Ranga:</small> <span class="badge bg-secondary">${c.ranga}</span></p>
                            <a href="character.html?id=${c.id_postaci}" class="btn btn-sm btn-outline-warning w-100">Zobacz Profil</a>
                        </div>
                    </div>
                </div>`;
        });

    } catch (err) {
        console.error("Błąd sieci:", err);
        list.innerHTML = `<div class="alert alert-danger">Błąd połączenia: ${err.message}</div>`;
    }
}

function logout() {
    fetch('api/logout.php').then(() => location.href = 'index.html');
}

// Uruchomienie ładowania
document.addEventListener('DOMContentLoaded', load);