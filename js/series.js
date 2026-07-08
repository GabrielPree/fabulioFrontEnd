import getDados from "./getDados.js";
import { initDropdown } from "./dropdown.js";
import { initSearch } from "./search.js";
import { atualizarVerMaisLink } from "./verMais.js";

const categorias = [
  "acao",
  "aventura",
  "animacao",
  "comedia",
  "crime",
  "documentario",
  "drama",
  "familia",
  "fantasia",
  "historia",
  "terror",
  "misterio",
  "romance",
  "suspense",
  "guerra",
];

function setupCarrossel(wrapper, carrosselId) {
  const carrossel = document.getElementById(carrosselId);
  if (!carrossel) return;

  const leftBtn = wrapper.querySelector(".scroll-left");
  const rightBtn = wrapper.querySelector(".scroll-right");

  function updateButtons() {
    const scrollLeft = carrossel.scrollLeft;
    const maxScroll = carrossel.scrollWidth - carrossel.clientWidth;

    if (scrollLeft > 20) {
      leftBtn.classList.add("visible");
    } else {
      leftBtn.classList.remove("visible");
    }

    if (maxScroll - scrollLeft > 20) {
      rightBtn.classList.add("visible");
    } else {
      rightBtn.classList.remove("visible");
    }
  }

  const scrollAmount = 400;
  leftBtn.onclick = () => {
    carrossel.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    setTimeout(updateButtons, 300);
  };
  rightBtn.onclick = () => {
    carrossel.scrollBy({ left: scrollAmount, behavior: "smooth" });
    setTimeout(updateButtons, 300);
  };

  carrossel.addEventListener("scroll", updateButtons);
  setTimeout(updateButtons, 100);
}

function criarCarrossel(container, titulo, dados, categoriaSlug) {
  if (!dados || dados.length === 0) return;

  const section = document.createElement("section");
  section.className = "section";
  section.innerHTML = `
        <div class="section-header-with-link">
            <h2>${titulo}</h2>
            <a href="#" class="ver-mais-link">Ver mais</a>
        </div>
        <div class="carrossel-wrapper">
            <button class="scroll-btn scroll-left">‹</button>
            <div class="carrossel" id="carrossel-${titulo.replace(/ /g, "-")}"></div>
            <button class="scroll-btn scroll-right">›</button>
        </div>
    `;

  const carrosselDiv = section.querySelector(".carrossel");
  const carrosselId = carrosselDiv.id;

  const seriesLimitadas = dados.slice(0, 15);

  carrosselDiv.innerHTML = seriesLimitadas
    .map(
      (serie) => `
        <div class="card" data-id="${serie.id}">
            <a href="detalhesSerie.html?id=${serie.id}">
                <img src="${serie.poster}" alt="${serie.titulo}" onerror="this.src='https://via.placeholder.com/300x450?text=FABULIO'">
            </a>
            <div class="card-info">
                <strong>${serie.titulo}</strong>
                <span class="rating-wrapper">
                    <span class="rating-icon">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#F5C16C" stroke="#F5C16C" stroke-width="1">
                            <polygon points="12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21 12 17.27"/>
                        </svg>
                    </span>
                    ${serie.avaliacao ?? "N/A"}/10
                </span>
            </div>
        </div>
    `,
    )
    .join("");

  container.appendChild(section);

  const verMaisLink = section.querySelector(".ver-mais-link");
  if (verMaisLink && categoriaSlug) {
    atualizarVerMaisLink(
      verMaisLink,
      `todos-genero.html?tipo=series&genero=${categoriaSlug}&nome=${encodeURIComponent(titulo)}`,
      dados.length,
    );
  }

  const wrapper = section.querySelector(".carrossel-wrapper");
  setupCarrossel(wrapper, carrosselId);
}

function obterTituloCategoria(categoria) {
  const titulos = {
    acao: "Ação",
    aventura: "Aventura",
    animacao: "Animação",
    comedia: "Comédia",
    crime: "Crime",
    documentario: "Documentário",
    drama: "Drama",
    familia: "Família",
    fantasia: "Fantasia",
    historia: "História",
    terror: "Terror",
    misterio: "Mistério",
    romance: "Romance",
    suspense: "Suspense",
    guerra: "Guerra",
  };
  return (
    titulos[categoria] || categoria.charAt(0).toUpperCase() + categoria.slice(1)
  );
}

