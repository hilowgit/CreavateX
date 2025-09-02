// --- إعدادات أساسية وعناصر DOM ---
const loader = document.getElementById('loader');
const canvas = document.getElementById('interactive-canvas');
const tooltip = document.getElementById('tooltip');
const projectsGrid = document.getElementById('projects-grid');
const contactForm = document.getElementById('contact-form');
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const filterContainer = document.getElementById('project-filters');
const cursor = document.querySelector('.cursor');
const cursorDot = document.querySelector('.cursor-dot');
const scrollToTopBtn = document.getElementById('scroll-to-top');
const constructionModal = document.getElementById('construction-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const sections = document.querySelectorAll('.fade-in-section');

// --- بيانات المشاريع ---
const projectsData = [
    {
        id: 1,
        title: 'منصة إدارة إلكترونية',
        category: 'management',
        description: 'منصة متكاملة لإدارة مشروعك مع لوحة تحكم.',
        url: 'https://modernmanage.netlify.app/',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1770&auto=format&fit=crop'
    },
    {
        id: 2,
        title: 'تطبيق بيع أجهزة منزلية',
        category: 'ecommerce',
        description: 'تطبيق مرن ومتطور لبيع المنتجات المنزلية بطريقة تسويقية عصرية وسهلة لزيادة المبيعات.',
        url: 'https://electricdevises.netlify.app/#',
        imageUrl: 'https://media.elwatannews.com/media/img/mediaarc/large/8294161301672077821.jpg'
    },
    {
        id: 3,
        title: 'موقع إعلاني للمدرسين',
        category: 'portfolio',
        description: 'موقع ويب يعرض خدمات المدرب أو الأستاذ بطريقة جذابة وحديثة.',
        url: 'https://missrola.netlify.app/',
        imageUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1770&auto=format&fit=crop'
    },
    {
        id: 4,
        title: 'موقع حجوزات فندقية',
        category: 'ecommerce',
        description: 'منصة تتيح للمستخدمين البحث عن الفنادق وحجز الغرف بسهولة.',
        url: '#under-construction',
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1740&auto=format&fit=crop'
    },
    {
        id: 5,
        title: 'متجر لبيع السيارات',
        category: 'ecommerce',
        description: 'تطبيق بسيط وجذاب يعرض أنواع السيارات ويعرضهم بطريقة جذابة.',
        url: 'https://carmarketone.netlify.app/',
        imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    }
];

// --- عرض وفلترة بطاقات المشاريع ---
function renderProjectCards(filter = 'all') {
    projectsGrid.innerHTML = '';
    const filteredProjects = projectsData.filter(p => filter === 'all' || p.category === filter);
    
    filteredProjects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'glass-card project-card rounded-lg overflow-hidden shadow-lg';
        card.dataset.projectId = project.id;
        card.innerHTML = `
            <a href="${project.url}" ${project.url !== '#under-construction' ? 'target="_blank"' : ''} rel="noopener noreferrer">
                <img src="${project.imageUrl}" alt="${project.title}" class="w-full h-48 object-cover">
                <div class="p-6">
                    <h3 class="text-xl font-bold text-white mb-2">${project.title}</h3>
                    <p class="text-gray-400 text-sm">${project.description}</p>
                </div>
            </a>
        `;
        projectsGrid.appendChild(card);
    });
}

// --- إعداد مشهد Three.js ---
let scene, camera, renderer, controls;
let raycaster, mouse;
let projectMeshes = [];
let INTERSECTED;
const baseEmissive = 0x111111;
const hoverEmissive = 0x777777;
const scrollEmissive = 0x333333;
let isScrolling = false;
let scrollTimeout;

function initThreeJS() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x121212, 0.035);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    Object.assign(controls, {
        enableDamping: true, dampingFactor: 0.05, enableZoom: true,
        enablePan: false, minDistance: 15, maxDistance: 60,
        autoRotate: true, autoRotateSpeed: 0.3
    });

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);
    const pointLight1 = new THREE.PointLight(0x3b82f6, 2, 100);
    pointLight1.position.set(-15, 10, 10);
    scene.add(pointLight1);

    const geometries = [
        new THREE.IcosahedronGeometry(2, 0), new THREE.TorusKnotGeometry(1.8, 0.6, 100, 16),
        new THREE.OctahedronGeometry(2.2, 0), new THREE.DodecahedronGeometry(2.1, 0),
        new THREE.TorusGeometry(2, 0.5, 16, 100)
    ];

    projectsData.forEach((project, index) => {
        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff, metalness: 0.7, roughness: 0.3,
            flatShading: true, transparent: true, opacity: 0.8,
            emissive: baseEmissive
        });
        const geometry = geometries[index % geometries.length];
        const mesh = new THREE.Mesh(geometry, material);
        const phi = Math.acos(-1 + (2 * index) / (projectsData.length -1));
        const theta = Math.sqrt(projectsData.length * Math.PI) * phi;
        mesh.position.setFromSphericalCoords(15, phi, theta);
        mesh.userData = project;
        mesh.originalPosition = mesh.position.clone();
        scene.add(mesh);
        projectMeshes.push(mesh);
    });

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('scroll', onPageScroll, false);
}

