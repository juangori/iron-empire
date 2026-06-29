# tools/ — análisis de balance

Scripts de Node (sin dependencias) para auditar la economía del juego sin abrir el navegador.
Leen directamente `js/data.js` y `js/game.js`, así que **siempre reflejan los números reales**.

Requisito: Node.js. Correr desde la raíz del repo.

## `sim_progression.js` — simulador de progresión
```
node tools/sim_progression.js
```
Un "jugador" greedy juega el loop central (compra equipos/staff/zonas/instructores por mejor
ROI, da clases, gana competencias, abre sucursales pasivas) y reporta:
- cuánto tarda (tiempo real) en llegar a cada nivel,
- estado final: nivel, plata, total ganado, estrellas, ingreso/gasto/neto por segundo,
- tablas de referencia: payback de cada equipo y curva de alquiler.

Compara dos configs: `PRE_REBALANCE` (cómo estaba antes) y `SHIPPED` (valores actuales en vivo).
**Para probar un ajuste:** editá los números de un config object al final del archivo y re-corré.
Si te gusta el resultado, aplicá esos números al código real (`data.js` / `game.js`).

> Es una aproximación: omite XP de VIPs, eventos y bono diario, los timers de construcción,
> suplementos y decoración. O sea, el juego real progresa un poco más rápido. Sirve como
> cota inferior — ideal para detectar fases con neto negativo, paredes de nivel e inflación.

## `test_branches.js` — tests de lógica de sucursales
```
node tools/test_branches.js
```
Carga el `game.js` real y valida (27 asserts) las fórmulas del sistema de franquicia pasiva
y la migración de saves viejos (localStorage y nube). Sale con código ≠ 0 si algo falla.
Corré esto después de tocar el sistema de sucursales o la curva de estrellas.

## Dónde están los números en el código
- Constantes de sucursales (`BRANCH_INCOME_PAYBACK`, `BRANCH_LEVEL_STEP`, `BRANCH_UPGRADE_BASE`): `js/game.js`
- Estrellas de franquicia (`getPrestigeStars`): `js/game.js`
- Curva de XP (`checkLevelUp`) y alquiler (`getOperatingCostsPerDay`): `js/game.js`
- Costos operativos (`OPERATING_COSTS`), equipos, clases, etc.: `js/data.js`
