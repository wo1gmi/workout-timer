'use strict';
/* PosTure — app.js */

const EXERCISES = [
  { name:'Cat-Cow Stretch', duration:60,
    description:'On hands and knees, alternate arching your back upward (cat) and letting it sag toward the floor (cow). Move slowly with your breath — inhale for cow, exhale for cat.',
    muscles:['Lumbar Spine','Thoracic Spine','Core'],
    image:'https://images.pexels.com/photos/6303447/pexels-photo-6303447.jpeg?auto=compress&cs=tinysrgb&w=580&h=310&dpr=1' },
  { name:"Child's Pose", duration:45,
    description:'Kneel and sit back on your heels, then reach both arms forward on the floor with your forehead resting down. Let gravity gently decompress and lengthen your spine.',
    muscles:['Lower Back','Hips','Shoulders'],
    image:'https://images.unsplash.com/photo-1620134280013-e756c46affc6?w=580&h=310&auto=format&fit=crop&q=80' },
  { name:'Cobra Stretch', duration:40,
    description:'Lie face down with palms under your shoulders. Press up through your hands, lifting your chest off the floor. Keep your hips grounded and elbows slightly bent throughout.',
    muscles:['Thoracic Spine','Abdominals','Hip Flexors'],
    image:'https://images.pexels.com/photos/8436608/pexels-photo-8436608.jpeg?auto=compress&cs=tinysrgb&w=580&h=310&dpr=1' },
  { name:'Seated Spinal Twist', duration:50,
    description:'Sit tall with legs extended. Cross one leg over the other and rotate your torso toward the raised knee, using your opposite arm as a brace. Lengthen on every inhale.',
    muscles:['Thoracic Spine','Obliques','Piriformis'],
    image:'https://images.pexels.com/photos/3758018/pexels-photo-3758018.jpeg?auto=compress&cs=tinysrgb&w=580&h=310&dpr=1' },
  { name:'Bird Dog', duration:60,
    description:'From hands and knees, extend one arm forward and the opposite leg back simultaneously. Keep hips level and core braced. Alternate sides for balanced spinal stabilisation.',
    muscles:['Erector Spinae','Glutes','Core'],
    image:'https://images.pexels.com/photos/6697134/pexels-photo-6697134.jpeg?auto=compress&cs=tinysrgb&w=580&h=310&dpr=1' },
  { name:'Glute Bridge', duration:45,
    description:'Lie on your back with knees bent and feet flat. Drive through your heels to raise your hips until your body forms a straight line from knees to shoulders. Squeeze at the top.',
    muscles:['Glutes','Hamstrings','Lower Back'],
    image:'https://images.pexels.com/photos/4047102/pexels-photo-4047102.jpeg?auto=compress&cs=tinysrgb&w=580&h=310&dpr=1' },
  { name:'Doorway Chest Opener', duration:30,
    description:'Stand in a doorframe with arms at 90°, elbows at shoulder height. Step one foot through and lean forward gently until you feel the stretch across your chest and anterior shoulders.',
    muscles:['Pectorals','Anterior Deltoids','Thoracic Spine'],
    image:'https://images.unsplash.com/photo-1582106316415-d02d4d0e9066?w=580&h=310&auto=format&fit=crop&q=80' },
  { name:'Wall Angels', duration:60,
    description:'Stand with your back, head, and arms flat against a wall in a goal-post shape. Slowly slide your arms upward overhead while maintaining full contact with the wall.',
    muscles:['Rhomboids','Lower Traps','Rotator Cuff'],
    image:'https://images.pexels.com/photos/6339447/pexels-photo-6339447.jpeg?auto=compress&cs=tinysrgb&w=580&h=310&dpr=1' },
  { name:'Hip Flexor Lunge', duration:50,
    description:'Step into a deep lunge and lower your rear knee to the floor. Gently push hips forward and hold. Tight hip flexors pull the lumbar spine into hyperlordosis — this counters that.',
    muscles:['Hip Flexors','Quadriceps','Psoas'],
    image:'https://images.pexels.com/photos/6703094/pexels-photo-6703094.jpeg?auto=compress&cs=tinysrgb&w=580&h=310&dpr=1' },
  { name:'Thoracic Spine Roll', duration:60,
    description:'Sit with knees bent and place a rolled towel or foam roller under your upper back. Slowly extend over it while supporting your head, walking it up and down your thoracic spine.',
    muscles:['Thoracic Spine','Erector Spinae','Rhomboids'],
    image:'https://images.pexels.com/photos/4534684/pexels-photo-4534684.jpeg?auto=compress&cs=tinysrgb&w=580&h=310&dpr=1' },
];

