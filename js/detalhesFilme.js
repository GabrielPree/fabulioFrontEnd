import getDados from "./getDados.js";
import { initDropdown } from "./dropdown.js";
import { initSearch } from "./search.js";

const params = new URLSearchParams(window.location.search);
const filmeId = params.get("id");

// Formatar duração (minutos para horas e minutos)
function formatarDuracao(minutos) {
  if (!minutos) return "N/A";
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (horas === 0) return `${mins} minutos`;
  return `${horas}h ${mins}min`;
}

// Formatar gêneros (array para string)
function formatarGeneros(generos) {
  if (!generos || generos.length === 0) return "N/A";
  return generos
    .map((g) => g.charAt(0).toUpperCase() + g.slice(1).toLowerCase())
    .join(", ");
}

// Carregar informações do filme
async function carregarFilme() {
  if (!filmeId) {
    window.location.href = "404.html";
    return;
  }

  try {
    const filmeData = await getDados(`/filmes/${filmeId}`);

    if (!filmeData || Object.keys(filmeData).length === 0) {
      window.location.href = "404.html";
      return;
    }

    const heroSection = document.querySelector(".detail-hero");
    heroSection.style.backgroundImage = `url('${filmeData.background}')`;

    // Logo ou título
    const logoImage = document.getElementById("logoImage");
    const tituloElement = document.getElementById("titulo-filme");

    if (filmeData.logo && filmeData.logo !== "") {
      logoImage.src = filmeData.logo;
      logoImage.style.display = "block";
      logoImage.classList.add("serie-logo-img");
      tituloElement.style.display = "none";
    } else {
      logoImage.style.display = "none";
      tituloElement.style.display = "block";
      tituloElement.textContent = filmeData.titulo;
    }

    // Dados para o hero
    document.getElementById("sinopse-filme").textContent =
      filmeData.sinopse || "Sinopse em breve.";
    document.getElementById("avaliacao").textContent =
      filmeData.avaliacao || "N/A";
    document.getElementById("atores").textContent =
      filmeData.atores || "Informações em breve";

    // Dados para a box de informações
    document.getElementById("diretor").textContent =
      filmeData.diretor || "Informações em breve";
    document.getElementById("ano").textContent =
      filmeData.anoLancamento || filmeData.ano || "N/A";
    document.getElementById("duracao").textContent = formatarDuracao(
      filmeData.duracao,
    );
    document.getElementById("generos").textContent = formatarGeneros(
      filmeData.generos,
    );
    document.getElementById("avaliacao-info").textContent =
      `${filmeData.avaliacao || "N/A"}/10`;
    document.getElementById("atores-info").textContent =
      filmeData.atores || "Informações em breve";
    document.getElementById("sinopse-info").textContent =
      filmeData.sinopse || "Sinopse em breve.";

    const posterSide = document.getElementById("poster-side");
    if (posterSide && filmeData.poster) {
      posterSide.src = filmeData.poster;
      posterSide.alt = filmeData.titulo;
    }

    // Botão favoritar
    const btnFav = document.getElementById("btn-fav");
    if (btnFav) {
      // Verificar se já está favoritado
      const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
      if (favoritos.includes(`filme_${filmeId}`)) {
        btnFav.textContent = "❤ Favoritado";
        btnFav.classList.add("favoritado");
      }

      btnFav.onclick = () => {
        let fav = JSON.parse(localStorage.getItem("favoritos")) || [];
        const itemId = `filme_${filmeId}`;

        if (!fav.includes(itemId)) {
          fav.push(itemId);
          localStorage.setItem("favoritos", JSON.stringify(fav));
          btnFav.textContent = "❤ Favoritado";
          btnFav.classList.add("favoritado");
        } else {
          fav = fav.filter((id) => id !== itemId);
          localStorage.setItem("favoritos", JSON.stringify(fav));
          btnFav.textContent = "❤ Favoritar";
          btnFav.classList.remove("favoritado");
        }
      };
    }

    document.getElementById("btn-assistir").onclick = () => {
      alert("Reprodução iniciada! (apenas simulação)");
    };

    if (filmeData.generos && filmeData.generos.length > 0) {
      await carregarRecomendados(filmeData.generos);
    }
  } catch (error) {
    console.error("Erro ao carregar filme:", error);
    window.location.href = "404.html";
  }
}

// Carregar filmes recomendados do mesmo gênero
async function carregarRecomendados(generos) {
  if (!generos || generos.length === 0) return;

  try {
    const todosFilmes = await getDados("/filmes");
    const generoPrincipal = generos[0].toLowerCase();

    const recomendados = todosFilmes
      .filter(
        (filme) =>
          filme.id != filmeId &&
          filme.generos &&
          filme.generos.some((g) => g.toLowerCase() === generoPrincipal),
      )
      .slice(0, 10);

    const carrossel = document.getElementById("recomendadosCarrossel");

    if (recomendados.length === 0) {
      carrossel.innerHTML =
        '<div class="loading">Nenhum filme recomendado encontrado.</div>';
      return;
    }

    carrossel.innerHTML = recomendados
      .map(
        (filme) => `
            <div class="card" data-id="${filme.id}">
                <a href="detalhesFilme.html?id=${filme.id}">
                    <img src="${filme.poster}" alt="${filme.titulo}" onerror="this.src='https://via.placeholder.com/300x450?text=FABULIO'">
                </a>
                <div class="card-info">
                    <strong>${filme.titulo}</strong>
                    <span class="rating-wrapper">
                        <span class="rating-icon">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#F5C16C" stroke="#F5C16C" stroke-width="1">
                                <polygon points="12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21 12 17.27"/>
                            </svg>
                        </span>
                        ${filme.avaliacao ?? "N/A"}/10
                    </span>
                </div>
            </div>
        `,
      )
      .join("");

    // Configurar scroll do carrossel de recomendados
    const wrapper = carrossel.closest(".carrossel-wrapper");
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
  } catch (error) {
    console.error("Erro ao carregar recomendados:", error);
  }
}

// Inicializar
async function init() {
  await carregarFilme();
  initDropdown();
  initSearch();
}

init();