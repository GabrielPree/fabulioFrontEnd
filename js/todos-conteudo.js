import getDados from "./getDados.js";
import { initDropdown } from "./dropdown.js";
import { initSearch } from './search.js';

const params = new URLSearchParams(window.location.search);
const tipo = params.get('tipo');
const secao = params.get('secao');

// Tipos válidos para redirecionamento
const tiposValidos = ['filmes', 'series'];
const secoesValidas = ['lancamentos', 'melhores'];

function obterTitulo(tipoValor, secaoValor) {
    const tipoTexto = tipoValor === 'filmes' ? 'Filmes' : 'Séries';
    const secaoTexto = secaoValor === 'lancamentos' ? 'Lançamentos' : 'Melhores';
    return `${tipoTexto} - ${secaoTexto}`;
}

async function carregarConteudo() {
    // Redirecionar para 404 se o tipo não estiver presente ou for inválido
    if (!tipo || !tiposValidos.includes(tipo)) {
        window.location.href = '404.html';
        return;
    }
    
    // Redirecionar para 404 se a seção não estiver presente ou for inválida
    if (!secao || !secoesValidas.includes(secao)) {
        window.location.href = '404.html';
        return;
    }

    const tipoValido = tipo;
    const secaoValida = secao;
    const titulo = obterTitulo(tipoValido, secaoValida);

    document.getElementById('paginaTitulo').textContent = titulo;
    document.getElementById('paginaDesc').textContent = `Todos os ${secaoValida === 'lancamentos' ? 'lançamentos' : 'melhores'} de ${tipoValido === 'filmes' ? 'filmes' : 'séries'}.`;

    try {
        const endpoint = secaoValida === 'melhores'
            ? `/${tipoValido}/melhores`
            : `/${tipoValido}/lancamentos`;

        const itens = await getDados(endpoint);
        const container = document.getElementById('todosGrid');
        const paginaDestino = tipoValido === 'filmes' ? '/pages/detalhesFilme.html' : '/pages/detalhesSerie.html';

        // Se não houver itens, redirecionar para 404
        if (!itens || itens.length === 0) {
            window.location.href = '404.html';
            return;
        }
        
        container.innerHTML = itens.map(item => `
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
        console.error('Erro ao carregar conteúdo:', error);
        window.location.href = '404.html';
    }
}

carregarConteudo();