const TOTAL_S = EXERCISES.reduce((s,e) => s + e.duration, 0);
const RING_C  = 2 * Math.PI * 96; // r=96

const DEFAULTS = { sound:true, restDuration:10, autoAdvance:true, countdownBeeps:true };

/* === AudioManager === */
class AudioManager {
  constructor() { this._ctx = null; this.enabled = true; }
  _ctx_() {
    if (!this._ctx) this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this._ctx.state === 'suspended') this._ctx.resume();
    return this._ctx;
  }
  _t(freq, dur, vol=0.22, type='sine') {
    if (!this.enabled) return;
    try {
      const ctx=this._ctx_(), o=ctx.createOscillator(), g=ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type=type; o.frequency.value=freq;
      g.gain.setValueAtTime(vol, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+dur);
      o.start(ctx.currentTime); o.stop(ctx.currentTime+dur);
    } catch(_){}
  }
  beep()       { this._t(880, 0.08, 0.18); }
  restBeep()   { this._t(440, 0.10, 0.16); }
  startChime() { [523,659,784].forEach((f,i) => setTimeout(()=>this._t(f,0.12,0.22), i*110)); }
  restChime()  { this._t(440,0.13,0.2); setTimeout(()=>this._t(349,0.18,0.15), 160); }
  doneChime()  { this._t(784,0.12,0.22); setTimeout(()=>this._t(523,0.18,0.18), 160); }
  finishChime(){ [523,659,784,1047].forEach((f,i) => setTimeout(()=>this._t(f,0.18,0.25), i*140)); }
}

/* === Store === */
class Store {
  _k(k){ return `posture_v1_${k}`; }
  get(k,fb){ try{ const v=localStorage.getItem(this._k(k)); return v!==null?JSON.parse(v):fb; }catch{return fb;} }
  set(k,v){ try{ localStorage.setItem(this._k(k), JSON.stringify(v)); }catch{} }
}

/* === WorkoutApp === */
class WorkoutApp {
  constructor() {
    this.store    = new Store();
    this.audio    = new AudioManager();
    this.settings = { ...DEFAULTS, ...this.store.get('settings',{}) };
    this.audio.enabled = this.settings.sound;

    this.idx      = 0;
    this.timeLeft = EXERCISES[0].duration;
    this.total    = EXERCISES[0].duration;
    this.running  = false;
    this.isRest   = false;
    this.restLeft = 0;
    this.done     = new Set();
    this._iv      = null;
    this._sessStart = null;
    this.stats    = this.store.get('stats', {sessions:0, lastDate:null, streak:0});

    this._dom();
    this._syncUI();
    this._renderList();
    this._load(0);
    this._updateStats();
    this._bind();
  }

  _dom() {
    const $=id=>document.getElementById(id), Q=s=>document.querySelector(s);
    this.el = {
      playPause:$('btn-play-pause'), prev:$('btn-prev'), next:$('btn-next'),
      sound:$('btn-sound'), settings:$('btn-settings'), fs:$('btn-fullscreen'),
      mob:$('btn-mobile-list'),
      phase:$('timer-phase'), time:$('timer-time'), label:$('timer-label'),
      ring:$('ring-progress'),
      name:$('exercise-name'), desc:$('exercise-desc'), tags:$('muscle-tags'),
      img:$('exercise-image'), nextName:$('next-exercise-name'), badge:$('exercise-index-badge'),
      list:$('exercise-list'), fill:$('overall-progress-fill'),
      ptext:$('progress-text'), elapsed:$('elapsed-time'), totalLbl:$('total-time-label'),
      completion:$('completion-overlay'), modal:$('settings-modal'),
      streak:$('streak-count'), sessions:$('sessions-count'),
      toasts:$('toast-container'), sidebar:$('exercise-sidebar'),
      sideTotal:$('sidebar-total-duration'),
      iPlay:Q('.icon-play'), iPause:Q('.icon-pause'),
      iSndOn:Q('.icon-sound-on'), iSndOff:Q('.icon-sound-off'),
      iFsIn:Q('.icon-fs-enter'), iFsOut:Q('.icon-fs-exit'),
    };
    const t = this._fmt(TOTAL_S);
    this.el.totalLbl.textContent  = t;
    this.el.sideTotal.textContent = `Total workout: ${t}`;
  }

