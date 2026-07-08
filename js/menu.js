document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById("menuToggle");
  const wrapper = document.getElementById("navLinksWrapper");
  const dropdownTriggers = document.querySelectorAll(".dropdown-trigger");

  // Menu hambúrguer só abre no click
  if (toggleBtn && wrapper) {
    toggleBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      this.classList.toggle("active");
      wrapper.classList.toggle("open");

      // Fecha dropdowns quando o menu fecha
      if (!wrapper.classList.contains("open")) {
        document.querySelectorAll(".dropdown-menu.open").forEach((menu) => {
          menu.classList.remove("open");
        });
        dropdownTriggers.forEach((t) => t.classList.remove("open"));
      }
    });
  }

  // Dropdown só no mobile (<= 850px)
  dropdownTriggers.forEach((trigger) => {
    trigger.addEventListener("click", function (e) {
      if (window.innerWidth <= 850) {
        e.preventDefault();
        e.stopPropagation();

        const menu = this.nextElementSibling;
        if (menu) {
          const isOpen = menu.classList.contains("open");

          // Fecha todos
          document.querySelectorAll(".dropdown-menu.open").forEach((m) => {
            m.classList.remove("open");
          });
          dropdownTriggers.forEach((t) => t.classList.remove("open"));

          // Abre o atual se estava fechado
          if (!isOpen) {
            menu.classList.add("open");
            this.classList.add("open");
          }
        }
      }
    });
  });

  // Fechar ao clicar fora do menu ou dropdown
  document.addEventListener("click", function (e) {
    const navbar = document.querySelector(".navbar");
    if (navbar && !navbar.contains(e.target)) {
      if (wrapper) {
        wrapper.classList.remove("open");
      }
      if (toggleBtn) {
        toggleBtn.classList.remove("active");
      }
      document.querySelectorAll(".dropdown-menu.open").forEach((menu) => {
        menu.classList.remove("open");
      });
      dropdownTriggers.forEach((t) => t.classList.remove("open"));
    }
  });

  // Fechar ao redimensionar a tela para desktop
  window.addEventListener("resize", function () {
    if (window.innerWidth > 850) {
      if (wrapper) {
        wrapper.classList.remove("open");
      }
      if (toggleBtn) {
        toggleBtn.classList.remove("active");
      }
      document.querySelectorAll(".dropdown-menu.open").forEach((menu) => {
        menu.classList.remove("open");
      });
      dropdownTriggers.forEach((t) => t.classList.remove("open"));
    }
  });
});
