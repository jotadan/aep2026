document.addEventListener('DOMContentLoaded', function() {
    function animarContador(el) {
        const alvo = parseInt(el.dataset.target) || 0;
        const sufixo = el.dataset.suffix || '';
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

    function definirTotalDenuncias(total) {
        document.querySelectorAll('.profile-stat-hero').forEach((bloco) => {
            const rotulo = bloco.querySelector('.profile-stat-hero-label');
            const numero = bloco.querySelector('.profile-stat-hero-num');
            if (rotulo && numero && rotulo.textContent.trim().toLowerCase() === 'denúncias') {
                numero.dataset.target = total;
            }
        });
    }

    function iniciarContadores() {
        const contadores = document.querySelectorAll('[data-target]');
        const observador = new IntersectionObserver((entradas) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) {
                    animarContador(entrada.target);
                    observador.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.4 });
        contadores.forEach((contador) => observador.observe(contador));
    }

    fetch('/api/estatisticas')
        .then(r => r.json())
        .then((stats) => definirTotalDenuncias(stats.total))
        .catch(() => {})
        .finally(iniciarContadores);
});
