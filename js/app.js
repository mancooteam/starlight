let getName = (k) => {
    if (k === "cien") { return "Klan Cienia"}
    if (k === "grom") { return "Klan Gromu"}
    if (k === "rzeka") { return "Klan Rzeki"}
    if (k === "wicher") { return "Klan Wichru"}
    if (k === "samotnik") { return "Samotnik"}
    if (k === "pnk") { return "Plemię"}
    if (k === "cl") { return "Ciemny Las"}
    if (k === "gk") { return "Gwiezdny Klan"}
    else { return "Bład - skontaktuj się z Nath"}
}

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

    zdj.style=`background-image: url(${p.avek});`;

    imie.innerText = p.imie;
    klan.innerText = getName(p.klan);
    plec.innerText = p.plec;
    ranga.innerText = p.ranga;

    info.append(imie,klan,plec,ranga,linki);
    card.append(zdj,info);

    card.style = `border: 2px solid var(--${p.klan})`;

    main.appendChild(card);
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch("../api/postacie.php");
        if (!res.ok) {
            console.error(res.text);
        }
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