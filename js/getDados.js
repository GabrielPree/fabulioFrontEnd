// deixe http://localhost:8080 se estiver rodando localmente, caso contrário, altere para a URL do seu backend
const baseURL = 'https://fabulio.onrender.com';

export default async function getDados(endpoint) {
    try {
        const response = await fetch(`${baseURL}${endpoint}`);

        // Se for 404, retorna array vazio
        if (response.status === 404) {
            console.warn(`Endpoint não encontrado: ${endpoint}`);
            return [];
        }

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        return [];
    }
}