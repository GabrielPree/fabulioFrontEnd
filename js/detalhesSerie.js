import getDados from "./getDados.js";
import { initDropdown } from "./dropdown.js";
import { initSearch } from './search.js';

const params = new URLSearchParams(window.location.search);
const serieId = params.get('id');

let temporadaAtual = 1;

// Carregar informações da série
async function carregarSerie() {
    if (!serieId) {
        window.location.href = '404.html';
        return;
    }

    try {
        const serieData = await getDados(`/series/${serieId}`);
        
        if (!serieData || Object.keys(serieData).length === 0) {
            window.location.href = '404.html';
            return;
        }

        console.log('Dados da série:', serieData);

        const heroSection = document.querySelector('.detail-hero');
        if (heroSection) {
            heroSection.style.backgroundImage = `url('${serieData.background}')`;
        }

        // Verificar se tem logo da série na API
        const logoImage = document.getElementById('logoImage');
        const tituloElement = document.getElementById('titulo-serie');
        
        if (logoImage && tituloElement) {
            if (serieData.logo && serieData.logo !== '') {
                logoImage.src = serieData.logo;
                logoImage.style.display = 'block';
                logoImage.classList.add('serie-logo-img');
                tituloElement.style.display = 'none';
            } else {
                logoImage.style.display = 'none';
                tituloElement.style.display = 'block';
                tituloElement.textContent = serieData.titulo;
            }
        }
        
        // Preencher sinopse
        const sinopseElement = document.getElementById('sinopse-serie');
        if (sinopseElement) {
            sinopseElement.textContent = serieData.sinopse || 'Sinopse em breve.';
        }
        
        // Preencher avaliação
        const avaliacaoElement = document.getElementById('avaliacao');
        if (avaliacaoElement) {
            avaliacaoElement.textContent = serieData.avaliacao || 'N/A';
        }
        
        // Preencher gêneros
        const generosElement = document.getElementById('generos');
        if (generosElement) {
            if (serieData.generos && serieData.generos.length > 0) {
                generosElement.textContent = serieData.generos.map(g => 
                    g.charAt(0).toUpperCase() + g.slice(1).toLowerCase()
                ).join(', ');
            } else {
                generosElement.textContent = 'N/A';
            }
        }
        
        // Preencher ano
        const anoElement = document.getElementById('ano');
        if (anoElement) {
            anoElement.textContent = serieData.anoLancamento || serieData.ano || 'N/A';
        }
        
        // Preencher atores
        const atoresElement = document.getElementById('atores');
        if (atoresElement) {
            atoresElement.textContent = serieData.atores || 'Informações em breve';
        }
        
        // Preencher box de informações (final da página)
        const infoAvaliacao = document.getElementById('info-avaliacao');
        if (infoAvaliacao) infoAvaliacao.textContent = `${serieData.avaliacao || 'N/A'}/10`;
        
        const infoGeneros = document.getElementById('info-generos');
        if (infoGeneros) {
            if (serieData.generos && serieData.generos.length > 0) {
                infoGeneros.textContent = serieData.generos.map(g => 
                    g.charAt(0).toUpperCase() + g.slice(1).toLowerCase()
                ).join(', ');
            } else {
                infoGeneros.textContent = 'N/A';
            }
        }
        
        const infoAno = document.getElementById('info-ano');
        if (infoAno) infoAno.textContent = serieData.anoLancamento || serieData.ano || 'N/A';
        
        const infoAtores = document.getElementById('info-atores');
        if (infoAtores) infoAtores.textContent = serieData.atores || 'Informações em breve';
        
        const infoSinopse = document.getElementById('info-sinopse');
        if (infoSinopse) infoSinopse.textContent = serieData.sinopse || 'Sinopse em breve.';
        
        // Poster lateral
        const posterSide = document.getElementById('poster-side');
        if (posterSide && serieData.poster) {
            posterSide.src = serieData.poster;
            posterSide.alt = serieData.titulo;
        }
        
        // Botão favoritar
    const btnFav = document.getElementById('btn-fav');
    if (btnFav) {
        // Verificar se já está favoritado
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
        if (favoritos.includes(`serie_${serieId}`)) {
            btnFav.textContent = '❤ Favoritado';
            btnFav.classList.add('favoritado');
        }
        
        btnFav.onclick = () => {
            let fav = JSON.parse(localStorage.getItem('favoritos')) || [];
            const itemId = `serie_${serieId}`;
            
            if (!fav.includes(itemId)) {
                fav.push(itemId);
                localStorage.setItem('favoritos', JSON.stringify(fav));
                btnFav.textContent = '❤ Favoritado';
                btnFav.classList.add('favoritado');
            } else {
                fav = fav.filter(id => id !== itemId);
                localStorage.setItem('favoritos', JSON.stringify(fav));
                btnFav.textContent = '❤ Favoritar';
                btnFav.classList.remove('favoritado');
            }
        };
    }
        
        // Botão assistir
        const btnAssistir = document.getElementById('btn-assistir');
        if (btnAssistir) {
            btnAssistir.onclick = () => {
                alert('Reprodução iniciada! (apenas simulação)');
            };
        }
        
        // Carregar recomendados
        if (serieData.generos && serieData.generos.length > 0) {
            await carregarRecomendadosSeries(serieData.generos);
        }
        
    } catch (error) {
        console.error('Erro ao carregar serie:', error);
        window.location.href = '404.html';
    }
}

