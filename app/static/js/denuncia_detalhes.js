    document.addEventListener('DOMContentLoaded', function() {
        // Load previews
        document.getElementById('previewEndereco').textContent = localStorage.getItem('denuncia_endereco') || 'Endereço não encontrado';
        document.getElementById('previewCategoria').textContent = localStorage.getItem('denuncia_categoria_label') || 'Categoria não encontrada';

        // Set today's date as default
        document.getElementById('dataOcorrencia').valueAsDate = new Date();

        // Character count
        const descricao = document.getElementById('descricao');
        const charCount = document.getElementById('charCount');
        descricao.addEventListener('input', () => {
            const len = descricao.value.length;
            charCount.textContent = `${len}/500`;
            charCount.style.color = len > 500 ? 'var(--color-danger)' : 'var(--color-text-muted)';
        });

        // File Upload
        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('fileInput');
        const photoGrid = document.getElementById('photoGrid');
        let photos = [];

        uploadZone.addEventListener('click', () => fileInput.click());
        uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
        uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            handleFiles(e.dataTransfer.files);
        });
        fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

        function handleFiles(files) {
            Array.from(files).forEach(file => {
                if (!file.type.startsWith('image/')) { showToast(`${file.name} não é uma imagem válida.`, 'warning'); return; }
                if (file.size > 5 * 1024 * 1024) { showToast(`${file.name} excede 5MB.`, 'warning'); return; }
                if (photos.length >= 4) { showToast('Limite de 4 fotos atingido.', 'warning'); return; }
                const reader = new FileReader();
                reader.onload = (e) => {
                    photos.push({ id: Date.now() + Math.random(), src: e.target.result, name: file.name });
                    renderPhotos();
                    showToast('Foto adicionada!', 'success');
                };
                reader.readAsDataURL(file);
            });
        }

        function renderPhotos() {
            photoGrid.innerHTML = photos.map(p => `
                <div class="photo-item">
                    <img src="${p.src}" alt="${p.name}">
                    <button class="remove-photo" onclick="removePhoto(${p.id})"><i class="bi bi-x"></i></button>
                </div>
            `).join('');
            uploadZone.style.display = photos.length >= 4 ? 'none' : 'block';
        }
        window.removePhoto = function(id) {
            photos = photos.filter(p => p.id !== id);
            renderPhotos();
            showToast('Foto removida.', 'info');
        };

        // Next button
        document.getElementById('btn-proximo').addEventListener('click', () => {
            const desc = descricao.value.trim();
            if (desc.length < 20) { showToast('Descreva a ocorrência com pelo menos 20 caracteres.', 'warning'); descricao.focus(); return; }
            const vol = document.getElementById('volume').value;
            if (!vol) { showToast('Selecione o volume estimado do resíduo.', 'warning'); document.getElementById('volume').focus(); return; }
            localStorage.setItem('denuncia_descricao', desc);
            localStorage.setItem('denuncia_data', document.getElementById('dataOcorrencia').value);
            localStorage.setItem('denuncia_volume', vol);
            localStorage.setItem('denuncia_fotos', JSON.stringify(photos.map(p => p.src)));
            showToast('Detalhes salvos! Redirecionando...', 'success');
            setTimeout(() => window.location.href = '/nova-denuncia/revisao', 600);
        });
    });
