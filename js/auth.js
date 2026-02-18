// js/auth.js
async function checkUserStatus() {
    const response = await fetch('api/auth.php?action=status');
    const user = await response.json();

    if (user.loggedIn) {
        console.log("Zalogowany jako:", user.nazwa, "Rola:", user.rola);
        // Ukryj formularz logowania, pokaż przycisk "Dodaj postać"
    } else {
        console.log("Użytkownik jest gościem");
        // Ukryj przyciski edycji
    }
    return user;
}