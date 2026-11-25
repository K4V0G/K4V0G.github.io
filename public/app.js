(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  try {paused = localStorage.getItem('k4v0g-motion') === 'paused';} catch {}
  const state = window.k4v0gState = {y:scrollY,progress:0,chapter:0,sectionProgress:0,paused,reduced:reduced.matches,compact:innerWidth<=760};
  const sections = $$('.scene-section');
  let metrics = [];
  let raf = 0;
  let activeProject = -1;
  const paths = ['community','ctf-toolkit','api-starter'];
  const code = [
    `<span class="code-muted">// Construido en comunidad.</span>\n<span class="code-cyan">const</span> collective = {\n  curiosity: <span class="code-cyan">true</span>,\n  boundaries: <span class="code-cyan">null</span>,\n  stack: [<span class="code-orange">'Astro', 'Tailwind'</span>]\n};\n\n<span class="code-muted">$</span> npm run build\n<span class="code-cyan">✓ Ready to make an impact.</span><span class="cursor">▊</span>`,
    `<span class="code-muted"># Aprende. Resuelve. Comparte.</span>\n<span class="code-cyan">class</span> CTFToolkit:\n  mindset = <span class="code-orange">'stay curious'</span>\n  tools = [<span class="code-orange">'Python', 'Bash'</span>]\n\n  <span class="code-cyan">def</span> explore(self):\n    <span class="code-cyan">return</span> knowledge\n\n<span class="code-cyan">&gt;_ El siguiente reto te espera.</span><span class="cursor">▊</span>`,
    `<span class="code-muted">// Una base para construir.</span>\n<span class="code-cyan">const</span> stack = {\n  runtime: <span class="code-orange">'Node.js'</span>,\n  framework: <span class="code-orange">'Express'</span>,\n  authentication: <span class="code-orange">'JWT'</span>,\n  logging: <span class="code-cyan">true</span>\n};\n\n<span class="code-cyan">✓ Start building something.</span><span class="cursor">▊</span>`
  ];
  function selectProject(index) {
    if(index===activeProject)return;
    activeProject=index;
    $$('[data-project]').forEach((panel,i)=>{
      panel.classList.toggle('is-active',i===index);
      if(!state.reduced) panel.inert=i!==index;
    });
    $$('[data-select-project]').forEach((button,i)=>{
      button.classList.toggle('active',i===index);
      button.setAttribute('aria-pressed',String(i===index));
    });
    $('#terminal-path').textContent=paths[index];
    $('#terminal-code').innerHTML=code[index];
  }
  function measure() {
    state.compact=innerWidth<=760;
    if(state.compact){$('#terminal-path').textContent=paths[0];$('#terminal-code').innerHTML=code[0];}
    $$('[data-project]').forEach((panel,i)=>panel.inert=!(state.compact||state.reduced||document.body.classList.contains('no-webgl')||i===activeProject));
    metrics=sections.map(section=>({top:section.offsetTop,height:section.offsetHeight,id:section.id}));
    update();
  }
  function update(){
    raf=0;
    state.y=scrollY;
    state.progress=Math.max(0,Math.min(1,scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)));
    let index=0;
    metrics.forEach((section,i)=>{if(scrollY+innerHeight*.4>=section.top)index=i;});
    state.chapter=index;
    const m=metrics[index];
    state.sectionProgress=Math.max(0,Math.min(1,(scrollY-m.top)/Math.max(1,m.height-innerHeight)));
    $('#progress-bar').style.transform=`scaleX(${state.progress})`;
    $('#scroll-percent').textContent=String(Math.round(state.progress*100)).padStart(3,'0')+'%';
    $('#scene-name').textContent=['INICIO','COMUNIDAD','EL EQUIPO','PROYECTOS','APRENDIZAJE','CONECTA'][index];
    $$('.desktop-nav a').forEach(a=>a.classList.toggle('current',a.hash==='#'+m.id));
    const manifesto=metrics[1];
    const mp=(scrollY-manifesto.top)/Math.max(1,manifesto.height-innerHeight);
    $$('.manifesto-word').forEach((word,i)=>word.classList.toggle('active',mp>=i*.3-.15));
    const project=metrics[3];
    if(!state.reduced && !state.compact && !document.body.classList.contains('no-webgl')){
      const p=Math.max(0,Math.min(.999,(scrollY-project.top)/Math.max(1,project.height-innerHeight)));
      selectProject(Math.floor(p*3));
    }
    window.dispatchEvent(new CustomEvent('k4v0g:scroll',{detail:state}));
  }
  addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(update);},{passive:true});
  addEventListener('resize',()=>{if(innerWidth>760)closeMenu();measure();});
  addEventListener('load',measure);
  document.fonts.ready.then(measure);
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');observer.unobserve(e.target);}}),{threshold:.08});
  $$('.reveal').forEach(el=>observer.observe(el));
  document.body.classList.add('js-enhanced');
  const toggle=$('.menu-toggle');
  const menu=$('#mobile-nav');
  function closeMenu(){document.body.classList.remove('menu-open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Abrir menú');menu.inert=true;}
  toggle.addEventListener('click',()=>{
    const open=!document.body.classList.contains('menu-open');
    document.body.classList.toggle('menu-open',open);menu.inert=!open;
    toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');
    if(open)menu.querySelector('a').focus();
  });
  menu.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
  document.addEventListener('keydown',e=>{
    if(!document.body.classList.contains('menu-open'))return;
    if(e.key==='Escape'){closeMenu();toggle.focus();}
    if(e.key==='Tab'){
      const focusables=[toggle,...menu.querySelectorAll('a')];
      const first=focusables[0],last=focusables.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  $$('[data-select-project]').forEach(button=>button.addEventListener('click',()=>{
    const index=Number(button.dataset.selectProject);
    selectProject(index);
    if(state.reduced||state.compact||document.body.classList.contains('no-webgl'))return;
    const m=metrics[3];
    scrollTo({top:m.top+(index+.35)/3*(m.height-innerHeight),behavior:state.paused?'instant':'smooth'});
  }));
  function setMotion(){
    state.reduced=reduced.matches;
    state.paused=paused||state.reduced;
    document.body.classList.toggle('motion-paused',state.paused);
    $('.motion-toggle').setAttribute('aria-pressed',String(state.paused));
    $('.motion-toggle').setAttribute('aria-label',state.paused?'Activar movimiento':'Pausar movimiento');
    $('.motion-label').textContent=state.paused?'Activar movimiento':'Pausar movimiento';
    $('.motion-icon').textContent=state.paused?'▷':'Ⅱ';
    if(state.reduced) $$('[data-project]').forEach(panel=>panel.inert=false);
    measure();
  }
  $('.motion-toggle').addEventListener('click',()=>{
    if(state.reduced){$('.motion-label').textContent='Movimiento reducido del sistema';return;}
    paused=!paused;
    try{localStorage.setItem('k4v0g-motion',paused?'paused':'enabled');}catch{}
    setMotion();
  });
  reduced.addEventListener('change',setMotion);
  window.addEventListener('k4v0g:fallback',()=>{
    document.body.classList.add('no-webgl');
    $$('[data-project]').forEach(panel=>{panel.inert=false;panel.classList.add('is-active');});
    measure();
  });
  selectProject(0);setMotion();
})();
