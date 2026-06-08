document.addEventListener('DOMContentLoaded', function () {
    const corpoTabela = document.getElementById('corpoTabelaDenuncias');
    const tabelaVazia = document.getElementById('tabelaVazia');
    const campoBusca = document.getElementById('searchDenuncias');
    const filtros = document.getElementById('filtrosStatus');
    const selectStatus = document.getElementById('selectStatus');
    const inputObservacao = document.getElementById('inputObservacao');
    const btnSalvar = document.getElementById('btnSalvarStatus');
    const modalEl = document.getElementById('modalDenuncia');
    const modal = new bootstrap.Modal(modalEl);

    let todas = [];
    let listaStatus = [];
    let filtroAtual = 'todas';
    let protocoloAtual = null;

    function badge(d) {
        return `<span class="badge-status" style="background:${d.status_cor}1a;color:${d.status_cor};border:1px solid ${d.status_cor}33;">${d.status_rotulo}</span>`;
    }

    function criarLinha(d) {
        const tr = document.createElement('tr');
        tr.dataset.status = d.status;
        tr.innerHTML = `
            <td class="celula-protocolo">${d.protocolo}</td>
            <td><div>${d.denunciante || '—'}</div><div class="celula-denunciante">${d.denunciante_email || ''}</div></td>
            <td>${d.assunto}</td>
            <td>${badge(d)}</td>
            <td>${d.data_envio}</td>
            <td>${d.ultima_atualizacao}</td>
            <td><button class="btn-acao" title="Gerenciar"><i class="bi bi-pencil-square"></i></button></td>
        `;
        tr.querySelector('.btn-acao').addEventListener('click', () => abrirDetalhe(d.protocolo));
        return tr;
    }

    function aplicarFiltros() {
        const termo = (campoBusca.value || '').trim().toLowerCase();
        const filtradas = todas.filter((d) => {
            const passaStatus = filtroAtual === 'todas' || d.status === filtroAtual;
            const passaBusca = !termo ||
                d.protocolo.toLowerCase().includes(termo) ||
                (d.denunciante || '').toLowerCase().includes(termo) ||
                (d.denunciante_email || '').toLowerCase().includes(termo) ||
                (d.assunto || '').toLowerCase().includes(termo) ||
                (d.categoria || '').toLowerCase().includes(termo) ||
                (d.endereco || '').toLowerCase().includes(termo);
            return passaStatus && passaBusca;
        });
        renderizar(filtradas);
    }

    function renderizar(lista) {
        corpoTabela.innerHTML = '';
        tabelaVazia.style.display = lista.length ? 'none' : 'block';
        lista.forEach((d) => corpoTabela.appendChild(criarLinha(d)));
    }

    function montarFiltros() {
        listaStatus.forEach((s) => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.dataset.filter = s.codigo;
            btn.textContent = s.rotulo;
            filtros.appendChild(btn);
        });
        filtros.querySelectorAll('.filter-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                filtros.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                filtroAtual = btn.dataset.filter;
                aplicarFiltros();
            });
        });
    }

    function montarSelectStatus(codigoAtual) {
        selectStatus.innerHTML = '';
        listaStatus.forEach((s) => {
            const opt = document.createElement('option');
            opt.value = s.codigo;
            opt.textContent = s.rotulo;
            if (s.codigo === codigoAtual) opt.selected = true;
            selectStatus.appendChild(opt);
        });
    }

    function linhaDetalhe(rotulo, valor) {
        return `<div class="detalhe-linha"><span class="detalhe-rotulo">${rotulo}</span><span>${valor || '—'}</span></div>`;
    }

    function abrirDetalhe(protocolo) {
        protocoloAtual = protocolo;
        fetch('/api/admin/denuncias/' + protocolo)
            .then((r) => r.json())
            .then((d) => {
                document.getElementById('modalTitulo').textContent = d.protocolo + ' — ' + d.status_rotulo;
                const fotos = (d.fotos || []).map((f) => `<a href="/static/${f}"><img src="/static/${f}" alt="Foto"></a>`).join('');
                const historico = (d.historico || []).map((h) =>
                    `<div class="timeline-item"><strong>${h.titulo}</strong><small>${h.data} ${h.hora}</small>${h.descricao ? '<div>' + h.descricao + '</div>' : ''}</div>`
                ).join('');
                document.getElementById('modalCorpo').innerHTML =
                    linhaDetalhe('Denunciante', d.denunciante ? `${d.denunciante.nome} (${d.denunciante.email})` : '—') +
                    linhaDetalhe('Categoria', d.assunto) +
                    linhaDetalhe('Endereço', d.endereco) +
                    linhaDetalhe('Volume', d.volume) +
                    linhaDetalhe('Ocorrência', d.data_ocorrencia) +
                    linhaDetalhe('Descrição', d.descricao) +
                    (fotos ? `<div class="fotos-galeria">${fotos}</div>` : '') +
                    `<h6 class="mt-3 mb-2">Histórico</h6>${historico || '<p class="text-muted">Sem histórico.</p>'}`;
                montarSelectStatus(d.status);
                inputObservacao.value = '';
                modal.show();
            })
            .catch(() => window.showToast && showToast('Erro ao carregar a denúncia.', 'danger'));
    }

    btnSalvar.addEventListener('click', function () {
        if (!protocoloAtual) return;
        btnSalvar.disabled = true;
        fetch('/api/admin/denuncias/' + protocoloAtual + '/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: selectStatus.value, observacao: inputObservacao.value }),
        })
            .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
            .then(({ ok, j }) => {
                if (!ok) throw new Error(j.erro || 'Falha');
                window.showToast && showToast('Status atualizado com sucesso.', 'success');
                modal.hide();
                carregar();
            })
            .catch((e) => window.showToast && showToast(e.message || 'Erro ao atualizar.', 'danger'))
            .finally(() => { btnSalvar.disabled = false; });
    });

    if (campoBusca) campoBusca.addEventListener('input', aplicarFiltros);

    function carregar() {
        fetch('/api/admin/denuncias')
            .then((r) => r.json())
            .then((lista) => { todas = lista; aplicarFiltros(); })
            .catch(() => window.showToast && showToast('Erro ao carregar denúncias.', 'danger'));
    }

    fetch('/api/admin/status')
        .then((r) => r.json())
        .then((status) => { listaStatus = status; montarFiltros(); carregar(); });
});
