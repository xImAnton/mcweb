ips = document.getElementsByClassName("copy-field");
for (let i = 0; i<ips.length; i++) {
    e = ips[i];
    for (let u = 0; u<e.childNodes.length; u++) {
        if (e.childNodes[u].tagName === "BUTTON")
        e.childNodes[u].addEventListener("click", (e) => navigator.clipboard.writeText(e.target.parentElement.getAttribute("copy-text")));
    }
}

function toggleDarkmode() {
    e = document.getElementById("body");
    if (e.className === "darkmode") {
        e.className = "brightmode";
    } else {
        e.className = "darkmode";
    }
}

document.getElementById("darkmode-switch").checked = true;
