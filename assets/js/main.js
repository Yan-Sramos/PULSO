(function () {
  'use strict';
  var root = document.documentElement;
  function read(key, fallback) { try { var v=localStorage.getItem(key); return v===null?fallback:v; } catch(e) { return fallback; } }
  function save(key, value) { try { localStorage.setItem(key,String(value)); } catch(e) {} }
  function init() {
    root.classList.add('js');
    root.setAttribute('data-theme', read('pulso-tema','dark') === 'light' ? 'light' : 'dark');

    var themeButton=document.querySelector('.theme-toggle');
    if(themeButton) {
      function themeLabel() {
        var label=root.getAttribute('data-theme')==='light'?'Ativar modo escuro':'Ativar modo claro';
        themeButton.setAttribute('aria-label',label); themeButton.title=label;
      }
      themeButton.addEventListener('click',function(){
        var next=root.getAttribute('data-theme')==='light'?'dark':'light';
        root.setAttribute('data-theme',next); save('pulso-tema',next); themeLabel();
      });
      themeLabel();
    }

    var menuButton=document.querySelector('.nav-toggle');
    var menu=document.getElementById('menu-principal');
    if(menuButton && menu) {
      function setMenu(open) { menu.classList.toggle('is-open',open); menuButton.setAttribute('aria-expanded',String(open)); menuButton.setAttribute('aria-label',open?'Fechar menu':'Abrir menu'); }
      menuButton.addEventListener('click',function(){setMenu(!menu.classList.contains('is-open'));});
      menu.addEventListener('click',function(e){if(e.target.closest('a'))setMenu(false);});
      document.addEventListener('click',function(e){if(menu.classList.contains('is-open')&&!menu.contains(e.target)&&!menuButton.contains(e.target))setMenu(false);});
      document.addEventListener('keydown',function(e){if(e.key==='Escape'&&menu.classList.contains('is-open')){setMenu(false);menuButton.focus();}});
      if(window.matchMedia) {
        var mq=window.matchMedia('(min-width: 768px)');
        var reset=function(e){if(e.matches)setMenu(false);};
        if(mq.addEventListener)mq.addEventListener('change',reset);else if(mq.addListener)mq.addListener(reset);
      }
    }

    /* Acessibilidade: controles presentes em todas as páginas */
    var actions=document.querySelector('.header-actions');
    var access=actions&&actions.querySelector('.accessibility-controls');
    if(actions&&!access) {
      access=document.createElement('div');
      access.className='accessibility-controls';
      access.setAttribute('role','group');
      access.setAttribute('aria-label','Controles de acessibilidade');
      access.innerHTML='<button type="button" class="accessibility-btn" id="fonte-diminuir" title="Diminuir fonte">A− Fonte</button><button type="button" class="accessibility-btn" id="fonte-aumentar" title="Aumentar fonte">A+ Fonte</button><button type="button" class="accessibility-btn" id="alto-contraste" aria-pressed="false">Alto contraste</button>';
      actions.appendChild(access);
    }
    if(access) {
      var down=access.querySelector('#fonte-diminuir'), up=access.querySelector('#fonte-aumentar'), contrast=access.querySelector('#alto-contraste');
      var sizes=[100,110,120,130,140,150], size=Number(read('pulso-fonte','100'));
      if(sizes.indexOf(size)<0)size=100;
      function applySize(){
        root.style.fontSize=size+'%';
        if(down)down.disabled=size===sizes[0];
        if(up)up.disabled=size===sizes[sizes.length-1];
        save('pulso-fonte',size);
      }
      if(up)up.addEventListener('click',function(){var i=sizes.indexOf(size);if(i<sizes.length-1)size=sizes[i+1];applySize();});
      if(down)down.addEventListener('click',function(){var i=sizes.indexOf(size);if(i>0)size=sizes[i-1];applySize();});
      applySize();
      var high=read('pulso-alto-contraste','false')==='true';
      function applyContrast(){
        root.setAttribute('data-contrast',high?'high':'normal');
        if(contrast){contrast.setAttribute('aria-pressed',String(high));contrast.textContent=high?'Contraste ligado':'Alto contraste';contrast.title=high?'Desativar alto contraste':'Ativar alto contraste';}
        save('pulso-alto-contraste',high);
      }
      if(contrast)contrast.addEventListener('click',function(){high=!high;applyContrast();});
      applyContrast();
    }

    /* Carrossel com setas e botões numerados estáveis */
    var carousel=document.querySelector('[data-carousel]');
    if(carousel) {
      var slides=Array.prototype.slice.call(carousel.querySelectorAll('[data-carousel-slide]'));
      var prev=carousel.querySelector('[data-carousel-prev]'), next=carousel.querySelector('[data-carousel-next]');
      var dots=Array.prototype.slice.call(carousel.querySelectorAll('[data-carousel-to]'));
      var status=carousel.querySelector('[data-carousel-status]'), current=0, timer=null;
      var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      function show(index){
        if(!slides.length)return;
        current=(index+slides.length)%slides.length;
        slides.forEach(function(slide,i){var active=i===current;slide.hidden=!active;slide.setAttribute('aria-hidden',String(!active));});
        dots.forEach(function(dot,i){dot.setAttribute('aria-current',String(i===current));dot.setAttribute('aria-pressed',String(i===current));});
        if(status)status.textContent='Foto '+(current+1)+' de '+slides.length;
      }
      function stop(){if(timer)clearInterval(timer);timer=null;}
      function start(){stop();if(!reduce&&slides.length>1)timer=setInterval(function(){show(current+1);},6500);}
      if(slides.length&&prev&&next){
        prev.addEventListener('click',function(){show(current-1);start();});
        next.addEventListener('click',function(){show(current+1);start();});
        dots.forEach(function(dot){dot.addEventListener('click',function(){show(Number(dot.getAttribute('data-carousel-to')));start();});});
        carousel.addEventListener('mouseenter',stop);carousel.addEventListener('mouseleave',start);
        carousel.addEventListener('focusin',stop);carousel.addEventListener('focusout',function(e){if(!carousel.contains(e.relatedTarget))start();});
        carousel.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'){e.preventDefault();show(current-1);start();}else if(e.key==='ArrowRight'){e.preventDefault();show(current+1);start();}});
        show(0);start();
      }
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();