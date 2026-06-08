        document.addEventListener('DOMContentLoaded', function() {

            // ============================================
            // ANIMATED COUNTERS
            // ============================================
            const counters = document.querySelectorAll('.stat-num[data-target]');

            const animateCounter = (el) => {
                const target = parseInt(el.dataset.target);
                const duration = 1500;
                const step = target / (duration / 16);
                let current = 0;

                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        el.textContent = target.toLocaleString('pt-BR');
                        clearInterval(timer);
                    } else {
                        el.textContent = Math.floor(current).toLocaleString('pt-BR');
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
                showToast('Perfil carregado! 👤', 'success');
            }, 1000);
        });
