// --- Prices (PLN) ---
const prices = {
    color: { gold: 6, silver: 6 },
    stones: {
        Ametyst: 47,
        KamienKsiezycowy: 36,
        KamienSloneczny: 36,
        Lolit: 38,
        KocieOkoTurkusowa: 23,
        KocieOkoFioletowa: 23,
        KocieOkoZielona: 23,
        KocieOkoSzary: 23,
        BialaMuszla: 40,
        AmetystLawendowy: 50,
        Sodalit: 29,
        OpalSyntetyczny: 24,
        ZielonaMasaPerlowa: 33,
        Fluoryt: 27,
        KoralNiebieski: 36
    },
    pendant: { sun: 5, moon: 5, random: 5 },
    clasp: { ring: 3, crab: 5 }
}

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
}


const showBackground = ["BialaMuszla"]
const metalColors = { gold: "#DAA520 ", silver: "#8C92AC " }

const selection = {
    color: "gold",
    stones: "Ametyst",
    pendant: "sun",
    clasp: "ring"
}

const canvas = document.getElementById("necklaceCanvas")
const ctx = canvas.getContext("2d")
const cache = {}

function getImage(src) {
    return new Promise((resolve, reject) => {
        if (cache[src]?.complete) return resolve(cache[src])
        const img = new Image()
        img.onload = () => { cache[src] = img; resolve(img) }
        img.onerror = reject
        img.src = src
    })
}

function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1) }

function colorToHex(category, value) {
    if (category === "color") return metalColors[value] || "#cccccc"
    if (category === "stones") return stoneColors[value] || "#ffffff"
    return "#ffffff"
}

async function drawTintedLayer(src, hexColor) {
    const img = await getImage(src)
    const off = document.createElement("canvas")
    off.width = canvas.width
    off.height = canvas.height
    const octx = off.getContext("2d")

    octx.drawImage(img, 0, 0, off.width, off.height)
    octx.globalCompositeOperation = "source-atop"
    octx.fillStyle = hexColor
    octx.fillRect(0, 0, off.width, off.height)
    octx.globalCompositeOperation = "source-over"

    ctx.drawImage(off, 0, 0)
}

async function updatePreview() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const layers = [
        { src: "img/beads.png", colorCategory: "stones" },
        { src: "img/metalBeads.png", colorCategory: "color" },
        { src: `img/clasp${capitalize(selection.clasp)}.png`, colorCategory: "color" },
        { src: `img/pendant${capitalize(selection.pendant)}.png`, colorCategory: "color" }
    ]

    for (const layer of layers) {
        const color = colorToHex(layer.colorCategory, selection[layer.colorCategory])
        await drawTintedLayer(layer.src, color)
    }
}

function selectOption(category, value, ev) {
    selection[category] = value

    document.querySelectorAll(`.option-button[onclick*="${category}"]`)
        .forEach(btn => btn.classList.remove("selected"))
    if (ev?.target) {
        const btn = ev.target.closest('.option-button')
        if (btn) btn.classList.add("selected")
    }

    updatePreview()
    updatePriceSummary()
    if (category === "stones") {
        updateStonePreview()
    }
}

function copySelection() {
    const text = Object.entries(selection).map(([k, v]) => `${k}: ${v}`).join("\n")
    navigator.clipboard.writeText(text)

    const btn = document.querySelector('.copy-button')
    btn.textContent = '✅ Skopiowano!'
    setTimeout(() => {
        btn.textContent = '📋 Kopiuj wybór'
    }, 2000)
}

function updateStonePreview() {
    const previewDiv = document.querySelector(".preview")
    const stoneName = selection.stones

    const existing = document.getElementById("stone-preview-image")
    if (existing) existing.remove()

    const img = document.createElement("img")
    img.id = "stone-preview-image"
    img.className = "stone-preview"
    img.src = `img/${stoneName}.png`
    img.alt = stoneName

    previewDiv.appendChild(img)
    requestAnimationFrame(() => (img.style.opacity = "1"))
}

function formatPLN(v) {
    return `${v} zł`
}

function initPriceTags() {
    const rx = /selectOption\('([^']+)'\s*,\s*'([^']+)'/

    document.querySelectorAll('.option-button').forEach(btn => {
        const on = btn.getAttribute('onclick')
        if (!on) return

        const m = on.match(rx)
        if (!m) return

        const category = m[1]   // 'color' | 'stones' | 'pendant' | 'clasp'
        const value = m[2]   // np. 'Ametyst', 'gold', 'ring'...

        const categoryPrices = prices[category]
        if (!categoryPrices) return

        const price = categoryPrices[value]
        if (price == null) return

        let tag = btn.querySelector('.price-tag')
        if (!tag) {
            tag = document.createElement('span')
            tag.className = 'price-tag'
            btn.appendChild(tag)
        }
        tag.textContent = formatPLN(price)
    })
}

function updatePriceSummary() {
    const c = prices.color[selection.color] ?? 0
    const s = prices.stones[selection.stones] ?? 0
    const p = prices.pendant[selection.pendant] ?? 0
    const cl = prices.clasp[selection.clasp] ?? 0
    const total = c + s + p + cl

    document.getElementById('price-total').textContent = formatPLN(total)
}

initPriceTags()
updatePreview()
updateStonePreview()
updatePriceSummary()

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