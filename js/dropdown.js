// Dropdown centralizado para todas as paginas
export function initDropdown() {
  const dropdownTrigger = document.querySelector(".dropdown-trigger");
  const dropdownMenu = document.querySelector(".dropdown-menu");

  if (!dropdownTrigger || !dropdownMenu) return;

  dropdownTrigger.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropdownMenu.classList.toggle("show");
  });

  document.addEventListener("click", (e) => {
    if (
      !dropdownTrigger.contains(e.target) &&
      !dropdownMenu.contains(e.target)
    ) {
      dropdownMenu.classList.remove("show");
    }
  });

  // Os links do dropdown ja estao no HTML
  dropdownMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (e) => {
      dropdownMenu.classList.remove("show");
    });
  });
}
