(function () {
    'use strict';

    var raiz = document.documentElement;

    raiz.classList.add('js');

    /* TEMA  */
    var CHAVE_TEMA = 'pulso-tema';

    // Lê o tema salvo. O escuro é o padrão (e também o plano B se o
    // localStorage estiver bloqueado).
    function lerTema() {
      try {
        return localStorage.getItem(CHAVE_TEMA) === 'light' ? 'light' : 'dark';
      } catch (erro) {
        return 'dark';
      }
    }

    function salvarTema(tema) {
      try { localStorage.setItem(CHAVE_TEMA, tema); } catch (erro) { /* ignora */ }
    }

    function aplicarTema(tema) {
      raiz.setAttribute('data-theme', tema);
    }

    // Aplica já, antes da página aparecer, para não piscar o tema errado
    aplicarTema(lerTema());

    /* ---------- O RESTO ESPERA A PÁGINA CARREGAR ---------- */
    document.addEventListener('DOMContentLoaded', function () {
      iniciarTema();
      iniciarMenu();
    });

    function iniciarTema() {
      var botaoTema = document.querySelector('.theme-toggle');
      if (!botaoTema) { return; }

      // O rótulo descreve a AÇÃO do botão (o ícone também muda)
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

    /* ---------- MENU HAMBÚRGUER ---------- */
    function iniciarMenu() {
      var botao = document.querySelector('.nav-toggle');
      var menu = document.getElementById('menu-principal');
      if (!botao || !menu) { return; }

      // Telas de tablet para cima (mesmo valor do responsive.css)
      var telaGrande = window.matchMedia('(min-width: 768px)');

      // Abre ou fecha o menu e mantém os atributos de acessibilidade em dia
      function definirMenu(aberto) {
        menu.classList.toggle('is-open', aberto);
        botao.setAttribute('aria-expanded', String(aberto));
        botao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
      }

      function menuAberto() {
        return menu.classList.contains('is-open');
      }

      // Clique no botão: alterna o menu
      botao.addEventListener('click', function () {
        definirMenu(!menuAberto());
      });

      // Clique em um link do menu: fecha
      menu.addEventListener('click', function (evento) {
        if (evento.target.closest('a')) { definirMenu(false); }
      });

      // Clique fora do menu e do botão: fecha
      document.addEventListener('click', function (evento) {
        if (menuAberto() && !menu.contains(evento.target) && !botao.contains(evento.target)) {
          definirMenu(false);
        }
      });

      // Tecla Esc: fecha e devolve o foco ao botão
      document.addEventListener('keydown', function (evento) {
        if (evento.key === 'Escape' && menuAberto()) {
          definirMenu(false);
          botao.focus();
        }
      });

      // Ao ampliar a tela para tablet/desktop, volta ao estado fechado
      telaGrande.addEventListener('change', function (evento) {
        if (evento.matches) { definirMenu(false); }
      });
    }
  })();