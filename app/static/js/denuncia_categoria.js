    document.addEventListener('DOMContentLoaded', function() {
        // Load location preview
        const endereco = localStorage.getItem('denuncia_endereco') || 'Endereço não encontrado';
        document.getElementById('enderecoPreview').textContent = endereco;

        // Category selection
        let categoriaSelecionada = null;
        const cards = document.querySelectorAll('.categoria-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                cards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                categoriaSelecionada = { categoria: card.dataset.categoria, label: card.dataset.label };
                showToast(`${card.dataset.label} selecionado`, 'success');
            });
        });

        // Next button
        document.getElementById('btn-proximo').addEventListener('click', () => {
            if (!categoriaSelecionada) { showToast('Selecione uma categoria de resíduo.', 'warning'); return; }
            localStorage.setItem('denuncia_categoria', categoriaSelecionada.categoria);
            localStorage.setItem('denuncia_categoria_label', categoriaSelecionada.label);
            showToast('Categoria salva! Redirecionando...', 'success');
            setTimeout(() => window.location.href = '/nova-denuncia/detalhes', 600);
        });
    });
