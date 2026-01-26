let makeCard = (p) => {
    let main = document.getElementById("spis");
    let card = document.createElement("postac");
    let zdj = document.createElement("zdj");
    let info = document.createElement("info");
    let imie = document.createElement("imie");
    let klan = document.createElement("klan");
    let plec = document.createElement("plec");
    let ranga = document.createElement("ranga");
    let linki = document.createElement("linki");

    imie.innerText = p.imie;
    klan.innerText = p.klan;
    plec.innerText = p.plec;
    ranga.innerText = p.ranga;
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
            console.log(postacie.data);
            postacie.data.forEach(p => {
                makeCard(p);
            });
        } else {
            document.getElementById("noti").innerText = postacie.data;
            console.error(postacie.data);
        }
    } catch (error) {
        console.error("Error" + error);
        document.getElementById("noti").innerText = error;
    }
})