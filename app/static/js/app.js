(function () {
    const html = document.documentElement;

    function aplicarTemaSalvo() {
        const temaSalvo = localStorage.getItem("ecotech-theme");
        if (temaSalvo === "dark") {
            html.classList.add("dark");
        }
    }

    function configurarToggleTema() {
        const themeToggle = document.getElementById("themeToggle");
        const themeIcon = document.getElementById("themeIcon");
        if (!themeToggle) return;
        if (themeIcon && html.classList.contains("dark")) {
            themeIcon.classList.replace("bi-moon-stars-fill", "bi-sun-fill");
        }
        themeToggle.addEventListener("click", () => {
            html.classList.toggle("dark");
            const escuro = html.classList.contains("dark");
            if (themeIcon) {
                themeIcon.classList.toggle("bi-moon-stars-fill", !escuro);
                themeIcon.classList.toggle("bi-sun-fill", escuro);
            }
            localStorage.setItem("ecotech-theme", escuro ? "dark" : "light");
            mostrarToast(escuro ? "Tema escuro ativado" : "Tema claro ativado", "info");
        });
    }

    function configurarSidebarMobile() {
        const sidebar = document.getElementById("sidebar");
        const overlay = document.getElementById("mobileOverlay");
        const abrir = document.getElementById("openSidebar");
        const fechar = document.getElementById("closeSidebar");
        if (!sidebar || !overlay) return;
        const alternar = (estado) => {
            sidebar.classList.toggle("open", estado);
            overlay.classList.toggle("active", estado);
        };
        if (abrir) abrir.addEventListener("click", () => alternar(true));
        if (fechar) fechar.addEventListener("click", () => alternar(false));
        overlay.addEventListener("click", () => alternar(false));
    }

    function configurarNotificacoes() {
        const botaoNotificacao = document.getElementById("notifBtn");
        if (!botaoNotificacao) return;
        botaoNotificacao.addEventListener("click", () =>
            mostrarToast("Você tem denúncias em análise", "info")
        );
    }

    function mostrarToast(mensagem, tipo = "success") {
        const container = document.getElementById("toastContainer");
        if (!container) return;
        const icones = {
            success: "bi-check-circle-fill",
            warning: "bi-exclamation-triangle-fill",
            danger: "bi-x-circle-fill",
            info: "bi-info-circle-fill",
        };
        const toast = document.createElement("div");
        toast.className = `toast toast-${tipo}`;
        const icone = document.createElement("i");
        icone.className = `bi ${icones[tipo]} toast-icon`;
        const corpo = document.createElement("span");
        corpo.className = "toast-body";
        corpo.textContent = mensagem;
        const fechar = document.createElement("button");
        fechar.className = "toast-close";
        fechar.innerHTML = '<i class="bi bi-x"></i>';
        fechar.addEventListener("click", () => toast.remove());
        toast.append(icone, corpo, fechar);
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(30px)";
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    window.showToast = mostrarToast;
    window.EcoTech = { mostrarToast };

    aplicarTemaSalvo();
    document.addEventListener("DOMContentLoaded", () => {
        configurarToggleTema();
        configurarSidebarMobile();
        configurarNotificacoes();
    });
})();
