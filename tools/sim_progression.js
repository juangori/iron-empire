// Iron Empire — economy progression simulator.
// A greedy "player" plays the core loop (buy best-ROI equipment/staff/zones/instructors,
// run classes & competitions, open passive branches) using the REAL data.js arrays and
// replicated game.js formulas. Reports real-time to reach each level + final economy state.
//
// Use it to compare tuning configs before touching the game. Edit a config object below,
// then: `node tools/sim_progression.js`
//
// NOTE: this is an APPROXIMATION (omits VIP/events/daily-bonus XP, construction delays,
// supplements, decoration), so the real game progresses a bit faster. It's a lower bound
// that's great for catching net-negative phases, level walls and runaway inflation.

const fs = require('fs');
const vm = require('vm');
const path = require('path');
const JS = path.join(__dirname, '..', 'js');
const data = fs.readFileSync(path.join(JS, 'data.js'), 'utf8');
const sb = { Math, JSON, console };
vm.createContext(sb);
vm.runInContext(data + '\nvar __D={EQUIPMENT,STAFF,OPERATING_COSTS,GYM_ZONES,COMPETITIONS,NEIGHBORHOODS,GYM_CLASSES,CLASS_INSTRUCTORS};', sb);
const D = sb.__D;

function run(cfg){
  const EQUIPMENT=JSON.parse(JSON.stringify(D.EQUIPMENT));
  if(cfg.treadmillInc) EQUIPMENT.find(e=>e.id==='treadmill').incomePerLevel=cfg.treadmillInc;
  const STAFF=D.STAFF, GYM_ZONES=D.GYM_ZONES, COMPETITIONS=D.COMPETITIONS, NB=D.NEIGHBORHOODS, CLASSES=D.GYM_CLASSES, INSTR=D.CLASS_INSTRUCTORS;
  const slm=l=>1+((l||1)-1)*0.2;
  const eqCost=(e,l,mgr)=>Math.ceil(e.baseCost*Math.pow(e.costMult,l)*(mgr?0.8:1));
  const staffMult=S=>{let m=1;for(const s of STAFF){const st=S.staff[s.id];if(st&&s.incomeMult)m+=s.incomeMult*slm(st.level);}return m;};
  const capStaff=S=>{let c=0;for(const s of STAFF){const st=S.staff[s.id];if(st&&s.capacityBonus)c+=s.capacityBonus*slm(st.level);}return c;};
  const maxMem=S=>{let c=0;for(const z of GYM_ZONES)if(S.zones[z.id])c+=z.capacityBonus;for(const e of EQUIPMENT)c+=e.capacityPerLevel*(S.equipment[e.id]||0);c+=capStaff(S);return Math.min(Math.floor(c),2500);};
  const mem=S=>{let b=0;for(const e of EQUIPMENT)b+=e.membersPerLevel*(S.equipment[e.id]||0);return Math.min(b,maxMem(S));};
  const stars=S=>{const v=S.totalEarned/cfg.starDiv; if(S.totalEarned<cfg.starDiv)return 0; return Math.min(cfg.starCap, Math.floor(Math.sqrt(v)));};
  const inc=S=>{let base=0;for(const e of EQUIPMENT)base+=e.incomePerLevel*(S.equipment[e.id]||0);
    let z=0;for(const zz of GYM_ZONES)if(S.zones[zz.id])z+=zz.incomeBonus;
    const pres=1+S.stars*cfg.starBonus, memb=Math.min(3,1+mem(S)*0.002);
    let t=(base+z)*staffMult(S)*memb*pres;
    for(const id in S.branches){const b=S.branches[id];const h=NB.find(n=>n.id===b.hood);const basis=h.unlockCost||250000;
      t+=(basis/1500)*(1+(b.level-1)*0.25)*(cfg.branchStar?pres:1);}
    return t;};
  const eqLvls=S=>{let t=0;for(const e of EQUIPMENT)t+=(S.equipment[e.id]||0);return t;};
  const opc=S=>{let d=0;
    if(cfg.contRent){ d += (S.level<=cfg.graceLv)? S.level*cfg.graceSlope : cfg.graceLv*cfg.graceSlope+(S.level-cfg.graceLv)*cfg.rentPerLevel; }
    else { if(S.level<=cfg.graceLv)d+=S.level*cfg.graceSlope; else d+=cfg.baseRent+S.level*cfg.rentPerLevel; }
    let ez=0;for(const z of GYM_ZONES)if(z.id!=='ground_floor'&&S.zones[z.id])ez++;
    d+=ez*(12000+S.level*800); d+=eqLvls(S)*cfg.util;
    for(const s of STAFF){const st=S.staff[s.id];if(st)d+=s.salary*(1+((st.level||1)-1)*0.3);}
    return d/600;};
  const net=S=>inc(S)-opc(S);
  const xpNext=L=>Math.ceil(100*Math.pow(cfg.xpBase,L-1));
  const addXp=(S,a)=>{S.xp+=a*cfg.xpMult;while(S.xp>=S.xpToNext){S.xp-=S.xpToNext;S.level++;S.xpToNext=xpNext(S.level);}};
  const advance=(S,dt)=>{dt=Math.max(0,dt);const n=net(S);S.money+=n*dt;S.totalEarned+=Math.max(0,inc(S))*dt;S.time+=dt;if(S.money<0)S.money=0;};

  const S={money:100,level:1,xp:0,xpToNext:100,time:0,equipment:{},staff:{},zones:{ground_floor:true},rep:0,compCD:{},classCD:{},instr:{},branches:{},totalEarned:0,stars:0};
  const lt={1:0}; let guard=0,stalls=0; const MAX=60*60*40;
  while(S.time<MAX&&S.level<26&&guard++<300000){
    S.stars=stars(S);
    const c=[];
    for(const e of EQUIPMENT){if(S.level<e.reqLevel)continue;const cur=S.equipment[e.id]||0;if(cur>=S.level)continue;
      const cost=eqCost(e,cur,!!S.staff.manager);const g=e.incomePerLevel*staffMult(S)*Math.min(3,1+mem(S)*0.002)*(1+S.stars*cfg.starBonus);
      c.push({t:'eq',id:e.id,cost,pb:cost/Math.max(g,1e-6)});}
    for(const s of STAFF){if(S.level<s.reqLevel||S.staff[s.id])continue;const cost=Math.ceil(s.costBase*(S.staff.manager&&s.id!=='manager'?0.8:1));
      let base=0;for(const e of EQUIPMENT)base+=e.incomePerLevel*(S.equipment[e.id]||0);
      let g=(s.incomeMult?s.incomeMult*base*Math.min(3,1+mem(S)*0.002):0)+(s.autoMembers?2:0)+0.5;
      c.push({t:'staff',id:s.id,cost,pb:cost/Math.max(g,1e-6)});}
    for(const z of GYM_ZONES){if(z.id==='ground_floor'||S.zones[z.id]||S.level<z.reqLevel)continue;
      const g=z.incomeBonus*staffMult(S)*Math.min(3,1+mem(S)*0.002)*(1+S.stars*cfg.starBonus);c.push({t:'zone',id:z.id,cost:z.cost,pb:z.cost/Math.max(g,1e-6)});}
    for(const n of NB){if(n.unlockCost===0||S.level<n.reqLevel||S.branches['b_'+n.id])continue;
      const g=(n.unlockCost/1500)*(cfg.branchStar?(1+S.stars*cfg.starBonus):1);c.push({t:'branch',id:n.id,cost:n.unlockCost,pb:n.unlockCost/Math.max(g,1e-6)});}
    // hire instructors (unlock repeatable class XP/income) — high priority
    for(const it of INSTR){ if(S.level<it.reqLevel||S.instr[it.id])continue; const cl=CLASSES.find(c=>c.id===it.id);
      if(cl.reqEquipment && !(S.equipment[cl.reqEquipment]>0)) continue; // need the equipment
      const g=(cl.income-cl.cost)/cl.cooldown + cl.xp/cl.cooldown*2; c.push({t:'instr',id:it.id,cost:it.hireCost,pb:it.hireCost/Math.max(g,1e-6)}); }
    // run classes (instructor hired, off cooldown) — net income + xp + rep (levelScale × prestige × quality)
    for(const cl of CLASSES){ if(!S.instr[cl.id]||(S.classCD[cl.id]||0)>S.time)continue;
      if(cl.reqEquipment && !(S.equipment[cl.reqEquipment]>0))continue;
      const lvlScale=1+0.2*(S.level-1); const pres2=1+S.stars*cfg.starBonus; const quality=1.4; // eq+instructor quality approx
      const net_=cl.income*lvlScale*pres2*quality*0.85 - cl.cost; // 15% commission
      S.money+=Math.max(0,net_); S.totalEarned+=Math.max(0,net_); addXp(S,cl.xp*lvlScale*0.5); S.rep+=cl.rep*lvlScale*0.5; S.classCD[cl.id]=S.time+cl.cooldown; }
    // competition expected value (off cooldown, rep-gated)
    let comp=null;for(const cc of COMPETITIONS){if(S.rep<(cc.minRep||0)||(S.compCD[cc.id]||0)>S.time)continue;if(!comp||cc.reward>comp.reward)comp=cc;}
    if(comp){S.money+=comp.reward*comp.winChance;S.totalEarned+=comp.reward*comp.winChance;addXp(S,comp.xpReward*(comp.winChance+0.2*(1-comp.winChance))*(1+cfg.repScale*(S.level-1)));S.rep+=comp.repReward*comp.winChance;S.compCD[comp.id]=S.time+comp.cooldown;}
    c.sort((a,b)=>a.pb-b.pb);const p=c[0];
    if(!p){advance(S,300);continue;}
    if(S.money<p.cost){const n=net(S);if(n<=0.01){stalls++;advance(S,600);if(stalls>60)break;continue;}let w=Math.min((p.cost-S.money)/n,60*60*6);advance(S,w);if(S.money<p.cost)continue;}
    S.money-=p.cost;
    if(p.t==='eq'){const cur=S.equipment[p.id]||0;S.equipment[p.id]=cur+1;addXp(S,15+(cur+1)*3);}
    else if(p.t==='staff'){S.staff[p.id]={level:1};addXp(S,50);}
    else if(p.t==='zone'){S.zones[p.id]=true;addXp(S,100);}
    else if(p.t==='instr'){S.instr[p.id]=true;}
    else if(p.t==='branch'){S.branches['b_'+p.id]={hood:p.id,level:1};}
    for(let L=2;L<=S.level;L++)if(lt[L]==null)lt[L]=S.time;
  }
  return {S,lt,stalls,inc:inc(S),opc:opc(S),net:net(S),mem:mem(S),mm:maxMem(S),nb:Object.keys(S.branches).length};
}
const fmtT=s=>Math.floor(s/3600)+'h'+String(Math.floor((s%3600)/60)).padStart(2,'0');
function report(name,cfg){
  const r=run(cfg);
  const milestones=[5,10,15,20,25].map(L=>r.lt[L]!=null?`L${L}:${fmtT(r.lt[L])}`:`L${L}:--`).join('  ');
  console.log(`\n### ${name}`);
  console.log('  '+milestones);
  console.log(`  final Lv${r.S.level} t=${fmtT(r.S.time)} money=$${Math.round(r.S.money).toLocaleString()} earned=$${Math.round(r.S.totalEarned).toLocaleString()} stars=${r.S.stars} branches=${r.nb}`);
  console.log(`  income=$${r.inc.toFixed(0)}/s op=$${r.opc.toFixed(1)}/s net=$${r.net.toFixed(0)}/s members=${r.mem}/${r.mm} stalls=${r.stalls}`);
}

