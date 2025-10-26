// --- Colors ---
const stoneColors = {
    "Ametyst": "#68456E", //https://www.korallo.pl/produkt/ametyst-kulka-fasetowana-4.5mm-dk0784
    "KamienKsiezycowy": "#f4ebd2ff", //https://www.korallo.pl/kamien-ksiezycowy-kulka-fasetowana-3-5mm
    "KamienSloneczny": "#d4b062ff", //https://www.korallo.pl/kamien-sloneczny-kulka-fasetowana-4mm
    "Lolit": "#412b63ff", //https://www.korallo.pl/produkt/iolit-kulka-fasetowana-3.7mm-dk1206
    "KocieOkoTurkusowa": "#93CBC2", //https://www.korallo.pl/kocie-oko-kulka-fasetowana-turkusowa-4mm
    "KocieOkoFioletowa": "#655A7C", //https://www.korallo.pl/kocie-oko-kulka-fasetowana-fioletowa-4mm
    "KocieOkoZielona": "#579E57", //https://www.korallo.pl/kocie-oko-kulka-fasetowana-zielona-4mm
    "KocieOkoSzary": "#b0b0b0", //https://www.korallo.pl/kocie-oko-kulka-fasetowana-szara-4mm
    "BialaMuszla": "#f9f9f9", //https://www.korallo.pl/biala-muszla-kulka-fasetowana-4mm
    "AmetystLawendowy": "#BFB0B4", //https://www.korallo.pl/ametyst-lawendowy-kulka-fasetowana-5mm
    "Sodalit": "#6d7fb8ff", //https://www.korallo.pl/sodalit-kulka-fasetowana-4mm-35537
    "OpalSyntetyczny": "#c9cba7ff", //https://www.korallo.pl/opal-syntetyczny-kulka-fasetowana-4mm
    "ZielonaMasaPerlowa": "#97cb67ff", //https://www.korallo.pl/zielona-masa-perlowa-kulka-fasetowana-4mm
    "Fluoryt": "#9290A5",  //https://www.korallo.pl/fluoryt-kulka-fasetowana-4mm-40396
    "KoralNiebieski": "#7294caff" //https://www.korallo.pl/koral-niebieski-kulka-fasetowana-4mm-35481
};

const showBackground = ["BialaMuszla" ];

const metalColors = { gold: "#d4af37", silver: "#c0c0c0" };

// --- State ---
const selection = {
    color: "gold",
    stones: "Ametyst",
    pendant: "sun",
    clasp: "ring"
};

// --- Canvas ---
const canvas = document.getElementById("necklaceCanvas");
const ctx = canvas.getContext("2d");

// --- Image cache (preload one time) ---
const cache = {};
function getImage(src) {
    return new Promise((resolve, reject) => {
        if (cache[src]?.complete) return resolve(cache[src]);
        const img = new Image();
        img.onload = () => { cache[src] = img; resolve(img); };
        img.onerror = reject;
        img.src = src;
    });
}

// --- Helpers ---
function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

function colorToHex(category, value) {
    if (category === "color") return metalColors[value] || "#cccccc";
    if (category === "stones") return stoneColors[value] || "#ffffff";
    return "#ffffff";
}

// Tint a single image on an offscreen canvas, then draw result to the main canvas.
// This guarantees, że kolorujemy WYŁĄCZNIE piksele tej warstwy.
async function drawTintedLayer(src, hexColor) {
    const img = await getImage(src);

    // offscreen
    const off = document.createElement("canvas");
    off.width = canvas.width;
    off.height = canvas.height;
    const octx = off.getContext("2d");

    // 1) draw image
    octx.drawImage(img, 0, 0, off.width, off.height);
    // 2) tint only where image has alpha
    octx.globalCompositeOperation = "source-atop";
    octx.fillStyle = hexColor;
    octx.fillRect(0, 0, off.width, off.height);
    octx.globalCompositeOperation = "source-over";

    // paste onto main
    ctx.drawImage(off, 0, 0);
}

async function updatePreview() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const layers = [
        // beads: kolor według stones
        { src: "img/beads.png", colorCategory: "stones" },
        // metalBeads + clasp + pendant: kolor według metal color
        { src: "img/metalBeads.png", colorCategory: "color" },
        { src: `img/clasp${capitalize(selection.clasp)}.png`, colorCategory: "color" },
        { src: `img/pendant${capitalize(selection.pendant)}.png`, colorCategory: "color" }
    ];

    // rysujemy po kolei, każdą warstwę tintujemy osobno
    for (const layer of layers) {
        const color = colorToHex(layer.colorCategory, selection[layer.colorCategory]);
        await drawTintedLayer(layer.src, color);
    }

    // --- Ustaw tło w zależności od wybranego kamienia ---
    const previewDiv = document.querySelector(".preview");
    if (showBackground.includes(selection.stones)) {
        previewDiv.style.backgroundColor = "#85858540";
    } else {
        previewDiv.style.backgroundColor = "#ffffff";
    }

}

// --- UI handlers ---
// Użyjemy event z inline onclick: onclick="selectOption('stones','Ametyst', event)"
function selectOption(category, value, ev) {
    selection[category] = value;

    document
        .querySelectorAll(`button[onclick*="${category}"]`)
        .forEach(btn => btn.classList.remove("selected"));
    if (ev?.target) ev.target.classList.add("selected");

    updatePreview();

    if (category === "stones") updateStonePreview(); // <--- nowy podgląd
}

function copySelection() {
    const text = Object.entries(selection).map(([k, v]) => `${k}: ${v}`).join("\n");
    navigator.clipboard.writeText(text);
}

function updateStonePreview() {
    const previewDiv = document.querySelector(".preview");
    const stoneName = selection.stones;

    // usuń poprzedni podgląd (jeśli istnieje)
    const existing = document.getElementById("stone-preview-image");
    if (existing) existing.remove();

    // utwórz nowy obrazek
    const img = document.createElement("img");
    img.id = "stone-preview-image";
    img.className = "stone-preview"; // 🎨 stylowanie przez CSS
    img.src = `img/${stoneName}.png`;
    img.alt = stoneName;

    previewDiv.appendChild(img);

    // animacja pojawiania się
    requestAnimationFrame(() => (img.style.opacity = "1"));
}

// first render
updatePreview();
updateStonePreview();


/**
 * cena
 * przekladki - 6zl
 * zawieszka - 6zl
 * zapiecie - 4zl
 * 
 * kamienie
 * tanie: 6 * 4 = 24zl
 * drogie: 6 * 8 = 48zl
 * 
 */