function filterThreeJSObjects(filter) {
    projectMeshes.forEach(mesh => {
        mesh.visible = (filter === 'all' || mesh.userData.category === filter);
    });
}

function onPageScroll() {
    isScrolling = true;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => { isScrolling = false; }, 300);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    projectMeshes.forEach(mesh => {
        let targetEmissive = isScrolling ? scrollEmissive : baseEmissive;
        if (mesh === INTERSECTED) {
            targetEmissive = hoverEmissive;
        }
        mesh.material.emissive.lerp(new THREE.Color(targetEmissive), 0.1);
        if (mesh !== INTERSECTED) {
            mesh.rotation.x += 0.001;
            mesh.rotation.y += 0.002;
        }
    });
    updateInteraction();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    tooltip.style.left = event.clientX + 15 + 'px';
    tooltip.style.top = event.clientY + 15 + 'px';
    cursor.style.left = event.clientX + 'px';
    cursor.style.top = event.clientY + 'px';
    cursorDot.style.left = event.clientX + 'px';
    cursorDot.style.top = event.clientY + 'px';
}

function updateInteraction() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(projectMeshes.filter(m => m.visible));
    const newIntersected = intersects.length > 0 ? intersects[0].object : null;

    if (newIntersected !== INTERSECTED) {
        if (INTERSECTED) INTERSECTED.scale.set(1, 1, 1);
        INTERSECTED = newIntersected;
        if (INTERSECTED) {
            INTERSECTED.scale.set(1.2, 1.2, 1.2);
            tooltip.textContent = INTERSECTED.userData.title;
            tooltip.style.display = 'block';
        } else {
            tooltip.style.display = 'none';
        }
    }
}

// --- منطق واجهة المستخدم الإضافي ---
function setupEventListeners() {
    // تحميل الصفحة
    window.addEventListener('load', () => {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 500);
    });

    // فلترة المشاريع
    filterContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            filterContainer.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            const filterValue = e.target.dataset.filter;
            renderProjectCards(filterValue);
            filterThreeJSObjects(filterValue);
        }
    });

    // تأثيرات التحويم على المؤشر
    document.querySelectorAll('a, button, .project-card, .filter-btn, .skill-badge').forEach(el => {
        el.addEventListener('mouseenter', () => {
             cursor.style.width = '30px';
             cursor.style.height = '30px';
             cursor.style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.width = '20px';
            cursor.style.height = '20px';
            cursor.style.backgroundColor = 'transparent';
        });
    });

    // زر الصعود للأعلى
    window.addEventListener('scroll', () => {
        scrollToTopBtn.classList.toggle('visible', window.scrollY > 300);
    });

    // قائمة الموبايل
    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        mobileMenu.classList.toggle('flex');
    });

    document.querySelectorAll('#mobile-menu a, nav a').forEach(link => {
        link.addEventListener('click', () => {
             if (!mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('flex');
            }
        });
    });

    // نموذج التواصل
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const whatsappNumber = '+963962967893';
        const name = document.getElementById('name').value;
        const message = document.getElementById('message').value;
        const fullMessage = `*رسالة جديدة من الموقع:*\n\n*الاسم:* ${name}\n*الرسالة:* ${message}`;
        const encodedMessage = encodeURIComponent(fullMessage);
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        window.open(whatsappURL, '_blank');
        contactForm.reset();
    });

    // نافذة "قيد الإنشاء"
    function openModal() { constructionModal.classList.add('visible'); }
    function closeModal() { constructionModal.classList.remove('visible'); }

    projectsGrid.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.getAttribute('href') === '#under-construction') {
            e.preventDefault();
            openModal();
        }
    });
    closeModalBtn.addEventListener('click', closeModal);
    constructionModal.addEventListener('click', (e) => {
        if (e.target === constructionModal) closeModal();
    });
}

// --- مراقب ظهور الأقسام ---
const sectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });
sections.forEach(section => sectionObserver.observe(section));

// --- بدء تشغيل كل شيء ---
function initialize() {
    document.getElementById('year').textContent = new Date().getFullYear();
    renderProjectCards();
    initThreeJS();
    animate();
    setupEventListeners();
}

initialize();
