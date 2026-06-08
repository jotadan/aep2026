document.addEventListener('DOMContentLoaded', function() {
    const html = document.documentElement;

    // Shake icon on load
    setTimeout(() => {
        document.getElementById('errorIcon').classList.add('animate-shake');
        showToast('Falha na conexão com o servidor', 'danger');
    }, 600);
});
