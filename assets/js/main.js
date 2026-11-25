(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var botao = document.querySelector('.nav-toggle');
  var menu = document.getElementById('menu-principal');
  if (!botao || !menu) { return; }

  var telaGrande = window.matchMedia('(min-width: 768px)');

  function definirMenu(aberto) {
    menu.classList.toggle('is-open', aberto);
    botao.setAttribute('aria-expanded', String(aberto));
    botao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  }

  function menuAberto() {
    return menu.classList.contains('is-open');
  }

  botao.addEventListener('click', function () {
    definirMenu(!menuAberto());
  });

  menu.addEventListener('click', function (evento) {
    if (evento.target.closest('a')) { definirMenu(false); }
  });

  document.addEventListener('click', function (evento) {
    if (menuAberto() && !menu.contains(evento.target) && !botao.contains(evento.target)) {
      definirMenu(false);
    }
  });

  document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape' && menuAberto()) {
      definirMenu(false);
      botao.focus();
    }
  });

  telaGrande.addEventListener('change', function (evento) {
    if (evento.matches) { definirMenu(false); }
  });
})();
