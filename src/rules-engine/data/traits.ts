import type { TraitDefinition } from "../types";

/**
 * Rasgos: cualidades especiales de ciertas razas/jugadores que NO se compran
 * con PE (a diferencia de las Habilidades). Transcritos desde COMPENDIO 2025
 * Third Season + NAF.pdf.
 *
 * El manual no divide los Rasgos en subcategorías — las categorías de abajo
 * (General/Resistencia/Ataque/AccionEspecial/Tamano/Despliegue/JugadorEstrella)
 * son una organización interna heredada del proyecto anterior, no algo
 * oficial. Se mantienen por comodidad de navegación en el admin.
 *
 * Verificado contra el Compendio: "Right Stuff" no existe en esta edición
 * (su función la cubre "Humanoide Bala") y "Swarming" tampoco aparece — se
 * eliminaron del catálogo. Los 3 rasgos de Jugador Estrella (Blind Rage,
 * Incorporeal, Tasty Morsel) siguen sin verificar: el Compendio lista las
 * plantillas de Star Players pero no incluye el detalle de sus reglas
 * exclusivas; se mantienen con la descripción corta heredada.
 */
export const TRAITS: TraitDefinition[] = [
  // ── Generales ────────────────────────────────────────────────────────
  {
    key: "animosity",
    name: "Animosidad (X)",
    englishName: "Animosity",
    category: "General",
    description:
      "Cuando este jugador intente realizar una acción de Pase o de Entregar el balón a un compañero con la misma clave que se indica entre paréntesis, tira 1D6. Con un 1, el jugador se niega a realizar la acción y su activación termina de inmediato. Algunos jugadores pueden tener Animosidad (todos), en cuyo caso esta regla se aplica a todos sus compañeros de equipo, sin importar las claves que tengan.",
  },
  {
    key: "unsteady",
    name: "Tembloroso",
    englishName: "Unsteady",
    category: "General",
    description: "Este jugador no puede declarar acciones de Asegurar el balón.",
  },
  {
    key: "bone-head",
    name: "Estúpido",
    englishName: "Bone Head",
    category: "General",
    description: "Cuando este jugador sea activado, justo tras haber declarado su acción, debe tirar 1D6. Con 2+, puede realizar la acción declarada de manera normal. Con un 1, en cambio, queda Distraído.",
  },
  {
    key: "really-stupid",
    name: "Realmente Estúpido",
    englishName: "Really Stupid",
    category: "General",
    description:
      "Cuando este jugador es activado, tras declarar su acción, debe tirar 1D6. Puede aplicar un modificador de +2 a la tirada si se encuentra adyacente a algún compañero que esté En pie, no esté Distraído y no tenga a su vez este rasgo. Con 4+, este jugador puede realizar su acción declarada de manera normal. Con 1-3, en cambio, este jugador queda Distraído.",
  },
  {
    key: "always-hungry",
    name: "Siempre Hambriento",
    englishName: "Always Hungry",
    category: "General",
    description:
      "Siempre que este jugador realice una acción de Lanzar compañero, antes de hacer el chequeo de Pase debe tirar 1D6. Con 2+, puede seguir adelante con la acción de Lanzar compañero de manera normal. Con un 1, en cambio, este jugador intenta comerse a su compañero; tira 1D6 de nuevo: con 2+, el compañero logra liberarse y la acción de Lanzar compañero resulta en una pifia. Con un 1, ¡el compañero es devorado! Elimínalo de inmediato de tu Hoja de plantilla. No se puede usar un Apotecario para intentar salvar al compañero, y tampoco se puede hacer ninguna tirada de Regeneración por él. Si el compañero era el portador del balón, el balón rebota desde la casilla que ocupa este jugador.",
  },
  {
    key: "unchannelled-fury",
    name: "Ira Descontrolada",
    englishName: "Unchannelled Fury",
    category: "General",
    description:
      "Cuando este jugador sea activado, tras declarar su acción, tira 1D6, aplicando un modificador de +2 a la tirada si ha declarado una acción de Placaje o de Penetración. Con 4+, este jugador puede realizar la acción declarada de manera normal. Con 1-3, este jugador ruge de forma incoherente, pero no hace nada más. Su activación termina de inmediato.",
  },
  {
    key: "animal-savagery",
    name: "Ferocidad Animal",
    englishName: "Animal Savagery",
    category: "General",
    description:
      "Cuando este jugador es activado, justo tras declarar su acción debe tirar 1D6. Puede aplicar un modificador de +2 a la tirada si ha declarado una acción de Placaje o de Penetración. Con 4+, este jugador puede realizar la acción declarada de manera normal. Con 1-3, en lugar de eso este jugador ataca a uno de sus compañeros. Elige un compañero que esté En pie y adyacente a este jugador; el jugador elegido es Derribado de inmediato. Esto no provoca un cambio de turno a menos que fuese el portador del balón. Si este jugador tiene las habilidades Garras o Golpe mortífero, debe usarlas al hacer la tirada de Armadura contra el jugador Derribado. Si este jugador saca de 1 a 3 pero no tiene ningún compañero En pie adyacente, queda Distraído.",
  },
  {
    key: "arma-secreta",
    name: "Arma Secreta",
    englishName: "Secret Weapon",
    category: "General",
    description: "Al final de una entrada en la que este jugador haya participado, incluso si no está en el campo al final de la misma, este jugador es Expulsado por cometer una Falta.",
  },
  {
    key: "borracho",
    name: "Borracho",
    englishName: "Drunkard",
    category: "General",
    description: "Este jugador aplica un modificador de -1 a sus chequeos para intentar forzar la marcha.",
  },
  {
    key: "echar-raices",
    name: "Echar Raíces",
    englishName: "Take Root",
    category: "General",
    description:
      "Cuando este jugador sea activado estando En pie, justo tras declarar su acción, tira 1D6: con 2+, este jugador puede realizar la acción declarada de manera normal. Con un 1, en cambio, el jugador “Echa raíces”. Un jugador que ha Echado raíces no puede realizar acciones de Movimiento, no puede hacer movimientos de impulso tras una acción de Placaje, no puede ser empujado, y no puede abandonar la casilla que ocupa actualmente por ningún otro motivo, salvo que quede Inconsciente o sufra una Lesión. Este jugador dejará de Echar raíces al final de una entrada, o si es Derribado o colocado Tumbado boca arriba.",
  },
  {
    key: "el-balon-es-mio",
    name: "El Balón es Mío",
    englishName: "Ball and Chain",
    category: "General",
    description:
      "Cuando este jugador es el portador del balón, no puede dejar de serlo voluntariamente. Por tanto, no puede declarar acciones de Pase o de Entregar el balón, ni usar habilidades o rasgos que le hagan renunciar a ser el portador del balón. Las únicas formas de que este jugador suelte el balón son que sea Derribado o colocado Tumbado boca arriba, se Caiga, o por el efecto de una habilidad, rasgo o regla especial de un jugador rival.",
  },
  {
    key: "el-balon-ni-verlo",
    name: "El Balón ni Verlo",
    englishName: "No Hands",
    category: "General",
    description: "Un jugador con este rasgo nunca puede ser el portador del balón. Si se requiere que este jugador intente atrapar o recoger el balón, fallará automáticamente dicho intento como si hubiera sacado un 1 natural. Un jugador con este rasgo no puede intentar interceptar un Pase.",
  },
  {
    key: "levantar-companero",
    name: "Levantar Compañero",
    englishName: "Stand Firm",
    category: "General",
    description:
      "Al final de cada turno del equipo rival, tira 1D6 por cada jugador de tu equipo Tumbado boca arriba a 3 casillas o menos de algún jugador En pie de tu equipo con este rasgo. Con 5+, el jugador Tumbado boca arriba puede levantarse de inmediato. Si un jugador con este rasgo se levanta debido al uso de este rasgo por parte de un compañero, no puede a su vez usar este rasgo durante ese mismo turno.",
  },
  {
    key: "solitario",
    name: "Solitario (X+)",
    englishName: "Loner",
    category: "General",
    description:
      "Si este jugador quiere usar una Segunda oportunidad para repetir una de sus tiradas, antes debe tirar 1D6. Si el resultado es igual o mayor que el número indicado entre paréntesis, puede usar la Segunda oportunidad de manera normal. En caso contrario, este jugador no puede repetir la tirada en cuestión, pero la Segunda oportunidad se gasta igualmente como si se hubiera utilizado.",
  },

  // ── Resistencia ──────────────────────────────────────────────────────
  {
    key: "decay",
    name: "Descomposición",
    englishName: "Decay",
    category: "Resistencia",
    description: "Aplica un modificador de +1 a todas las tiradas de Lesiones que se hagan contra ese jugador.",
  },
  {
    key: "stunty",
    name: "Escurridizo",
    englishName: "Stunty",
    category: "Resistencia",
    description:
      "Cuando este jugador intente esquivar, no sufre modificadores negativos a su chequeo de Agilidad por estar siendo Marcado por jugadores rivales. Además, este jugador aplica un modificador de -1 a su chequeo de Agilidad al intentar interceptar el balón. Un jugador con este rasgo es más propenso a lesionarse; si se debe hacer una tirada de Heridas contra él, tira en la tabla de Heridas para Escurridizos.",
  },
  {
    key: "regeneration",
    name: "Regeneración",
    englishName: "Regeneration",
    category: "Resistencia",
    description: "Cuando este jugador sufra una Lesión, antes de hacer su tirada de Lesiones, tira 1D6. Con 1-3, el jugador sufre la Lesión de manera normal. Con 4+, en cambio, el jugador se regenera y la Lesión se ignora (aunque los Puntos de Estrellato generados por haberla causado se reciben igualmente), y este jugador es colocado en la zona de Reservas de su equipo.",
  },
  {
    key: "embustero",
    name: "Embustero",
    englishName: "Fool",
    category: "Resistencia",
    description:
      "Cuando un jugador rival intente realizar una acción de Placaje contra este jugador, o una acción especial que tome directamente como blanco a este jugador (excepto una acción de Placaje causada por la acción especial Bola con cadena), este jugador puede usar este rasgo. Antes de determinar cuántos dados se tiran, este jugador puede ser retirado del campo y recolocado en cualquier otra casilla desocupada y adyacente al jugador rival que realiza la acción. Luego, la acción tiene lugar de manera normal. Si este jugador es el portador del balón y se coloca en la zona de anotación del rival, la acción de Placaje debe resolverse por completo antes de que pueda anotar un touchdown. Si este jugador usa este rasgo para recolocarse en la casilla del balón, puede intentar recogerlo antes de que se tire ningún dado.",
  },

  // ── Ataque ───────────────────────────────────────────────────────────
  {
    key: "stab",
    name: "Apuñalar",
    englishName: "Stab",
    category: "Ataque",
    description:
      "Cuando este jugador es activado, puede declarar una acción especial de Apuñalar; no hay límite al número de jugadores que pueden declarar esta acción especial cada turno. Cuando este jugador realiza una acción de Apuñalar, elige a un jugador rival En pie y adyacente a él, y haz una tirada de Armadura contra dicho jugador rival. Esta tirada de Armadura no puede modificarse de ningún modo. Si la armadura del jugador rival se rompe, haz una tirada de Heridas contra él. Este jugador puede usar la acción especial de Apuñalar para reemplazar la acción de Placaje que forma parte de una acción de Penetración, pero su activación finalizará igualmente una vez resuelta la acción especial de Apuñalar.",
  },
  {
    key: "chainsaw",
    name: "Motosierra",
    englishName: "Chainsaw",
    category: "Ataque",
    description:
      "Cuando este jugador es activado, puede declarar una acción especial de Ataque con motosierra; no hay límite al número de jugadores que pueden declarar esta acción especial cada turno. Cuando este jugador realiza esta acción especial, tira 1D6. Con 2+, puede realizar de inmediato una tirada de Armadura contra un jugador rival En pie, aplicando un modificador de +3. Con un 1, en cambio, la motosierra se descontrola y este jugador es Derribado. Si este jugador es Derribado o se Cae por cualquier motivo, sea cual sea, el Entrenador rival aplicará un modificador de +3 a la tirada de Armadura contra este jugador. Este modificador de +3 debe aplicarse siempre. Si quiere, el jugador puede usar su motosierra al realizar una acción de Falta. En tal caso, podrá aplicar un modificador de +3 a la tirada de Armadura contra el jugador rival. No obstante, antes deberá tirar para ver si la motosierra se descontrola. Este jugador puede usar la acción especial de Ataque con motosierra para reemplazar la acción de Placaje que forma parte de una acción de Penetración, pero su activación finalizará igualmente una vez resuelta la acción especial de Ataque con motosierra.",
  },
  {
    key: "firebreath",
    name: "Exhalar Fuego",
    englishName: "Firebreath",
    category: "Ataque",
    description:
      "Cuando este jugador es activado, puede declarar una acción especial de Exhalar fuego; no hay límite al número de jugadores que pueden declarar esta acción especial cada turno. Cuando un jugador realiza esta acción especial, puede elegir un jugador rival En pie al que esté marcando y tirar 1D6, aplicando un modificador de -1 si el blanco tiene una FU de 5 o más. Con un 1, este jugador es inmediatamente Derribado. Con 2-3, no ocurre nada. Con 4+, el jugador rival es inmediatamente colocado Tumbado boca arriba. Si la tirada es un 6 natural, en lugar de eso el jugador rival es Derribado. Tras resolver la acción especial de Exhalar fuego, la activación de este jugador termina de inmediato. Este jugador puede usar la acción especial de Exhalar fuego para reemplazar la acción de Placaje que forma parte de una acción de Penetración, pero su activación finalizará igualmente tras resolver dicha acción especial.",
  },
  {
    key: "projectile-vomit",
    name: "Proyectil de Vómito",
    englishName: "Projectile Vomit",
    category: "Ataque",
    description:
      "Cuando este jugador es activado, puede declarar una acción especial de Proyectil de vómito; no hay límite al número de jugadores que pueden declarar esta acción especial cada turno. Cuando este jugador realiza una acción especial de Proyectil de vómito, elige a un jugador rival En pie y adyacente a él, y tira 1D6: con 2+, este jugador vomita sobre el blanco; haz una tirada de Armadura contra dicho jugador rival. Esa tirada de Armadura no puede modificarse de ningún modo. Si la armadura se rompe, haz una tirada de Heridas contra el jugador. De lo contrario, no ocurre nada. Con un 1, este jugador se cubre con su propia bilis ácida: haz una tirada de Armadura contra este jugador. Esa tirada de Armadura no puede modificarse de ningún modo. Si la armadura se rompe, haz una tirada de Heridas contra este jugador. De lo contrario, no ocurre nada. Este jugador puede usar la acción especial de Proyectil de vómito para reemplazar la acción de Placaje que forma parte de una acción de Penetración, pero su activación finalizará igualmente una vez resuelta la acción especial de Proyectil de vómito.",
  },
  {
    key: "ball-and-chain",
    name: "Bola con Cadena",
    englishName: "Ball and Chain",
    category: "Ataque",
    description:
      "Cuando este jugador es activado, la única acción que puede declarar es la acción especial de Bola con cadena. No hay límite al número de jugadores que pueden declarar esta acción especial cada turno. Cuando un jugador realice una acción especial de Bola con cadena, coloca la plantilla de devolución sobre él, encarada hacia cualquier zona de anotación o línea de banda. A continuación, tira 1D6 y mueve al jugador una casilla en la dirección indicada. Al mover así, el jugador no tiene que hacer chequeos de Agilidad para esquivar al salir de una Zona de defensa: los supera automáticamente. Los jugadores rivales no pueden usar las habilidades Perseguir ni Tentáculos contra un jugador que realiza una acción de Bola con cadena. Si este movimiento lleva al jugador fuera del campo, puede ser Herido por el público. Si este movimiento lleva al jugador a una casilla ocupada por un jugador En pie (de cualquier equipo), realiza automáticamente una acción de Placaje contra dicho jugador; esa acción ignora la habilidad Apariencia asquerosa. Si es un compañero, el Entrenador de este jugador elige qué resultado aplicar tras tirar los dados de Placaje. Si este movimiento lleva al jugador a una casilla ocupada por un jugador Tumbado boca arriba o Aturdido, dicho jugador es Empujado y se hace una tirada de Armadura contra él. Si este movimiento lleva al jugador a una casilla que contiene el balón, éste rebota de inmediato. Esto no causa un cambio de turno. Un jugador que realice una acción especial de Bola con cadena puede moverse hasta tantas casillas como su MV. Puede forzar la marcha de forma normal, pero si saca un 1, primero entrará en la casilla a la que se estaba moviendo, luego se resolverán todos los placajes, empujones y rebotes de balón que procedan, y entonces el jugador se Caerá en dicha casilla. Si este jugador se Cae, es Derribado o es colocado Tumbado boca arriba, haz de inmediato una tirada de Heridas contra él, tratando resultados de Aturdido como si fueran Inconsciente. Un jugador con este rasgo no puede tener las siguientes habilidades: Apartar, Atento al balón, Equilibrio firme, Furia, Golpe a la carrera, Perseguir, Piquete de ojos, Placaje heroico, Placaje múltiple ni Saltar.",
  },
  {
    key: "odio",
    name: "Odio (X)",
    englishName: "Hatred",
    category: "Ataque",
    description: "Cuando este jugador realiza una acción de Placaje contra un jugador con la misma clave que figura entre paréntesis, puede repetir un único resultado de Atacante derribado.",
  },

  // ── Acción Especial ──────────────────────────────────────────────────
  {
    key: "bombardier",
    name: "Bombardero",
    englishName: "Bombardier",
    category: "AccionEspecial",
    description:
      "Cuando este jugador es activado, puede declarar una acción especial de Lanzar una bomba. Solo un jugador puede declarar esta acción especial por turno. Cuando un jugador realiza esta acción especial, lanza una bomba explosiva del mismo modo que haría una acción de Pase, siguiendo todas las reglas normales al respecto. Aunque esto no sea realmente una acción de Pase, todas las habilidades y rasgos que se aplicarían al realizar una acción de Pase se aplican también a esta acción especial, a excepción de la habilidad Atento al balón. Un jugador que declara una acción especial de Lanzar una bomba no puede realizar una acción de Movimiento antes de lanzar la bomba. Si en cualquier momento una bomba cae al suelo, explota de inmediato en esa casilla. Si se obtiene un balón perdido al lanzar una bomba, o esta cae cuando un jugador intenta atraparla, no rebota sino que explota en la casilla de ese jugador. Cuando una bomba explota, cualquier jugador en la casilla en la que explota es impactado por la explosión. Además, tira 1D6 por cada jugador adyacente a la casilla en la que explota la bomba. Con 4+, ese jugador es impactado por la explosión. Todo jugador En pie impactado por la explosión es Derribado. Además, haz una tirada de Armadura contra cualquier jugador Tumbado boca arriba o Aturdido impactado por la explosión. Si un jugador atrapa o intercepta con éxito una bomba lanzada, debe volver a lanzarla de inmediato, siguiendo las mismas reglas ya descritas para realizar esta acción especial.",
  },
  {
    key: "kick-team-mate",
    name: "Chutar Compañero",
    englishName: "Kick Team-mate",
    category: "AccionEspecial",
    description:
      "Cuando este jugador es activado, puede declarar una acción especial de Chutar compañero. Solo un jugador puede declarar esta acción especial por turno. La acción especial de Chutar compañero funciona exactamente igual que la acción de Lanzar compañero, con las siguientes excepciones: realizar esta acción especial no cuenta como la acción de Lanzar compañero del equipo para ese turno, por lo que un mismo equipo puede realizar ambas acciones durante el mismo turno, si así lo quiere su Entrenador. Si se obtiene un resultado de pifia al resolver esta acción especial, haz de inmediato una tirada de Heridas contra el jugador chutado, tratando un resultado de Aturdido como un resultado de Inconsciente. Si el jugador chutado era el portador del balón, este rebotará desde la casilla que ocupaba. Todas las habilidades y rasgos aplicables a la acción de Lanzar compañero lo son también a la acción especial de Chutar compañero. Al realizar esta acción, un jugador gana Puntos de Estrellato del mismo modo que con las acciones de Lanzar compañero.",
  },
  {
    key: "lanzar-companero",
    name: "Lanzar Compañero",
    englishName: "Throw Team-mate",
    category: "AccionEspecial",
    description: "Este jugador puede declarar la acción de Lanzar compañero, tal como se describe en la pág. 76 del Reglamento.",
  },
  {
    key: "mirada-hipnotica",
    name: "Mirada Hipnótica",
    englishName: "Hypnotic Gaze",
    category: "AccionEspecial",
    description:
      "Cuando este jugador es activado, puede declarar una acción especial de Mirada hipnótica. No hay límite al número de jugadores que pueden declarar esta acción especial cada turno. Cuando un jugador declara una acción especial de Mirada hipnótica, puede realizar antes una acción de Movimiento, pero no podrá seguir moviéndose tras intentar la acción especial de Mirada hipnótica. Cuando este jugador realiza la acción especial de Mirada hipnótica, elige a un jugador rival En pie y adyacente a él, y tira 1D6. Con 1-2 no ocurre nada y la activación de este jugador termina de inmediato. Con 3+, el jugador rival elegido queda Distraído y la activación de este jugador termina de inmediato.",
  },

  // ── Tamaño ───────────────────────────────────────────────────────────
  {
    key: "titchy",
    name: "Canijo",
    englishName: "Titchy",
    category: "Tamano",
    description: "Este jugador puede aplicar un modificador de +1 a sus chequeos de Agilidad para intentar esquivar. Aparte de esto, si un jugador rival intenta esquivar moviéndose a una casilla en la zona de defensa de este jugador, este jugador no aplicará un modificador de -1 al chequeo de Agilidad del jugador rival por estarlo Marcando.",
  },
  {
    key: "swoop",
    name: "Planear",
    englishName: "Swoop",
    category: "Tamano",
    description: "Si este jugador es lanzado mediante la acción de Lanzar compañero, puede elegir no escorarse como es habitual antes de aterrizar. En tal caso, coloca la plantilla de devolución sobre este jugador, encarada hacia cualquier zona de anotación o línea de banda. Tira 1D6 para determinar en qué dirección se moverá, y luego un segundo 1D6 para determinar cuántas casillas planeará en esa dirección. Además, si este jugador decide no escorarse como es habitual, puede repetir el chequeo de Agilidad para intentar aterrizar.",
  },
  {
    key: "humanoide-bala",
    name: "Humanoide Bala",
    englishName: "Bombshell",
    category: "Tamano",
    description: "Este jugador puede ser lanzado por un compañero que tenga el rasgo Lanzar compañero, incluso si este jugador está Tumbado boca arriba.",
  },
  {
    key: "insignificante",
    name: "Insignificante",
    englishName: "Insignificant",
    category: "Tamano",
    description: "Al crear una Hoja de plantilla, no puedes incluir más jugadores con este rasgo que jugadores sin este rasgo.",
  },
  {
    key: "pogo-saltarin",
    name: "Pogo Saltarín",
    englishName: "Pogo Stick",
    category: "Tamano",
    description: "Durante su movimiento, este jugador puede intentar “hacer pogo”, saltando por encima de una sola casilla adyacente, sin importar lo que haya en ella. Hacer pogo funciona igual que Brincar, como se describe en la pág. 56 del Reglamento, con la excepción de que este jugador puede ignorar todos los modificadores negativos que reciba para hacerlo. Un jugador con este rasgo no puede tener la habilidad Saltar.",
  },
  {
    key: "tronco-va",
    name: "¡Tronco Va!",
    englishName: "Timber!",
    category: "Tamano",
    description: "Si este jugador tiene un atributo MV de 2 o menos, aplica un modificador de +1 a sus tiradas para intentar levantarse por cada compañero Desmarcado y En pie adyacente a él. Un 1 natural en esta tirada sigue siendo un fallo.",
  },

  // ── Despliegue ───────────────────────────────────────────────────────
  {
    key: "infected",
    name: "Infectado",
    englishName: "Infected",
    category: "Despliegue",
    description: "Una vez por partido, cuando este jugador cause una Lesión a un jugador rival debido a una acción de Placaje, y en la tirada de Lesiones dicho jugador rival sufra un resultado de Muerto que no sea salvado por un Apotecario, puedes añadir de inmediato un nuevo jugador Línea de tu Lista de equipo a tu zona de Reservas. Esto puede hacer que tu equipo tenga más de 16 jugadores por el resto del partido. Durante la secuencia posterior al partido, este nuevo jugador puede ser fichado de forma permanente como si fuera un Sustituto. Este rasgo no puede utilizarse contra jugadores Grandullones, ni que tengan los rasgos Descomposición, Escurridizo o Regeneración.",
  },

  // ── Jugador Estrella ─────────────────────────────────────────────────
  {
    key: "incorporeal",
    name: "Incorporeal",
    category: "JugadorEstrella",
    description: "Puede abandonar una zona de defensa sin tirar Esquiva una vez por activación.",
  },
  {
    key: "blind-rage",
    name: "Blind Rage",
    category: "JugadorEstrella",
    description: "Puede repetir el dado al usar Valentía.",
  },
  {
    key: "tasty-morsel",
    name: "Tasty Morsel",
    category: "JugadorEstrella",
    description: "Puede morder a un rival débil para satisfacer Sed de Sangre.",
  },
];

export function getTraitByKey(key: string): TraitDefinition | undefined {
  return TRAITS.find((t) => t.key === key);
}
