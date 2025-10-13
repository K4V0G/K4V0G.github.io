//Lógica para el menú móvil
document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('mobile-menu-button');
    const menu = document.getElementById('mobile-menu');
    if (!button || !menu) return;
    const iconOpen = button.querySelector('.icon-open');
    const iconClose = button.querySelector('.icon-close');
    button.addEventListener('click', () => {
        const expanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!expanded));
        menu.classList.toggle('expanded', !expanded);
        menu.classList.toggle('collapsed', expanded);
        if (iconOpen && iconClose) {
            iconOpen.classList.toggle('hidden', !expanded);
            iconClose.classList.toggle('hidden', expanded);
        }
    });

    // Smooth scroll para anclas y cerrar menú móvil al hacer clic
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (!href) return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Cierra el menú móvil si está abierto
                if (window.matchMedia('(max-width: 639px)').matches) {
                    button.setAttribute('aria-expanded', 'false');
                    menu.classList.add('collapsed');
                    menu.classList.remove('expanded');
                    if (iconOpen && iconClose) {
                        iconOpen.classList.remove('hidden');
                        iconClose.classList.add('hidden');
                    }
                }
            }
        });
    });

    // Scroll suave al siguiente bloque al pulsar la flecha
    const scrollBtn = document.getElementById('scroll-down');
    if (scrollBtn) {
        scrollBtn.addEventListener('click', () => {
            const nextSection = document.querySelector('main section')?.nextElementSibling;
            if (nextSection && nextSection.scrollIntoView) {
                nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
            }
        });
    }
});


window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.js-blur-word').forEach(el => {
        el.style.filter = 'blur(0)';
        el.style.opacity = '1';
    });
    document.querySelectorAll('.js-blur-paragraph').forEach(el => {
        el.style.filter = 'blur(0)';
        el.style.opacity = '1';
    });
    document.querySelectorAll('.js-blur-btn').forEach(el => {
        el.style.filter = 'blur(0)';
        el.style.opacity = '1';
    });

    // Efecto scroll para mostrar/ocultar secciones con blur
    const mainSection = document.querySelector('#blur-reveal');
    const extraSection = document.querySelector('#extra-content');
    window.addEventListener('scroll', () => {
      const trigger = window.innerHeight * 0.5;
        if (window.scrollY > trigger) {
            mainSection.style.opacity = '0.2';
            mainSection.style.filter = 'blur(16px)';
            extraSection.style.opacity = '1';
            extraSection.style.filter = 'blur(0)';
        } else {
            mainSection.style.opacity = '1';
            mainSection.style.filter = 'blur(0)';
        extraSection.style.opacity = '0';
            extraSection.style.filter = 'blur(16px)';
        }
    });});