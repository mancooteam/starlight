let makeCard = (p) => {
    let main = document.getElementById("spis");
    let card = document.createElement("postac");
    let zdj = document.createElement("zdj");
    let info = document.createElement("info");
    let imie = document.createElement("imie");
    imie.innerText = p.imie;
    let klan = document.createElement("klan");
    klan.innerText = p.klan;
    let plec = document.createElement("plec");
    let ranga = document.createElement("ranga");
    let linki = document.createElement("linki");
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch("../api/postacie.php", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const postacie = await res.json();
        if(postacie.valid) {
            console.log(res.data);
            postacie.data.forEach(p => {
                makeCard(p);
            });
        } else {
            console.error(postacie.data);
        }
    } catch (error) {
        console.error("Error" + error);
    }
})