document.addEventListener('DOMContentLoaded', function() {
    const corpoTabela = document.getElementById('corpoTabelaDenuncias');
    const tabelaVazia = document.getElementById('tabelaVazia');
    const campoBusca = document.getElementById('searchDenuncias');
    const botoesFiltro = document.querySelectorAll('.filter-btn');

    const FILTROS = {
        todas: null,
        andamento: ['em_andamento'],
        concluida: ['concluida'],
        pendente: ['recebida', 'em_analise']
    };

    let todasDenuncias = [];
    let filtroAtual = 'todas';

    function criarLinha(denuncia) {
        const tr = document.createElement('tr');
        tr.dataset.status = denuncia.status;
        tr.innerHTML = `
            <td class="celula-protocolo">${denuncia.protocolo}</td>
            <td>${denuncia.assunto}</td>
            <td><span class="tipo-tag">${denuncia.categoria}</span></td>
            <td><span class="badge-status" style="background:${denuncia.status_cor}1a;color:${denuncia.status_cor};border:1px solid ${denuncia.status_cor}33;">${denuncia.status_rotulo}</span></td>
            <td>${denuncia.data_envio}</td>
            <td>${denuncia.ultima_atualizacao}</td>
            <td>
                <button class="btn-acao" data-protocolo="${denuncia.protocolo}" title="Ver detalhes"><i class="bi bi-eye"></i></button>
            </td>
        `;
        tr.querySelector('.btn-acao').addEventListener('click', () => verDetalhes(denuncia.protocolo));
        return tr;
    }

    function aplicarFiltros() {
        const termo = (campoBusca.value || '').trim().toLowerCase();
        const statusPermitidos = FILTROS[filtroAtual];
        const filtradas = todasDenuncias.filter((d) => {
            const passaStatus = !statusPermitidos || statusPermitidos.includes(d.status);
            const passaBusca = !termo ||
                d.protocolo.toLowerCase().includes(termo) ||
                d.assunto.toLowerCase().includes(termo) ||
                d.categoria.toLowerCase().includes(termo) ||
                (d.endereco || '').toLowerCase().includes(termo);
            return passaStatus && passaBusca;
        });
        renderizar(filtradas);
    }

    function renderizar(denuncias) {
        corpoTabela.innerHTML = '';
        if (denuncias.length === 0) {
            tabelaVazia.style.display = 'block';
            return;
        }
        tabelaVazia.style.display = 'none';
        denuncias.forEach((d) => corpoTabela.appendChild(criarLinha(d)));
    }

    function verDetalhes(protocolo) {
        fetch('/api/denuncias/' + protocolo)
            .then(r => r.json())
            .then((d) => {
                showToast(`${d.protocolo} — ${d.status_rotulo}. Última atualização em ${d.ultima_atualizacao}.`, 'info');
            })
            .catch(() => showToast('Não foi possível carregar os detalhes.', 'danger'));
    }

    botoesFiltro.forEach((botao) => {
        botao.addEventListener('click', () => {
            botoesFiltro.forEach(b => b.classList.remove('active'));
            botao.classList.add('active');
            filtroAtual = botao.dataset.filter;
            aplicarFiltros();
        });
    });

    if (campoBusca) campoBusca.addEventListener('input', aplicarFiltros);

    fetch('/api/denuncias')
        .then(r => r.json())
        .then((denuncias) => {
            todasDenuncias = denuncias;
            renderizar(denuncias);
        })
        .catch(() => showToast('Erro ao carregar denúncias.', 'danger'));
});
