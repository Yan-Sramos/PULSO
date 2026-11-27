(function () {
  'use strict';

  var CHAVE_USUARIOS = 'pulso-usuarios';
  var CHAVE_SESSAO = 'pulso-sessao';
  var PAGINA_CONTA = 'perfil.html';

  var OBJETIVOS = { emagrecer: 'Emagrecer', massa: 'Ganhar massa', manter: 'Manter a forma', condicionamento: 'Melhorar o condicionamento' };
  var NIVEIS = { iniciante: 'Iniciante', intermediario: 'Intermediário', avancado: 'Avançado' };

  function ler(chave, padrao) {
    try {
      var texto = localStorage.getItem(chave);
      return texto ? JSON.parse(texto) : padrao;
    } catch (erro) { return padrao; }
  }
  function gravar(chave, valor) {
    try { localStorage.setItem(chave, JSON.stringify(valor)); return true; }
    catch (erro) { return false; }
  }

  function listarUsuarios() { return ler(CHAVE_USUARIOS, []); }

  function usuarioAtual() {
    var id = ler(CHAVE_SESSAO, null);
    if (!id) { return null; }
    var lista = listarUsuarios();
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].id === id) { return lista[i]; }
    }
    return null;
  }

  function atualizarUsuario(dados) {
    var id = ler(CHAVE_SESSAO, null);
    var lista = listarUsuarios();
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].id === id) {
        Object.assign(lista[i], dados);
        return gravar(CHAVE_USUARIOS, lista) ? lista[i] : null;
      }
    }
    return null;
  }

  function sair() {
    try { localStorage.removeItem(CHAVE_SESSAO); } catch (erro) { /* ignora */ }
  }

  function excluirConta() {
    var id = ler(CHAVE_SESSAO, null);
    var restantes = listarUsuarios().filter(function (u) { return u.id !== id; });
    gravar(CHAVE_USUARIOS, restantes);
    try {
      var apagar = [];
      for (var i = 0; i < localStorage.length; i++) {
        var chave = localStorage.key(i);
        if (chave.indexOf('pulso-dados-' + id + '-') === 0) { apagar.push(chave); }
      }
      apagar.forEach(function (c) { localStorage.removeItem(c); });
    } catch (erro) { /* ignora */ }
    sair();
  }

  function chaveDados(nome) {
    var u = usuarioAtual();
    return u ? 'pulso-dados-' + u.id + '-' + nome : null;
  }

  window.PulsoAuth = {
    usuarioAtual: usuarioAtual, atualizarUsuario: atualizarUsuario, sair: sair,
    chaveDados: chaveDados, paginaConta: PAGINA_CONTA, objetivos: OBJETIVOS, niveis: NIVEIS
  };

  function validarNome(v) {
    v = v.trim();
    if (!v) { return 'Informe seu nome.'; }
    if (v.length < 3) { return 'O nome deve ter pelo menos 3 caracteres.'; }
    if (v.length > 60) { return 'O nome deve ter no máximo 60 caracteres.'; }
    return '';
  }
  function validarEmail(v) {
    v = v.trim();
    if (!v) { return 'Informe seu e-mail.'; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { return 'Digite um e-mail válido, como nome@exemplo.com.'; }
    return '';
  }
  function validarSenha(v) {
    if (!v) { return 'Informe uma senha.'; }
    if (v.length < 8) { return 'A senha deve ter pelo menos 8 caracteres.'; }
    if (!/[A-Za-z]/.test(v) || !/[0-9]/.test(v)) { return 'A senha deve ter letras e números.'; }
    return '';
  }
  function exigir(mensagem) {
    return function (v) { return v ? '' : mensagem; };
  }
  function numero(min, max, obrigatorio) {
    return function (v) {
      v = String(v).trim();
      if (!v) { return obrigatorio ? 'Informe um valor.' : ''; }
      var n = Number(v.replace(',', '.'));
      if (isNaN(n) || n < min || n > max) { return 'Informe um valor entre ' + min + ' e ' + max + '.'; }
      return '';
    };
  }

  function mostrarErro(campo, texto) {
    var p = document.getElementById(campo.id + '-erro');
    p.textContent = texto;
    p.hidden = false;
    campo.setAttribute('aria-invalid', 'true');
  }
  function limparErro(campo) {
    var p = document.getElementById(campo.id + '-erro');
    p.textContent = '';
    p.hidden = true;
    campo.removeAttribute('aria-invalid');
  }
  function validar(regras) {
    var primeiro = null;
    regras.forEach(function (r) {
      var texto = r[1](r[0].value);
      if (texto) { mostrarErro(r[0], texto); if (!primeiro) { primeiro = r[0]; } }
      else { limparErro(r[0]); }
    });
    if (primeiro) { primeiro.focus(); }
    return !primeiro;
  }
  function mostrarStatus(el, tipo, texto) {
    el.className = 'status alert alert-' + (tipo === 'erro' ? 'erro' : 'ok');
    el.textContent = (tipo === 'erro' ? 'Erro: ' : 'Sucesso: ') + texto;
  }
  function limparStatus(el) { el.className = 'status'; el.textContent = ''; }

  function limparErroAoDigitar(form) {
    form.addEventListener('input', function (e) {
      if (e.target.id && document.getElementById(e.target.id + '-erro')) { limparErro(e.target); }
    });
  }

  function iniciarMostrarSenha() {
    Array.prototype.forEach.call(document.querySelectorAll('.mostrar-senha'), function (caixa) {
      caixa.addEventListener('change', function () {
        caixa.getAttribute('data-alvos').split(' ').forEach(function (id) {
          document.getElementById(id).type = caixa.checked ? 'text' : 'password';
        });
      });
    });
  }

  function atualizarCabecalho() {
    var link = document.querySelector('.header-cta');
    if (link && usuarioAtual()) {
      link.textContent = 'Conta';
      link.setAttribute('href', PAGINA_CONTA);
      link.setAttribute('aria-label', 'Minha conta');
    }
  }

  function iniciarLogin() {
    var form = document.getElementById('form-login');
    var status = document.getElementById('login-status');
    var email = document.getElementById('login-email');
    var senha = document.getElementById('login-senha');
    limparErroAoDigitar(form);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      limparStatus(status);
      if (!validar([[email, validarEmail], [senha, exigir('Informe sua senha.')]])) { return; }

      var achado = listarUsuarios().filter(function (u) {
        return u.email === email.value.trim().toLowerCase() && u.senha === senha.value;
      })[0];

      if (!achado) { mostrarStatus(status, 'erro', 'E-mail ou senha incorretos.'); return; }
      if (!gravar(CHAVE_SESSAO, achado.id)) { mostrarStatus(status, 'erro', 'Não foi possível salvar a sessão neste navegador.'); return; }
      mostrarStatus(status, 'ok', 'Login realizado. Redirecionando...');
      setTimeout(function () { window.location.href = PAGINA_CONTA; }, 700);
    });
  }

  function iniciarCadastro() {
    var form = document.getElementById('form-cadastro');
    var status = document.getElementById('cadastro-status');
    var nome = document.getElementById('cad-nome');
    var email = document.getElementById('cad-email');
    var senha = document.getElementById('cad-senha');
    var conf = document.getElementById('cad-confirmar');
    limparErroAoDigitar(form);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      limparStatus(status);
      var ok = validar([
        [nome, validarNome], [email, validarEmail], [senha, validarSenha],
        [conf, function (v) { return !v ? 'Confirme a senha.' : (v !== senha.value ? 'As senhas não coincidem.' : ''); }]
      ]);
      if (!ok) { return; }

      var emailFinal = email.value.trim().toLowerCase();
      var lista = listarUsuarios();
      var existe = lista.some(function (u) { return u.email === emailFinal; });
      if (existe) { mostrarErro(email, 'Este e-mail já está cadastrado. Use a aba Entrar.'); email.focus(); return; }

      var usuario = {
        id: 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        nome: nome.value.trim(), email: emailFinal, senha: senha.value,
        objetivo: 'manter', nivel: 'iniciante', altura: '', metaPeso: '', metaTreinos: 3,
        criadoEm: new Date().toISOString()
      };
      lista.push(usuario);
      if (!gravar(CHAVE_USUARIOS, lista) || !gravar(CHAVE_SESSAO, usuario.id)) {
        mostrarStatus(status, 'erro', 'Não foi possível salvar os dados neste navegador.');
        return;
      }
      mostrarStatus(status, 'ok', 'Conta de demonstração criada. Redirecionando...');
      setTimeout(function () { window.location.href = PAGINA_CONTA; }, 900);
    });
  }

  function iniciarPerfil() {
    var u = usuarioAtual();
    var aviso = document.getElementById('aviso-login');
    var area = document.getElementById('area-perfil');
    if (!u) { aviso.hidden = false; return; }
    area.hidden = false;

    var campos = {
      nome: document.getElementById('perfil-nome'),
      objetivo: document.getElementById('perfil-objetivo'),
      nivel: document.getElementById('perfil-nivel'),
      altura: document.getElementById('perfil-altura'),
      metaPeso: document.getElementById('perfil-meta-peso'),
      metaTreinos: document.getElementById('perfil-meta-treinos')
    };
    var form = document.getElementById('form-perfil');
    var status = document.getElementById('perfil-status');
    limparErroAoDigitar(form);

    function mostrarResumo(usuario) {
      var textos = {
        nome: usuario.nome, email: usuario.email,
        objetivo: OBJETIVOS[usuario.objetivo], nivel: NIVEIS[usuario.nivel],
        altura: usuario.altura ? usuario.altura + ' cm' : 'Não informada',
        metaPeso: usuario.metaPeso ? usuario.metaPeso + ' kg' : 'Não informada',
        metaTreinos: usuario.metaTreinos + (Number(usuario.metaTreinos) === 1 ? ' treino por semana' : ' treinos por semana'),
        criadoEm: new Date(usuario.criadoEm).toLocaleDateString('pt-BR')
      };
      Array.prototype.forEach.call(document.querySelectorAll('[data-resumo]'), function (el) {
        el.textContent = textos[el.getAttribute('data-resumo')];
      });
      document.getElementById('avatar').textContent = usuario.nome.trim().charAt(0).toUpperCase();
    }

    function preencherForm(usuario) {
      Object.keys(campos).forEach(function (k) { campos[k].value = usuario[k]; });
    }

    mostrarResumo(u);
    preencherForm(u);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      limparStatus(status);
      var ok = validar([
        [campos.nome, validarNome], [campos.altura, numero(100, 250, false)],
        [campos.metaPeso, numero(30, 300, false)], [campos.metaTreinos, numero(1, 7, true)]
      ]);
      if (!ok) { return; }

      var novo = atualizarUsuario({
        nome: campos.nome.value.trim(), objetivo: campos.objetivo.value, nivel: campos.nivel.value,
        altura: campos.altura.value.trim(), metaPeso: campos.metaPeso.value.trim(),
        metaTreinos: Math.round(Number(campos.metaTreinos.value))
      });
      if (!novo) { mostrarStatus(status, 'erro', 'Não foi possível salvar neste navegador.'); return; }
      mostrarResumo(novo);
      mostrarStatus(status, 'ok', 'Perfil atualizado.');
    });

    document.getElementById('btn-sair').addEventListener('click', function () {
      sair();
      window.location.href = 'index.html';
    });

    document.getElementById('btn-excluir').addEventListener('click', function () {
      if (window.confirm('Excluir sua conta de demonstração e todos os dados salvos neste navegador? Isso não pode ser desfeito.')) {
        excluirConta();
        window.location.href = 'index.html';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    atualizarCabecalho();
    iniciarMostrarSenha();

    if (document.getElementById('form-login')) {
      if (usuarioAtual()) { window.location.replace(PAGINA_CONTA); return; }
      iniciarLogin();
      iniciarCadastro();
    }
    if (document.getElementById('area-perfil')) { iniciarPerfil(); }
  });
})();