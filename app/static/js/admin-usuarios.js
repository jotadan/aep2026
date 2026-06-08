document.addEventListener('DOMContentLoaded', function () {
    const corpoTabela = document.getElementById('corpoTabelaUsuarios');
    const tabelaVazia = document.getElementById('tabelaVazia');
    const campoBusca = document.getElementById('searchUsuarios');

    let todos = [];

    function criarLinha(u) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${u.nome} ${u.is_admin ? '<span class="badge-admin"><i class="bi bi-shield-check"></i> Admin</span>' : ''}</td>
            <td class="celula-denunciante">${u.email}</td>
            <td>${u.total_denuncias}</td>
            <td>${u.criado_em || '—'}</td>
            <td>
                <div class="form-check form-switch">
                    <input class="form-check-input switch-admin" type="checkbox" ${u.is_admin ? 'checked' : ''}>
                </div>
            </td>
        `;
        const checkbox = tr.querySelector('.switch-admin');
        checkbox.addEventListener('change', () => alternarAdmin(u, checkbox));
        return tr;
    }

    function aplicarBusca() {
        const termo = (campoBusca.value || '').trim().toLowerCase();
        const filtrados = todos.filter((u) =>
            !termo || u.nome.toLowerCase().includes(termo) || u.email.toLowerCase().includes(termo)
        );
        renderizar(filtrados);
    }

    function renderizar(lista) {
        corpoTabela.innerHTML = '';
        tabelaVazia.style.display = lista.length ? 'none' : 'block';
        lista.forEach((u) => corpoTabela.appendChild(criarLinha(u)));
    }

    function alternarAdmin(usuario, checkbox) {
        const desejado = checkbox.checked;
        checkbox.disabled = true;
        fetch('/api/admin/usuarios/' + usuario.id + '/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_admin: desejado }),
        })
            .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
            .then(({ ok, j }) => {
                if (!ok) throw new Error(j.erro || 'Falha');
                usuario.is_admin = j.is_admin;
                window.showToast && showToast(
                    j.is_admin ? `${usuario.nome} agora é administrador.` : `${usuario.nome} não é mais administrador.`,
                    'success'
                );
                aplicarBusca();
            })
            .catch((e) => {
                checkbox.checked = !desejado;
                window.showToast && showToast(e.message || 'Erro ao atualizar.', 'danger');
            })
            .finally(() => { checkbox.disabled = false; });
    }

    if (campoBusca) campoBusca.addEventListener('input', aplicarBusca);

    fetch('/api/admin/usuarios')
        .then((r) => r.json())
        .then((lista) => { todos = lista; renderizar(lista); })
        .catch(() => window.showToast && showToast('Erro ao carregar usuários.', 'danger'));
});
