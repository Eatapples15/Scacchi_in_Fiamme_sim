// --- 1. SETUP INIZIALE ---
const map = L.map('mappa').setView([40.45, 16.05], 9); // Vista sulla Basilicata
L.tileLayer('https://{s}.tile.jawg.io/jawg-terrain/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
    attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	accessToken: 'JAWG_MAPS_ACCESS_TOKEN' // Inserisci una chiave Jawg o usa un altro tile layer
}).addTo(map);

const statoPartita = {
    turno: 0,
    incendi: [
        { id: 1, nome: 'Parco del Pollino', lat: 40.05, lng: 16.18, severita: 100, marker: null },
        { id: 2, nome: 'Foresta di Accettura', lat: 40.49, lng: 16.15, severita: 80, marker: null },
        { id: 3, nome: 'Area del Vulture', lat: 40.95, lng: 15.63, severita: 120, marker: null }
    ],
    risorse: [
        // PROVINCIA DI POTENZA
        { id: 'DOS_PZ', nome: 'DOS Potenza', tipo: 'Re', icona: '♔', potenza: 0, base_lat: 40.63, base_lng: 15.80, stato: 'disponibile', incendio_id: null },
        { id: 'VVF_PZ', nome: 'VVF Potenza', tipo: 'Torre', icona: '♖', potenza: 15, base_lat: 40.63, base_lng: 15.80, stato: 'disponibile', incendio_id: null },
        { id: 'VVF_MF', nome: 'VVF Melfi', tipo: 'Torre', icona: '♖', potenza: 15, base_lat: 40.99, base_lng: 15.65, stato: 'disponibile', incendio_id: null },
        { id: 'VVF_LA', nome: 'VVF Lauria', tipo: 'Torre', icona: '♖', potenza: 12, base_lat: 40.04, base_lng: 15.83, stato: 'disponibile', incendio_id: null },
        { id: 'ODV_AV', nome: 'ODV Avigliano', tipo: 'Cavallo', icona: '♞', potenza: 8, base_lat: 40.73, base_lng: 15.71, stato: 'disponibile', incendio_id: null },
        { id: 'ODV_PC', nome: 'ODV Picerno', tipo: 'Cavallo', icona: '♞', potenza: 8, base_lat: 40.63, base_lng: 15.63, stato: 'disponibile', incendio_id: null },
        { id: 'ELR1', nome: 'Regina Lucana 1', tipo: 'Regina', icona: '♛', potenza: 25, base_lat: 40.63, base_lng: 15.80, stato: 'disponibile', incendio_id: null },
        // PROVINCIA DI MATERA
        { id: 'DOS_MT', nome: 'DOS Matera', tipo: 'Re', icona: '♔', potenza: 0, base_lat: 40.66, base_lng: 16.60, stato: 'disponibile', incendio_id: null },
        { id: 'VVF_MT', nome: 'VVF Matera', tipo: 'Torre', icona: '♖', potenza: 15, base_lat: 40.66, base_lng: 16.60, stato: 'disponibile', incendio_id: null },
        { id: 'VVF_PO', nome: 'VVF Policoro', tipo: 'Torre', icona: '♖', potenza: 12, base_lat: 40.21, base_lng: 16.67, stato: 'disponibile', incendio_id: null },
        { id: 'ODV_TR', nome: 'ODV Tricarico', tipo: 'Cavallo', icona: '♞', potenza: 9, base_lat: 40.61, base_lng: 16.14, stato: 'disponibile', incendio_id: null },
        { id: 'CB_BR', nome: 'Consorzio Bradano', tipo: 'Alfiere', icona: '♝', potenza: 10, base_lat: 40.48, base_lng: 16.42, stato: 'disponibile', incendio_id: null },
        { id: 'ELR2', nome: 'Regina Lucana 2', tipo: 'Regina', icona: '♛', potenza: 25, base_lat: 40.66, base_lng: 16.60, stato: 'disponibile', incendio_id: null }
    ],
    incendioSelezionatoId: null
};

// Copia le coordinate di base in quelle attuali all'inizio
statoPartita.risorse.forEach(r => { r.lat = r.base_lat; r.lng = r.base_lng; });

// --- 2. FUNZIONI UI ---
const listaIncendiUI = document.getElementById('lista-incendi');
const dettaglioSelezioneUI = document.getElementById('dettaglio-selezione');
const contatoreTurniUI = document.getElementById('contatore-turni');

