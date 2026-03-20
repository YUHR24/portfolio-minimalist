
/* --- COUNTERS --- */
function animateCounter(id, target, suffix, duration) {
    const el = document.getElementById(id);
    const steps = 60;
    const interval = duration / steps;
    let current = 0;
    const step = target / steps;
    const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.round(current) + suffix;
        if (current >= target) clearInterval(timer);
    }, interval);
}

window.addEventListener("load", () => {
    setTimeout(() => {
        animateCounter("c1", 4, "+", 1000);
        animateCounter("c2", 3, "", 800);
        animateCounter("c3", 10, "+", 900);
    }, 600);
});

/* --- REVEAL ON SCROLL --- */
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add("visible"), i * 80);
                observer.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.1 },
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

/* --- NAV ACTIVE --- */
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach((s) => {
        if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    navLinks.forEach((a) => {
        a.style.color = a.getAttribute("href") === "#" + current ? "var(--text)" : "";
    });
});

/* --- HOVER IMAGE PREVIEW (desktop) + TAP EXPAND (mobile) --- */
const preview = document.getElementById("projPreview");
const previewImg = document.getElementById("projPreviewImg");
const previewLbl = document.getElementById("projPreviewLabel");
const previewVid = document.getElementById('projPreviewVid');
const previewTyp = document.getElementById("projPreviewType");

let mouseX = 0,
    mouseY = 0;
let curX = 0,
    curY = 0;
let rafId = null;
let isHovering = false;
const OFFSET_X = 28,
    OFFSET_Y = -90,
    W = 340,
    H = 210;

function lerp(a, b, t) {
    return a + (b - a) * t;
}
function isMobile() {
    return window.innerWidth <= 600;
}

function animatePreview() {
    curX = lerp(curX, mouseX, 0.12);
    curY = lerp(curY, mouseY, 0.12);
    const vw = window.innerWidth,
        vh = window.innerHeight;
    let px = curX + OFFSET_X,
        py = curY + OFFSET_Y;
    if (px + W > vw - 16) px = curX - W - OFFSET_X;
    if (py < 60) py = curY + 20;
    if (py + H > vh - 16) py = vh - H - 16;
    preview.style.left = px + "px";
    preview.style.top = py + "px";
    if (isHovering) rafId = requestAnimationFrame(animatePreview);
}

document.querySelectorAll(".project-item[data-img]").forEach((item) => {
    const expand = item.querySelector(".proj-expand-area");
    const chevron = item.querySelector(".proj-chevron");

    /* DESKTOP hover */
    item.addEventListener('mouseenter', (e) => {
    if (isMobile()) return;

    const src = item.dataset.img;
    const isVideo = src.match(/\.(mp4|webm|ogg)$/i);

    preview.className = 'proj-preview';
    if (item.dataset.previewClass) {
        preview.classList.add(item.dataset.previewClass);
    }

    if (isVideo) {
        previewImg.style.display = 'none';
        previewVid.style.display = 'block';
        previewVid.src = src;
        previewVid.play();
    } else {
        previewVid.style.display = 'none';
        previewVid.src = '';
        previewImg.style.display = 'block';
        previewImg.src = src;
    }

    previewLbl.textContent = item.dataset.label;
    previewTyp.textContent = item.dataset.type;
    mouseX = e.clientX; mouseY = e.clientY;
    curX = mouseX; curY = mouseY;
    isHovering = true;
    preview.classList.add('visible');
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(animatePreview);
});
    item.addEventListener("mousemove", (e) => {
        if (isMobile()) return;
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    item.addEventListener("mouseleave", () => {
    if (isMobile()) return;
    isHovering = false;
    preview.classList.remove("visible");
    cancelAnimationFrame(rafId);
    previewVid.pause();
    previewVid.src = '';
    });

    /* MOBILE tap */
    item.addEventListener("click", (e) => {
        e.preventDefault();
        if (!isMobile()) return;
        const isOpen = expand && expand.classList.contains("open");
        document.querySelectorAll(".proj-expand-area").forEach((a) => a.classList.remove("open"));
        document.querySelectorAll(".proj-chevron").forEach((c) => {
            c.classList.remove("open");
            c.textContent = "↓";
        });
        if (!isOpen && expand) {
            expand.classList.add("open");
            if (chevron) {
                chevron.classList.add("open");
                chevron.textContent = "↑";
            }
            setTimeout(() => item.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
        }
    });
});


/* --- CONTACT FORM --- */
const form = document.getElementById('contactForm');
const toast = document.getElementById('toast');

function showToast(msg) {
    toast.textContent = msg;
    toast.style.display = 'block';
    requestAnimationFrame(() => {
        toast.classList.add('visible');
    });
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.style.display = 'none', 300);
    }, 3500);
}

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = new FormData(form);
        const res = await fetch('https://formspree.io/f/mkoqklkv', {
            method: 'POST',
            body: data,
            headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
            form.reset();
            showToast('Mensaje enviado. Te respondo pronto.');
        } else {
            showToast('Algo salió mal. Intentá de nuevo.');
        }
    });
}