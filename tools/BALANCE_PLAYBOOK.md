# Balance Playbook — sistema de automejora

Documento VIVO. Toda pasada de balance (humano o agente) **lee esto primero** y al terminar
**agrega lo aprendido**. Es el loop de automejora: diagnóstico → fix → validación → aprendizaje.

## El loop (metodología repetible)
1. **Diagnosticar con números, no a ojo.** Leé la data (`js/data.js`) y las fórmulas
   (`js/game.js`, `js/systems.js`). Replicá las fórmulas en un sim de Node (`tools/sim_*.js`)
   que lee los archivos reales, así siempre refleja los valores en vivo.
2. **Encontrá bien Y mal.** No inventes problemas: si algo está bien, decilo. Listá lo malo con
   números concretos que lo demuestren y una severidad.
3. **Proponé fixes exactos.** Valor actual → nuevo, archivo, justificación, y si es buff/nerf/neutral.
4. **Validá** contra `tools/sim_progression.js` (la curva no se rompe) + los `tools/test_*.js`.
5. **Aplicá** (un sistema por commit, mensaje claro), subí cache `?v=NN`, actualizá `CLAUDE.md`.
6. **Registrá el aprendizaje acá** (sección Learnings + Status log).

## Principios de diseño (aprendidos)
- **Hay jugadores en vivo.** Preferí buffs / fixes de coherencia sobre nerfs. Nunca bajes el
  progreso ya ganado (estrellas existentes no se tocan, multiplicadores no se reducen retroactivos).
- **Premios Y costos tienen que ESCALAR con la economía** (income/s, nivel, o cap). Los números
  mágicos fijos que se vuelven irrelevantes tarde (o brutales temprano) son el bug #1.
- **Cooldowns/duraciones pensados para sesión diaria** ("jugar un rato cada día"): la mayoría
  refresca dentro de una sesión (3-15 min); sólo el top-tier es objetivo diario.
- **Los sinks de costo geométrico (costMult) se autobalancean** por el equilibrio de income-por-$.
  No los aplanes: son el sink de plata principal y son load-bearing.
- **Cuidado con límites VESTIGIALES** del viejo sistema multi-sucursal que anulan un sistema en
  silencio (ej: el cap de miembros del barrio capaba toda la dimensión de capacidad de los equipos).
- **Validá siempre con el sim de progresión** para que la curva (tiempo-a-nivel, plata, estrellas)
  no se rompa con un cambio.
- **Los GASTOS también tienen que escalar con el ingreso.** Si los costos son flat (alquiler/servicios
  por nivel), a nivel medio quedan en ~1% del ingreso (que explota con multiplicadores) y se pierde la
  tensión del tycoon. Solución: un costo proporcional al ingreso ("servicios e impuestos", `overheadRate`)
  que escala solo a toda escala, reducible con el Gerente para mantener agencia. (Detectado por un jugador
  en vivo: Nv11, +$5.5K/s ingreso vs -$66/s gasto.)
- **Patrones cross-sistema recurrentes** (encontrados por los 6 agentes en paralelo, valen para TODO sistema futuro):
  1. *Efectos planos no escalan* → vestigiales tarde. autoMembers, capacityBonus, repBonus, premios fijos de
     competencia/campeón. Regla: todo número que importa debe ser % (de ingreso, cap, o miembros), no un flat.
  2. *La reputación casi no tiene valor económico* (solo gatea minRep de competencias, que se supera en minutos).
     Todo lo que solo da "rep" es débil → emparejá con un efecto de ingreso, o repensá qué hace la rep. (Pendiente: darle valor real a la reputación.)
  3. *Mecánicas fantasma*: cosas documentadas que el código no hace (gate de fatiga del campeón) o que un detalle
     anula (robo de rivales absorbido por el surplus de atracción; classIncomeMult de suplementos nunca leído).
     Verificá SIEMPRE que el efecto realmente ocurra, no solo que esté en la data.

## Status log
| Sistema | Estado | Resumen |
|---|---|---|
| Sucursales | ✅ | Rediseño a idle puro (sin swap, ingreso pasivo). |
| Economía core | ✅ | Curva XP 1.55→1.40, alquiler continuo (sin cliff), estrellas cap 10, treadmill ROI. |
| Eventos | ✅ | 24→39 eventos, sistema declarativo que escala todo con la economía. |
| Cooldowns | ✅ | Competencias comprimidas (10m-6h), recuperación campeón, bono diario escala. |
| Maquinarias | ✅ | Curva se autobalancea (ok). Fix: cap de miembros del barrio 500→2500 + mancuernas cap 0→2. |
| Gastos vs ingreso | ✅ | Gastos eran ~1% del ingreso. Agregado overhead 18% del ingreso bruto (reducible con Gerente). |
| Staff | ✅ | Sano en general. Fix: copias extra del Gerente ya no son trap (costReduction stackea+capea 60%). |
| Clases | ✅ | Caían a ~1% del ingreso. Ahora escalan ×staff×miembros + bug classIncomeMult arreglado + mejora instructor 2.5→1.5. |
| Suplementos | ✅ | 6/12 muertos. Pre-Workout/ZMA revividos (bug clases) + 4 suplementos planos ahora con incomeMult que escala. |
| Skill tree | ✅ | 4 skills de reputación + capstones eran trampas. Riders de income agregados + XP de research escala con costo. |
| Rivales | ✅ | memberSteal era cosmético (atracción > cap) y promo trampa. Robo ahora = % real de miembros + promo 300→900s. |
| Campeón | ✅ | Gate de fatiga no existía en código (agregado) + mentalidad muerta ahora escala con dificultad + premio $ con piso por ingreso. |
| UX (review en vivo con navegador) | ⏳ | Encolado para el final |

## Herramientas
- `tools/sim_progression.js` — curva de progresión (PRE_REBALANCE vs SHIPPED).
- `tools/sim_equipment.js` — análisis de equipos.
- `tools/audit_timings.js` — todos los cooldowns/tiempos clasificados.
- `tools/test_events.js`, `tools/test_branches.js` — regresión.