// Carregar séries recomendadas do mesmo gênero
async function carregarRecomendadosSeries(generos) {
    if (!generos || generos.length === 0) return;
    
    try {
        const todasSeries = await getDados('/series');
        const generoPrincipal = generos[0].toLowerCase();
        
        const recomendados = todasSeries
            .filter(serie => 
                serie.id != serieId && 
                serie.generos && 
                serie.generos.some(g => g.toLowerCase() === generoPrincipal)
            )
            .slice(0, 10);
        
        const carrossel = document.getElementById('recomendadosCarrosselSeries');
        
        if (recomendados.length === 0) {
            carrossel.innerHTML = '<div class="loading">Nenhuma série recomendada encontrada.</div>';
            return;
        }
        
        carrossel.innerHTML = recomendados.map(serie => `
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
                        ${serie.avaliacao ?? 'N/A'}/10
                    </span>
                </div>
            </div>
        `).join('');
        
        // Configurar scroll do carrossel
        const wrapper = carrossel.closest('.carrossel-wrapper');
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
        
    } catch (error) {
        console.error('Erro ao carregar séries recomendadas:', error);
    }
}

// Carregar temporadas
async function carregarTemporadas() {
    try {
        const temporadas = await getDados(`/series/${serieId}/temporadas/todas`);
        
        if (!temporadas || temporadas.length === 0) {
            document.getElementById('episodios-container').innerHTML = '<p>Nenhuma temporada disponível no momento.</p>';
            return;
        }
        
        const temps = [...new Set(temporadas.map(ep => ep.temporada))].sort((a,b) => a - b);
        
        const tempBar = document.getElementById('tempBar');
        tempBar.innerHTML = temps.map(temp => `
            <button class="temp-btn ${temp === 1 ? 'active' : ''}" data-temporada="${temp}">
                Temporada ${temp}
            </button>
        `).join('');
        
        document.querySelectorAll('.temp-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.temp-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                temporadaAtual = parseInt(btn.dataset.temporada);
                carregarEpisodios(temporadaAtual);
            });
        });
        
        if (temps.length > 0) {
            await carregarEpisodios(temps[0]);
        }
        
    } catch (error) {
        console.error('Erro ao carregar temporadas:', error);
        document.getElementById('episodios-container').innerHTML = '<div class="loading">Erro ao carregar episódios.</div>';
    }
}

// Carregar episódios
async function carregarEpisodios(temporada) {
    try {
        const episodios = await getDados(`/series/${serieId}/temporadas/${temporada}`);
        
        const container = document.getElementById('episodios-container');
        
        if (!episodios || episodios.length === 0) {
            container.innerHTML = '<div class="loading">Nenhum episódio encontrado para esta temporada.</div>';
            return;
        }
        
        container.innerHTML = `
            <div class="episodios-grid">
                ${episodios.map(ep => `
                    <div class="episodio-card">
                        <div class="episodio-num">Ep. ${ep.numeroEpisodio || ep.numero || '?'}</div>
                        <div class="episodio-info">
                            <h4>${escapeHtml(ep.titulo)}</h4>
                        </div>
                        <button class="btn-primary" style="padding: 6px 16px; font-size: 0.8rem;" onclick="alert('Assistindo episódio: ${escapeHtml(ep.titulo)} (apenas simulação)')">
                            ▶ Assistir
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        
    } catch (error) {
        console.error('Erro ao carregar episódios:', error);
        document.getElementById('episodios-container').innerHTML = '<div class="loading">Erro ao carregar episódios.</div>';
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Inicializar
async function init() {
    await carregarSerie();
    await carregarTemporadas();
    initDropdown();
    initSearch();
}

init();