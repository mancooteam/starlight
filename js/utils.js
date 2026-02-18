/**
 * ST_HUB Utils - Uniwersalne funkcje pomocnicze
 */

/**
 * Wyświetla powiadomienie Toast (Bootstrap 5)
 * @param {string} message - Treść komunikatu
 * @param {string} type - 'success' (zielony), 'danger' (czerwony), 'warning' (żółty)
 */
function showToast(message, type = 'success') {
    const toastEl = document.getElementById('liveToast');
    const messageEl = document.getElementById('toast-message');

    if (!toastEl || !messageEl) {
        console.warn("Nie znaleziono kontenera Toast w HTML. Używam alert: " + message);
        alert(message);
        return;
    }

    // Dobór koloru krawędzi
    let borderColor = 'var(--em2)';
    if (type === 'danger') borderColor = '#ff4d4d';
    if (type === 'warning') borderColor = '#ffc107';

    toastEl.style.borderLeft = `5px solid ${borderColor}`;
    messageEl.innerText = message;

    const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
    toast.show();
}