async function carregarHeroSeries() {
  try {
    // Defina aqui o ID da série que você quer mostrar no Hero
    const idSerie = 20;
    const serie = await getDados(`/series/${idSerie}`);

    if (serie && Object.keys(serie).length > 0) {
      const destaque = serie;
      const heroLogoImage = document.getElementById("heroLogoImage");
      const heroTitle = document.getElementById("heroTitle");

      if (destaque.logo && destaque.logo !== "") {
        heroLogoImage.src = destaque.logo;
        heroLogoImage.style.display = "block";
        heroLogoImage.classList.add("hero-logo-img");
        heroTitle.style.display = "none";
      } else {
        heroLogoImage.style.display = "none";
        heroTitle.style.display = "block";
        heroTitle.textContent = destaque.titulo;
      }

      document.getElementById("heroDesc").textContent =
        destaque.sinopse || "Descrição em breve.";
      document.getElementById("heroSeries").style.backgroundImage =
        `url('${destaque.background}')`;
      document.getElementById("heroWatchBtn").onclick = () =>
        alert("Reprodução iniciada! (apenas simulação)");
      document.getElementById("heroInfoBtn").onclick = () => {
        window.location.href = `detalhesSerie.html?id=${destaque.id}`;
      };
    }
  } catch (error) {
    console.error("Erro ao carregar hero de series:", error);
  }
}

async function carregarCategorias() {
  const container = document.getElementById("categoriasContainer");
  if (!container) return;

  container.innerHTML = "";

  for (const categoria of categorias) {
    try {
      const dados = await getDados(
        `/series/categoria/${encodeURIComponent(categoria)}`,
      );
      if (dados && dados.length > 0) {
        const titulo = obterTituloCategoria(categoria);
        criarCarrossel(container, titulo, dados, categoria);
      }
    } catch (error) {
      console.error(`Erro ao carregar categoria ${categoria}:`, error);
    }
  }
}

async function carregarPaginaSeries() {
  await carregarHeroSeries();

  // Carregar Lançamentos
  const lancamentos = await getDados("/series/lancamentos");
  if (lancamentos && lancamentos.length > 0) {
    const carrossel = document.getElementById("lancamentosCarrossel");
    if (carrossel) {
      carrossel.innerHTML = lancamentos
        .slice(0, 15)
        .map(
          (serie) => `
                <div class="card">
                    <a href="detalhesSerie.html?id=${serie.id}">
                        <img src="${serie.poster}" alt="${serie.titulo}" onerror="this.src='https://via.placeholder.com/300x450?text=FABULIO'">
                    </a>
                    <div class="card-info">
                        <strong>${serie.titulo}</strong>
                        <span class="rating-wrapper">
                            <span class="rating-icon">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="#F5C16C" stroke="#F5C16C" stroke-width="1">
                                    <polygon points="12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21 12 17.27"/>
                                </svg>
                            </span>
                            ${serie.avaliacao ?? "N/A"}/10
                        </span>
                    </div>
                </div>
            `,
        )
        .join("");

      const wrapper = carrossel.closest(".carrossel-wrapper");
      if (wrapper) setupCarrossel(wrapper, "lancamentosCarrossel");
    }
  }

  // Carregar Melhores
  const melhoresSeries = await getDados("/series/melhores");
  if (melhoresSeries && melhoresSeries.length > 0) {
    const carrossel = document.getElementById("top15Carrossel");
    if (carrossel) {
      carrossel.innerHTML = melhoresSeries
        .slice(0, 15)
        .map(
          (serie) => `
                <div class="card">
                    <a href="detalhesSerie.html?id=${serie.id}">
                        <img src="${serie.poster}" alt="${serie.titulo}" onerror="this.src='https://via.placeholder.com/300x450?text=FABULIO'">
                    </a>
                    <div class="card-info">
                        <strong>${serie.titulo}</strong>
                        <span class="rating-wrapper">
                            <span class="rating-icon">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="#F5C16C" stroke="#F5C16C" stroke-width="1">
                                    <polygon points="12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21 12 17.27"/>
                                </svg>
                            </span>
                            ${serie.avaliacao ?? "N/A"}/10
                        </span>
                    </div>
                </div>
            `,
        )
        .join("");

      const wrapper = carrossel.closest(".carrossel-wrapper");
      if (wrapper) setupCarrossel(wrapper, "top15Carrossel");
    }
  }

  await carregarCategorias();
  initDropdown();
  initSearch();
}

carregarPaginaSeries();
