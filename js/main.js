// Global variables
let sidebarOpen = false;
const SIDEBAR_WIDTH = '250px';

window.openNav = function() {
    const sidebar = document.getElementById('mySidebar');
    const main = document.getElementById('main');
    const openBtn = document.querySelector('.openbtn');
    
    sidebar.style.width = SIDEBAR_WIDTH;
    main.style.marginLeft = SIDEBAR_WIDTH;
    openBtn.style.display = 'none';
    sidebarOpen = true;
};

window.closeNav = function() {
    const sidebar = document.getElementById('mySidebar');
    const main = document.getElementById('main');
    const openBtn = document.querySelector('.openbtn');
    
    sidebar.style.width = '0';
    main.style.marginLeft = '0';
    openBtn.style.display = 'block';
    sidebarOpen = false;
};

function handleResize() {
    if (window.innerWidth <= 768 && sidebarOpen) {
        window.closeNav();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebarOpen) {
            window.closeNav();
        }
    });

    window.addEventListener('resize', handleResize);

    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.sidebar a');
    
    links.forEach(link => {
        if (link.getAttribute('href') && currentPath.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });
});