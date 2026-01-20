const URL_EXCEL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSijJi_zx1n5LBrg7YiQTEXaITNYzu3cXbAX1pgWy4q3K93bo4BnS21oyy70rH92TXeDPY7u3J7P3tC/pub?output=csv";

function crearBotones(datos) {
    const contenedor = document.getElementById("buttonsContainer");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    (datos || []).forEach((item) => {
        if (!item.titulo || !item.link) return;
        const a = document.createElement("a");
        a.textContent = item.titulo;
        a.href = item.link;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.classList.add("button");
        contenedor.appendChild(a);
    });
}

function initCarousel() {
    const swiper = new Swiper(".carousel-swiper", {
        slidesPerView: 3,
        spaceBetween: 5,
        loop: true,
        speed: 3000,
        allowTouchMove: false,
        autoplay: {
            delay: 1,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
        },
        breakpoints: {
            768: {
                slidesPerView: 7,
                spaceBetween: 10,
                loopedSlides: 9,
            },
        },
    });
    setInterval(() => swiper.slideNext(), 100);
}

document.addEventListener("DOMContentLoaded", () => {
    fetch(URL_EXCEL)
        .then((response) => response.text())
        .then((csv) => {
            const filas = csv.split("\n").slice(1);
            const datos = filas
                .filter((fila) => fila.trim() !== "")
                .map((fila) => {
                    const [titulo, link] = fila.split(",");
                    return { titulo: titulo?.trim(), link: link?.trim() };
                });
            crearBotones(datos);
        })
        .catch(() => {});

    initCarousel();
});
