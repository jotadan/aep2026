        document.addEventListener('DOMContentLoaded', function() {

            const html = document.documentElement;

            // ============================================
            // ANIMATED COUNTERS
            // ============================================
            const counters = document.querySelectorAll('.stat-num[data-target]');

            const animateCounter = (el) => {
                const target = parseInt(el.dataset.target);
                const suffix = el.dataset.suffix || '';
                const duration = 1500;
                const step = target / (duration / 16);
                let current = 0;

                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        el.textContent = target.toLocaleString('pt-BR') + suffix;
                        clearInterval(timer);
                    } else {
                        el.textContent = Math.floor(current).toLocaleString('pt-BR') + suffix;
                    }
                }, 16);
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            counters.forEach(counter => observer.observe(counter));

            // ============================================
            // WELCOME TOAST
            // ============================================
            setTimeout(() => {
                showToast('Locais de coleta carregados! 🗺️', 'success');
            }, 1000);

            // ============================================
            // LEAFLET MAP
            // ============================================
            const limitesMaringa = L.latLngBounds(
                [-23.58, -52.08],
                [-23.28, -51.78]
            );
            const centroMaringa = [-23.4273, -51.9375];

            const map = L.map('mapa-real', {
                center: centroMaringa,
                zoom: 13,
                maxBounds: limitesMaringa,
                maxBoundsViscosity: 1.0,
                minZoom: 11,
                maxZoom: 18,
                zoomControl: false,
                attributionControl: false
            });

            // Tile layer with conditional dark mode
            const lightTiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

            let currentTiles = L.tileLayer(lightTiles, {
                maxZoom: 19,
                attribution: '© OpenStreetMap'
            }).addTo(map);

            // Dark mode observer for map tiles
            const darkObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const isDark = html.classList.contains('dark');
                        currentTiles.remove();
                        currentTiles = L.tileLayer(isDark ? darkTiles : lightTiles, {
                            maxZoom: 19,
                            attribution: '© OpenStreetMap / CARTO'
                        }).addTo(map);
                    }
                });
            });
            darkObserver.observe(html, { attributes: true });

            L.control.attribution({position: 'bottomright', prefix: false}).addTo(map);

            // ============================================
            // MAP MARKERS
            // ============================================
            const locais = [
                {
                    lat: -23.4020,
                    lng: -51.9250,
                    nome: 'Ecoponto Zona 07',
                    endereco: 'Av. Colombo, 3042 - Zona 07',
                    horario: 'Seg a Sáb: 8h às 18h',
                    tipo: 'verde',
                    categoria: 'entulho',
                    icone: 'bi-shop'
                },
                {
                    lat: -23.4150,
                    lng: -51.9380,
                    nome: 'Ponto de Entrega Voluntária - PEV',
                    endereco: 'R. Pioneiro Antônio França de Moraes, 500 - Zona 02',
                    horario: 'Seg a Sáb: 7h às 17h',
                    tipo: 'azul',
                    categoria: 'reciclaveis',
                    icone: 'bi-recycle'
                },
                {
                    lat: -23.4149,
                    lng: -51.9549,
                    nome: 'Coleta Seletiva - Mandacaru',
                    endereco: 'Av. Mandacaru, 200 - Zona 01',
                    horario: 'Seg a Sáb: 8h às 17h',
                    tipo: 'laranja',
                    categoria: 'reciclaveis',
                    icone: 'bi-recycle'
                },
                {
                    lat: -23.4272,
                    lng: -51.9115,
                    nome: 'Ecoponto Zona 05',
                    endereco: 'Av. Brasil, 1000 - Zona 05',
                    horario: 'Seg a Sáb: 8h às 18h',
                    tipo: 'verde',
                    categoria: 'entulho',
                    icone: 'bi-shop'
                },
                {
                    lat: -23.4350,
                    lng: -51.9420,
                    nome: 'Central de Resíduos Perigosos',
                    endereco: 'R. Industrial, 300 - Zona 03',
                    horario: 'Seg a Sáb: 8h às 16h',
                    tipo: 'vermelho',
                    categoria: 'perigosos',
                    icone: 'bi-exclamation-triangle'
                }
            ];

            const markers = {};

            locais.forEach((local, index) => {
                const iconeHtml = `<div class="custom-marker marker-${local.tipo}"><i class="bi ${local.icone}"></i></div>`;

                const iconePersonalizado = L.divIcon({
                    html: iconeHtml,
                    className: '',
                    iconSize: [36, 36],
                    iconAnchor: [18, 36],
                    popupAnchor: [0, -36]
                });

                const marker = L.marker([local.lat, local.lng], { icon: iconePersonalizado }).addTo(map);

                const popupContent = `
                    <div style="min-width: 220px;">
                        <h6 style="margin-bottom: 6px; font-weight: 700; font-size: 0.95em; color: var(--color-text-primary);">${local.nome}</h6>
                        <p style="margin-bottom: 4px; font-size: 0.82em; color: var(--color-text-secondary);">
                            <i class="bi bi-geo-alt" style="color: var(--color-primary);"></i> ${local.endereco}
                        </p>
                        <p style="margin-bottom: 0; font-size: 0.8em; color: var(--color-text-muted);">
                            <i class="bi bi-clock" style="color: var(--color-primary);"></i> ${local.horario}
                        </p>
                    </div>
                `;

                marker.bindPopup(popupContent, {
                    closeButton: false,
                    offset: [0, -10]
                });
                markers[index] = marker;
            });

            // Fit bounds to show all markers
            const grupoMarcadores = L.featureGroup(Object.values(markers));
            map.fitBounds(grupoMarcadores.getBounds().pad(0.15));

            // Reset map button
            document.getElementById('resetMap').addEventListener('click', () => {
                map.flyTo(centroMaringa, 13, { duration: 1.5 });
                setTimeout(() => {
                    map.fitBounds(grupoMarcadores.getBounds().pad(0.15), { animate: true, duration: 1 });
                }, 1600);
            });

            // ============================================
            // LIST <-> MAP INTERACTION
            // ============================================
            const itensLista = document.querySelectorAll('.local-item');

            itensLista.forEach((item, index) => {
                item.style.cursor = 'pointer';

                item.addEventListener('click', function() {
                    const lat = parseFloat(this.dataset.lat);
                    const lng = parseFloat(this.dataset.lng);

                    // Remove active from all
                    itensLista.forEach(i => i.classList.remove('ativo'));
                    this.classList.add('ativo');

                    // Fly to location
                    map.flyTo([lat, lng], 16, { duration: 1.2 });

                    // Open popup with delay
                    if (markers[index]) {
                        setTimeout(() => {
                            markers[index].openPopup();
                            // Bounce effect
                            const pin = markers[index].getElement();
                            if (pin) {
                                pin.style.transform += ' translateY(-8px)';
                                setTimeout(() => {
                                    pin.style.transform = pin.style.transform.replace(' translateY(-8px)', '');
                                }, 300);
                            }
                        }, 800);
                    }
                });

                // Hover effects
                item.addEventListener('mouseenter', () => {
                    if (markers[index]) {
                        markers[index].setZIndexOffset(1000);
                        const el = markers[index].getElement();
                        if (el) el.style.transform += ' scale(1.2)';
                    }
                });

                item.addEventListener('mouseleave', () => {
                    if (markers[index]) {
                        markers[index].setZIndexOffset(0);
                        const el = markers[index].getElement();
                        if (el) el.style.transform = el.style.transform.replace(' scale(1.2)', '');
                    }
                });
            });

            // ============================================
            // FILTRO POR TIPO DE RESÍDUO
            // ============================================
            const botoesFiltro = document.querySelectorAll('.filter-btn');

            botoesFiltro.forEach(botao => {
                botao.addEventListener('click', function() {
                    const tipoFiltro = this.dataset.tipo;

                    // Atualiza botão ativo
                    botoesFiltro.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');

                    // Filtra itens da lista
                    itensLista.forEach((item, index) => {
                        const categoriaItem = item.dataset.tipo;

                        if (tipoFiltro === 'todos' || categoriaItem === tipoFiltro) {
                            item.style.display = 'flex';
                            if (markers[index]) markers[index].addTo(map);
                        } else {
                            item.style.display = 'none';
                            if (markers[index]) map.removeLayer(markers[index]);
                        }
                    });

                    // Refit bounds after filter
                    setTimeout(() => {
                        const visibleMarkers = Object.values(markers).filter(m => map.hasLayer(m));
                        if (visibleMarkers.length > 0) {
                            const group = L.featureGroup(visibleMarkers);
                            map.fitBounds(group.getBounds().pad(0.15));
                        }
                    }, 100);

                    showToast(`Filtro aplicado: ${this.textContent.trim()}`, 'info');
                });
            });

            // ============================================
            // SEARCH FILTER
            // ============================================
            const searchInput = document.getElementById('searchLocais');
            searchInput.addEventListener('input', function() {
                const term = this.value.toLowerCase();

                itensLista.forEach((item, index) => {
                    const nome = item.querySelector('.local-nome').textContent.toLowerCase();
                    const endereco = item.querySelector('.local-endereco').textContent.toLowerCase();

                    if (nome.includes(term) || endereco.includes(term)) {
                        item.style.display = 'flex';
                        if (markers[index]) markers[index].addTo(map);
                    } else {
                        item.style.display = 'none';
                        if (markers[index]) map.removeLayer(markers[index]);
                    }
                });
            });

            // ============================================
            // BOTÃO "MINHA LOCALIZAÇÃO"
            // ============================================
            L.control.locate = L.Control.extend({
                onAdd: function(map) {
                    const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control');
                    btn.innerHTML = '<i class="bi bi-geo-alt-fill" style="color:#0d6efd;"></i>';
                    btn.title = 'Minha localização';
                    btn.style.cssText = 'width:34px;height:34px;font-size:18px;cursor:pointer;background:white;border:2px solid rgba(0,0,0,0.2);border-radius:4px;display:flex;align-items:center;justify-content:center;';

                    btn.onclick = function() {
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(pos => {
                                const lat = pos.coords.latitude;
                                const lng = pos.coords.longitude;
                                map.flyTo([lat, lng], 15);
                                L.circleMarker([lat, lng], {
                                    radius: 8,
                                    fillColor: '#0d6efd',
                                    color: '#fff',
                                    weight: 2,
                                    opacity: 1,
                                    fillOpacity: 0.8
                                }).addTo(map).bindPopup('Você está aqui!').openPopup();
                                showToast('Localização encontrada!', 'success');
                            }, () => {
                                showToast('Não foi possível obter sua localização', 'warning');
                            });
                        }
                    };
                    return btn;
                }
            });

            new L.control.locate({ position: 'topright' }).addTo(map);

        });
