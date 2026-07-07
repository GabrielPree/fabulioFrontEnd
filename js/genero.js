import getDados from "./getDados.js";
import { initDropdown } from "./dropdown.js";
import { initSearch } from './search.js';
import { atualizarVerMaisLink } from './verMais.js';

const params = new URLSearchParams(window.location.search);
const generoSlug = params.get('genero');

let filmesCompletos = [];
let seriesCompletas = [];

const titulosGeneros = {
    acao: "Ação", aventura: "Aventura", animacao: "Animação",
    biografia: "Biografia", comedia: "Comédia", crime: "Crime",
    drama: "Drama", fantasia: "Fantasia", historia: "História", 
    terror: "Terror", misterio: "Mistério", romance: "Romance",
    "ficcao-cientifica": "Ficção Científica", esporte: "Esporte",
    musica: "Música", suspense: "Suspense", guerra: "Guerra",
    faroeste: "Faroeste"
};

function obterTituloGenero(slug) {
    return titulosGeneros[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
}

function setupCarrossel(wrapper, carrosselId) {
    const carrossel = document.getElementById(carrosselId);
    if (!carrossel) return;
    
    const leftBtn = wrapper.querySelector('.scroll-left');
    const rightBtn = wrapper.querySelector('.scroll-right');
    
    function updateButtons() {
        const scrollLeft = carrossel.scrollLeft;
        const maxScroll = carrossel.scrollWidth - carrossel.clientWidth;
        
        if (scrollLeft > 20) {
            leftBtn.classList.add('visible');
        } else {
            leftBtn.classList.remove('visible');
        }
        
        if (maxScroll - scrollLeft > 20) {
            rightBtn.classList.add('visible');
        } else {
            rightBtn.classList.remove('visible');
        }
    }
    
    const scrollAmount = 400;
    leftBtn.onclick = () => {
        carrossel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        setTimeout(updateButtons, 300);
    };
    rightBtn.onclick = () => {
        carrossel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        setTimeout(updateButtons, 300);
    };
    
    carrossel.addEventListener('scroll', updateButtons);
    setTimeout(updateButtons, 100);
}

function criarCarrossel(containerId, dados, tipo) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!dados || !Array.isArray(dados) || dados.length === 0) {
        container.innerHTML = '<div class="loading" id="nenhumConteudo">Nenhum conteúdo encontrado para este gênero.</div>';
        return;
    }
    
    const dadosLimitados = dados.slice(0, 15);
    const paginaDestino = tipo === 'filme' ? 'detalhesFilme.html' : 'detalhesSerie.html';
    
    container.innerHTML = dadosLimitados.map(item => `
        <div class="card" data-id="${item.id}">
            <a href="${paginaDestino}?id=${item.id}">
                <img src="${item.poster}" alt="${item.titulo}" onerror="this.src='https://via.placeholder.com/300x450?text=FABULIO'">
            </a>
            <div class="card-info">
                <strong>${item.titulo}</strong>
                <span class="rating-wrapper">
                    <span class="rating-icon">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#F5C16C" stroke="#F5C16C" stroke-width="1">
                            <polygon points="12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21 12 17.27"/>
                        </svg>
                    </span>
                    ${item.avaliacao ?? 'N/A'}/10
                </span>
            </div>
        </div>
    `).join('');
    
    const wrapper = container.closest('.carrossel-wrapper');
    if (wrapper) {
        setupCarrossel(wrapper, containerId);
    }
}

function generoExiste(slug) {
    return titulosGeneros.hasOwnProperty(slug);
}

async function carregarGenero() {
    if (!generoSlug) {
        window.location.href = '../index.html';
        return;
    }
    
    if (!generoExiste(generoSlug)) {
        window.location.href = '404.html';
        return;
    }
    
    const generoNome = obterTituloGenero(generoSlug);
    document.getElementById('generoTitulo').textContent = generoNome;
    
    try {
        // Buscar filmes e séries separadamente com tratamento de erro individual
        let filmes = [];
        let series = [];
        
        try {
            const filmesResponse = await getDados(`/filmes/categoria/${encodeURIComponent(generoSlug)}`);
            filmes = Array.isArray(filmesResponse) ? filmesResponse : [];
        } catch (error) {
            console.warn(`Erro ao buscar filmes para ${generoSlug}:`, error);
            filmes = [];
        }
        
        try {
            const seriesResponse = await getDados(`/series/categoria/${encodeURIComponent(generoSlug)}`);
            series = Array.isArray(seriesResponse) ? seriesResponse : [];
        } catch (error) {
            console.warn(`Erro ao buscar séries para ${generoSlug}:`, error);
            series = [];
        }
        
        filmesCompletos = filmes;
        seriesCompletas = series;
        
        // Só redireciona para 404 se ambos estiverem vazios
        if (filmesCompletos.length === 0 && seriesCompletas.length === 0) {
            window.location.href = '404.html';
            return;
        }
        
        // Criar carrossel de filmes (se houver filmes)
        criarCarrossel('filmesCarrossel', filmesCompletos, 'filme');
        
        // Criar carrossel de séries (se houver séries)
        criarCarrossel('seriesCarrossel', seriesCompletas, 'serie');
        
        // Configurar botões "Ver mais"
        const verMaisFilmes = document.getElementById('verMaisFilmes');
        const verMaisSeries = document.getElementById('verMaisSeries');
        
        if (verMaisFilmes) {
            if (filmesCompletos.length === 0) {
                verMaisFilmes.style.display = 'none';
            } else {
                verMaisFilmes.style.display = 'inline-block';
                atualizarVerMaisLink(
                    verMaisFilmes,
                    `todos-genero.html?tipo=filmes&genero=${generoSlug}&nome=${encodeURIComponent(generoNome)}`,
                    filmesCompletos.length
                );
            }
        }

        if (verMaisSeries) {
            if (seriesCompletas.length === 0) {
                verMaisSeries.style.display = 'none';
            } else {
                verMaisSeries.style.display = 'inline-block';
                atualizarVerMaisLink(
                    verMaisSeries,
                    `todos-genero.html?tipo=series&genero=${generoSlug}&nome=${encodeURIComponent(generoNome)}`,
                    seriesCompletas.length
                );
            }
        }
        
        initDropdown();
        initSearch();
        
    } catch (error) {
        console.error('Erro ao carregar gênero:', error);
        // Se o erro for por causa de um gênero sem conteúdo, não redireciona
        if (filmesCompletos.length === 0 && seriesCompletas.length === 0) {
            window.location.href = '404.html';
        }
    }
}

carregarGenero();