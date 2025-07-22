// --- 1. INIZIALIZZAZIONE MAPPA ---
// Centriamo la mappa su un'area del Parco Nazionale dell'Appennino Lucano
const map = L.map('mappa').setView([40.416, 15.735], 13);

// Aggiungiamo uno sfondo realistico (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// --- 2. DEFINIZIONE PEZZI E FUOCO ---
// Usiamo le emoji come icone per semplicità. 
// Ogni "pezzo" è un oggetto con le sue proprietà.

const fuoco = {
    lat: 40.420,
    lng: 15.740,
    raggio: 50, // Raggio in metri
    marker: null,
    icon: L.divIcon({ className: 'icona-personalizzata', html: '🔥' })
};

const pezzi = [
    { tipo: 'Torre', lat: 40.430, lng: 15.740, marker: null, icon: L.divIcon({ className: 'icona-personalizzata', html: '🚒' }) },
    { tipo: 'Alfiere', lat: 40.430, lng: 15.725, marker: null, icon: L.divIcon({ className: 'icona-personalizzata', html: '🚙' }) },
    { tipo: 'Regina', lat: 40.410, lng: 15.720, marker: null, icon: L.divIcon({ className: 'icona-personalizzata', html: '🚁' }) }
];

// --- 3. POSIZIONAMENTO SULLA MAPPA ---
// Posizioniamo il fuoco
fuoco.marker = L.marker([fuoco.lat, fuoco.lng], { icon: fuoco.icon }).addTo(map)
    .bindPopup('Fronte del Fuoco');

// Posizioniamo i pezzi
pezzi.forEach(pezzo => {
    pezzo.marker = L.marker([pezzo.lat, pezzo.lng], { icon: pezzo.icon }).addTo(map)
        .bindPopup(pezzo.tipo);
});


// --- 4. LOGICA DELLA SIMULAZIONE ---
let simulazioneAttiva = false;
const startBtn = document.getElementById('start-btn');

startBtn.addEventListener('click', () => {
    if (simulazioneAttiva) return; // Evita di avviare più simulazioni
    simulazioneAttiva = true;
    startBtn.disabled = true;
    startBtn.textContent = 'Simulazione in corso...';
    
    // Avviamo un "turno" di simulazione ogni 2 secondi
    setInterval(turnoSimulazione, 2000);
});

function turnoSimulazione() {
    // Logica di base per il movimento dei pezzi verso il fuoco
    pezzi.forEach(pezzo => {
        const passo = 0.0005; // Di quanto si muove ogni pezzo per turno
        
        let dx = fuoco.lng - pezzo.lng;
        let dy = fuoco.lat - pezzo.lat;

        // Movimento della Torre (solo su un asse alla volta)
        if (pezzo.tipo === 'Torre') {
            if (Math.abs(dx) > Math.abs(dy)) {
                pezzo.lng += Math.sign(dx) * passo;
            } else {
                pezzo.lat += Math.sign(dy) * passo;
            }
        } 
        // Movimento dell'Alfiere e della Regina (diretto)
        else {
            pezzo.lng += Math.sign(dx) * passo;
            pezzo.lat += Math.sign(dy) * passo;
        }

        // Aggiorniamo la posizione del marker sulla mappa
        pezzo.marker.setLatLng([pezzo.lat, pezzo.lng]);
    });

    // Simuliamo l'espansione del fuoco aumentando leggermente l'opacità
    // (una vera espansione del raggio sarebbe più complessa)
    let opacitaCorrente = fuoco.marker.getElement().style.opacity || 1;
    if (opacitaCorrente > 0.6) {
        fuoco.marker.getElement().style.opacity = opacitaCorrente - 0.05;
    }
}
