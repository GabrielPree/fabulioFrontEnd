import getDados from "./getDados.js";
import { initDropdown } from "./dropdown.js";
import { initSearch } from './search.js';

const params = new URLSearchParams(window.location.search);
const tipo = params.get('tipo');
const generoSlug = params.get('genero');
const generoNome = decodeURIComponent(params.get('nome') || '');

// Tipos válidos para redirecionamento
const tiposValidos = ['filmes', 'series'];

const titulosGeneros = {
    acao: "Ação", aventura: "Aventura", animacao: "Animação",
    biografia: "Biografia", comedia: "Comédia", crime: "Crime",
    documentario: "Documentário", drama: "Drama", familia: "Família",
    fantasia: "Fantasia", historia: "História", terror: "Terror",
    musical: "Musical", misterio: "Mistério", romance: "Romance",
    "ficcao-cientifica": "Ficção Científica", esporte: "Esporte",
    musica: "Música", suspense: "Suspense", guerra: "Guerra",
    curta: "Curta", faroeste: "Faroeste", outros: "Outros"
};

function obterTituloGenero(slug) {
    return titulosGeneros[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
}

function generoExiste(slug) {
    return titulosGeneros.hasOwnProperty(slug);
}

async function carregarTodos() {
    // Redirecionar para 404 se o tipo não estiver presente ou for inválido
    if (!tipo || !tiposValidos.includes(tipo)) {
        window.location.href = '404.html';
        return;
    }
    
    // Redirecionar para 404 se o gênero não estiver presente
    if (!generoSlug) {
        window.location.href = '404.html';
        return;
    }
    
    // Redirecionar para 404 se o gênero não existir
    if (!generoExiste(generoSlug)) {
        window.location.href = '404.html';
        return;
    }

    const tituloGenero = generoNome || obterTituloGenero(generoSlug);
    const tipoTexto = tipo === 'filmes' ? 'Filmes' : 'Séries';
    
    document.getElementById('paginaTitulo').textContent = `${tituloGenero} - ${tipoTexto}`;
    document.getElementById('paginaDesc').textContent = `Todos os ${tipoTexto.toLowerCase()} do gênero ${tituloGenero}.`;
    
    try {
        const endpoint = tipo === 'filmes' ? '/filmes' : '/series';
        const todosItens = await getDados(endpoint);
        
        const itensFiltrados = todosItens.filter(item => 
            item.generos && item.generos.some(g => g.toLowerCase() === generoSlug)
        );
        
        const container = document.getElementById('todosGrid');
        const paginaDestino = tipo === 'filmes' ? '/pages/detalhesFilme.html' : '/pages/detalhesSerie.html';
        
        // Se não houver itens para o gênero, redirecionar para 404
        if (itensFiltrados.length === 0) {
            window.location.href = '404.html';
            return;
        }
        
        container.innerHTML = itensFiltrados.map(item => `
            <div class="card-grid">
                <a href="${paginaDestino}?id=${item.id}">
                    <img src="${item.poster}" alt="${item.titulo}" onerror="this.src='https://via.placeholder.com/300x450?text=FABULIO'">
                </a>
                <div class="card-grid-info">
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
        
        initDropdown();
        initSearch();
        
    } catch (error) {
        console.error('Erro ao carregar todos:', error);
        window.location.href = '404.html';
    }
}

carregarTodos();