  _syncUI() {
    document.getElementById('setting-sound').checked     = this.settings.sound;
    document.getElementById('setting-rest').value        = this.settings.restDuration;
    document.getElementById('setting-auto').checked      = this.settings.autoAdvance;
    document.getElementById('setting-countdown').checked = this.settings.countdownBeeps;
  }

  _renderList() {
    this.el.list.innerHTML = '';
    EXERCISES.forEach((ex,i) => {
      const c = document.createElement('div');
      c.className = ['exercise-card', i===this.idx?'active':'', this.done.has(i)?'completed':''].filter(Boolean).join(' ');
      c.innerHTML = `<div class="card-num">${this.done.has(i)?'✓':i+1}</div>
        <div class="card-info"><div class="card-name">${ex.name}</div><div class="card-duration">${this._fmt(ex.duration)}</div></div>`;
      c.addEventListener('click', ()=>{ if(this.running) this._pause(); this._load(i); if(window.innerWidth<=720) this._closeSide(); });
      this.el.list.appendChild(c);
    });
    this.el.ptext.textContent = `${this.done.size} / ${EXERCISES.length}`;
  }

  _scrollActive() {
    const a = this.el.list.querySelector('.exercise-card.active');
    if(a) a.scrollIntoView({behavior:'smooth', block:'nearest'});
  }

  _load(idx) {
    this.idx = idx;
    const ex = EXERCISES[idx];
    this.timeLeft = ex.duration;
    this.total    = ex.duration;
    this.isRest   = false;

    this.el.img.style.opacity = '0';
    const im = new Image();
    im.onload = ()=>{ this.el.img.src=ex.image; this.el.img.alt=ex.name; this.el.img.style.transition='opacity .45s ease'; this.el.img.style.opacity='1'; };
    im.onerror = ()=>{ this.el.img.style.opacity='1'; };
    im.src = ex.image;

    this.el.name.textContent = ex.name;
    this.el.name.classList.remove('name-animate');
    void this.el.name.offsetWidth;
    this.el.name.classList.add('name-animate');
    this.el.desc.textContent = ex.description;
    this.el.tags.innerHTML   = ex.muscles.map(m=>`<span class="muscle-tag">${m}</span>`).join('');

    const nx = EXERCISES[idx+1];
    this.el.nextName.textContent = nx ? nx.name : 'Finish!';
    this.el.badge.textContent    = `${idx+1} / ${EXERCISES.length}`;

    this.el.time.classList.remove('rest-mode');
    this._ringMode('exercise');
    this._face();
    this._ringFrac(1);
    this.el.phase.textContent = 'Exercise';
    this.el.label.textContent = `${this._fmt(ex.duration)} total`;
    document.body.classList.remove('rest-running');

    this._renderList();
    this._progress();
    this._scrollActive();
  }

  _play() {
    if(this.running) return;
    this.running = true;
    if(!this._sessStart) this._sessStart = Date.now();
    this._playIcon(true);
    document.body.classList.add('is-running');
    this.audio.startChime();
    this._iv = setInterval(()=>this._tick(), 1000);
  }

  _pause() {
    if(!this.running) return;
    clearInterval(this._iv); this._iv=null;
    this.running = false;
    this._playIcon(false);
    document.body.classList.remove('is-running');
    document.body.classList.remove('rest-running');
  }

  _toggle() { this.running ? this._pause() : this._play(); }

