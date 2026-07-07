import getDados from "./getDados.js";

let todosDados = [];
let tipoFiltro = 'todos';

// Detectar o caminho para pesquisa
function getCaminhoPagina(tipo) {
    const path = window.location.pathname;
    // Se estiver na raiz (index.html) ou em qualquer página da raiz
    const isRoot = path === '/' || 
                   path.endsWith('index.html') || 
                   path === '/index.html' ||
                   path.endsWith('/');
    
    const pagina = tipo === 'serie' ? 'detalhesSerie.html' : 'detalhesFilme.html';
    
    if (isRoot) {
        return `pages/${pagina}`;
    } else {
        return pagina;
    }
}

// Abrir modal de pesquisa
function openSearch() {
    const modal = document.getElementById('searchModal');
    modal.classList.add('active');
    document.getElementById('searchInput').focus();
    document.body.style.overflow = 'hidden';
    carregarTodosDados();
}

// Fechar modal de pesquisa
function closeSearch() {
    const modal = document.getElementById('searchModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').innerHTML = `
        <div class="search-placeholder">
            <span class="search-placeholder-icon">🔍︎</span>
            <p>Digite para começar a buscar</p>
            <span class="search-placeholder-sub">Encontre seus filmes e séries favoritos</span>
        </div>
    `;
}

// Carregar todos os dados (séries e filmes)
async function carregarTodosDados() {
    if (todosDados.length > 0) return;
    
    try {
        const [series, filmes] = await Promise.all([
            getDados('/series'),
            getDados('/filmes')
        ]);
        
        todosDados = [
            ...series.map(item => ({ ...item, tipo: 'serie' })),
            ...filmes.map(item => ({ ...item, tipo: 'filme' }))
        ];
    } catch (error) {
        console.error('Erro ao carregar dados para pesquisa:', error);
    }
}

// Realizar pesquisa
function search(query) {
    if (!query || query.trim() === '') {
        document.getElementById('searchResults').innerHTML = `
            <div class="search-placeholder">
                <span class="search-placeholder-icon">🔍︎</span>
                <p>Digite para começar a buscar</p>
                <span class="search-placeholder-sub">Encontre seus filmes e séries favoritos</span>
            </div>
        `;
        return;
    }
    
    const termo = query.toLowerCase().trim();
    
    let resultados = todosDados.filter(item => {
        const tituloMatch = item.titulo.toLowerCase().includes(termo);
        const sinopseMatch = item.sinopse && item.sinopse.toLowerCase().includes(termo);
        const atoresMatch = item.atores && item.atores.toLowerCase().includes(termo);
        const diretorMatch = item.diretor && item.diretor.toLowerCase().includes(termo);
        
        return tituloMatch || sinopseMatch || atoresMatch || diretorMatch;
    });
    
    // Aplicar filtro de tipo
    if (tipoFiltro !== 'todos') {
        resultados = resultados.filter(item => item.tipo === tipoFiltro);
    }
    
    // Limitar a 30 resultados
    resultados = resultados.slice(0, 30);
    
    renderizarResultados(resultados, termo);
}

// Renderizar resultados
function renderizarResultados(resultados, termo) {
    const container = document.getElementById('searchResults');
    
    if (resultados.length === 0) {
        container.innerHTML = `
            <div class="search-result-empty">
                <span class="empty-icon">⛌</span>
                <p>Nenhum resultado encontrado para "<strong>${termo}</strong>"</p>
                <span style="font-size: 0.85rem; color: #6B6B76;">Tente usar palavras-chave diferentes</span>
            </div>
        `;
        return;
    }
    
    container.innerHTML = resultados.map(item => {
        const paginaDestino = getCaminhoPagina(item.tipo);
        const tipoLabel = item.tipo === 'serie' ? 'Série' : 'Filme';
        
        return `
            <div class="search-result-item" onclick="window.location.href='${paginaDestino}?id=${item.id}'">
                <img src="${item.poster}" alt="${item.titulo}" onerror="this.src='https://via.placeholder.com/60x90?text=+'">
                <div class="search-result-info">
                    <h4>${destacarTexto(item.titulo, termo)}</h4>
                    <div class="search-result-meta">
                        <span>★ ${item.avaliacao ?? 'N/A'}/10</span>
                        <span style="margin-left: 0.8rem;">${tipoLabel}</span>
                        ${item.diretor ? `<span style="margin-left: 0.8rem;">${item.diretor}</span>` : ''}
                        ${item.anoLancamento ? `<span style="margin-left: 0.8rem;">${item.anoLancamento}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Destacar termo no texto
function destacarTexto(texto, termo) {
    if (!texto) return '';
    const regex = new RegExp(`(${termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return texto.replace(regex, '<span style="color: #F5C16C; font-weight: 700;">$1</span>');
}

// Inicializar eventos
function initSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchModal = document.getElementById('searchModal');
    const searchCloseBtn = document.getElementById('searchCloseBtn');
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.search-filter-btn');
    
    // Abrir pesquisa
    searchBtn.addEventListener('click', openSearch);
    
    // Fechar pesquisa
    searchCloseBtn.addEventListener('click', closeSearch);
    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) closeSearch();
    });
    
    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchModal.classList.contains('active')) {
            closeSearch();
        }
    });
    
    // Input de pesquisa com debounce
    let timeoutId;
    searchInput.addEventListener('input', () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            search(searchInput.value);
        }, 300);
    });
    
    // Filtros
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            tipoFiltro = btn.dataset.tipo;
            search(searchInput.value);
        });
    });
}

// Exportar funções
export { initSearch, openSearch, closeSearch };