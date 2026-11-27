(function () {
  'use strict';

  function iniciarAbas(raiz) {
    var lista = raiz.querySelector('[role="tablist"]');
    if (!lista) { return; }
    var abas = Array.prototype.slice.call(lista.querySelectorAll('[role="tab"]'));

    function selecionar(aba, focar) {
      abas.forEach(function (a) {
        var ativa = a === aba;
        a.setAttribute('aria-selected', String(ativa));
        a.tabIndex = ativa ? 0 : -1;
        var painel = document.getElementById(a.getAttribute('aria-controls'));
        if (painel) { painel.hidden = !ativa; }
      });
      if (focar) { aba.focus(); }
      lista.dispatchEvent(new CustomEvent('abaalterada', { bubbles: true, detail: { id: aba.id } }));
    }

    abas.forEach(function (aba, i) {
      aba.addEventListener('click', function () { selecionar(aba, false); });
      aba.addEventListener('keydown', function (e) {
        var novo = null;
        if (e.key === 'ArrowRight') { novo = abas[(i + 1) % abas.length]; }
        else if (e.key === 'ArrowLeft') { novo = abas[(i - 1 + abas.length) % abas.length]; }
        else if (e.key === 'Home') { novo = abas[0]; }
        else if (e.key === 'End') { novo = abas[abas.length - 1]; }
        if (novo) { e.preventDefault(); selecionar(novo, true); }
      });
    });

    // Permite abrir direto uma aba pelo endereço, ex.: login.html#cadastro
    abas.forEach(function (aba) {
      if (aba.dataset.hash && '#' + aba.dataset.hash === window.location.hash) { selecionar(aba, false); }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.forEach.call(document.querySelectorAll('[data-tabs]'), iniciarAbas);
  });
})();