const klanKolory = {
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
    "NPC": "#aaaaaa"
};

async function fetchCharacters() {
    const container = document.getElementById('characters-container');

    try {
        const response = await fetch('api/get_characters.php');
        const characters = await response.json();

        container.innerHTML = ''; // Wyczyść loader

        characters.forEach(char => {
            const color = klanKolory[char.klan] || '#444'; // Domyślny kolor jeśli brak w mapie

            const cardHtml = `
                <div class="col-md-4 col-lg-3">
                    <div class="card bg-secondary border-0 h-100 shadow" style="border-top: 5px solid ${color} !important;">
                        <img src="${char.url_awatara || 'https://via.placeholder.com/150'}" class="card-img-top" alt="${char.imie}" style="height: 200px; object-fit: cover;">
                        <div class="card-body text-center">
                            <h5 class="card-title fw-bold" style="color: ${color}">${char.imie}</h5>
                            <p class="badge mb-1" style="background-color: ${color}">${char.klan}</p>
                            <p class="card-text small mb-0 text-uppercase">${char.ranga}</p>
                            <hr class="my-2 border-light opacity-25">
                            <p class="small text-light-50 italic">${char.cechy || 'Brak cech'}</p>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += cardHtml;
        });
    } catch (error) {
        console.error('Błąd pobierania danych:', error);
        container.innerHTML = '<p class="text-danger text-center">Nie udało się załadować postaci.</p>';
    }
}

// Odpalenie funkcji na starcie
fetchCharacters();