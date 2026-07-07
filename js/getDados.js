const baseURL = 'http://localhost:8080';

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