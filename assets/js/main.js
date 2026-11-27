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
      iniciarAcessibilidade();
      iniciarCarrossel();
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

  /* ACESSIBILIDADE: TAMANHO DA FONTE E ALTO CONTRASTE */
  function iniciarAcessibilidade() {
    var raiz = document.documentElement;
    var acoes = document.querySelector('.header-actions');
    if (!acoes) return;

    var controles = document.createElement('div');
    controles.className = 'accessibility-controls';
    controles.setAttribute('aria-label', 'Controles de acessibilidade');
    controles.innerHTML =
      '<button type="button" class="accessibility-btn" id="fonte-diminuir" aria-label="Diminuir tamanho da fonte" title="Diminuir fonte">A−</button>' +
      '<button type="button" class="accessibility-btn" id="fonte-aumentar" aria-label="Aumentar tamanho da fonte" title="Aumentar fonte">A+</button>' +
      '<button type="button" class="accessibility-btn contrast-toggle" id="alto-contraste" aria-pressed="false" title="Ativar alto contraste">◐ Contraste</button>';
    acoes.appendChild(controles);

    var tamanhos = [100, 110, 120, 130];
    var tamanhoSalvo = 100;
    try { tamanhoSalvo = Number(localStorage.getItem('pulso-fonte')) || 100; } catch (erro) {}
    if (tamanhos.indexOf(tamanhoSalvo) === -1) tamanhoSalvo = 100;

    function aplicarFonte() {
      raiz.style.fontSize = tamanhoSalvo + '%';
      var menos = document.getElementById('fonte-diminuir');
      var mais = document.getElementById('fonte-aumentar');
      menos.disabled = tamanhoSalvo === tamanhos[0];
      mais.disabled = tamanhoSalvo === tamanhos[tamanhos.length - 1];
      try { localStorage.setItem('pulso-fonte', String(tamanhoSalvo)); } catch (erro) {}
    }
    document.getElementById('fonte-aumentar').addEventListener('click', function () {
      var i = tamanhos.indexOf(tamanhoSalvo);
      if (i < tamanhos.length - 1) tamanhoSalvo = tamanhos[i + 1];
      aplicarFonte();
    });
    document.getElementById('fonte-diminuir').addEventListener('click', function () {
      var i = tamanhos.indexOf(tamanhoSalvo);
      if (i > 0) tamanhoSalvo = tamanhos[i - 1];
      aplicarFonte();
    });
    aplicarFonte();

    var contraste = false;
    try { contraste = localStorage.getItem('pulso-alto-contraste') === 'true'; } catch (erro) {}
    var botaoContraste = document.getElementById('alto-contraste');
    function aplicarContraste() {
      raiz.setAttribute('data-contrast', contraste ? 'high' : 'normal');
      botaoContraste.setAttribute('aria-pressed', String(contraste));
      botaoContraste.textContent = contraste ? '✓ Contraste' : '◐ Contraste';
      botaoContraste.title = contraste ? 'Desativar alto contraste' : 'Ativar alto contraste';
      try { localStorage.setItem('pulso-alto-contraste', String(contraste)); } catch (erro) {}
    }
    botaoContraste.addEventListener('click', function () {
      contraste = !contraste;
      aplicarContraste();
    });
    aplicarContraste();
  }

  /* CARROSSEL DA PÁGINA INICIAL */
  function iniciarCarrossel() {
    var carrossel = document.querySelector('[data-carousel]');
    if (!carrossel) return;
    var slides = Array.prototype.slice.call(carrossel.querySelectorAll('.carousel-slide'));
    var anterior = carrossel.querySelector('[data-carousel-prev]');
    var proximo = carrossel.querySelector('[data-carousel-next]');
    var indicadores = carrossel.querySelector('[data-carousel-dots]');
    if (!slides.length || !anterior || !proximo || !indicadores) return;

    var atual = 0;
    var intervalo = null;
    indicadores.innerHTML = slides.map(function (_, i) {
      return '<button type="button" class="carousel-dot" aria-label="Ir para imagem ' + (i + 1) + '" aria-current="' + (i === 0 ? 'true' : 'false') + '" data-slide="' + i + '"></button>';
    }).join('');
    var pontos = Array.prototype.slice.call(indicadores.querySelectorAll('button'));

    function mostrar(indice) {
      atual = (indice + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.hidden = i !== atual;
        slide.setAttribute('aria-hidden', String(i !== atual));
      });
      pontos.forEach(function (ponto, i) {
        ponto.setAttribute('aria-current', String(i === atual));
      });
    }
    function iniciarAuto() {
      pararAuto();
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        intervalo = window.setInterval(function () { mostrar(atual + 1); }, 5000);
      }
    }
    function pararAuto() {
      if (intervalo) window.clearInterval(intervalo);
      intervalo = null;
    }
    anterior.addEventListener('click', function () { mostrar(atual - 1); iniciarAuto(); });
    proximo.addEventListener('click', function () { mostrar(atual + 1); iniciarAuto(); });
    indicadores.addEventListener('click', function (evento) {
      var botao = evento.target.closest('[data-slide]');
      if (!botao) return;
      mostrar(Number(botao.dataset.slide));
      iniciarAuto();
    });
    carrossel.addEventListener('mouseenter', pararAuto);
    carrossel.addEventListener('mouseleave', iniciarAuto);
    carrossel.addEventListener('focusin', pararAuto);
    carrossel.addEventListener('focusout', iniciarAuto);
    mostrar(0);
    iniciarAuto();
  }
