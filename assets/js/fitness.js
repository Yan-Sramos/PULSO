(function () {
  'use strict';

  function storageKey(name) {
    try {
      if (window.PulsoAuth && typeof PulsoAuth.chaveDados === 'function') {
        var key = PulsoAuth.chaveDados(name);
        if (key) return key;
      }
    } catch (e) {}
    return 'pulso-demo-' + name;
  }
  function read(name) {
    try { var value = JSON.parse(localStorage.getItem(storageKey(name)) || '[]'); return Array.isArray(value) ? value : []; }
    catch (e) { return []; }
  }
  function save(name, value) {
    try { localStorage.setItem(storageKey(name), JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function dateBR(value) {
    if (!value) return '—';
    var p = value.split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : value;
  }
  function el(id) { return document.getElementById(id); }
  function status(id, message, error) {
    var node = el(id);
    if (!node) return;
    node.className = 'status alert ' + (error ? 'alert-erro' : 'alert-ok');
    node.textContent = message;
  }
  function safe(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  var exercisesDefault = [
    { id: 'e1', name: 'Agachamento livre', group: 'Pernas', level: 'Iniciante', duration: 12, description: 'Mantenha o tronco firme e desça até onde sua mobilidade permitir.' },
    { id: 'e2', name: 'Flexão de braços', group: 'Peito', level: 'Iniciante', duration: 8, description: 'Alinhe cabeça, tronco e quadril durante o movimento.' },
    { id: 'e3', name: 'Remada unilateral', group: 'Costas', level: 'Intermediário', duration: 10, description: 'Puxe o cotovelo em direção ao quadril sem girar o tronco.' },
    { id: 'e4', name: 'Desenvolvimento', group: 'Ombros', level: 'Intermediário', duration: 10, description: 'Use uma carga controlável e evite arquear a lombar.' },
    { id: 'e5', name: 'Prancha', group: 'Abdômen', level: 'Iniciante', duration: 3, description: 'Contraia o abdômen e mantenha o corpo alinhado.' },
    { id: 'e6', name: 'Levantamento terra', group: 'Pernas', level: 'Avançado', duration: 12, description: 'Priorize a técnica e mantenha a coluna neutra.' }
  ];

  function initWorkouts() {
    var list = el('lista-exercicios');
    if (!list) return;
    var form = el('form-treino');
    var search = el('busca-exercicio');
    var filter = el('filtro-grupo');
    var data = read('workouts');
    if (!data.length) { data = exercisesDefault.slice(); save('workouts', data); }

    function render() {
      var term = search ? search.value.trim().toLowerCase() : '';
      var group = filter ? filter.value : 'Todos';
      var visible = data.filter(function (item) {
        return (!term || item.name.toLowerCase().includes(term)) && (group === 'Todos' || item.group === group);
      });
      list.innerHTML = visible.length ? visible.map(function (item) {
        return '<article class="card"><h3>' + safe(item.name) + '</h3><p><strong>' + safe(item.group) + '</strong> · ' + safe(item.level) + ' · ' + Number(item.duration || 0) + ' min</p><p>' + safe(item.description) + '</p><div class="form-actions"><button class="btn btn-primary" type="button" data-done="' + safe(item.id) + '">' + (item.doneDate === today() ? 'Concluído hoje ✓' : 'Marcar como concluído') + '</button>' + (item.custom ? '<button class="btn btn-perigo" type="button" data-delete="' + safe(item.id) + '">Excluir</button>' : '') + '</div></article>';
      }).join('') : '<p>Nenhum exercício encontrado.</p>';
      var count = el('contador-exercicios');
      if (count) count.textContent = visible.length + ' exercício(s)';
      var history = el('historico-treinos-lista');
      if (history) {
        var completed = data.filter(function (x) { return x.doneDate; }).sort(function (a,b) { return b.doneDate.localeCompare(a.doneDate); }).slice(0, 8);
        history.innerHTML = completed.length ? completed.map(function (x) { return '<li>' + safe(x.name) + ' — ' + dateBR(x.doneDate) + '</li>'; }).join('') : '<li>Seus treinos concluídos aparecerão aqui.</li>';
      }
    }
    list.addEventListener('click', function (event) {
      var done = event.target.closest('[data-done]');
      var del = event.target.closest('[data-delete]');
      if (done) {
        var item = data.find(function (x) { return x.id === done.dataset.done; });
        if (item) item.doneDate = item.doneDate === today() ? '' : today();
        save('workouts', data); render();
      }
      if (del) { data = data.filter(function (x) { return x.id !== del.dataset.delete; }); save('workouts', data); render(); }
    });
    if (search) search.addEventListener('input', render);
    if (filter) filter.addEventListener('change', render);
    if (form) form.addEventListener('submit', function (event) {
      event.preventDefault();
      var name = el('treino-nome').value.trim();
      var group = el('treino-grupo').value;
      var level = el('treino-nivel').value;
      var duration = Number(el('treino-duracao').value);
      var description = el('treino-descricao').value.trim();
      if (!name || !duration || duration < 1 || duration > 240) { status('treino-status', 'Preencha o nome e uma duração entre 1 e 240 minutos.', true); return; }
      data.push({ id: 'custom-' + Date.now(), name: name, group: group, level: level, duration: duration, description: description || 'Exercício personalizado.', custom: true });
      if (!save('workouts', data)) { status('treino-status', 'Não foi possível salvar neste navegador.', true); return; }
      form.reset(); status('treino-status', 'Exercício adicionado com sucesso.'); render();
    });
    render();
    initTimer();
  }

  function initTimer() {
    var display = el('timer-display');
    if (!display) return;
    var seconds = 60, interval = null;
    function draw() { display.textContent = String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0'); }
    var presets = document.querySelectorAll('[data-timer-preset]');
    presets.forEach(function (button) { button.addEventListener('click', function () { clearInterval(interval); interval = null; seconds = Number(button.dataset.timerPreset) || 60; draw(); }); });
    el('btn-timer-iniciar').addEventListener('click', function () {
      if (interval) return;
      interval = setInterval(function () { seconds = Math.max(0, seconds - 1); draw(); if (!seconds) { clearInterval(interval); interval = null; status('timer-status', 'Tempo concluído!'); } }, 1000);
      status('timer-status', 'Cronômetro em andamento.');
    });
    el('btn-timer-pausar').addEventListener('click', function () { clearInterval(interval); interval = null; status('timer-status', 'Cronômetro pausado.'); });
    el('btn-timer-zerar').addEventListener('click', function () { clearInterval(interval); interval = null; seconds = 60; draw(); status('timer-status', 'Cronômetro reiniciado.'); });
    draw();
  }

  function initNutrition() {
    var form = el('form-alimentacao');
    var list = el('historico-alimentacao');
    if (!form || !list) return;
    var meals = read('meals');
    el('dieta-data').value = today();
    function render() {
      var day = el('filtro-data-dieta').value || today();
      var selected = meals.filter(function (m) { return m.date === day; });
      list.innerHTML = selected.length ? selected.map(function (m) {
        return '<li><strong>' + safe(m.name) + '</strong> · ' + safe(m.meal) + ' · ' + Number(m.kcal) + ' kcal · ' + Number(m.protein) + ' g proteína <button class="btn btn-perigo btn-small" type="button" data-meal-delete="' + safe(m.id) + '">Remover</button></li>';
      }).join('') : '<li>Nenhuma refeição registrada nesta data.</li>';
      var total = selected.reduce(function (acc, m) { acc.kcal += Number(m.kcal) || 0; acc.protein += Number(m.protein) || 0; return acc; }, { kcal: 0, protein: 0 });
      el('resumo-kcal').textContent = total.kcal + ' kcal';
      el('resumo-prot').textContent = total.protein + ' g';
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var item = { id: 'meal-' + Date.now(), date: el('dieta-data').value, meal: el('dieta-refeicao').value, name: el('alimento-nome').value.trim(), kcal: Number(el('alimento-kcal').value), protein: Number(el('alimento-prot').value) };
      if (!item.date || !item.name || item.kcal < 0 || item.protein < 0) { status('dieta-status', 'Preencha os campos corretamente.', true); return; }
      meals.push(item);
      if (!save('meals', meals)) { status('dieta-status', 'Não foi possível salvar os dados.', true); return; }
      form.reset(); el('dieta-data').value = today(); el('filtro-data-dieta').value = item.date;
      status('dieta-status', 'Refeição registrada.'); render();
    });
    list.addEventListener('click', function (event) {
      var button = event.target.closest('[data-meal-delete]');
      if (!button) return;
      meals = meals.filter(function (m) { return m.id !== button.dataset.mealDelete; }); save('meals', meals); render();
    });
    el('filtro-data-dieta').value = today();
    el('filtro-data-dieta').addEventListener('change', render);
    render();
  }

  function initProgress() {
    var form = el('form-peso');
    var list = el('historico-peso-lista');
    if (!form || !list) return;
    var entries = read('progress');
    el('peso-data').value = today();
    function render() {
      entries.sort(function (a,b) { return a.date.localeCompare(b.date); });
      var latest = entries[entries.length - 1];
      el('peso-atual').textContent = latest ? Number(latest.weight).toFixed(1).replace('.', ',') + ' kg' : '—';
      el('peso-inicial').textContent = entries.length ? Number(entries[0].weight).toFixed(1).replace('.', ',') + ' kg' : '—';
      var change = entries.length > 1 ? Number(latest.weight) - Number(entries[0].weight) : 0;
      el('peso-variacao').textContent = entries.length > 1 ? (change > 0 ? '+' : '') + change.toFixed(1).replace('.', ',') + ' kg' : '—';
      list.innerHTML = entries.slice().reverse().map(function (x) { return '<li><strong>' + dateBR(x.date) + '</strong> — ' + Number(x.weight).toFixed(1).replace('.', ',') + ' kg' + (x.note ? ' · ' + safe(x.note) : '') + ' <button class="btn btn-perigo btn-small" type="button" data-progress-delete="' + safe(x.id) + '">Remover</button></li>'; }).join('') || '<li>Registre seu primeiro peso para acompanhar a evolução.</li>';
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var weight = Number(el('peso-valor').value);
      var date = el('peso-data').value;
      if (!date || !weight || weight < 20 || weight > 400) { status('peso-status', 'Informe uma data e um peso entre 20 e 400 kg.', true); return; }
      entries.push({ id: 'progress-' + Date.now(), date: date, weight: weight, note: el('peso-obs').value.trim() });
      if (!save('progress', entries)) { status('peso-status', 'Não foi possível salvar o registro.', true); return; }
      form.reset(); el('peso-data').value = today(); status('peso-status', 'Peso registrado com sucesso.'); render();
    });
    list.addEventListener('click', function (event) {
      var button = event.target.closest('[data-progress-delete]');
      if (!button) return;
      entries = entries.filter(function (x) { return x.id !== button.dataset.progressDelete; }); save('progress', entries); render();
    });
    render();
  }

  function initDashboard() {
    if (!el('dash-treinos')) return;
    var workouts = read('workouts'), meals = read('meals'), progress = read('progress');
    var completed = workouts.filter(function (x) { return x.doneDate === today(); }).length;
    el('dash-treinos').textContent = completed;
    el('dash-refeicoes').textContent = meals.filter(function (x) { return x.date === today(); }).length;
    var latest = progress.slice().sort(function (a,b) { return b.date.localeCompare(a.date); })[0];
    el('dash-peso').textContent = latest ? Number(latest.weight).toFixed(1).replace('.', ',') + ' kg' : 'Ainda não registrado';
    var user = window.PulsoAuth && PulsoAuth.usuarioAtual();
    el('dash-nome').textContent = user ? user.nome.split(' ')[0] : 'atleta';
  }

  function initContact() {
    var form = el('form-contato');
    if (!form) return;
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var name = el('contato-nome').value.trim(), email = el('contato-email').value.trim(), message = el('contato-mensagem').value.trim();
      if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10) {
        status('contato-status', 'Confira nome, e-mail e mensagem (mínimo de 10 caracteres).', true); return;
      }
      status('contato-status', 'Mensagem validada! Este protótipo não envia mensagens para um servidor.');
      form.reset();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initWorkouts(); initNutrition(); initProgress(); initDashboard(); initContact();
  });
})();