    document.addEventListener('DOMContentLoaded', function() {
        const html = document.documentElement;

        // ===== LEAFLET MAP =====
        const limitesMaringa = L.latLngBounds([-23.58, -52.08], [-23.28, -51.78]);
        const centroMaringa = [-23.4273, -51.9375];
        const map = L.map('mapa-denuncia', { center: centroMaringa, zoom: 13, maxBounds: limitesMaringa, maxBoundsViscosity: 1.0, minZoom: 11, maxZoom: 18, zoomControl: false, attributionControl: false });

        const lightTiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        let currentTiles = L.tileLayer(lightTiles, { maxZoom: 19 }).addTo(map);
        L.control.attribution({position: 'bottomright', prefix: false}).addTo(map);

        // Dark mode observer for map
        const darkObserver = new MutationObserver((mutations) => {
            mutations.forEach((m) => {
                if (m.type === 'attributes' && m.attributeName === 'class') {
                    const isDark = html.classList.contains('dark');
                    currentTiles.remove();
                    currentTiles = L.tileLayer(isDark ? darkTiles : lightTiles, { maxZoom: 19 }).addTo(map);
                }
            });
        });
        darkObserver.observe(html, { attributes: true });

        // Zoom control custom position
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // ===== MARKER =====
        let marcadorAtual = null;
        let coordenadasSelecionadas = null;
        const iconeMarcador = L.divIcon({ html: '<div class="marcador-denuncia"><i class="bi bi-exclamation-lg"></i></div>', className: '', iconSize: [40, 40], iconAnchor: [20, 40] });

        function adicionarMarcador(lat, lng) {
            if (marcadorAtual) map.removeLayer(marcadorAtual);
            marcadorAtual = L.marker([lat, lng], { icon: iconeMarcador, draggable: true }).addTo(map);
            coordenadasSelecionadas = { lat, lng };
            document.getElementById('texto-coordenadas').textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            document.getElementById('endereco-selecionado').classList.add('mostrar');
            marcadorAtual.on('dragend', function(e) {
                const pos = e.target.getLatLng();
                coordenadasSelecionadas = { lat: pos.lat, lng: pos.lng };
                document.getElementById('texto-coordenadas').textContent = `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`;
                buscarEnderecoReverse(pos.lat, pos.lng);
            });
        }

        map.on('click', function(e) {
            const lat = e.latlng.lat, lng = e.latlng.lng;
            adicionarMarcador(lat, lng);
            buscarEnderecoReverse(lat, lng);
            showToast('Local marcado! Arraste para ajustar.', 'success');
        });

        // ===== GEOLOCATION =====
        document.getElementById('btn-usar-local').addEventListener('click', function() {
            if (!navigator.geolocation) { showToast('Geolocalização não suportada.', 'danger'); return; }
            const btn = this;
            btn.innerHTML = '<i class="bi bi-arrow-repeat spin"></i> Obtendo localização...';
            navigator.geolocation.getCurrentPosition(
                function(pos) {
                    const lat = pos.coords.latitude, lng = pos.coords.longitude;
                    map.flyTo([lat, lng], 16, { duration: 1.5 });
                    setTimeout(() => { adicionarMarcador(lat, lng); buscarEnderecoReverse(lat, lng); showToast('Localização obtida com sucesso!', 'success'); }, 1500);
                    btn.innerHTML = '<i class="bi bi-crosshair"></i>Usar minha localização';
                },
                function() { showToast('Não foi possível obter sua localização.', 'danger'); btn.innerHTML = '<i class="bi bi-crosshair"></i>Usar minha localização'; }
            );
        });

        // ===== ADDRESS SEARCH =====
        const inputBusca = document.getElementById('busca-endereco');
        const divResultados = document.getElementById('resultados-busca');
        let timeoutBusca = null;

        inputBusca.addEventListener('input', function() {
            clearTimeout(timeoutBusca);
            const query = this.value.trim();
            if (query.length < 3) { divResultados.classList.remove('mostrar'); return; }
            timeoutBusca = setTimeout(() => buscarEndereco(query), 500);
        });

        document.addEventListener('click', function(e) { if (!e.target.closest('.search-box-hero')) divResultados.classList.remove('mostrar'); });

        async function buscarEndereco(query) {
            try {
                const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Maringá, Paraná, Brasil')}&bounded=1&viewbox=-52.08,-23.28,-51.78,-23.58`;
                const response = await fetch(url);
                const data = await response.json();
                divResultados.innerHTML = '';
                if (data.length === 0) { divResultados.innerHTML = '<div class="resultado-item text-muted"><i class="bi bi-search"></i>Nenhum resultado encontrado em Maringá</div>'; divResultados.classList.add('mostrar'); return; }
                data.slice(0, 5).forEach(result => {
                    const item = document.createElement('div');
                    item.className = 'resultado-item';
                    item.innerHTML = `<i class="bi bi-geo-alt"></i><span>${result.display_name}</span>`;
                    item.addEventListener('click', function() {
                        const lat = parseFloat(result.lat), lng = parseFloat(result.lon);
                        map.flyTo([lat, lng], 17, { duration: 1.2 });
                        setTimeout(() => { adicionarMarcador(lat, lng); }, 1200);
                        document.getElementById('texto-endereco').textContent = result.display_name;
                        divResultados.classList.remove('mostrar');
                        inputBusca.value = result.display_name.split(',')[0];
                        showToast('Endereço localizado!', 'success');
                    });
                    divResultados.appendChild(item);
                });
                divResultados.classList.add('mostrar');
            } catch (error) { console.error('Erro na busca:', error); }
        }

        async function buscarEnderecoReverse(lat, lng) {
            try {
                const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
                const response = await fetch(url);
                const data = await response.json();
                if (data.display_name) {
                    const enderecoCurto = data.display_name.split(',').slice(0, 3).join(', ');
                    document.getElementById('texto-endereco').textContent = enderecoCurto;
                }
            } catch (error) { console.error('Erro no reverse geocoding:', error); }
        }

        // ===== NEXT BUTTON =====
        document.getElementById('btn-proximo').addEventListener('click', function() {
            if (!coordenadasSelecionadas) { showToast('Por favor, selecione um local no mapa.', 'warning'); map.getContainer().style.boxShadow = '0 0 0 3px var(--color-warning-glow)'; setTimeout(() => map.getContainer().style.boxShadow = '', 1000); return; }
            localStorage.setItem('denuncia_lat', coordenadasSelecionadas.lat);
            localStorage.setItem('denuncia_lng', coordenadasSelecionadas.lng);
            localStorage.setItem('denuncia_endereco', document.getElementById('texto-endereco').textContent);
            showToast('Localização salva! Redirecionando...', 'success');
            setTimeout(() => window.location.href = '/nova-denuncia/categoria', 800);
        });

        // ===== SPIN ANIMATION =====
        const spinStyle = document.createElement('style');
        spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; display: inline-block; }';
        document.head.appendChild(spinStyle);
    });
