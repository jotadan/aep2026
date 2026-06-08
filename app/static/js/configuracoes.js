        document.addEventListener('DOMContentLoaded', function() {

            const html = document.documentElement;
            const themeIcon = document.getElementById('themeIcon');
            const toggleThemeDark = document.getElementById('toggleThemeDark');

            if (html.classList.contains('dark')) {
                if (toggleThemeDark) toggleThemeDark.checked = true;
            }

            function updateTheme(isDark) {
                if (isDark) {
                    html.classList.add('dark');
                    themeIcon.classList.replace('bi-moon-stars-fill', 'bi-sun-fill');
                    localStorage.setItem('ecotech-theme', 'dark');
                    if (toggleThemeDark) toggleThemeDark.checked = true;
                } else {
                    html.classList.remove('dark');
                    themeIcon.classList.replace('bi-sun-fill', 'bi-moon-stars-fill');
                    localStorage.setItem('ecotech-theme', 'light');
                    if (toggleThemeDark) toggleThemeDark.checked = false;
                }
            }

            if (toggleThemeDark) {
                toggleThemeDark.addEventListener('change', function() {
                    updateTheme(this.checked);
                    showToast(this.checked ? 'Tema escuro ativado' : 'Tema claro ativado', this.checked ? 'info' : 'success');
                });
            }

            // ============================================
            // CONFIG MENU NAVIGATION
            // ============================================
            const menuItems = document.querySelectorAll('.config-menu-item');
            const sections = document.querySelectorAll('.config-section');

            menuItems.forEach(item => {
                item.addEventListener('click', function() {
                    const targetSection = this.dataset.section;

                    // Update menu active state
                    menuItems.forEach(m => m.classList.remove('active'));
                    this.classList.add('active');

                    // Show target section
                    sections.forEach(s => s.classList.add('d-none'));
                    document.getElementById('section-' + targetSection).classList.remove('d-none');

                    showToast('Seção: ' + this.querySelector('.config-menu-title').textContent, 'info');
                });
            });

            // ============================================
            // TOGGLE SWITCHES FEEDBACK
            // ============================================
            document.querySelectorAll('.form-check-input[type="checkbox"]').forEach(toggle => {
                toggle.addEventListener('change', function() {
                    const label = this.closest('.preference-item, .security-item')?.querySelector('.preference-title, .security-title')?.textContent || 'Configuração';
                    showToast(`${label}: ${this.checked ? 'ativado' : 'desativado'}`, this.checked ? 'success' : 'info');
                });
            });

            // ============================================
            // WELCOME TOAST
            // ============================================
            setTimeout(() => {
                showToast('Configurações carregadas! ⚙️', 'success');
            }, 1000);
        });
