document.addEventListener('DOMContentLoaded', function() {
    const html = document.documentElement;

    const lat = parseFloat(localStorage.getItem('denuncia_lat'));
    const lng = parseFloat(localStorage.getItem('denuncia_lng'));
    const endereco = localStorage.getItem('denuncia_endereco') || 'Endereço não encontrado';
    const categoria = localStorage.getItem('denuncia_categoria') || '';
    const categoriaRotulo = localStorage.getItem('denuncia_categoria_label') || 'Categoria não encontrada';
    const descricao = localStorage.getItem('denuncia_descricao') || 'Sem descrição';
    const data = localStorage.getItem('denuncia_data') || new Date().toISOString().split('T')[0];
    const volume = localStorage.getItem('denuncia_volume') || '';
    const fotos = JSON.parse(localStorage.getItem('denuncia_fotos') || '[]');

    const volumeLabels = { pequeno: 'Pequeno (até 1 saco)', medio: 'Médio (1 a 5 sacos)', grande: 'Grande (5 a 10 sacos)', muito_grande: 'Muito grande (mais de 10 sacos)' };

    document.getElementById('revEndereco').textContent = endereco;
    document.getElementById('revCoords').textContent = lat && lng ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : '---';
    document.getElementById('revCategoria').textContent = categoriaRotulo;
    document.getElementById('revDescricao').textContent = descricao;
    document.getElementById('revData').textContent = new Date(data).toLocaleDateString('pt-BR');
    document.getElementById('revVolume').textContent = volumeLabels[volume] || volume || 'Não informado';

    if (fotos.length > 0) {
        document.getElementById('revFotosSection').style.display = 'block';
        document.getElementById('revFotos').innerHTML = fotos.map(src => `
            <div class="photo-review-item"><img src="${src}" alt="Foto da denúncia"></div>
        `).join('');
    }

    const map = L.map('mapa-revisao', { zoomControl: false, attributionControl: false });
    const lightTiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    let currentTiles = L.tileLayer(lightTiles, { maxZoom: 19 }).addTo(map);

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

    if (lat && lng) {
        map.setView([lat, lng], 15);
        const icone = L.divIcon({
            html: '<div style="width:36px;height:36px;background:linear-gradient(135deg,#dc3545 0%,#b91c1c 100%);border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 14px rgba(220,53,69,0.35);border:3px solid white;display:flex;align-items:center;justify-content:center;"><i class="bi bi-exclamation-lg" style="transform:rotate(45deg);color:white;font-size:14px;"></i></div>',
            className: '', iconSize: [36, 36], iconAnchor: [18, 36]
        });
        L.marker([lat, lng], { icon: icone }).addTo(map);
    } else {
        map.setView([-23.4273, -51.9375], 12);
    }

    function dataUrlParaArquivo(dataUrl, nome) {
        const partes = dataUrl.split(',');
        const tipo = (partes[0].match(/:(.*?);/) || [])[1] || 'image/jpeg';
        const binario = atob(partes[1]);
        const bytes = new Uint8Array(binario.length);
        for (let i = 0; i < binario.length; i++) {
            bytes[i] = binario.charCodeAt(i);
        }
        return new File([bytes], nome, { type: tipo });
    }

    function limparDadosDenuncia() {
        ['denuncia_lat', 'denuncia_lng', 'denuncia_endereco', 'denuncia_categoria',
         'denuncia_categoria_label', 'denuncia_descricao', 'denuncia_data',
         'denuncia_volume', 'denuncia_fotos'].forEach(chave => localStorage.removeItem(chave));
    }

    document.getElementById('btnEnviar').addEventListener('click', async function() {
        const btn = this;
        btn.classList.add('loading');
        showToast('Enviando denúncia...', 'info');

        const formData = new FormData();
        formData.append('categoria', categoria);
        formData.append('categoria_rotulo', categoriaRotulo);
        formData.append('descricao', descricao);
        formData.append('endereco', endereco);
        if (!isNaN(lat)) formData.append('latitude', lat);
        if (!isNaN(lng)) formData.append('longitude', lng);
        formData.append('volume', volume);
        formData.append('data_ocorrencia', data);
        fotos.forEach((src, indice) => {
            try {
                formData.append('fotos', dataUrlParaArquivo(src, `foto_${indice + 1}.jpg`));
            } catch (erro) {
                console.error('Foto inválida ignorada', erro);
            }
        });

        try {
            const resposta = await fetch('/api/denuncias', { method: 'POST', body: formData });
            if (!resposta.ok) throw new Error('Falha no envio');
            const dados = await resposta.json();
            localStorage.setItem('denuncia_enviada', 'true');
            if (dados.protocolo) localStorage.setItem('denuncia_protocolo', dados.protocolo);
            limparDadosDenuncia();
            window.location.href = '/nova-denuncia/sucesso';
        } catch (erro) {
            btn.classList.remove('loading');
            window.location.href = '/nova-denuncia/falha';
        }
    });
});
