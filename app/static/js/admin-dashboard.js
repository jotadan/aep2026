document.addEventListener('DOMContentLoaded', function () {
    const grafico = document.getElementById('graficoStatus');

    function definir(id, valor) {
        const el = document.getElementById(id);
        if (el) el.textContent = valor;
    }

    function renderizarGrafico(porStatus, status, total) {
        grafico.innerHTML = '';
        if (!status.length) {
            grafico.innerHTML = '<p class="text-muted mb-0">Nenhum status cadastrado.</p>';
            return;
        }
        status.forEach((s) => {
            const valor = porStatus[s.codigo] || 0;
            const pct = total > 0 ? Math.round((valor / total) * 100) : 0;
            const linha = document.createElement('div');
            linha.className = 'barra-linha';
            linha.innerHTML = `
                <span class="barra-rotulo">${s.rotulo}</span>
                <div class="barra-trilho"><div class="barra-preenchida" style="width:${pct}%;background:${s.cor};"></div></div>
                <span class="barra-valor">${valor}</span>
            `;
            grafico.appendChild(linha);
        });
    }

    Promise.all([
        fetch('/api/admin/estatisticas').then((r) => r.json()),
        fetch('/api/admin/status').then((r) => r.json()),
    ])
        .then(([stats, status]) => {
            definir('statTotal', stats.total);
            definir('statAtivas', stats.ativas);
            definir('statConcluidas', stats.concluidas);
            definir('statUsuarios', stats.total_usuarios);
            renderizarGrafico(stats.por_status || {}, status, stats.total);
        })
        .catch(() => window.showToast && showToast('Erro ao carregar estatísticas.', 'danger'));
});
