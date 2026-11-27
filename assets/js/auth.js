\
(function () {\
&#x20; 'use strict';\
\
&#x20; var CHAVE_USUARIOS = 'pulso-usuarios';\
&#x20; var CHAVE_SESSAO = 'pulso-sessao';\
&#x20; var PAGINA_CONTA = 'perfil.html';   // no Lote C passa a ser 'dashboard.html'\
\
&#x20; var OBJETIVOS = { emagrecer: 'Emagrecer', massa: 'Ganhar massa', manter: 'Manter a forma', condicionamento: 'Melhorar o condicionamento' };\
&#x20; var NIVEIS = { iniciante: 'Iniciante', intermediario: 'Intermediário', avancado: 'Avançado' };\
\
&#x20; /\*  Armazenamento (com plano B se estiver bloqueado)  \*/\
&#x20; function ler(chave, padrao) {\
&#x20;   try {\
&#x20;     var texto = localStorage.getItem(chave);\
&#x20;     return texto ? JSON.parse(texto) : padrao;\
&#x20;   } catch (erro) { return padrao; }\
&#x20; }\
&#x20; function gravar(chave, valor) {\
&#x20;   try { localStorage.setItem(chave, JSON.stringify(valor)); return true; }\
&#x20;   catch (erro) { return false; }\
&#x20; }\
\
&#x20; /\*  Usuários e sessão \*/\
&#x20; function listarUsuarios() { return ler(CHAVE_USUARIOS, []); }\
\
&#x20; function usuarioAtual() {\
&#x20;   var id = ler(CHAVE_SESSAO, null);\
&#x20;   if (!id) { return null; }\
&#x20;   var lista = listarUsuarios();\
&#x20;   for (var i = 0; i < lista.length; i++) {\
&#x20;     if (lista[i].id === id) { return lista[i]; }\
&#x20;   }\
&#x20;   return null;\
&#x20; }\
\
&#x20; // Atualiza o usuário logado. Devolve o usuário novo ou null se falhar.\
&#x20; function atualizarUsuario(dados) {\
&#x20;   var id = ler(CHAVE_SESSAO, null);\
&#x20;   var lista = listarUsuarios();\
&#x20;   for (var i = 0; i < lista.length; i++) {\
&#x20;     if (lista[i].id === id) {\
&#x20;       Object.assign(lista[i], dados);\
&#x20;       return gravar(CHAVE_USUARIOS, lista) ? lista[i] : null;\
&#x20;     }\
&#x20;   }\
&#x20;   return null;\
&#x20; }\
\
&#x20; function sair() {\
&#x20;   try { localStorage.removeItem(CHAVE_SESSAO); } catch (erro) { /\* ignora \*/ }\
&#x20; }\
\
&#x20; // Apaga a conta e todos os dados dela (prefixo pulso-dados-\<id>-)\
&#x20; function excluirConta() {\
&#x20;   var id = ler(CHAVE_SESSAO, null);\
&#x20;   var restantes = listarUsuarios().filter(function (u) { return u.id !== id; });\
&#x20;   gravar(CHAVE_USUARIOS, restantes);\
&#x20;   try {\
&#x20;     var apagar = [];\
&#x20;     for (var i = 0; i < localStorage.length; i++) {\
&#x20;       var chave = localStorage.key(i);\
&#x20;       if (chave.indexOf('pulso-dados-' + id + '-') === 0) { apagar.push(chave); }\
&#x20;     }\
&#x20;     apagar.forEach(function (c) { localStorage.removeItem(c); });\
&#x20;   } catch (erro) { /\* ignora \*/ }\
&#x20;   sair();\
&#x20; }\
\
&#x20; // Chave para guardar dados do usuário logado (usado por outras páginas)\
&#x20; function chaveDados(nome) {\
&#x20;   var u = usuarioAtual();\
&#x20;   return u ? 'pulso-dados-' + u.id + '-' + nome : null;\
&#x20; }\
\
&#x20; window\.PulsoAuth = {\
&#x20;   usuarioAtual: usuarioAtual, atualizarUsuario: atualizarUsuario, sair: sair,\
&#x20;   chaveDados: chaveDados, paginaConta: PAGINA_CONTA, objetivos: OBJETIVOS, niveis: NIVEIS\
&#x20; };\
\
&#x20; /\* ---------- Validações (devolvem texto do erro, ou '' se estiver certo) ---------- \*/\
&#x20; function validarNome(v) {\
&#x20;   v = v.trim();\
&#x20;   if (!v) { return 'Informe seu nome.'; }\
&#x20;   if (v.length < 3) { return 'O nome deve ter pelo menos 3 caracteres.'; }\
&#x20;   if (v.length > 60) { return 'O nome deve ter no máximo 60 caracteres.'; }\
&#x20;   return '';\
&#x20; }\
&#x20; function validarEmail(v) {\
&#x20;   v = v.trim();\
&#x20;   if (!v) { return 'Informe seu e-mail.'; }\
&#x20;   if (!/^[^\s@]+@[^\s@]+\\.[^\s@]{2,}$/.test(v)) { return 'Digite um e-mail válido, como nome@exemplo.com.'; }\
&#x20;   return '';\
&#x20; }\
&#x20; function validarSenha(v) {\
&#x20;   if (!v) { return 'Informe uma senha.'; }\
&#x20;   if (v.length < 8) { return 'A senha deve ter pelo menos 8 caracteres.'; }\
&#x20;   if (!/[A-Za-z]/.test(v) || !/[0-9]/.test(v)) { return 'A senha deve ter letras e números.'; }\
&#x20;   return '';\
&#x20; }\
&#x20; function exigir(mensagem) {\
&#x20;   return function (v) { return v ? '' : mensagem; };\
&#x20; }\
&#x20; function numero(min, max, obrigatorio) {\
&#x20;   return function (v) {\
&#x20;     v = String(v).trim();\
&#x20;     if (!v) { return obrigatorio ? 'Informe um valor.' : ''; }\
&#x20;     var n = Number(v.replace(',', '.'));\
&#x20;     if (isNaN(n) || n < min || n > max) { return 'Informe um valor entre ' + min + ' e ' + max + '.'; }\
&#x20;     return '';\
&#x20;   };\
&#x20; }\
\
&#x20; /\* Ajudantes de formulário  \*/\
&#x20; function mostrarErro(campo, texto) {\
&#x20;   var p = document.getElementById(campo.id + '-erro');\
&#x20;   p.textContent = texto;\
&#x20;   p.hidden = false;\
&#x20;   campo.setAttribute('aria-invalid', 'true');\
&#x20; }\
&#x20; function limparErro(campo) {\
&#x20;   var p = document.getElementById(campo.id + '-erro');\
&#x20;   p.textContent = '';\
&#x20;   p.hidden = true;\
&#x20;   campo.removeAttribute('aria-invalid');\
&#x20; }\
&#x20; // regras = [[campo, funcaoDeValidacao], ...]. Foca o primeiro campo com erro.\
&#x20; function validar(regras) {\
&#x20;   var primeiro = null;\
&#x20;   regras.forEach(function (r) {\
&#x20;     var texto = r[1]\(r[0].value);\
&#x20;     if (texto) { mostrarErro(r[0], texto); if (!primeiro) { primeiro = r[0]; } }\
&#x20;     else { limparErro(r[0]); }\
&#x20;   });\
&#x20;   if (primeiro) { primeiro.focus(); }\
&#x20;   return !primeiro;\
&#x20; }\
&#x20; // A mensagem traz "Erro:" ou "Sucesso:" no texto (não depende só de cor)\
&#x20; function mostrarStatus(el, tipo, texto) {\
&#x20;   el.className = 'status alert alert-' + (tipo === 'erro' ? 'erro' : 'ok');\
&#x20;   el.textContent = (tipo === 'erro' ? 'Erro: ' : 'Sucesso: ') + texto;\
&#x20; }\
&#x20; function limparStatus(el) { el.className = 'status'; el.textContent = ''; }\
\
&#x20; function limparErroAoDigitar(form) {\
&#x20;   form.addEventListener('input', function (e) {\
&#x20;     if (e.target.id && document.getElementById(e.target.id + '-erro')) { limparErro(e.target); }\
&#x20;   });\
&#x20; }\
\
&#x20; function iniciarMostrarSenha() {\
&#x20;   Array.prototype.forEach.call(document.querySelectorAll('.mostrar-senha'), function (caixa) {\
&#x20;     caixa.addEventListener('change', function () {\
&#x20;       caixa.getAttribute('data-alvos').split(' ').forEach(function (id) {\
&#x20;         document.getElementById(id).type = caixa.checked ? 'text' : 'password';\
&#x20;       });\
&#x20;     });\
&#x20;   });\
&#x20; }\
\
&#x20; /\*  Cabeçalho: "Entrar" vira "Conta" quando há sessão \*/\
&#x20; function atualizarCabecalho() {\
&#x20;   var link = document.querySelector('.header-cta');\
&#x20;   if (link && usuarioAtual()) {\
&#x20;     link.textContent = 'Conta';\
&#x20;     link.setAttribute('href', PAGINA_CONTA);\
&#x20;     link.setAttribute('aria-label', 'Minha conta');\
&#x20;   }\
&#x20; }\
\
&#x20; /\* Login e cadastro  \*/\
&#x20; function iniciarLogin() {\
&#x20;   var form = document.getElementById('form-login');\
&#x20;   var status = document.getElementById('login-status');\
&#x20;   var email = document.getElementById('login-email');\
&#x20;   var senha = document.getElementById('login-senha');\
&#x20;   limparErroAoDigitar(form);\
\
&#x20;   form.addEventListener('submit', function (e) {\
&#x20;     e.preventDefault();\
&#x20;     limparStatus(status);\
&#x20;     if (!validar([[email, validarEmail], [senha, exigir('Informe sua senha.')]])) { return; }\
\
&#x20;     var achado = listarUsuarios().filter(function (u) {\
&#x20;       return u.email === email.value.trim().toLowerCase() && u.senha === senha.value;\
&#x20;     })[0];\
\
&#x20;     if (!achado) { mostrarStatus(status, 'erro', 'E-mail ou senha incorretos.'); return; }\
&#x20;     if (!gravar(CHAVE_SESSAO, achado.id)) { mostrarStatus(status, 'erro', 'Não foi possível salvar a sessão neste navegador.'); return; }\
&#x20;     mostrarStatus(status, 'ok', 'Login realizado. Redirecionando...');\
&#x20;     setTimeout(function () { window\.location.href = PAGINA_CONTA; }, 700);\
&#x20;   });\
&#x20; }\
\
&#x20; function iniciarCadastro() {\
&#x20;   var form = document.getElementById('form-cadastro');\
&#x20;   var status = document.getElementById('cadastro-status');\
&#x20;   var nome = document.getElementById('cad-nome');\
&#x20;   var email = document.getElementById('cad-email');\
&#x20;   var senha = document.getElementById('cad-senha');\
&#x20;   var conf = document.getElementById('cad-confirmar');\
&#x20;   limparErroAoDigitar(form);\
\
&#x20;   form.addEventListener('submit', function (e) {\
&#x20;     e.preventDefault();\
&#x20;     limparStatus(status);\
&#x20;     var ok = validar([\
&#x20;       [nome, validarNome], [email, validarEmail], [senha, validarSenha],\
&#x20;       [conf, function (v) { return !v ? 'Confirme a senha.' : (v !== senha.value ? 'As senhas não coincidem.' : ''); }]\
&#x20;     ]);\
&#x20;     if (!ok) { return; }\
\
&#x20;     var emailFinal = email.value.trim().toLowerCase();\
&#x20;     var lista = listarUsuarios();\
&#x20;     var existe = lista.some(function (u) { return u.email === emailFinal; });\
&#x20;     if (existe) { mostrarErro(email, 'Este e-mail já está cadastrado. Use a aba Entrar.'); email.focus(); return; }\
\
&#x20;     var usuario = {\
&#x20;       id: 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),\
&#x20;       nome: nome.value.trim(), email: emailFinal, senha: senha.value,\
&#x20;       objetivo: 'manter', nivel: 'iniciante', altura: '', metaPeso: '', metaTreinos: 3,\
&#x20;       criadoEm: new Date().toISOString()\
&#x20;     };\
&#x20;     lista.push(usuario);\
&#x20;     if (!gravar(CHAVE_USUARIOS, lista) || !gravar(CHAVE_SESSAO, usuario.id)) {\
&#x20;       mostrarStatus(status, 'erro', 'Não foi possível salvar os dados neste navegador.');\
&#x20;       return;\
&#x20;     }\
&#x20;     mostrarStatus(status, 'ok', 'Conta de demonstração criada. Redirecionando...');\
&#x20;     setTimeout(function () { window\.location.href = PAGINA_CONTA; }, 900);\
&#x20;   });\
&#x20; }\
\
&#x20; /\*  Perfil  \*/\
&#x20; function iniciarPerfil() {\
&#x20;   var u = usuarioAtual();\
&#x20;   var aviso = document.getElementById('aviso-login');\
&#x20;   var area = document.getElementById('area-perfil');\
&#x20;   if (!u) { aviso.hidden = false; return; }\
&#x20;   area.hidden = false;\
\
&#x20;   var campos = {\
&#x20;     nome: document.getElementById('perfil-nome'),\
&#x20;     objetivo: document.getElementById('perfil-objetivo'),\
&#x20;     nivel: document.getElementById('perfil-nivel'),\
&#x20;     altura: document.getElementById('perfil-altura'),\
&#x20;     metaPeso: document.getElementById('perfil-meta-peso'),\
&#x20;     metaTreinos: document.getElementById('perfil-meta-treinos')\
&#x20;   };\
&#x20;   var form = document.getElementById('form-perfil');\
&#x20;   var status = document.getElementById('perfil-status');\
&#x20;   limparErroAoDigitar(form);\
\
&#x20;   function mostrarResumo(usuario) {\
&#x20;     var textos = {\
&#x20;       nome: usuario.nome, email: usuario.email,\
&#x20;       objetivo: OBJETIVOS[usuario.objetivo], nivel: NIVEIS[usuario.nivel],\
&#x20;       altura: usuario.altura ? usuario.altura + ' cm' : 'Não informada',\
&#x20;       metaPeso: usuario.metaPeso ? usuario.metaPeso + ' kg' : 'Não informada',\
&#x20;       metaTreinos: usuario.metaTreinos + (Number(usuario.metaTreinos) === 1 ? ' treino por semana' : ' treinos por semana'),\
&#x20;       criadoEm: new Date(usuario.criadoEm).toLocaleDateString('pt-BR')\
&#x20;     };\
&#x20;     Array.prototype.forEach.call(document.querySelectorAll('[data-resumo]'), function (el) {\
&#x20;       el.textContent = textos[el.getAttribute('data-resumo')];\
&#x20;     });\
&#x20;     document.getElementById('avatar').textContent = usuario.nome.trim().charAt(0).toUpperCase();\
&#x20;   }\
\
&#x20;   function preencherForm(usuario) {\
&#x20;     Object.keys(campos).forEach(function (k) { campos[k].value = usuario[k]; });\
&#x20;   }\
\
&#x20;   mostrarResumo(u);\
&#x20;   preencherForm(u);\
\
&#x20;   form.addEventListener('submit', function (e) {\
&#x20;     e.preventDefault();\
&#x20;     limparStatus(status);\
&#x20;     var ok = validar([\
&#x20;       [campos.nome, validarNome], [campos.altura, numero(100, 250, false)],\
&#x20;       [campos.metaPeso, numero(30, 300, false)], [campos.metaTreinos, numero(1, 7, true)]\
&#x20;     ]);\
&#x20;     if (!ok) { return; }\
\
&#x20;     var novo = atualizarUsuario({\
&#x20;       nome: campos.nome.value.trim(), objetivo: campos.objetivo.value, nivel: campos.nivel.value,\
&#x20;       altura: campos.altura.value.trim(), metaPeso: campos.metaPeso.value.trim(),\
&#x20;       metaTreinos: Math.round(Number(campos.metaTreinos.value))\
&#x20;     });\
&#x20;     if (!novo) { mostrarStatus(status, 'erro', 'Não foi possível salvar neste navegador.'); return; }\
&#x20;     mostrarResumo(novo);\
&#x20;     mostrarStatus(status, 'ok', 'Perfil atualizado.');\
&#x20;   });\
\
&#x20;   document.getElementById('btn-sair').addEventListener('click', function () {\
&#x20;     sair();\
&#x20;     window\.location.href = 'index.html';\
&#x20;   });\
\
&#x20;   document.getElementById('btn-excluir').addEventListener('click', function () {\
&#x20;     if (window\.confirm('Excluir sua conta de demonstração e todos os dados salvos neste navegador? Isso não pode ser desfeito.')) {\
&#x20;       excluirConta();\
&#x20;       window\.location.href = 'index.html';\
&#x20;     }\
&#x20;   });\
&#x20; }\
\
&#x20; /\*  Início: cada página usa só o que tem  \*/\
&#x20; document.addEventListener('DOMContentLoaded', function () {\
&#x20;   atualizarCabecalho();\
&#x20;   iniciarMostrarSenha();\
\
&#x20;   if (document.getElementById('form-login')) {\
&#x20;     if (usuarioAtual()) { window\.location.replace(PAGINA_CONTA); return; }  // já logado\
&#x20;     iniciarLogin();\
&#x20;     iniciarCadastro();\
&#x20;   }\
&#x20;   if (document.getElementById('area-perfil')) { iniciarPerfil(); }\
&#x20; });\
})();