document.addEventListener('DOMContentLoaded', function() {
    const html = document.documentElement;

    const limitesMaringa = L.latLngBounds([-23.58, -52.08], [-23.28, -51.78]);
    const centroMaringa = [-23.4273, -51.9375];

    const map = L.map('mapa-real-mini', {
        center: centroMaringa,
        zoom: 12,
        maxBounds: limitesMaringa,
        maxBoundsViscosity: 1.0,
        minZoom: 11,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false
    });

    const lightTiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    let currentTiles = L.tileLayer(html.classList.contains('dark') ? darkTiles : lightTiles, { maxZoom: 19 }).addTo(map);

    new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                currentTiles.remove();
                currentTiles = L.tileLayer(html.classList.contains('dark') ? darkTiles : lightTiles, { maxZoom: 19 }).addTo(map);
            }
        });
    }).observe(html, { attributes: true });
    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

    function animarContador(el, alvo, sufixo) {
        const duracao = 1500;
        const passo = alvo / (duracao / 16);
        let atual = 0;
        const timer = setInterval(() => {
            atual += passo;
            if (atual >= alvo) {
                el.textContent = alvo.toLocaleString('pt-BR') + sufixo;
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(atual).toLocaleString('pt-BR') + sufixo;
            }
        }, 16);
    }

    function preencherEstatisticas(stats) {
        const mapaCards = {
            'verde': stats.total,
            'azul': stats.ativas,
            'amarelo': stats.concluidas,
            'roxo': stats.impacto_kg
        };
        Object.entries(mapaCards).forEach(([classe, valor]) => {
            const card = document.querySelector('.stat-card.' + classe + ' .stat-num');
            if (!card) return;
            const sufixo = card.dataset.suffix || '';
            animarContador(card, valor || 0, sufixo);
        });
    }

    function criarLinhaDenuncia(denuncia, indice) {
        const linha = document.createElement('div');
        linha.className = 'denuncia-row d-flex align-items-center gap-3';
        linha.dataset.index = indice;
        if (denuncia.latitude != null) linha.dataset.lat = denuncia.latitude;
        if (denuncia.longitude != null) linha.dataset.lng = denuncia.longitude;
        linha.style.cursor = 'pointer';
        const imagem = denuncia.foto ? '/static/' + denuncia.foto : '/static/imagens/leaf.svg';
        linha.innerHTML = `
            <img src="${imagem}" class="denuncia-thumb" alt="${denuncia.assunto}">
            <div class="denuncia-info flex-fill">
                <div class="denuncia-cat">${denuncia.assunto}</div>
                <div class="denuncia-end"><i class="bi bi-geo-alt me-1"></i>${denuncia.endereco}</div>
            </div>
            <span class="badge-status" style="background:${denuncia.status_cor}1a;color:${denuncia.status_cor};border:1px solid ${denuncia.status_cor}33;">${denuncia.status_rotulo}</span>
            <span class="denuncia-data"><i class="bi bi-clock me-1"></i>${denuncia.data_envio}</span>
        `;
        return linha;
    }

    function adicionarMarcadores(denuncias) {
        const marcadores = [];
        denuncias.forEach((denuncia) => {
            if (denuncia.latitude == null || denuncia.longitude == null) return;
            const icone = L.divIcon({
                html: `<div class="custom-pin" style="color:${denuncia.status_cor};"><i class="bi bi-geo-alt-fill"></i></div>`,
                className: '',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });
            const marcador = L.marker([denuncia.latitude, denuncia.longitude], { icon: icone }).addTo(map);
            marcador.bindPopup(`
                <div style="min-width: 200px;">
                    <h6 style="margin-bottom: 6px; font-weight: 700;">${denuncia.assunto}</h6>
                    <p style="margin-bottom: 4px; font-size: 0.82em;"><i class="bi bi-geo-alt"></i> ${denuncia.endereco}</p>
                    <span style="font-size:0.75em;color:${denuncia.status_cor};font-weight:600;">${denuncia.status_rotulo} — ${denuncia.data_envio}</span>
                </div>
            `, { closeButton: false, offset: [0, -10] });
            marcadores.push(marcador);
        });
        if (marcadores.length) {
            const grupo = L.featureGroup(marcadores);
            map.fitBounds(grupo.getBounds().pad(0.2));
            const botaoReset = document.getElementById('resetMap');
            if (botaoReset) {
                botaoReset.addEventListener('click', () => {
                    map.flyTo(centroMaringa, 12, { duration: 1.2 });
                    setTimeout(() => map.fitBounds(grupo.getBounds().pad(0.2)), 1300);
                });
            }
        } else {
            map.setView(centroMaringa, 12);
        }
        return marcadores;
    }

    function conectarListaComMapa(marcadores) {
        const itens = document.querySelectorAll('.denuncia-row');
        itens.forEach((item) => {
            item.addEventListener('click', function() {
                const indice = parseInt(this.dataset.index);
                const lat = parseFloat(this.dataset.lat);
                const lng = parseFloat(this.dataset.lng);
                itens.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                if (!isNaN(lat) && !isNaN(lng)) {
                    map.flyTo([lat, lng], 16, { duration: 1.2 });
                    if (marcadores[indice]) setTimeout(() => marcadores[indice].openPopup(), 800);
                }
            });
        });
    }

    fetch('/api/estatisticas')
        .then(r => r.json())
        .then(preencherEstatisticas)
        .catch(() => {});

    fetch('/api/denuncias')
        .then(r => r.json())
        .then((denuncias) => {
            const recentes = denuncias.slice().reverse();
            const lista = document.querySelector('.denuncia-lista');
            if (lista) {
                lista.innerHTML = '';
                if (recentes.length === 0) {
                    lista.innerHTML = '<p class="text-muted text-center py-4">Você ainda não fez nenhuma denúncia.</p>';
                } else {
                    recentes.slice(0, 6).forEach((denuncia, indice) => {
                        lista.appendChild(criarLinhaDenuncia(denuncia, indice));
                    });
                }
            }
            const marcadores = adicionarMarcadores(recentes.slice(0, 6));
            conectarListaComMapa(marcadores);
        })
        .catch(() => { map.setView(centroMaringa, 12); });
});
