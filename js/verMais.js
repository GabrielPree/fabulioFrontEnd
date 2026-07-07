export function atualizarVerMaisLink(linkElement, href, totalItens, limite = 15) {
    if (!linkElement) return;

    if (totalItens > limite) {
        linkElement.href = href;
        linkElement.style.display = 'inline-flex';
    } else {
        linkElement.style.display = 'none';
    }
}