import type { SkillDefinition } from "../types";

/**
 * Catálogo completo de las 72 habilidades oficiales (12 por cada una de las
 * 6 categorías), transcritas desde COMPENDIO 2025 Third Season + NAF.pdf.
 * Es la semilla versionada; la copia editable en producción vive en
 * MasterSkill (Postgres) y la cura el admin desde /admin/skills.
 */
export const SKILLS: SkillDefinition[] = [
  // ── General ──────────────────────────────────────────────────────────
  {
    key: "dauntless",
    name: "Agallas",
    englishName: "Dauntless",
    category: "General",
    isActive: false,
    description:
      "Cuando este jugador realiza una acción de Placaje contra un jugador rival con un atributo Fuerza superior al suyo (antes de aplicar modificadores a ambos jugadores), este jugador puede tirar 1D6 y sumar su atributo Fuerza al resultado. Si el total es mayor que el atributo Fuerza sin modificar del jugador rival, mientras dure la acción de Placaje este jugador aumentará su propio atributo Fuerza hasta igualarlo al del jugador rival. A continuación se aplicarán de manera normal todos los modificadores que procedan. Si este jugador tiene además una habilidad que le permita realizar más de una acción de Placaje en una misma activación, como por ejemplo Furia, deberá hacer una tirada de Agallas por separado para cada una de esas acciones de Placaje.",
  },
  {
    key: "steady-footing",
    name: "Equilibrio Firme",
    englishName: "Steady Footing",
    category: "General",
    isActive: true,
    description:
      "Cuando este jugador vaya a ser Derribado o a Caerse por cualquier motivo, tira 1D6. Con un resultado de 6, este jugador no es Derribado o no se Cae. Si esto ocurre durante su activación, este jugador puede seguir adelante con su activación de forma normal y no se produce un cambio de turno.",
  },
  {
    key: "wrestle",
    name: "Forcejear",
    englishName: "Wrestle",
    category: "General",
    isActive: false,
    description:
      "Cuando este jugador realice una acción de Placaje, o sea blanco de una acción de Placaje, y vaya a aplicar un resultado de Ambos jugadores derribados, puede elegir usar esta habilidad. En tal caso, ambos jugadores son colocados Tumbados boca arriba, con independencia de otras habilidades que puedan tener.",
  },
  {
    key: "frenzy",
    name: "Furia",
    englishName: "Frenzy",
    category: "General",
    isActive: false,
    description:
      "Cada vez que este jugador realice una acción de Placaje y empuje a su blanco, debe hacer el movimiento de impulso si puede. Además, si después de ser empujado el blanco sigue En pie, este jugador debe realizar de inmediato una segunda acción de Placaje contra ese mismo blanco y hacer movimiento de impulso si lo empuja de nuevo. Si este jugador está realizando una acción de Penetración, la segunda acción de Placaje le costará también una casilla de su movimiento. Si no le queda movimiento, deberá forzar la marcha. En caso de que no pueda forzar la marcha, no podrá realizar el segundo placaje. Un jugador con esta habilidad no puede tener las habilidades Apartar, Golpe a la carrera ni Placaje múltiple.",
  },
  {
    key: "sure-hands",
    name: "Manos Seguras",
    englishName: "Sure Hands",
    category: "General",
    isActive: false,
    description:
      "Este jugador puede repetir el D6 al intentar recoger el balón, aunque no al realizar una acción de Asegurar el balón. Además, la habilidad Robar balón no puede utilizarse contra este jugador.",
  },
  {
    key: "kick",
    name: "Patada",
    englishName: "Kick",
    category: "General",
    isActive: false,
    description:
      "Si este jugador es designado como pateador, cuando el balón se desvíe su Entrenador puede elegir que se desvíe solo 1D3 casillas, en lugar de las habituales 1D6.",
  },
  {
    key: "tackle",
    name: "Placaje Defensivo",
    englishName: "Tackle",
    category: "General",
    isActive: false,
    description:
      "Cuando un jugador rival intente esquivar para salir de una casilla en la zona de defensa de este jugador, no podrá usar su habilidad Esquivar. Además, cuando este jugador realice una acción de Placaje contra un jugador rival, se considerará que dicho rival no tiene la habilidad de Esquivar si se elige un resultado de Desequilibrado.",
  },
  {
    key: "block",
    name: "Placar",
    englishName: "Block",
    category: "General",
    isActive: false,
    isElite: true,
    description:
      "Cuando este jugador participe en una acción de Placaje en la que se aplique un resultado de Ambos jugadores derribados, puede elegir no ser Derribado.",
  },
  {
    key: "pro",
    name: "Profesional",
    englishName: "Pro",
    category: "General",
    isActive: true,
    description:
      "Durante su activación, este jugador puede intentar repetir la tirada de un dado. Ese dado puede haberse tirado por sí mismo o como parte de una tirada de varios dados o de una reserva de dados. Al usar esta habilidad, tira antes 1D6: con 3+ el dado elegido puede repetirse; con 1-2 el dado no puede repetirse. Esta habilidad no puede utilizarse para repetir un dado que sea parte de una tirada de Armadura, de Heridas o de Lesiones, ni una tirada que se haya hecho fuera de la activación de este jugador o que no haya hecho directamente este jugador (como Protestar al árbitro o El público reacciona). Tras intentar usar esta habilidad, no se puede utilizar ningún otro tipo de repetición en la misma tirada.",
  },
  {
    key: "taunt",
    name: "Provocar",
    englishName: "Taunt",
    category: "General",
    isActive: true,
    description:
      "Cuando este jugador es empujado debido a una acción de Placaje realizada contra él, su Entrenador puede obligar al jugador rival a que haga un movimiento de impulso. Esta habilidad no puede usarse contra un jugador rival que haya Echado raíces debido al rasgo Echar raíces.",
  },
  {
    key: "strip-ball",
    name: "Robar el Balón",
    englishName: "Strip Ball",
    category: "General",
    isActive: false,
    description:
      "Cuando este jugador realice una acción de Placaje contra un jugador rival que sea el portador del balón, si el jugador rival es empujado dejará caer el balón en la casilla a la que sea empujado, y el balón rebotará desde ella. Dicho rebote ocurre antes de que el jugador rival quede Tumbado boca arriba (si eso sucede) pero después de que este jugador elija si hacer movimiento de impulso.",
  },
  {
    key: "fend",
    name: "Zafarse",
    englishName: "Fend",
    category: "General",
    isActive: false,
    description:
      "Cuando este jugador sea empujado como resultado de una acción de Placaje realizada contra él, el jugador rival no puede hacer el movimiento de impulso. Esta habilidad no se puede utilizar contra un jugador con el rasgo Bola con cadena, ni contra un jugador con la habilidad Imparable que esté realizando una acción de Penetración.",
  },

  // ── Fuerza ───────────────────────────────────────────────────────────
  {
    key: "break-tackle",
    name: "Abrirse Paso",
    englishName: "Break Tackle",
    category: "Fuerza",
    isActive: true,
    description:
      "Una vez por turno, cuando este jugador intente esquivar, puede aplicar a su chequeo de Agilidad un modificador de +1 si su atributo Fuerza es de 3 o menos, o bien un modificador de +2 si su atributo Fuerza es de 4, o bien un modificador de +3 si su atributo Fuerza es de 5 o más.",
  },
  {
    key: "grab",
    name: "Apartar",
    englishName: "Grab",
    category: "Fuerza",
    isActive: false,
    description:
      "Cuando este jugador declara una acción de Placaje, si el blanco resulta empujado, el Entrenador de este jugador puede elegir cualquier casilla desocupada adyacente al blanco y empujarlo allí. Si no hay casillas desocupadas adyacentes al blanco, esta habilidad no puede utilizarse. Además, cuando este jugador realiza una acción de Placaje, el blanco no puede utilizar la habilidad Echarse a un lado. Un jugador con esta habilidad no puede tener la habilidad Furia.",
  },
  {
    key: "strong-arm",
    name: "Brazo Fuerte",
    englishName: "Strong Arm",
    category: "Fuerza",
    isActive: false,
    description:
      "Cuando este jugador realice una acción de Lanzar compañero, puede aplicar un modificador de +1 al chequeo de Pase. Un jugador que no tenga el rasgo Lanzar compañero no puede tener esta habilidad.",
  },
  {
    key: "cabeza-dura",
    name: "Cabeza Dura",
    englishName: "Thick Skull",
    category: "Fuerza",
    isActive: false,
    description:
      "Cuando se haga una tirada de Heridas contra este jugador, solo quedará Inconsciente con un resultado de 9, y tratará el resultado de 8 como Aturdido. Si este jugador tiene además el rasgo Escurridizo, en lugar de eso solo quedará Inconsciente con un resultado de 8, y tratará el resultado de 7 como Aturdido.",
  },
  {
    key: "guard",
    name: "Defensa",
    englishName: "Guard",
    category: "Fuerza",
    isActive: false,
    isElite: true,
    description:
      "Este jugador siempre puede ofrecer apoyos tanto ofensivos como defensivos en las acciones de Placaje, sin importar por cuántos jugadores rivales esté siendo Marcado.",
  },
  {
    key: "mighty-blow",
    name: "Golpe Mortífero",
    englishName: "Mighty Blow",
    category: "Fuerza",
    isActive: false,
    isElite: true,
    description:
      "Cuando este jugador Derriba a un jugador rival durante una acción de Placaje, incluso aunque él mismo sea también Derribado, puede aplicar un modificador de +1 o bien a la tirada de Armadura o bien a la tirada de Heridas. Se puede decidir aplicar este modificador después de hacer la tirada en cuestión.",
  },
  {
    key: "juggernaut",
    name: "Imparable",
    englishName: "Juggernaut",
    category: "Fuerza",
    isActive: false,
    description:
      "Cuando este jugador declara una acción de Penetración, puede tratar cualquier resultado de Ambos jugadores derribados como un resultado de Empujón en los placajes que realice durante la misma. Además, cuando este jugador realiza una acción de Penetración, los rivales no pueden usar las habilidades Forcejear, Mantenerse firme ni Zafarse.",
  },
  {
    key: "llave-de-brazo",
    name: "Llave de Brazo",
    englishName: "Arm Bar",
    category: "Fuerza",
    isActive: true,
    description:
      "Si un jugador se Cae por haber fallado su intento de esquivar, saltar o brincar desde una casilla en la Zona de defensa de este jugador, este jugador puede aplicar un modificador de +1 o bien a la tirada de Armadura o bien a la tirada de Heridas. Se puede decidir aplicar este modificador después de hacer la tirada en cuestión. Si el jugador rival resulta Lesionado por haber fallado su intento de esquivar, saltar o brincar desde una casilla en la Zona de defensa de este jugador, se considerará que este jugador ha causado la Lesión y recibe Puntos de Estrellato por ello. Si un jugador intenta salir de una casilla en la Zona de defensa de varios jugadores con esta habilidad, solo uno de ellos podrá utilizarla.",
  },
  {
    key: "luchador",
    name: "Luchador",
    englishName: "Grappler",
    category: "Fuerza",
    isActive: true,
    description:
      "Cuando este jugador declara una acción de Placaje, puede repetir un único resultado de Ambos jugadores derribados.",
  },
  {
    key: "stand-firm",
    name: "Mantenerse Firme",
    englishName: "Stand Firm",
    category: "Fuerza",
    isActive: false,
    description:
      "Cuando este jugador vaya a ser empujado durante una acción de Placaje, incluso debido a un empujón en cadena, puede elegir no ser empujado y permanecer en su casilla actual. El uso de esta habilidad no impide a un jugador con la habilidad Furia realizar una segunda acción de Placaje, siempre y cuando este jugador siga En pie.",
  },
  {
    key: "ojo-de-halcon",
    name: "Ojo de Halcón",
    englishName: "Hawk-Eye",
    category: "Fuerza",
    isActive: false,
    description:
      "Cuando este jugador realiza una acción de Lanzar compañero, si el resultado es un lanzamiento soberbio, el jugador lanzado no se escora antes de aterrizar, sino que aterriza en la casilla objetivo. Un jugador que no tenga el rasgo Lanzar compañero no puede tener esta habilidad.",
  },
  {
    key: "multiple-block",
    name: "Placaje Múltiple",
    englishName: "Multiple Block",
    category: "Fuerza",
    isActive: true,
    description:
      "Cuando este jugador declara una acción de Placaje, puede efectuar hasta dos acciones de Placaje, cada una tomando como blanco a un jugador rival distinto al que esté Marcando. Al hacer esto, el atributo Fuerza de este jugador se reduce en 2 durante esas acciones de Placaje. Ambas acciones de Placaje son simultáneas, aunque recomendamos tirar por separado para evitar confusiones. Eso significa que ambas se resuelven por completo, aunque alguna de las dos provoque un cambio de turno. Este jugador no puede hacer movimientos de impulso en ninguna de esas acciones de Placaje. Un jugador con esta habilidad no puede tener la habilidad Furia.",
  },

  // ── Agilidad ─────────────────────────────────────────────────────────
  {
    key: "catch",
    name: "Atrapar",
    englishName: "Catch",
    category: "Agilidad",
    isActive: false,
    description: "Este jugador puede repetir cualquier chequeo de Agilidad fallido al intentar atrapar el balón.",
  },
  {
    key: "sidestep",
    name: "Echarse a un Lado",
    englishName: "Sidestep",
    category: "Agilidad",
    isActive: false,
    description:
      "Si este jugador es empujado por cualquier motivo, en lugar de que el Entrenador rival elija a qué casilla es empujado, el Entrenador de este jugador podrá elegir cualquier casilla desocupada adyacente a este jugador, y este jugador será empujado a dicha casilla. Si no hay casillas desocupadas adyacentes, esta habilidad no puede usarse.",
  },
  {
    key: "jump-up",
    name: "En Pie de un Salto",
    englishName: "Jump Up",
    category: "Agilidad",
    isActive: true,
    description:
      "Cuando este jugador esté Tumbado boca arriba, puede usar esta habilidad para levantarse “gratis”, sin gastar tres casillas de movimiento para ello. Además, este jugador puede declarar una acción de Placaje estando Tumbado boca arriba. En tal caso, debe hacer un chequeo de Agilidad con un modificador de +1. Si el chequeo tiene éxito, el jugador puede levantarse y realizar de inmediato la acción de Placaje. Si falla el chequeo, el jugador permanece Tumbado boca arriba y su activación termina.",
  },
  {
    key: "sprint",
    name: "Esprintar",
    englishName: "Sprint",
    category: "Agilidad",
    isActive: false,
    description: "Cuando este jugador realiza una acción de Movimiento, puede intentar forzar la marcha una vez más de las que podría normalmente.",
  },
  {
    key: "dodge",
    name: "Esquivar",
    englishName: "Dodge",
    category: "Agilidad",
    isActive: false,
    isElite: true,
    description:
      "Una vez por turno, este jugador puede repetir un único chequeo de Agilidad para intentar esquivar. Además, esta habilidad afecta al resultado de Desequilibrado cuando un jugador rival realiza una acción de Placaje contra este jugador, tal como se describe en la pág. 62 del Reglamento.",
  },
  {
    key: "golpe-a-la-carrera",
    name: "Golpe a la Carrera",
    englishName: "Strike and Run",
    category: "Agilidad",
    isActive: true,
    description:
      "Cuando este jugador realiza una acción de Placaje o una acción especial de Apuñalar, tras resolver dicha acción por completo y siempre y cuando permanezca En pie, puede mover de inmediato una casilla de manera gratuita ignorando las zonas de defensa. Tras mover esa casilla, el jugador no puede estar Marcado ni Marcando a ningún jugador rival. Un jugador con esta habilidad no puede tener la habilidad Furia.",
  },
  {
    key: "sure-feet",
    name: "Pies Firmes",
    englishName: "Sure Feet",
    category: "Agilidad",
    isActive: true,
    description: "Una vez por turno, este jugador puede repetir la tirada de 1D6 al intentar forzar la marcha.",
  },
  {
    key: "diving-tackle",
    name: "Placaje Heroico",
    englishName: "Diving Tackle",
    category: "Agilidad",
    isActive: true,
    description:
      "Cuando un jugador rival intente salir de la zona de defensa de este jugador esquivando, saltando o brincando, tras hacer su chequeo de Agilidad y que se apliquen todos los modificadores y repeticiones, este jugador puede usar esta habilidad. Se aplica de inmediato un modificador de -2 al chequeo de Agilidad del jugador rival y este jugador se coloca Tumbado boca arriba en la casilla que ha dejado vacante el rival. Si un jugador intenta salir de una casilla en la Zona de defensa de varios jugadores con esta habilidad, solo uno de ellos podrá utilizarla.",
  },
  {
    key: "safe-pair-of-hands",
    name: "Proteger el Cuero",
    englishName: "Safe Pair of Hands",
    category: "Agilidad",
    isActive: false,
    description:
      "Si este jugador va a ser Derribado, a Caerse o a quedar Tumbado boca arriba mientras es el portador del balón, antes de eso puede colocar el balón en una casilla desocupada adyacente a la que ocupara él cuando sea Derribado, se Caiga o quede Tumbado boca arriba. En ese caso, el balón no rebota.",
  },
  {
    key: "diving-catch",
    name: "Recepción Heroica",
    englishName: "Diving Catch",
    category: "Agilidad",
    isActive: true,
    description:
      "Este jugador puede intentar atrapar el balón si cae en una casilla de su zona de defensa debido a un pase, una patada inicial o una devolución. Esta habilidad no le permite intentar atrapar el balón si este rebota hasta una casilla de su zona de defensa. Además, este jugador puede aplicar un modificador de +1 a su chequeo de Agilidad al intentar atrapar el balón como parte de una acción de Pase si está en la casilla objetivo del mismo.",
  },
  {
    key: "romper-defensas",
    name: "Romper Defensas",
    englishName: "Break Defenses",
    category: "Agilidad",
    isActive: false,
    description: "Durante los turnos del equipo rival, los jugadores rivales Marcados por este jugador no pueden usar las habilidades Defensa ni Meter la bota.",
  },
  {
    key: "leap",
    name: "Saltar",
    englishName: "Leap",
    category: "Agilidad",
    isActive: true,
    description:
      "Durante su acción de Movimiento, este jugador puede intentar Saltar por encima de una sola casilla adyacente, sin importar lo que haya en ella. Saltar funciona igual que Brincar, como se describe en la pág. 56 del Reglamento, con la excepción de que este jugador puede reducir en 1, hasta un mínimo de -1, los modificadores negativos que reciba para hacerlo. Un jugador con esta habilidad no puede tener el rasgo Pogo saltarín.",
  },

  // ── Pase ─────────────────────────────────────────────────────────────
  {
    key: "on-the-ball",
    name: "Atento al Balón",
    englishName: "On the Ball",
    category: "Pase",
    isActive: false,
    description:
      "Cuando un jugador rival realice una acción de Pase, tras declarar la casilla objetivo pero antes de hacer el chequeo de Pase, este jugador puede moverse hasta 3 casillas, siguiendo todas las reglas normales de movimiento excepto que no puede forzar la marcha. Si este jugador se Cae durante dicho movimiento, el movimiento termina de inmediato y se retoma la acción de Pase. Si hay varios jugadores con esta habilidad, todos ellos pueden usarla durante la misma acción de Pase, aunque deben hacerlo de uno en uno, y si uno de ellos se Cae antes de que otros hayan podido usar esta habilidad, ya no podrán hacerlo. Además, durante la secuencia de inicio de una entrada, tras el desvío del balón pero antes de tirar el Evento de patada inicial, un único jugador Desmarcado del equipo receptor con esta habilidad puede moverse hasta 3 casillas, siguiendo todas las reglas normales de movimiento excepto que no puede forzar la marcha. Esta habilidad no puede utilizarse si se produce una recepción libre, ni permite cruzar a la mitad del campo del equipo rival. Si este jugador se Cae durante dicho movimiento, el movimiento termina de inmediato y se tira el Evento de patada inicial.",
  },
  {
    key: "canonero",
    name: "Cañonero",
    englishName: "Cannoneer",
    category: "Pase",
    isActive: true,
    description: "Cuando este jugador realiza una acción de Pase que sea un pase largo o una bomba larga, puede aplicar un modificador de +1 al chequeo de Pase.",
  },
  {
    key: "leader",
    name: "Líder",
    englishName: "Leader",
    category: "Pase",
    isActive: false,
    description:
      "Un equipo que, al inicio de cualquier parte del partido, tenga sobre el campo a uno o más jugadores con esta habilidad, gana una Segunda oportunidad adicional llamada “Segunda oportunidad de Líder”. Un equipo solo puede utilizar esa Segunda oportunidad si tiene a un jugador con la habilidad Líder sobre el campo. Si todos sus jugadores con esta habilidad son retirados del partido (ya sea por Lesión o expulsado) antes de usar la Segunda oportunidad de Líder, esta se pierde. La Segunda oportunidad de Líder se trata a todos los efectos como una Segunda oportunidad normal, excepto que no puede perderse debido a un Chef Maestro Halfling.",
  },
  {
    key: "nerves-of-steel",
    name: "Nervios de Acero",
    englishName: "Nerves of Steel",
    category: "Pase",
    isActive: false,
    description: "Este jugador puede ignorar todos los modificadores por estar siendo Marcado al hacer un chequeo de Agilidad para atrapar el balón, o al hacer un chequeo de Pase para pasar el balón.",
  },
  {
    key: "partenubes",
    name: "Partenubes",
    englishName: "Cloud Burster",
    category: "Pase",
    isActive: false,
    description: "Cuando este jugador realiza una acción de Pase, los jugadores rivales no pueden intentar interceptar el balón.",
  },
  {
    key: "pass",
    name: "Pasar",
    englishName: "Pass",
    category: "Pase",
    isActive: false,
    description: "Este jugador puede repetir cualquier chequeo de Pase fallido al realizar una acción de Pase.",
  },
  {
    key: "pasar-y-seguir",
    name: "Pasar y Seguir",
    englishName: "Pass and Move",
    category: "Pase",
    isActive: false,
    description:
      "Si este jugador realiza una acción de Pase que sea un Pase rápido, o una acción de Entregar el balón, y no se produce un cambio de turno, su activación no terminará tras resolver el pase o la entrega de balón. En su lugar, este jugador puede continuar su acción de Movimiento usando el movimiento que aún le quede.",
  },
  {
    key: "hail-mary-pass",
    name: "Pase a lo Loco",
    englishName: "Hail Mary Pass",
    category: "Pase",
    isActive: true,
    description:
      "Cuando este jugador realice una acción de Pase o una acción especial de Lanzar una bomba, puede declarar cualquier casilla del campo como casilla objetivo en lugar de usar la regla de pases. Haz un chequeo de Pase de forma normal, tratando el lanzamiento como una Bomba larga y cualquier resultado de pase preciso como un pase impreciso. Un Pase a lo loco no puede interceptarse.",
  },
  {
    key: "pase-precipitado",
    name: "Pase Precipitado",
    englishName: "Dump-off",
    category: "Pase",
    isActive: true,
    description:
      "Cuando un jugador rival intente realizar una acción de Placaje contra este jugador, o una acción especial que tome como blanco a este jugador directamente, este jugador puede usar esta habilidad. Al hacerlo, puede realizar un Pase rápido justo antes de que se resuelva la acción que lo toma como blanco. Dicho Pase rápido no puede causar un cambio de turno, pero aparte de eso sigue todas las reglas normales de pases. Una vez resuelto el pase, la acción que tomaba como blanco a este jugador sigue adelante.",
  },
  {
    key: "safe-pass",
    name: "Pase Seguro",
    englishName: "Safe Pass",
    category: "Pase",
    isActive: false,
    description: "Si este jugador saca un 1 natural al realizar un chequeo de Pase, no se producirá un balón perdido. En lugar de eso, este jugador mantendrá la posesión del balón y su activación terminará de inmediato. Eso no provoca un cambio de turno.",
  },
  {
    key: "patada-de-despeje",
    name: "Patada de Despeje",
    englishName: "Punt",
    category: "Pase",
    isActive: true,
    description:
      "Este jugador puede declarar una acción especial de Patada de despeje; solo un jugador puede declarar una acción especial de Patada de despeje por turno. Cuando un jugador declara esta acción especial, puede realizar antes una acción de Movimiento, pero no podrá seguir moviéndose tras resolver la Patada de despeje. Si, tras su acción de Movimiento, este jugador es el portador del balón, puede darle una Patada de despeje. Coloca la plantilla de devolución sobre él, encarada hacia cualquier zona de anotación o línea de banda. Tira 1D6 para determinar la dirección en la que se chuta el balón, y luego otro 1D6 para determinar cuántas casillas se desplaza en esa dirección. Si este jugador tiene la habilidad de Patada, puede repetir una o dos de estas tiradas, pero debe decidir si repetir o no la dirección antes de tirar por la distancia desplazada. Si el balón aterriza en una casilla ocupada por un jugador, dicho jugador debe intentar atraparlo. De lo contrario, el balón rebota. Al realizar una acción especial de Patada de despeje, no se produce un cambio de turno si el balón acaba en el suelo. En cambio, sí se produce un cambio de turno si el balón acaba en posesión de un jugador rival o si cae en el público.",
  },
  {
    key: "precision",
    name: "Precisión",
    englishName: "Accurate",
    category: "Pase",
    isActive: true,
    description: "Cuando este jugador realiza una acción de Pasar que sea un Pase rápido o un Pase corto, puede aplicar un modificador de +1 al chequeo de Pase.",
  },

  // ── Mutación ─────────────────────────────────────────────────────────
  {
    key: "apariencia-asquerosa",
    name: "Apariencia Asquerosa",
    englishName: "Foul Appearance",
    category: "Mutacion",
    isActive: false,
    description:
      "Cuando un jugador rival intente realizar una acción de Placaje contra este jugador, o una acción especial que tome como blanco a este jugador directamente, debe tirar 1D6 antes de hacer cualquier otra tirada. Con 2+, la acción puede seguir adelante de manera normal. Con un 1, la acción queda cancelada y la activación del jugador rival termina de inmediato.",
  },
  {
    key: "boca-monstruosa",
    name: "Boca Monstruosa",
    englishName: "Monstrous Mouth",
    category: "Mutacion",
    isActive: true,
    description:
      "Cuando este jugador es activado, puede declarar una acción especial de Masticar. No hay límite al número de jugadores que pueden declarar esta acción especial cada turno. Cuando este jugador declara una acción especial de Masticar, puede elegir a un jugador rival En pie al que esté Marcando y tirar 1D6. Con 3+, el jugador rival se considera Masticado. Mientras sea Masticado y este jugador lo esté Marcando, el jugador rival no puede abandonar la casilla que ocupa. La condición de Masticado termina de inmediato si este jugador deja de Marcar al jugador rival por cualquier motivo. Este jugador puede usar la acción especial de Masticar para reemplazar la acción de Placaje que forma parte de una acción de Penetración. Además, la habilidad Robar balón no puede utilizarse contra este jugador.",
  },
  {
    key: "extra-arms",
    name: "Brazos Adicionales",
    englishName: "Extra Arms",
    category: "Mutacion",
    isActive: false,
    description: "Este jugador aplica un modificador de +1 a sus chequeos de Agilidad para intentar atrapar, recoger o interceptar el balón.",
  },
  {
    key: "prehensile-tail",
    name: "Cola Prensil",
    englishName: "Prehensile Tail",
    category: "Mutacion",
    isActive: false,
    description: "Si un jugador rival intenta esquivar, saltar o brincar desde una casilla en la zona de defensa de este jugador, sufrirá un modificador de -1 adicional a su chequeo de Agilidad.",
  },
  {
    key: "cuernos",
    name: "Cuernos",
    englishName: "Horns",
    category: "Mutacion",
    isActive: false,
    description: "Cuando este jugador declara una acción de Penetración, aplica un modificador de +1 a su atributo Fuerza para todas las acciones de Placaje que realice durante dicha acción de Penetración.",
  },
  {
    key: "two-heads",
    name: "Dos Cabezas",
    englishName: "Two Heads",
    category: "Mutacion",
    isActive: false,
    description: "Este jugador puede aplicar un modificador de +1 a los chequeos de Agilidad para intentar esquivar.",
  },
  {
    key: "claws",
    name: "Garras",
    englishName: "Claws",
    category: "Mutacion",
    isActive: false,
    description: "Cuando este jugador haga una tirada de Armadura contra un jugador rival Derribado durante una acción de Placaje, incluso si este jugador también es Derribado, cualquier resultado natural de 8+ en dicha tirada de Armadura romperá la armadura del jugador rival, sea cual sea su atributo Armadura.",
  },
  {
    key: "mano-grande",
    name: "Mano Grande",
    englishName: "Big Hand",
    category: "Mutacion",
    isActive: false,
    description: "Este jugador ignora todos los modificadores negativos al intentar recoger el balón.",
  },
  {
    key: "piel-ferrea",
    name: "Piel Férrea",
    englishName: "Iron Hard Skin",
    category: "Mutacion",
    isActive: false,
    description: "Los jugadores rivales no pueden aplicar modificadores al hacer una tirada de Armadura contra este jugador. Además, la habilidad Garras no puede ser usada contra este jugador.",
  },
  {
    key: "piernas-muy-largas",
    name: "Piernas Muy Largas",
    englishName: "Very Long Legs",
    category: "Mutacion",
    isActive: false,
    description: "Este jugador puede aplicar un modificador de +1 a su chequeo de Agilidad al intentar brincar o saltar, y un modificador de +2 a su chequeo de Agilidad al intentar interceptar el balón.",
  },
  {
    key: "presencia-perturbadora",
    name: "Presencia Perturbadora",
    englishName: "Disturbing Presence",
    category: "Mutacion",
    isActive: false,
    description: "Cuando un jugador rival realice una acción de Pase, una acción de Lanzar compañero, una acción especial de Lanzar una bomba, o intente interceptar o atrapar el balón, deberá aplicar un modificador de -1 al chequeo de Pase o de Agilidad por cada jugador de tu equipo con esta habilidad a tres casillas o menos de él.",
  },
  {
    key: "tentacles",
    name: "Tentáculos",
    englishName: "Tentacles",
    category: "Mutacion",
    isActive: false,
    description:
      "Cuando un jugador rival intente esquivar, brincar o saltar desde una casilla en la zona de defensa de este jugador, este jugador puede usar esta habilidad. En tal caso, tira 1D6, sumando al resultado el atributo Fuerza de este jugador y restando el atributo Fuerza del jugador rival. Si el resultado es 6 o más, o si sacas un 6 natural, el jugador rival no puede abandonar la casilla y su activación termina. En cambio, si el resultado es de 5 o menos, o si sacas un 1 natural, esta habilidad no tiene efecto. Si un jugador intenta salir de una casilla en la Zona de defensa de varios jugadores rivales que tengan esta habilidad, solo uno de ellos podrá utilizarla.",
  },

  // ── Triquiñuelas ─────────────────────────────────────────────────────
  {
    key: "underhanded",
    name: "Agresor Discreto",
    englishName: "Underhanded",
    category: "Triquinuelas",
    isActive: true,
    description: "Cuando este jugador realice una acción de Falta y no haya jugadores prestando apoyos ofensivos ni defensivos, puede repetir una tirada de Armadura fallida.",
  },
  {
    key: "crunch",
    name: "Crujir",
    englishName: "Pile Driver",
    category: "Triquinuelas",
    isActive: false,
    description: "Cuando un jugador rival sea Derribado por este jugador durante una acción de Placaje, este jugador puede realizar de inmediato una acción de Falta gratuita contra el jugador rival, siempre que este jugador siga estando En pie y marcando al jugador rival. A continuación, este jugador se coloca Tumbado boca arriba y su activación termina inmediatamente.",
  },
  {
    key: "dump-off",
    name: "Dejada",
    englishName: "Fumblerooski",
    category: "Triquinuelas",
    isActive: true,
    description: "Cuando este jugador sea el portador del balón y realice una acción de Movimiento, puede elegir “dejar el balón”, colocándolo en cualquier casilla que abandone durante dicha acción de Movimiento. Esto no provoca un cambio de turno.",
  },
  {
    key: "quick-foul",
    name: "Falta Rápida",
    englishName: "Quick Foul",
    category: "Triquinuelas",
    isActive: true,
    description: "La activación de este jugador no termina tras realizar la acción de Falta, sino que puede seguir con su acción de Movimiento, usando el movimiento que aún le quede.",
  },
  {
    key: "sneaky-git",
    name: "Furtivo",
    englishName: "Sneaky Git",
    category: "Triquinuelas",
    isActive: false,
    description: "Este jugador no es Expulsado al realizar una acción de Falta si saca un doble natural en la tirada de Armadura, siempre y cuando la armadura del jugador atacado no se rompa. Si dicha armadura se rompe, entonces este jugador puede ser Expulsado de forma normal.",
  },
  {
    key: "violent-innovator",
    name: "Innovador Violento",
    englishName: "Violent Innovator",
    category: "Triquinuelas",
    isActive: false,
    description: "Si un jugador rival sufre una Lesión debido a una acción especial realizada por este jugador, este jugador gana los Puntos de Estrellato apropiados por causar dicha Lesión. Un jugador solo puede tener esta habilidad si tiene algún rasgo que le permita realizar una acción especial.",
  },
  {
    key: "dirty-player",
    name: "Jugar Sucio (+X)",
    englishName: "Dirty Player",
    category: "Triquinuelas",
    isActive: false,
    description: "Cuando este jugador realiza una acción de Falta, puede aplicar un modificador de +1 a la tirada de Armadura o a la tirada de Heridas. Se puede decidir aplicar este modificador después de hacer la tirada en cuestión.",
  },
  {
    key: "put-the-boot-in",
    name: "Meter la Bota",
    englishName: "Put the Boot In",
    category: "Triquinuelas",
    isActive: false,
    description: "Este jugador puede prestar apoyos ofensivos cuando un compañero realiza una acción de Falta sin importar cuántos jugadores rivales estén Marcando a este jugador.",
  },
  {
    key: "marcaje-de-sombra",
    name: "Perseguir",
    englishName: "Shadowing",
    category: "Triquinuelas",
    isActive: false,
    description:
      "Este jugador puede utilizar esta habilidad cuando un jugador rival trate de esquivar para salir de una casilla en su zona de defensa. Cuando la utiliza, tira 1D6. Con 1-3 no ocurre nada. Con 4+, este jugador es colocado de inmediato en la casilla que ha dejado desocupada el jugador rival. Este jugador puede usar esta habilidad un número máximo de veces por turno igual a su MV. Si un jugador intenta salir de una casilla en la Zona de defensa de varios jugadores con esta habilidad, solo uno de ellos podrá utilizarla.",
  },
  {
    key: "eye-gouge",
    name: "Piquete de Ojos",
    englishName: "Eye Gouge",
    category: "Triquinuelas",
    isActive: false,
    description: "Cuando un jugador rival sea empujado por este jugador, ese jugador rival no podrá prestar apoyos ofensivos ni defensivos hasta que vuelva a ser activado.",
  },
  {
    key: "saboteur",
    name: "Saboteador",
    englishName: "Saboteur",
    category: "Triquinuelas",
    isActive: true,
    description:
      "Cuando este jugador es Derribado debido a la acción de Placaje de un jugador rival, antes de hacer la tirada de Armadura, puede tirar 1D6. Con 1-3, no ocurre nada y la tirada de Armadura se hace de manera normal. Con 4+, el arma saboteada de este jugador explota y el jugador rival es Derribado también, aunque esto no provocará un cambio de turno a menos que ese jugador rival fuera el portador del balón. Si el arma saboteada de este jugador explota, este jugador queda automáticamente Inconsciente y no se hace tirada de Armadura contra él. Un jugador que no tenga el rasgo Arma secreta no puede tener esta habilidad.",
  },
  {
    key: "lethal-flight",
    name: "Vuelo Letal",
    englishName: "Lethal Flight",
    category: "Triquinuelas",
    isActive: false,
    description:
      "Cuando este jugador es lanzado como parte de una acción de Lanzar compañero y aterriza en una casilla ocupada por un jugador rival, incluyendo que vaya a parar a ella debido a un rebote, y el jugador rival es Derribado, puede aplicar un modificador de +1 o bien a la tirada de Armadura o bien a la tirada de Heridas. Se puede decidir aplicar este modificador después de hacer la tirada en cuestión. Si un jugador rival sufre una Lesión como resultado de ser Derribado por un jugador lanzado que tenga esta habilidad, se considerará que el jugador lanzado es quien ha causado esa Lesión y recibirá Puntos de Estrellato de manera acorde. Un jugador que no tenga el rasgo Humanoide bala no puede tener esta habilidad.",
  },
];

export const ELITE_SKILL_KEYS = SKILLS.filter((s) => s.isElite).map((s) => s.key);

export function getSkillByKey(key: string): SkillDefinition | undefined {
  return SKILLS.find((s) => s.key === key);
}

export function getSkillsByCategory(category: SkillDefinition["category"]): SkillDefinition[] {
  return SKILLS.filter((s) => s.category === category);
}
