import getDados from "./getDados.js";
import { initDropdown } from "./dropdown.js";
import { initSearch } from './search.js';

const elementos = {
    lancamentosFilmes: null,
    lancamentosSeries: null,
    top15Filmes: null,
    top15Series: null,
    todasSeries: null,
    todosFilmes: null,
    categoria: null
};

let tipoAtual = 'series';

// Verificar e atualizar visibilidade das setas
function updateScrollButtons(wrapper) {
    const carrossel = wrapper.querySelector('.carrossel');
    const leftBtn = wrapper.querySelector('.scroll-left');
    const rightBtn = wrapper.querySelector('.scroll-right');
    
    if (!carrossel || !leftBtn || !rightBtn) return;
    
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

// Configurar scroll para um carrossel específico
function setupCarrossel(wrapper) {
    const carrossel = wrapper.querySelector('.carrossel');
    const leftBtn = wrapper.querySelector('.scroll-left');
    const rightBtn = wrapper.querySelector('.scroll-right');
    
    if (!carrossel) return;
    
    const scrollAmount = 400;
    
    const newLeftBtn = leftBtn.cloneNode(true);
    const newRightBtn = rightBtn.cloneNode(true);
    leftBtn.parentNode.replaceChild(newLeftBtn, leftBtn);
    rightBtn.parentNode.replaceChild(newRightBtn, rightBtn);
    
    const finalLeftBtn = wrapper.querySelector('.scroll-left');
    const finalRightBtn = wrapper.querySelector('.scroll-right');
    
    finalLeftBtn.onclick = (e) => {
        e.stopPropagation();
        carrossel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    };
    finalRightBtn.onclick = (e) => {
        e.stopPropagation();
        carrossel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    };
    
    const updateHandler = () => updateScrollButtons(wrapper);
    carrossel.removeEventListener('scroll', updateHandler);
    carrossel.addEventListener('scroll', updateHandler);
    window.removeEventListener('resize', updateHandler);
    window.addEventListener('resize', updateHandler);
    
    setTimeout(() => updateScrollButtons(wrapper), 100);
}

// Criar lista de filmes ou séries em um carrossel
function criarListaFilmes(elemento, dados, tipo = 'series') {
    if (!elemento) return;
    
    const wrapper = elemento.querySelector('.carrossel-wrapper');
    const carrossel = wrapper.querySelector('.carrossel');

    if (!dados || dados.length === 0) {
        carrossel.innerHTML = '<div class="loading">Nenhum conteúdo disponível no momento.</div>';
        return;
    }

    const paginaDestino = tipo === 'series' ? 'pages/detalhesSerie.html' : 'pages/detalhesFilme.html';

    carrossel.innerHTML = dados.map(item => `
        <div class="card" data-id="${item.id}" data-tipo="${tipo}">
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

    setupCarrossel(wrapper);
}

// Carregar Hero com destaque da API
async function carregarHero() {
    try {
        // Definir o ID do filme que você quer mostrar na pagina inicial
        const idFilme = 158;
        const filme = await getDados(`/filmes/${idFilme}`);
        
        if (filme && Object.keys(filme).length > 0) {
            const destaque = filme;
            const heroLogoImage = document.getElementById('heroLogoImage');
            const heroTitle = document.getElementById('heroTitle');
            
            if (destaque.logo && destaque.logo !== '') {
                heroLogoImage.src = destaque.logo;
                heroLogoImage.style.display = 'block';
                heroLogoImage.classList.add('hero-logo-img');
                heroTitle.style.display = 'none';
            } else {
                heroLogoImage.style.display = 'none';
                heroTitle.style.display = 'block';
                heroTitle.textContent = destaque.titulo;
            }
            
            document.getElementById('heroDesc').textContent = destaque.sinopse || 'Descrição em breve.';
            document.getElementById('heroSection').style.backgroundImage = `url('${destaque.background}')`;
            document.getElementById('heroWatchBtn').onclick = () => alert('Reprodução iniciada (demo)');
            document.getElementById('heroInfoBtn').onclick = () => {
                 window.location.href = `pages/detalhesFilme.html?id=${destaque.id}`;
            };
        }
    } catch (error) {
        console.error('Erro ao carregar hero:', error);
    }
}

// Criar todas as seções da home
function criarSections() {
    const container = document.getElementById('sectionsContainer');
    if (!container) return;
    
    // Gêneros que serão exibidos como seções (filmes e séries separados)
    const generos = [
        { slug: 'acao', titulo: 'Ação' },
        { slug: 'comedia', titulo: 'Comédia' },
        { slug: 'drama', titulo: 'Drama' },
        { slug: 'terror', titulo: 'Terror' },
        { slug: 'animacao', titulo: 'Animação' }
    ];
    
    // Construir array de seções
    const sections = [
        // Primeiro: Lançamentos
        { title: "Lançamentos Filmes", id: "lancamentosFilmes", tipo: "filmes", endpoint: "/filmes/lancamentos", verMaisHref: "pages/todos-conteudo.html?tipo=filmes&secao=lancamentos" },
        { title: "Lançamentos Séries", id: "lancamentosSeries", tipo: "series", endpoint: "/series/lancamentos", verMaisHref: "pages/todos-conteudo.html?tipo=series&secao=lancamentos" },
        
        // Depois: Melhores
        { title: "Melhores Filmes", id: "top15Filmes", tipo: "filmes", endpoint: "/filmes/melhores", verMaisHref: "pages/todos-conteudo.html?tipo=filmes&secao=melhores" },
        { title: "Melhores Séries", id: "top15Series", tipo: "series", endpoint: "/series/melhores", verMaisHref: "pages/todos-conteudo.html?tipo=series&secao=melhores" },
        
        // Por último: Gêneros (cada gênero tem uma seção de filmes e uma de séries)
        ...generos.flatMap(gen => [
            {
                title: `${gen.titulo} Filmes`,
                id: `genero_${gen.slug}_filmes`,
                tipo: 'filmes',
                endpoint: null,
                isGenero: true,
                generoSlug: gen.slug,
                generoTipo: 'filmes',
                generoNome: gen.titulo,
                verMaisHref: `pages/todos-genero.html?tipo=filmes&genero=${gen.slug}&nome=${encodeURIComponent(gen.titulo)}`
            },
            {
                title: `${gen.titulo} Series`,
                id: `genero_${gen.slug}_series`,
                tipo: 'series',
                endpoint: null,
                isGenero: true,
                generoSlug: gen.slug,
                generoTipo: 'series',
                generoNome: gen.titulo,
                verMaisHref: `pages/todos-genero.html?tipo=series&genero=${gen.slug}&nome=${encodeURIComponent(gen.titulo)}`
            }
        ])
    ];
    
    container.innerHTML = sections.map(section => {
        const headerHtml = `
            <div class="section-header-with-link">
                <h2>${section.title}</h2>
                <a href="${section.verMaisHref || '#'}" class="ver-mais-link">Ver mais</a>
            </div>
        `;

        return `
            <section class="section" data-name="${section.id}" data-tipo="${section.tipo || ''}" data-genero-slug="${section.generoSlug || ''}" data-genero-tipo="${section.generoTipo || ''}" data-genero-nome="${section.generoNome || ''}">
                ${headerHtml}
                <div class="carrossel-wrapper">
                    <button class="scroll-btn scroll-left">‹</button>
                    <div class="carrossel" id="carrossel-${section.id}"></div>
                    <button class="scroll-btn scroll-right">›</button>
                </div>
            </section>
        `;
    }).join('');
    
    // Adicionar seção de categoria escondida
    const categoriaSection = document.createElement('section');
    categoriaSection.className = 'section hidden';
    categoriaSection.setAttribute('data-name', 'categoria');
    categoriaSection.innerHTML = `
        <h2 id="categoriaTitulo">Categoria</h2>
        <div class="carrossel-wrapper">
            <button class="scroll-btn scroll-left">‹</button>
            <div class="carrossel"></div>
            <button class="scroll-btn scroll-right">›</button>
        </div>
    `;
    container.appendChild(categoriaSection);
    
    elementos.categoria = categoriaSection;
    
    // Carregar dados de cada seção
    sections.forEach(async (section) => {
        const elemento = document.querySelector(`[data-name="${section.id}"]`);
        if (!elemento) return;
        
        if (section.isGenero) {
            // Carregar filmes ou séries do gênero
            try {
                const endpoint = section.generoTipo === 'filmes' ? '/filmes' : '/series';
                const todosItens = await getDados(endpoint);
                
                const itensFiltrados = todosItens.filter(item => 
                    item.generos && item.generos.some(g => 
                        g.toLowerCase() === section.generoSlug
                    )
                );
                
                if (itensFiltrados.length > 0) {
                    const limitados = itensFiltrados.slice(0, 15);
                    criarListaFilmes(elemento, limitados, section.generoTipo === 'filmes' ? 'filmes' : 'series');
                } else {
                    const carrossel = elemento.querySelector('.carrossel');
                    carrossel.innerHTML = '<div class="loading">Nenhum conteudo disponivel neste genero.</div>';
                }
            } catch (error) {
                console.error(`Erro ao carregar genero ${section.generoSlug} (${section.generoTipo}):`, error);
                const carrossel = elemento.querySelector('.carrossel');
                carrossel.innerHTML = '<div class="loading">Erro ao carregar genero.</div>';
            }
            return;
        }
        
        // Carregar seções normais (lançamentos, melhores)
        elementos[section.id] = elemento;
        const dados = await getDados(section.endpoint);
        const dadosLimitados = dados ? dados.slice(0, 15) : [];
        criarListaFilmes(elemento, dadosLimitados, section.tipo);
    });
}

// Carregar home com dados da API
async function carregarHome() {
    criarSections();
    await carregarHero();
}

// Carregar por categoria
async function carregarPorCategoria(categoria, nomeCategoria) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(s => s.classList.add('hidden'));
    elementos.categoria.classList.remove('hidden');
    
    const categoriaTitulo = document.getElementById('categoriaTitulo');
    if (categoriaTitulo) {
        categoriaTitulo.textContent = nomeCategoria;
    }
    
    try {
        const [seriesData, filmesData] = await Promise.all([
            getDados(`/series/categoria/${encodeURIComponent(categoria)}`),
            getDados(`/filmes/categoria/${encodeURIComponent(categoria)}`)
        ]);
        
        const todosItens = [...(seriesData || []), ...(filmesData || [])];
        
        if (todosItens.length === 0) {
            const carrossel = elementos.categoria.querySelector('.carrossel');
            carrossel.innerHTML = '<div class="loading">Nenhum conteudo encontrado nesta categoria.</div>';
            return;
        }
        
        const wrapper = elementos.categoria.querySelector('.carrossel-wrapper');
        const carrossel = wrapper.querySelector('.carrossel');
        
        carrossel.innerHTML = todosItens.map(item => {
            const tipo = item.hasOwnProperty('temporadas') ? 'series' : 'filmes';
            const paginaDestino = tipo === 'series' ? 'pages/detalhesSerie.html' : 'pages/detalhesFilme.html';
            return `
                <div class="card" data-id="${item.id}" data-tipo="${tipo}">
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
            `;
        }).join('');
        
        setupCarrossel(wrapper);
        
    } catch (error) {
        console.error('Erro ao carregar categoria:', error);
        const carrossel = elementos.categoria.querySelector('.carrossel');
        carrossel.innerHTML = '<div class="loading">Erro ao carregar conteudo.</div>';
    }
}

// Reset para home
function resetToHome() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(s => s.classList.remove('hidden'));
    if (elementos.categoria) {
        elementos.categoria.classList.add('hidden');
    }
    criarSections();
    carregarHero();
}

// Navegacao
function initNavegacao() {
    const navSeries = document.getElementById('navSeries');
    if (navSeries) {
        navSeries.onclick = (e) => {
            e.preventDefault();
            window.location.href = 'pages/series.html';
        };
    }
    
    const navMovies = document.getElementById('navMovies');
    if (navMovies) {
        navMovies.onclick = (e) => {
            e.preventDefault();
            window.location.href = 'pages/filmes.html';
        };
    }
    
    const navMyList = document.getElementById('navMyList');
    if (navMyList) {
        navMyList.onclick = (e) => {
            e.preventDefault();
            window.location.href = 'pages/minha-lista.html';
        };
    }
    
    const homeLink = document.querySelector('.nav-links-left a[href="index.html"]');
    if (homeLink) {
        homeLink.onclick = (e) => {
            e.preventDefault();
            resetToHome();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }
}

// Inicializar
async function init() {
    await carregarHome();
    initNavegacao();
    initDropdown();
    initSearch();
}

init();