function renderPannello() {
    contatoreTurniUI.textContent = `Turno: ${statoPartita.turno}`;
    listaIncendiUI.innerHTML = '';
    statoPartita.incendi.forEach(incendio => {
        const li = document.createElement('li');
        li.className = 'elemento-lista';
        let statoIncendio = `Severità: ${incendio.severita}`;
        if (incendio.severita <= 0) {
            li.style.backgroundColor = '#dff9fb';
            statoIncendio = 'ESTINTO';
        }
        li.innerHTML = `<span class="nome-elemento">🔥 ${incendio.nome}</span><span class="severita-incendio">${statoIncendio}</span>`;
        if (incendio.id === statoPartita.incendioSelezionatoId) li.classList.add('selezionato');
        li.addEventListener('click', () => selezionaIncendio(incendio.id));
        listaIncendiUI.appendChild(li);
    });

    if (!statoPartita.incendioSelezionatoId) {
        dettaglioSelezioneUI.innerHTML = '<p>Seleziona un incendio per schierare le tue forze.</p>';
        return;
    }

    const incendio = statoPartita.incendi.find(i => i.id === statoPartita.incendioSelezionatoId);
    let htmlDettaglio = `<h4>Risorse per: ${incendio.nome}</h4><ul>`;
    statoPartita.risorse.filter(r => r.tipo !== 'Re').forEach(r => {
        let disabled = '', buttonText = 'Schiera';
        if (r.incendio_id) {
            disabled = 'disabled';
            buttonText = r.incendio_id === incendio.id ? 'Assegnata' : 'Occupata';
        }
        if (incendio.severita <= 0) disabled = 'disabled';
        htmlDettaglio += `<li class="elemento-lista">
            <span>${r.icona} ${r.nome} (P:${r.potenza})</span>
            <button class="btn-assegna" onclick="assegnaRisorsa(${incendio.id}, '${r.id}')" ${disabled}>${buttonText}</button>
        </li>`;
    });
    dettaglioSelezioneUI.innerHTML = htmlDettaglio + `</ul>`;
}

// --- 3. LOGICA DI GIOCO ---
function selezionaIncendio(id) {
    statoPartita.incendioSelezionatoId = id;
    renderPannello();
}

function assegnaRisorsa(incendioId, risorsaId) {
    const risorsa = statoPartita.risorse.find(r => r.id === risorsaId);
    if (risorsa && risorsa.stato === 'disponibile') {
        risorsa.incendio_id = incendioId;
        risorsa.stato = 'in_transito';
        renderPannello();
    }
}

document.getElementById('start-btn').addEventListener('click', () => {
    statoPartita.turno++;
    turnoSimulazione();
    renderPannello();
});

function turnoSimulazione() {
    // A. Logica delle risorse
    statoPartita.risorse.forEach(r => {
        const incendioTarget = statoPartita.incendi.find(i => i.id === r.incendio_id);
        if (r.stato === 'in_transito' && incendioTarget) {
            // Movimento
            const passo = 0.10;
            let dx = incendioTarget.lng - r.lng;
            let dy = incendioTarget.lat - r.lat;
            let distanza = Math.sqrt(dx * dx + dy * dy);
            if (distanza < passo) {
                r.stato = 'operativo';
                r.marker.bindPopup(`${r.nome} (OPERATIVO)`).openPopup();
            } else {
                r.lat += (dy / distanza) * passo;
                r.lng += (dx / distanza) * passo;
            }
            r.marker.setLatLng([r.lat, r.lng]);
        }
        else if (r.stato === 'operativo' && incendioTarget) {
            // Azione ("Attacco" al fuoco)
            if(incendioTarget.severita > 0) {
                incendioTarget.severita -= r.potenza;
            }
        }
    });

    // B. Logica degli incendi
    statoPartita.incendi.forEach(incendio => {
        if (incendio.severita <= 0) {
            incendio.severita = 0;
            incendio.marker.setIcon(L.divIcon({ className: 'icona-personalizzata', html: '✅' }));
            // Libera le risorse assegnate a questo incendio
            statoPartita.risorse.filter(r => r.incendio_id === incendio.id).forEach(r => {
                r.stato = 'disponibile';
                r.incendio_id = null;
                // Optional: farle tornare alla base
            });
        } else {
            // Se nessun pezzo è operativo, il fuoco si espande
            const pezziOperativi = statoPartita.risorse.filter(r => r.incendio_id === incendio.id && r.stato === 'operativo').length;
            if (pezziOperativi === 0) {
                incendio.severita += 5; // Aumento di severità per turno
            }
        }
    });
}

// --- 4. INIZIALIZZAZIONE MAPPA ---
function inizializzaMappa() {
    statoPartita.incendi.forEach(incendio => {
        incendio.marker = L.marker([incendio.lat, incendio.lng], { icon: L.divIcon({ className: 'icona-personalizzata', html: '🔥' }) })
            .addTo(map).bindPopup(incendio.nome);
        incendio.marker.on('click', () => selezionaIncendio(incendio.id));
    });
    statoPartita.risorse.forEach(r => {
        r.marker = L.marker([r.lat, r.lng], { icon: L.divIcon({ className: 'icona-personalizzata', html: r.icona }) })
            .addTo(map).bindPopup(`${r.nome} (${r.stato})`);
    });
}

// --- AVVIO ---
inizializzaMappa();
renderPannello();
