// --- 1. INIZIALIZZAZIONE MAPPA ---
const map = L.map('mappa').setView([40.416, 15.735], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// --- 2. DEFINIZIONE RISORSE E FUOCO ---
const fuoco = {
    lat: 40.425, lng: 15.755,
    marker: L.marker([40.425, 15.755], { 
        icon: L.divIcon({ className: 'icona-personalizzata', html: '🔥' }) 
    }).addTo(map).bindPopup('Incendio Boschivo')
};

const risorse = [
    { id: 'DOS', nome: 'DOS', tipo: 'Comando', icona: '⛺', lat: 40.390, lng: 15.730, stato: 'attivo' },
    { id: 'VVF1', nome: 'Vigili del Fuoco', tipo: 'Torre', icona: '🚒', lat: 40.410, lng: 15.710, stato: 'inattivo' },
    { id: 'CDB1', nome: 'Consorzio Bonifica', tipo: 'Genio', icona: '🚜', lat: 40.440, lng: 15.730, stato: 'inattivo' },
    { id: 'VOL1', nome: 'Volontariato', tipo: 'Alfiere', icona: '🚙', lat: 40.400, lng: 15.760, stato: 'inattivo' },
    { id: 'ELR1', nome: 'Elicottero #1', tipo: 'Aereo', icona: '🚁', lat: 40.380, lng: 15.700, stato: 'inattivo' },
    { id: 'ELR2', nome: 'Elicottero #2', tipo: 'Aereo', icona: '🚁', lat: 40.375, lng: 15.705, stato: 'inattivo' },
    { id: 'CAN1', nome: 'Canadair (COAU)', tipo: 'Regina', icona: '✈️', lat: 40.350, lng: 15.680, stato: 'inattivo' }
];

// Aggiungiamo le risorse alla mappa e al pannello
const listaRisorseUI = document.getElementById('lista-risorse');
risorse.forEach(r => {
    // Crea il marker sulla mappa
    r.marker = L.marker([r.lat, r.lng], { 
        icon: L.divIcon({ className: 'icona-personalizzata', html: r.icona }) 
    }).addTo(map).bindPopup(r.nome);

    // Crea l'elemento nel pannello di controllo
    const li = document.createElement('li');
    li.innerHTML = `
        <span class="icona-risorsa">${r.icona}</span>
        <span class="nome-risorsa">${r.nome}</span>
        <span class="stato ${r.stato}" id="stato-${r.id}">${r.stato}</span>
    `;
    // Aggiungiamo un click per "allertare" la risorsa
    li.addEventListener('click', () => {
        if (r.stato === 'inattivo') {
            r.stato = 'allertato';
            document.getElementById(`stato-${r.id}`).className = 'stato allertato';
            document.getElementById(`stato-${r.id}`).textContent = 'allertato';
        }
    });
    listaRisorseUI.appendChild(li);
});

// --- 3. LOGICA DELLA SIMULAZIONE ---
const startBtn = document.getElementById('start-btn');
startBtn.addEventListener('click', () => {
    startBtn.textContent = 'TURNO SUCCESSIVO';
    turnoSimulazione();
});

function turnoSimulazione() {
    risorse.forEach(r => {
        // Muoviamo solo le risorse allertate o già attive (tranne il DOS)
        if ((r.stato === 'allertato' || r.stato === 'attivo') && r.tipo !== 'Comando') {
            
            // Una volta mosse, diventano attive
            r.stato = 'attivo';
            document.getElementById(`stato-${r.id}`).className = 'stato attivo';
            document.getElementById(`stato-${r.id}`).textContent = 'attivo';

            const passoBase = 0.002;
            let dx = fuoco.lng - r.lng;
            let dy = fuoco.lat - r.lat;

            // Logica di movimento personalizzata
            switch (r.tipo) {
                case 'Torre': // VVF: si muove su un asse alla volta, come lungo una strada
                    if (Math.abs(dx) > Math.abs(dy)) r.lng += Math.sign(dx) * passoBase;
                    else r.lat += Math.sign(dy) * passoBase;
                    break;
                case 'Alfiere': // Volontari: si muovono agilmente in diagonale
                    r.lng += Math.sign(dx) * passoBase * 0.7;
                    r.lat += Math.sign(dy) * passoBase * 0.7;
                    break;
                case 'Genio': // Consorzio: lento ma costante
                    r.lng += Math.sign(dx) * (passoBase * 0.5);
                    r.lat += Math.sign(dy) * (passoBase * 0.5);
                    break;
                case 'Aereo': // Elicotteri: veloci e diretti
                    r.lng += Math.sign(dx) * (passoBase * 1.5);
                    r.lat += Math.sign(dy) * (passoBase * 1.5);
                    break;
                case 'Regina': // Canadair: il più veloce di tutti
                    r.lng += Math.sign(dx) * (passoBase * 2.0);
                    r.lat += Math.sign(dy) * (passoBase * 2.0);
                    break;
            }
            // Aggiorna la posizione sulla mappa
            r.marker.setLatLng([r.lat, r.lng]);
        }
    });
}
