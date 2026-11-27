(function () {
  'use strict';

  var raiz = document.documentElement;

  // Avisa o CSS de que o JavaScript está funcionando.
  raiz.classList.add('js');

  // TEMA
  var CHAVE_TEMA = 'pulso-tema';

  // Lê o tema salvo. O escuro é o padrão e também o plano B se o localStorage estiver bloqueado.
  function lerTema() {
    try {
      return localStorage.getItem(CHAVE_TEMA) === 'light' ? 'light' : 'dark';
    } catch (erro) {
      return 'dark';
    }
  }

  function salvarTema(tema) {
    try {
      localStorage.setItem(CHAVE_TEMA, tema);
    } catch (erro) {
      // Ignora caso o armazenamento esteja bloqueado.
    }
  }

  function aplicarTema(tema) {
    raiz.setAttribute('data-theme', tema);
  }

  // Aplica o tema antes da página aparecer para evitar o efeito de piscar.
  aplicarTema(lerTema());

  // O restante espera a página carregar.
  document.addEventListener('DOMContentLoaded', function () {
    iniciarTema();
    iniciarMenu();
  });

  function iniciarTema() {
    var botaoTema = document.querySelector('.theme-toggle');
    if (!botaoTema) { return; }

    // O rótulo descreve a ação do botão.
    function atualizarBotao() {
      var rotulo = raiz.getAttribute('data-theme') === 'light'
        ? 'Ativar modo escuro'
        : 'Ativar modo claro';
      botaoTema.setAttribute('aria-label', rotulo);
      botaoTema.setAttribute('title', rotulo);
    }

    botaoTema.addEventListener('click', function () {
      var novo = raiz.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      aplicarTema(novo);
      salvarTema(novo);
      atualizarBotao();
    });

    atualizarBotao();
  }

  // MENU HAMBÚRGUER
  function iniciarMenu() {
    var botao = document.querySelector('.nav-toggle');
    var menu = document.getElementById('menu-principal');
    if (!botao || !menu) { return; }

    // Mesmo ponto de quebra definido no responsive.css.
    var telaGrande = window.matchMedia('(min-width: 768px)');

    // Abre ou fecha o menu e atualiza os atributos de acessibilidade.
    function definirMenu(aberto) {
      menu.classList.toggle('is-open', aberto);
      botao.setAttribute('aria-expanded', String(aberto));
      botao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    }

    function menuAberto() {
      return menu.classList.contains('is-open');
    }

    // Clique no botão: alterna o menu.
    botao.addEventListener('click', function () {
      definirMenu(!menuAberto());
    });

    // Clique em um link do menu: fecha.
    menu.addEventListener('click', function (evento) {
      if (evento.target.closest('a')) { definirMenu(false); }
    });

    // Clique fora do menu e do botão: fecha.
    document.addEventListener('click', function (evento) {
      if (menuAberto() && !menu.contains(evento.target) && !botao.contains(evento.target)) {
        definirMenu(false);
      }
    });

    // Tecla Esc: fecha e devolve o foco ao botão.
    document.addEventListener('keydown', function (evento) {
      if (evento.key === 'Escape' && menuAberto()) {
        definirMenu(false);
        botao.focus();
      }
    });

    // Ao ampliar a tela para tablet/desktop, fecha o menu.
    telaGrande.addEventListener('change', function (evento) {
      if (evento.matches) { definirMenu(false); }
    });
  }
})();