  _tick() {
    if(this.isRest) {
      this.restLeft = Math.max(0, this.restLeft-1);
      this.el.time.textContent = this._fmt(this.restLeft);
      this._ringFrac(this.restLeft / this.settings.restDuration);
      if(this.settings.countdownBeeps && this.restLeft>0 && this.restLeft<=3) this.audio.restBeep();
      if(this.restLeft<=0) this._endRest();
    } else {
      this.timeLeft = Math.max(0, this.timeLeft-1);
      this._face();
      this._ringFrac(this.timeLeft / this.total);
      this._progress();
      if(this.settings.countdownBeeps && this.timeLeft>0 && this.timeLeft<=3) this.audio.beep();
      if(this.timeLeft<=0) this._endEx();
    }
  }

  _endEx() {
    this.done.add(this.idx);
    this.audio.doneChime();
    this._renderList();
    if(this.idx >= EXERCISES.length-1) { this._finish(); return; }
    if(this.settings.autoAdvance) { this._beginRest(); }
    else { this._pause(); this._toast(`${EXERCISES[this.idx].name} done!`,'success'); this._load(this.idx+1); }
  }

  _beginRest() {
    this.isRest   = true;
    this.restLeft = this.settings.restDuration;
    this.el.phase.textContent = 'Rest';
    this.el.time.textContent  = this._fmt(this.restLeft);
    this.el.time.classList.add('rest-mode');
    this.el.label.textContent = `Up next: ${EXERCISES[this.idx+1]?.name ?? '—'}`;
    this._ringMode('rest');
    this._ringFrac(1);
    document.body.classList.replace('is-running','rest-running');
    this.audio.restChime();
    this._toast('Rest — breathe deeply','warning');
  }

  _endRest() {
    this.isRest = false;
    this.el.time.classList.remove('rest-mode');
    document.body.classList.remove('rest-running');
    document.body.classList.add('is-running');
    this._load(this.idx+1);
    this.el.phase.textContent = 'Exercise';
    this.audio.startChime();
  }

  _fwd() {
    const was=this.running; this._pause();
    this.done.add(this.idx);
    if(this.idx < EXERCISES.length-1) { this._load(this.idx+1); if(was) this._play(); }
    else { this._renderList(); this._finish(); }
  }

  _back() {
    if(this.idx===0) return;
    const was=this.running, p=this.idx-1; this._pause();
    this.done.delete(p); this._load(p); if(was) this._play();
  }

  _finish() {
    this._pause(); this._sessStart=null;
    const today = new Date().toDateString();
    if(this.stats.lastDate !== today) {
      const yd = new Date(Date.now()-86400000).toDateString();
      this.stats.streak = this.stats.lastDate===yd ? this.stats.streak+1 : 1;
      this.stats.lastDate = today;
    }
    this.stats.sessions++;
    this.store.set('stats', this.stats);
    this._updateStats();
    document.getElementById('comp-time').textContent      = this._fmt(TOTAL_S);
    document.getElementById('comp-exercises').textContent = EXERCISES.length;
    document.getElementById('comp-streak').textContent    = `${this.stats.streak}d`;
    this.el.completion.classList.remove('hidden');
    this.audio.finishChime();
  }

  _restart() {
    this._pause(); this.done.clear(); this._sessStart=null;
    this.el.completion.classList.add('hidden');
    this._load(0); this._progress();
  }

  _playIcon(p) {
    this.el.iPlay.classList.toggle('hidden',p);
    this.el.iPause.classList.toggle('hidden',!p);
  }
  _face()       { this.el.time.textContent = this._fmt(this.timeLeft); }
  _ringFrac(f)  { this.el.ring.style.strokeDashoffset = RING_C*(1-Math.max(0,Math.min(1,f))); }
  _ringMode(m)  { this.el.ring.setAttribute('stroke', m==='rest'?'url(#rest-gradient)':'url(#ring-gradient)'); }

  _progress() {
    const doneS  = [...this.done].reduce((s,i)=>s+EXERCISES[i].duration, 0);
    const cur    = this.isRest ? 0 : (this.total - this.timeLeft);
    const frac   = (doneS+cur) / TOTAL_S;
    this.el.fill.style.width   = `${frac*100}%`;
    this.el.elapsed.textContent = this._fmt(doneS+cur);
    this.el.totalLbl.textContent = this._fmt(TOTAL_S);
    this.el.ptext.textContent    = `${this.done.size} / ${EXERCISES.length}`;
  }

