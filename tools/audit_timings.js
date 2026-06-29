// Iron Empire — timing/cooldown audit.
// Tabula TODOS los tiempos del juego (cooldowns, duraciones, intervalos, construcción)
// y los clasifica por ventana de sesión, marcando los que conviene revisar.
// Run: `node tools/audit_timings.js`
//
// Filosofía de retención ("jugar un rato cada día"):
//   instant  < 30s   — feedback inmediato
//   quick    30s-3m  — varias acciones por sesión
//   session  3-15m   — volvés en la misma sesión
//   short-AFK 15-60m — volvés más tarde el mismo día
//   daily    1-8h    — objetivo del día / multi-sesión
//   slow     >8h     — multi-día (sólo top-tier debería estar acá)

const fs = require('fs');
const vm = require('vm');
const path = require('path');
const data = fs.readFileSync(path.join(__dirname, '..', 'js', 'data.js'), 'utf8');
const sb = { Math, JSON, console };
vm.createContext(sb);
vm.runInContext(data + '\nvar __D={COMPETITIONS,GYM_CLASSES,MARKETING_CAMPAIGNS,SUPPLEMENTS,GYM_ZONES,RANDOM_EVENTS,RIVAL_GYMS};', sb);
const D = sb.__D;

function bucket(s){
  if (s < 30) return 'instant';
  if (s < 180) return 'quick';
  if (s < 900) return 'session';
  if (s < 3600) return 'short-AFK';
  if (s <= 8*3600) return 'daily';
  return 'slow';
}
function fmt(s){ if(s<60) return s+'s'; if(s<3600) return (s/60).toFixed(s%60?1:0)+'m'; return (s/3600).toFixed(s%3600?1:0)+'h'; }
function row(name, secs, note){ console.log('  '+String(fmt(secs)).padStart(7)+'  ['+bucket(secs).padEnd(9)+']  '+name+(note?'  — '+note:'')); }

console.log('===== INTERVALOS / SPAWNS =====');
row('Evento random (intervalo)', 300, '300-600s (5-10m)');
row('VIP spawn', 250, '250-450s, máx 3 simultáneos');
row('Game day', 600, '600 ticks');

console.log('\n===== COMPETENCIAS (cooldown) =====');
for(const c of D.COMPETITIONS) row(c.name, c.cooldown, '$'+c.reward.toLocaleString()+' · win '+Math.round(c.winChance*100)+'% · minRep '+c.minRep);

console.log('\n===== CLASES (cooldown / duración) =====');
for(const c of D.GYM_CLASSES) row(c.name+' (cd)', c.cooldown, 'dura '+fmt(c.duration)+' · $'+c.income+' bruto');

console.log('\n===== MARKETING burst (ciclo = duración + cooldown) =====');
for(const m of D.MARKETING_CAMPAIGNS.filter(x=>x.type==='burst')) row(m.name, m.duration+m.cooldown, 'dur '+fmt(m.duration)+' + cd '+fmt(m.cooldown));

console.log('\n===== SUPLEMENTOS (duración del efecto) =====');
for(const s of D.SUPPLEMENTS) row(s.name, s.duration, '$'+s.cost);

console.log('\n===== ZONAS (construcción) =====');
for(const z of D.GYM_ZONES.filter(x=>x.buildTime>0)) row(z.name, z.buildTime, '$'+z.cost.toLocaleString());

console.log('\n===== CONSTRUCCIÓN / RESEARCH (fórmulas game.js) =====');
[1,5,10,15].forEach(L=>row('Equipo upgrade a Nv.'+L, 20*L, '20s × nivel'));
[2,3,4,5].forEach(L=>row('Staff training a Nv.'+L, L*L*60, 'nivel² × 60'));
[['$≤30K',60],['$≤200K',180],['$≤1M',420],['$≤5M',900],['$≤20M',1800],['>$20M',3600]].forEach(([t,s])=>row('Skill research '+t, s));

console.log('\n===== CAMPEÓN =====');
[1,10,20].forEach(v=>row('Entrenar stat (val '+v+')', 30+v*15, '30 + val×15'));
console.log('  Fatiga: +25/entrenar, +35/competir, agotado a 75 (≈3 acciones)');
[1,5,10].forEach(st=>{ var perSec=(2+Math.floor(st*0.5))/30; row('Recuperar 75 fatiga (stamina '+st+')', Math.round(75/perSec), (2+Math.floor(st*0.5))+'/30s'); });

console.log('\n===== RESUMEN por ventana =====');
const all=[];
D.COMPETITIONS.forEach(c=>all.push(c.cooldown));
D.GYM_CLASSES.forEach(c=>all.push(c.cooldown));
const counts={};
all.forEach(s=>counts[bucket(s)]=(counts[bucket(s)]||0)+1);
console.log('  competencias+clases por ventana:', JSON.stringify(counts));