// Knobs: contRent=continuous rent ramp (no cliff). graceLv/graceSlope=soft early rent.
// rentPerLevel/baseRent/util=operating costs. xpBase=level curve exponent. starDiv/starCap/starBonus=franchise stars.
// branchStar=do passive branches compound with stars. treadmillInc=treadmill income/level. repScale=competition XP level-scaling.
const PRE_REBALANCE = {contRent:false,baseRent:8000,rentPerLevel:2500,util:150,graceLv:5,graceSlope:800,xpBase:1.55,xpMult:1,starDiv:2e6,starCap:Infinity,starBonus:0.25,branchStar:true,treadmillInc:1.6,repScale:0};
const SHIPPED       = {contRent:true, baseRent:0,   rentPerLevel:2000,util:60, graceLv:5,graceSlope:800,xpBase:1.40,xpMult:1,starDiv:8e6,starCap:10,      starBonus:0.25,branchStar:false,treadmillInc:2.6,repScale:0.15};
report('PRE-REBALANCE (before)', PRE_REBALANCE);
report('SHIPPED (current live values)', SHIPPED);

// ===== STATIC REFERENCE TABLES =====
console.log('\n=== EQUIPMENT first-purchase payback (raw income, no multipliers) ===');
for(const e of D.EQUIPMENT){ console.log('  '+e.id.padEnd(11)+' cost '+String(e.baseCost).padStart(8)+'  inc/lvl '+String(e.incomePerLevel).padStart(5)+'  payback '+Math.round(e.baseCost/e.incomePerLevel)+'s  reqLv'+e.reqLevel); }
console.log('\n=== RENT/day curve: SHIPPED (continuous) vs PRE-REBALANCE (cliff at L6) ===');
for(const L of [3,5,6,7,10,13,15,18,22,25]){ const shipped=L<=5?L*800:5*800+(L-5)*2000; const old=L<=5?L*800:8000+L*2500; console.log('  Lv'+String(L).padStart(2)+'  SHIPPED '+String(shipped).padStart(6)+'   OLD '+String(old).padStart(6)); }