  _updateStats() {
    this.el.streak.textContent   = this.stats.streak;
    this.el.sessions.textContent = this.stats.sessions;
  }

  _fmt(s) { return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }

  _toast(msg, type='info') {
    const el = document.createElement('div');
    el.className = `toast ${type}`; el.textContent = msg;
    this.el.toasts.appendChild(el);
    setTimeout(()=>{ el.classList.add('fade-out'); el.addEventListener('animationend',()=>el.remove(),{once:true}); }, 2800);
  }

  _openSide()   { this.el.sidebar.classList.add('mobile-open');    this.el.mob.classList.add('active'); }
  _closeSide()  { this.el.sidebar.classList.remove('mobile-open'); this.el.mob.classList.remove('active'); }
  _toggleSide() { this.el.sidebar.classList.contains('mobile-open') ? this._closeSide() : this._openSide(); }

  _toggleSound() {
    this.audio.enabled = !this.audio.enabled;
    this.settings.sound = this.audio.enabled;
    this.store.set('settings', this.settings);
    this.el.iSndOn.classList.toggle('hidden',  !this.audio.enabled);
    this.el.iSndOff.classList.toggle('hidden',  this.audio.enabled);
    this.el.sound.classList.toggle('active', !this.audio.enabled);
    this._toast(this.audio.enabled ? 'Sound on' : 'Sound muted', 'info');
  }

  _toggleFS() {
    if(!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
    else document.exitFullscreen().catch(()=>{});
  }

  _bind() {
    this.el.playPause.addEventListener('click', ()=>this._toggle());
    this.el.prev.addEventListener('click',      ()=>this._back());
    this.el.next.addEventListener('click',      ()=>this._fwd());
    this.el.sound.addEventListener('click',     ()=>this._toggleSound());
    this.el.mob.addEventListener('click',       ()=>this._toggleSide());
    this.el.fs.addEventListener('click',        ()=>this._toggleFS());
    this.el.settings.addEventListener('click',  ()=>this.el.modal.classList.remove('hidden'));
    document.getElementById('btn-close-settings').addEventListener('click', ()=>this.el.modal.classList.add('hidden'));
    this.el.modal.addEventListener('click', e=>{ if(e.target===this.el.modal) this.el.modal.classList.add('hidden'); });

    document.getElementById('btn-save-settings').addEventListener('click', ()=>{
      this.settings.sound          = document.getElementById('setting-sound').checked;
      this.settings.restDuration   = parseInt(document.getElementById('setting-rest').value, 10);
      this.settings.autoAdvance    = document.getElementById('setting-auto').checked;
      this.settings.countdownBeeps = document.getElementById('setting-countdown').checked;
      this.audio.enabled = this.settings.sound;
      this.store.set('settings', this.settings);
      this.el.modal.classList.add('hidden');
      this._toast('Settings saved','success');
    });

    document.getElementById('btn-restart').addEventListener('click', ()=>this._restart());

    document.addEventListener('fullscreenchange', ()=>{
      const fs = !!document.fullscreenElement;
      document.body.classList.toggle('is-fullscreen', fs);
      this.el.iFsIn.classList.toggle('hidden', fs);
      this.el.iFsOut.classList.toggle('hidden', !fs);
      this.el.fs.classList.toggle('active', fs);
    });

    document.addEventListener('click', e=>{
      if(window.innerWidth<=720 && this.el.sidebar.classList.contains('mobile-open') &&
         !this.el.sidebar.contains(e.target) && !this.el.mob.contains(e.target))
        this._closeSide();
    });

    document.addEventListener('keydown', e=>{
      if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT') return;
      switch(e.code) {
        case 'Space':      e.preventDefault(); this._toggle(); break;
        case 'ArrowRight': this._fwd();   break;
        case 'ArrowLeft':  this._back();  break;
        case 'KeyF':       this._toggleFS();    break;
        case 'KeyM':       this._toggleSound(); break;
        case 'Escape':
          this.el.modal.classList.add('hidden');
          this._closeSide(); break;
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', ()=>{ window.app = new WorkoutApp(); });
