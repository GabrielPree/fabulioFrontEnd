import getDados from "./getDados.js";
import { initDropdown } from "./dropdown.js";
import { initSearch } from './search.js';

let activeBubble = null;

function createConfirmBubble(btn, id, tipo, titulo) {
    // Remove qualquer balão ativo
    if (activeBubble) {
        activeBubble.remove();
        activeBubble = null;
    }
    
    // Pega a posição do botão
    const rect = btn.getBoundingClientRect();
    
    // Cria o balão
    const bubble = document.createElement('div');
    bubble.className = 'confirm-bubble';
    
    // Decide se o balão fica à esquerda ou à direita do botão
    const windowWidth = window.innerWidth;
    const spaceRight = windowWidth - rect.right;
    const spaceLeft = rect.left;
    
    if (spaceRight > 200) {
        // Balão para a direita do botão
        bubble.classList.add('right');
        bubble.style.top = `${rect.top + rect.height / 2 - 40}px`;
        bubble.style.left = `${rect.right + 10}px`;
    } else {
        // Balão para a esquerda do botão
        bubble.classList.add('left');
        bubble.style.top = `${rect.top + rect.height / 2 - 40}px`;
        bubble.style.right = `${windowWidth - rect.left + 10}px`;
    }
    
    bubble.innerHTML = `
        <p>Remover "${titulo.length > 30 ? titulo.substring(0, 27) + '...' : titulo}" da lista?</p>
        <div class="bubble-buttons">
            <button class="bubble-btn bubble-btn-cancel">Cancelar</button>
            <button class="bubble-btn bubble-btn-confirm">Remover</button>
        </div>
    `;
    
    document.body.appendChild(bubble);
    setTimeout(() => bubble.classList.add('show'), 10);
    activeBubble = bubble;
    
    // Eventos dos botões
    const confirmBtn = bubble.querySelector('.bubble-btn-confirm');
    const cancelBtn = bubble.querySelector('.bubble-btn-cancel');
    
    confirmBtn.onclick = async () => {
        let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
        const key = `${tipo}_${id}`;
        favoritos = favoritos.filter(fav => String(fav) !== key);
        localStorage.setItem('favoritos', JSON.stringify(favoritos));
        
        bubble.remove();
        activeBubble = null;
        await carregarFavoritos();
    };
    
    cancelBtn.onclick = () => {
        bubble.remove();
        activeBubble = null;
    };
    
    // Fechar ao clicar fora do balão
    const closeBubble = (e) => {
        if (!bubble.contains(e.target)) {
            bubble.remove();
            activeBubble = null;
            document.removeEventListener('click', closeBubble);
        }
    };
    setTimeout(() => document.addEventListener('click', closeBubble), 10);
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

function criarCarrosselFavoritos(containerId, items, tipo) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!items || items.length === 0) {
        container.innerHTML = '<div class="loading">Nenhum item favorito ainda. Adicione clicando no coração nos detalhes.</div>';
        const wrapper = container.closest('.carrossel-wrapper');
        if (wrapper) {
            const leftBtn = wrapper.querySelector('.scroll-left');
            const rightBtn = wrapper.querySelector('.scroll-right');
            if (leftBtn) leftBtn.classList.remove('visible');
            if (rightBtn) rightBtn.classList.remove('visible');
        }
        return;
    }
    
    const paginaDestino = tipo === 'serie' ? 'detalhesSerie.html' : 'detalhesFilme.html';
    
    container.innerHTML = items.map(item => `
        <div class="card favorito-card" data-id="${item.id}" data-tipo="${tipo}" data-titulo="${item.titulo.replace(/'/g, "\\'")}">
            <a href="${paginaDestino}?id=${item.id}">
                <img src="${item.poster}" alt="${item.titulo}" onerror="this.src='https://via.placeholder.com/300x450?text=FABULIO'">
            </a>
            <button class="btn-remove-fav" data-id="${item.id}" data-tipo="${tipo}" data-titulo="${item.titulo.replace(/'/g, "\\'")}" title="Remover da lista">✕</button>
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
    
    document.querySelectorAll('.btn-remove-fav').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = btn.dataset.id;
            const tipo = btn.dataset.tipo;
            const titulo = btn.dataset.titulo;
            
            createConfirmBubble(btn, id, tipo, titulo);
        });
    });
}

async function carregarFavoritos() {
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

    try {
        // Buscar todos os dados atuais do banco
        const [todasSeries, todosFilmes] = await Promise.all([
            getDados('/series'),
            getDados('/filmes')
        ]);
        
        // Extrair IDs válidos
        const idsSeriesValidos = todasSeries.map(s => String(s.id));
        const idsFilmesValidos = todosFilmes.map(f => String(f.id));
        
        // Filtrar apenas os favoritos que ainda existem no banco
        const favoritosValidos = favoritos.filter(fav => {
            const favStr = String(fav);
            
            if (favStr.startsWith('serie_')) {
                const id = favStr.replace('serie_', '');
                return idsSeriesValidos.includes(id);
            } else if (favStr.startsWith('filme_')) {
                const id = favStr.replace('filme_', '');
                return idsFilmesValidos.includes(id);
            }
            return false;
        });
        
        // Se houver diferença, atualizar o localStorage
        if (favoritosValidos.length !== favoritos.length) {
            localStorage.setItem('favoritos', JSON.stringify(favoritosValidos));
            console.log(`Lista sincronizada: ${favoritos.length} -> ${favoritosValidos.length} itens válidos`);
        }
        
        // Usar a lista validada para exibir
        const favoritosParaExibir = favoritosValidos;
        
        const seriesIds = [];
        const filmesIds = [];
        
        favoritosParaExibir.forEach(fav => {
            const favStr = String(fav);
            
            if (favStr.startsWith('serie_')) {
                seriesIds.push(favStr.replace('serie_', ''));
            } else if (favStr.startsWith('filme_')) {
                filmesIds.push(favStr.replace('filme_', ''));
            } else if (!isNaN(favStr) && favStr !== '') {
                seriesIds.push(favStr);
            }
        });
        
        // Carregar séries favoritas
        try {
            const seriesFavoritas = todasSeries.filter(serie => seriesIds.includes(String(serie.id)));
            criarCarrosselFavoritos('seriesFavoritasCarrossel', seriesFavoritas, 'serie');
        } catch (error) {
            console.error('Erro ao carregar séries favoritas:', error);
            criarCarrosselFavoritos('seriesFavoritasCarrossel', [], 'serie');
        }
        
        // Carregar filmes favoritos
        try {
            const filmesFavoritos = todosFilmes.filter(filme => filmesIds.includes(String(filme.id)));
            criarCarrosselFavoritos('filmesFavoritosCarrossel', filmesFavoritos, 'filme');
        } catch (error) {
            console.error('Erro ao carregar filmes favoritos:', error);
            criarCarrosselFavoritos('filmesFavoritosCarrossel', [], 'filme');
        }
        
    } catch (error) {
        console.error('Erro ao validar favoritos:', error);
        // Fallback: carregar sem validação
        const seriesIds = [];
        const filmesIds = [];
        
        favoritos.forEach(fav => {
            const favStr = String(fav);
            if (favStr.startsWith('serie_')) {
                seriesIds.push(favStr.replace('serie_', ''));
            } else if (favStr.startsWith('filme_')) {
                filmesIds.push(favStr.replace('filme_', ''));
            }
        });
        
        try {
            const todasSeries = await getDados('/series');
            const seriesFavoritas = todasSeries.filter(serie => seriesIds.includes(String(serie.id)));
            criarCarrosselFavoritos('seriesFavoritasCarrossel', seriesFavoritas, 'serie');
        } catch {
            criarCarrosselFavoritos('seriesFavoritasCarrossel', [], 'serie');
        }
        
        try {
            const todosFilmes = await getDados('/filmes');
            const filmesFavoritos = todosFilmes.filter(filme => filmesIds.includes(String(filme.id)));
            criarCarrosselFavoritos('filmesFavoritosCarrossel', filmesFavoritos, 'filme');
        } catch {
            criarCarrosselFavoritos('filmesFavoritosCarrossel', [], 'filme');
        }
    }
}

initDropdown();
initSearch();
carregarFavoritos();