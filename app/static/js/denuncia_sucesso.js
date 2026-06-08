document.addEventListener('DOMContentLoaded', function() {
    const html = document.documentElement;

    // Animate counter
    const statNum = document.getElementById('statDenuncias');
    let current = 12;
    const target = 13;
    const timer = setInterval(() => {
        current += 0.1;
        if (current >= target) { statNum.textContent = target; clearInterval(timer); }
        else { statNum.textContent = Math.floor(current); }
    }, 50);

    // Remove confetti after animation
    setTimeout(() => { document.getElementById('confettiContainer').style.display = 'none'; }, 4500);

    // Welcome toast
    setTimeout(() => showToast('Denúncia #2025-0013 registrada com sucesso!', 'success'), 800);
});
