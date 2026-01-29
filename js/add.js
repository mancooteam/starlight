document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('id').value;
        const imie = document.getElementById('imie').value;
        const plec = document.getElementById('plec').value;
        const klan = document.getElementById('klan').value;
        const ranga = document.getElementById('ranga').value;
        const avek = document.getElementById('avek').value;

        const dane = {
            id: id,
            imie: imie,
            plec: plec,
            klan: klan,
            ranga: ranga,
            avek: avek
        };
    })
})