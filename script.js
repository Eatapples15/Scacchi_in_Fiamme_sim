// --- 1. INIZIALIZZAZIONE MAPPA E STATO ---
const map = L.map('mappa').setView([40.55, 16.10], 9); // Vista più ampia sulla Basilicata
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let statoSimulazione = {
    incendi: [
        { id: 1, nome: 'Incendio Gallipoli Cognato', lat: 40.52, lng: 16.13, severita: 10, marker: null, li: null },
        { id: 2, nome: 'Incendio Val d\'Agri', lat: 40.35, lng: 15.82, severita: 8, marker: null, li: null }
    ],
    risorse: [
        { id: 'VVF_PZ', nome: 'VVF Potenza', tipo: 'Torre', icona: '🚒', base_lat: 40.63, base_lng: 15.80, lat: 40.63, lng: 15.80, stato: 'disponibile', incendio_id: null, marker: null },
        { id: 'VVF_MT', nome: 'VVF Matera', tipo: 'Torre', icona: '🚒', base_lat: 40.66, base_lng: 16.60, lat: 40.66, lng: 16.60, stato: 'disponibile', incendio_id: null, marker: null },
        { id: 'ODV_TR', nome: 'ODV Tricarico', tipo: 'Alfiere', icona: '🚙', base_lat: 40.61, base_lng: 16.14, lat: 40.61, lng: 16.14, stato: 'disponibile', incendio_id: null, marker: null },
        { id: 'CB_BR', nome: 'Cons. Bonifica Bradano', tipo: 'Genio', icona: '🚜', base_lat: 40.48, base_lng: 16.42, lat: 40.48, lng: 16.42, stato: 'disponibile', incendio_id: null, marker: null },
        { id: 'ELR1', nome: 'Elicottero Regione', tipo: 'Aereo', icona: '🚁', base_lat: 40.63, base_lng: 15.80, lat: 40.63, lng: 15.80, stato: 'disponibile', incendio_id: null, marker: null }
    ],
    incendioSelezionatoId: null
};

// --- 2. FUNZIONI DI RENDER E AGGIORNAMENTO UI ---
const listaIncendiUI = document.getElementById('lista-incendi');
const dettaglioSelezioneUI = document.getElementById('dettaglio-selezione');

function renderPannello() {
    // Render lista incendi
    listaIncendiUI.innerHTML = '';
    statoSimulazione.incendi.forEach(incendio => {
        const li = document.createElement('li');
        li.className = 'elemento-lista';
        li.innerHTML = `<span class="nome-elemento">🔥 ${incendio.nome}</span>`;
        if (incendio.id === statoSimulazione.incendioSelezionatoId) {
            li.classList.add('selezionato');
        }
        li.addEventListener('click', () => selezionaIncendio(incendio.id));
        incendio.li = li;
        listaIncendiUI.appendChild(li);
    });

    // Render pannello dettagli
    if (!statoSimulazione.incendioSelezionatoId) {
        dettaglioSelezioneUI.innerHTML = '<p>Seleziona un incendio per assegnare le risorse.</p>';
        return;
    }

    const incendio = statoSimulazione.incendi.find(i => i.id === statoSimulazione.incendioSelezionatoId);
    let htmlDettaglio = `<h3>Assegnazione per: ${incendio.nome}</h3><ul>`;

    statoSimulazione.risorse.forEach(r => {
        let disabled = '';
        let buttonText = 'Assegna';
        if (r.incendio_id) { // Se la risorsa è già assegnata
            disabled = 'disabled';
            buttonText = r.incendio_id === incendio.id ? 'Assegnata' : 'Occupata';
        }

        htmlDettaglio += `
            <li class="elemento-lista">
                <span>${r.icona} ${r.nome}</span>
                <button class="btn-assegna" onclick="assegnaRisorsa(${incendio.id}, '${r.id}')" ${disabled}>
                    ${buttonText}
                </button>
            </li>`;
    });
    htmlDettaglio += `</ul>`;
    dettaglioSelezioneUI.innerHTML = htmlDettaglio;
}

function selezionaIncendio(id) {
    statoSimulazione.incendioSelezionatoId = id;
    map.panTo(statoSimulazione.incendi.find(i => i.id === id).marker.getLatLng());
    renderPannello();
}

function assegnaRisorsa(incendioId, risorsaId) {
    const risorsa = statoSimulazione.risorse.find(r => r.id === risorsaId);
    if (risorsa && risorsa.stato === 'disponibile') {
        risorsa.incendio_id = incendioId;
        risorsa.stato = 'in_transito';
        console.log(`Risorsa ${risorsa.nome} assegnata all'incendio ${incendioId}`);
        renderPannello();
    }
}

// --- 3. CREAZIONE MARKER SULLA MAPPA ---
function inizializzaMappa() {
    // Marker incendi
    statoSimulazione.incendi.forEach(incendio => {
        incendio.marker = L.marker([incendio.lat, incendio.lng], { 
            icon: L.divIcon({ className: 'icona-personalizzata', html: '🔥' })
        }).addTo(map).bindPopup(incendio.nome);
        incendio.marker.on('click', () => selezionaIncendio(incendio.id));
    });

    // Marker risorse
    statoSimulazione.risorse.forEach(r => {
        r.marker = L.marker([r.lat, r.lng], {
            icon: L.divIcon({ className: 'icona-personalizzata', html: r.icona })
        }).addTo(map).bindPopup(`${r.nome} (${r.stato})`);
    });
}

// --- 4. LOGICA DI SIMULAZIONE ---
document.getElementById('start-btn').addEventListener('click', () => {
    turnoSimulazione();
});

function turnoSimulazione() {
    statoSimulazione.risorse.forEach(r => {
        if (r.stato === 'in_transito' && r.incendio_id) {
            const incendioTarget = statoSimulazione.incendi.find(i => i.id === r.incendio_id);
            if (!incendioTarget) return;

            // Movimento verso l'obiettivo
            const passo = 0.03; // Movimento più rapido per simulazione
            let dx = incendioTarget.lng - r.lng;
            let dy = incendioTarget.lat - r.lat;
            let distanza = Math.sqrt(dx * dx + dy * dy);

            // Se è vicino, arriva e diventa operativo
            if (distanza < passo) {
                r.stato = 'operativo';
                r.marker.setLatLng([incendioTarget.lat, incendioTarget.lng]);
                r.marker.bindPopup(`${r.nome} (OPERATIVO su ${incendioTarget.nome})`).openPopup();
            } else { // Altrimenti continua a muoversi
                r.lat += (dy / distanza) * passo;
                r.lng += (dx / distanza) * passo;
                r.marker.setLatLng([r.lat, r.lng]);
            }
        }
    });
}

// --- 5. AVVIO ---
inizializzaMappa();
renderPannello();
