export const LOCALES = Object.freeze({
  EN: "en",
  ES: "es",
  PT_BR: "pt-BR",
  DE: "de"
});

export const DEFAULT_LOCALE = LOCALES.EN;
export const SUPPORTED_LOCALES = Object.freeze(Object.values(LOCALES));
export const LANGUAGE_OPTIONS = Object.freeze([
  Object.freeze({ locale: LOCALES.EN, label: "English" }),
  Object.freeze({ locale: LOCALES.ES, label: "Español" }),
  Object.freeze({ locale: LOCALES.PT_BR, label: "Português" }),
  Object.freeze({ locale: LOCALES.DE, label: "Deutsch" })
]);

const CATALOGS = Object.freeze({
  [LOCALES.EN]: Object.freeze({
    hud: Object.freeze({
      timeRemaining: "Time remaining: {time}",
      beachMoney: "Beach money: {amount}",
      heat: Object.freeze({
        label: "HEAT",
        levels: Object.freeze({
          low: "LOW",
          comfortable: "COMFORTABLE",
          high: "HIGH"
        }),
        aria: "Heat {level}: {heat}%"
      }),
      rating: Object.freeze({
        label: "Rating",
        noReviews: "NO REVIEWS",
        aria: "Beach rating: {rating} out of 5 from {count} {reviewLabel}",
        review: "review",
        reviews: "reviews"
      }),
      bathers: Object.freeze({
        singular: "bather",
        plural: "bathers",
        onBeach: "{count} {label} on the beach",
        moodTitle: "MOOD {band} {score}%",
        needs: "NEEDS {need} {value}%",
        focusAria: "{count} {label} on the beach; focus mood {band} {score} percent; needs {need}",
        bands: Object.freeze({
          happy: "HAPPY",
          okay: "OKAY",
          uneasy: "UNEASY",
          upset: "UPSET"
        }),
        needsByMotive: Object.freeze({
          connectivity: "CONNECTION",
          relief: "RELIEF",
          entertainment: "FUN",
          heat: "COOL DOWN"
        }),
        actions: Object.freeze({
          connectivity: "TRY WIFI SPOT",
          relief: "TRY TOILET",
          entertainment: "TRY VOLLEYBALL",
          heat: "TRY A DRINK OR SHADE",
          watchBeach: "WATCH THE BEACH"
        })
      }),
      gameModeAria: "Game mode: {mode}",
      modes: Object.freeze({
        live: "LIVE",
        build: "BUILD"
      }),
      placement: Object.freeze({
        moveOverBeach: "Move over the beach",
        spotBusy: "This spot is busy",
        notWater: "Not in the water",
        stayOnSand: "Stay on the sand",
        useSunShadeRow: "Use the sun-shade row",
        useGreenRow: "Use the green row"
      })
    }),
    common: Object.freeze({
      up: "UP",
      money: "Money",
      star: "Star",
      free: "FREE",
      select: "Select"
    }),
    dialogs: Object.freeze({
      chooseBuilding: "Choose a building",
      buildingInteraction: "{building} interaction"
    }),
    actions: Object.freeze({
      placeSunShade: "PLACE SUN-SHADE — {cost}",
      firstSunShadeFree: "Your first sun-shade is free.",
      additionalSunShadeCost: "Each additional sun-shade costs $5."
    }),
    buildingButton: Object.freeze({
      available: "BUILD",
      missing: "NEED ${amount} MORE",
      availableAria: "Choose a construction",
      missingAria: "Need {amount} more dollars to build"
    }),
    buildings: Object.freeze({
      kiosk: Object.freeze({
        label: "Kiosk"
      }),
      "beverage-store": Object.freeze({
        label: "Beverage Store",
        role: "Beverages",
        description: "Makes $1 every 30 seconds a bather uses it."
      }),
      "lifeguard-building": Object.freeze({
        label: "Lifeguard Building",
        role: "Beach safety",
        description: "Improves reviews. Costs $4 at the end of each day."
      }),
      "wifi-spot": Object.freeze({
        label: "Wi-Fi Spot",
        role: "Visitor connection",
        description: "Makes $1 every 30 seconds a bather uses it."
      }),
      "toilet-building": Object.freeze({
        label: "Toilet Building",
        role: "Beach facilities",
        description: "Prevents toilet complaints. Costs $3 at the end of each day."
      }),
      "trash-cans": Object.freeze({
        label: "Trash Cans",
        role: "Waste control",
        description: "Don't make money, but they improve Google Maps reviews."
      }),
      "volleyball-court": Object.freeze({
        label: "Volleyball Court",
        role: "Fun",
        description: "Stops bathers from getting bored."
      })
    }),
    start: Object.freeze({
      title: "BEACH SIMULATOR",
      loading: "LOADING...",
      pressStart: "PRESS START",
      chooseLanguage: "CHOOSE YOUR LANGUAGE",
      screenAria: "Beach Simulator start screen",
      languageAria: "Choose your language"
    }),
    app: Object.freeze({
      title: "Beach Simulator",
      worldAria: "Beach Simulator world",
      gameHudAria: "Game status",
      beachStatusAria: "Beach status",
      loading: "Loading terrain...",
      loadingAsset: "Loading {asset}...",
      fpsAria: "Frames per second",
      fps: "FPS {value}",
      worldLoadError: "Unable to load the beach world.",
      rendererError: "Unable to initialize rendering."
    }),
    onboarding: Object.freeze({
      gameTip: "Game tip",
      ok: "OK",
      batherNotice: "Bathers are your customers. Keep them happy to earn better reviews."
    }),
    tasks: Object.freeze({
      ariaLabel: "Today's job",
      title: "TODAY'S JOB",
      helper: "HELP THE BEACH, ONE JOB AT A TIME",
      startHere: "START HERE",
      complete: "TASK COMPLETE!",
      progress: "{label} progress",
      cleanBeach: "Clean the beach",
      cleanAfterVisitor: "Clean up after a visitor",
      coolDownPeople: "Cool down {count} people",
      buildFirstConstruction: "Build your first construction",
      welcomeBathers: "Welcome more bathers"
    }),
    run: Object.freeze({
      finalRating: "GUUGLE RATING",
      continue: "CONTINUE",
      playAgain: "PLAY AGAIN",
      day: "DAY {day}",
      forecastTitle: "DAY FORECAST",
      forecast: Object.freeze({
        heat: "HEAT {level}",
        crowd: "CROWD {level}",
        sharkRisk: "SHARK RISK {level}",
        litterPressure: "LITTER PRESSURE {level}",
        levels: Object.freeze({
          low: "LOW",
          comfortable: "COMFORTABLE",
          high: "HIGH",
          busy: "BUSY",
          steady: "STEADY",
          quiet: "QUIET",
          medium: "MEDIUM"
        })
      }),
      problems: Object.freeze({
        title: "BEACH PROBLEMS",
        heat: "HEAT WAS THE BIGGEST PROBLEM",
        litter: "LITTER HURT YOUR RATING",
        entertainment: "LOW ENTERTAINMENT",
        sharkRisk: "SHARK RISK UNCONTROLLED",
        none: "NO MAJOR PROBLEMS"
      })
    }),
    reports: Object.freeze({
      verdict: Object.freeze({
        beachOpened: "BEACH OPENED!",
        amazing: "AMAZING BEACH!",
        great: "GREAT BEACH!",
        goodStart: "GOOD START!",
        keepImproving: "KEEP IMPROVING!"
      }),
      rating: "RATING {value}",
      stars: "{value} STARS",
      noReviews: "NO REVIEWS",
      money: "MONEY {amount}",
      bathers: "BATHERS {count}",
      buildings: "BUILDINGS {count}",
      nextTime: "NEXT TIME: {actions} EARLIER!",
      loved: "BATHERS LOVED IT!",
      actions: Object.freeze({
        drinks: "DRINKS",
        volleyball: "VOLLEYBALL",
        toilets: "TOILETS",
        wifi: "WI-FI",
        batherCare: "BATHER CARE"
      }),
      dayClosing: Object.freeze({
        publicFund: "PUBLIC BEACH FUND +{amount}",
        dailyCosts: "DAILY COSTS -{amount}",
        closed: "{service} CLOSED!",
        yesterdayRating: "YESTERDAY {rating} STARS",
        reviewsCount: "{count} {label}",
        yesterdayNoReviews: "YESTERDAY NO REVIEWS",
        servicesHelped: "{services} HELPED!",
        helpedTarget: "YOU HELPED {count} PEOPLE COOL OFF!",
        helpedOne: "YOU HELPED {count} PERSON COOL OFF",
        helpedMany: "YOU HELPED {count} PEOPLE COOL OFF",
        review: "REVIEW",
        reviews: "REVIEWS",
        services: Object.freeze({
          lifeguard: "LIFEGUARD",
          toilet: "TOILET",
          trashCans: "TRASH CANS"
        }),
        problems: Object.freeze({
          "heat-without-beverage": "BATHERS NEED DRINKS!",
          "missing-entertainment": "BATHERS ARE BORED!",
          "missing-wifi": "BATHERS WANT WI-FI!",
          "missing-toilet": "BATHERS NEED TOILETS!"
        })
      })
    }),
    feedback: Object.freeze({
      batherNeeds: Object.freeze({
        "heat-without-beverage": "NEEDS A DRINK!",
        "missing-entertainment": "IS BORED!",
        "missing-wifi": "WANTS WI-FI!",
        "missing-toilet": "NEEDS A TOILET!",
        fallback: "BATHER IS UPSET!"
      }),
      beachProblems: Object.freeze({
        "heat-without-beverage": "BATHERS NEED DRINKS!",
        "missing-entertainment": "BATHERS ARE BORED!",
        "missing-wifi": "BATHERS WANT WI-FI!",
        "missing-toilet": "BATHERS NEED TOILETS!",
        fallback: "BATHERS WERE UPSET!"
      }),
      pickup: Object.freeze({
        money: "+{amount}",
        moneyBonus: "+{amount} BONUS!",
        beerLitter: "BEER LITTER! CLEAN IT UP!",
        wantsBeer: "WANTS A BEER",
        serviceDecisions: Object.freeze({
          "lifeguard-building": "GOING TO LIFEGUARD",
          "wifi-spot": "GOING TO WI-FI",
          "toilet-building": "GOING TO TOILET",
          "volleyball-court": "GOING TO VOLLEYBALL",
          "sun-shade": "GOING TO SUN-SHADE"
        }),
        serviceCompletions: Object.freeze({
          "lifeguard-building": "LIFEGUARD +SAFETY",
          "wifi-spot": "WI-FI +CONNECTION",
          "toilet-building": "TOILET +RELIEF",
          "volleyball-court": "VOLLEYBALL +FUN",
          "sun-shade": "SUN-SHADE"
        }),
        beerSold: "BEER SOLD! COLLECT MONEY",
        review: "REVIEW {rating} {stars}!",
        reviewBonus: "REVIEW BONUS! COLLECT MONEY",
        star: "STAR",
        stars: "STARS",
        moneyGained: "Money gained"
      })
    }),
    complaints: Object.freeze({
      heat: "It's too hot! Try a drink or shade!",
      entertainment: "I'm bored! Try volleyball!",
      wifi: "I need internet! Try the Wi-Fi spot!",
      toilet: "I need a toilet! Build one!",
      toiletLeaving: "No toilet. I'm leaving!",
      toleranceExhausted: "Too many problems. I'm leaving!",
      needLevel: "Need level"
    })
  }),
  [LOCALES.ES]: Object.freeze({
    hud: Object.freeze({
      timeRemaining: "Tiempo restante: {time}",
      beachMoney: "Dinero de la playa: {amount}",
      heat: Object.freeze({
        label: "CALOR",
        levels: Object.freeze({
          low: "BAJO",
          comfortable: "CÓMODO",
          high: "ALTO"
        }),
        aria: "Calor {level}: {heat}%"
      }),
      rating: Object.freeze({
        label: "Valoración",
        noReviews: "SIN RESEÑAS",
        aria: "Valoración de la playa: {rating} de 5 con {count} {reviewLabel}",
        review: "reseña",
        reviews: "reseñas"
      }),
      bathers: Object.freeze({
        singular: "bañista",
        plural: "bañistas",
        onBeach: "{count} {label} en la playa",
        moodTitle: "ÁNIMO {band} {score}%",
        needs: "NECESITA {need} {value}%",
        focusAria: "{count} {label} en la playa; ánimo {band} {score} por ciento; necesita {need}",
        bands: Object.freeze({
          happy: "FELIZ",
          okay: "BIEN",
          uneasy: "INQUIETO",
          upset: "MOLESTO"
        }),
        needsByMotive: Object.freeze({
          connectivity: "CONEXIÓN",
          relief: "ALIVIO",
          entertainment: "DIVERSIÓN",
          heat: "ENFRIAR"
        }),
        actions: Object.freeze({
          connectivity: "PRUEBA EL PUNTO WI-FI",
          relief: "PRUEBA EL BAÑO",
          entertainment: "PRUEBA EL VOLEIBOL",
          heat: "PRUEBA UNA BEBIDA O SOMBRA",
          watchBeach: "VIGILA LA PLAYA"
        })
      }),
      gameModeAria: "Modo de juego: {mode}",
      modes: Object.freeze({
        live: "EN VIVO",
        build: "CONSTRUIR"
      }),
      placement: Object.freeze({
        moveOverBeach: "Mueve el cursor sobre la playa",
        spotBusy: "Este lugar está ocupado",
        notWater: "No está en el agua",
        stayOnSand: "Quédate en la arena",
        useSunShadeRow: "Usa la fila de sombrillas",
        useGreenRow: "Usa la fila verde"
      })
    }),
    common: Object.freeze({
      up: "MEJORA",
      money: "Dinero",
      star: "Estrella",
      free: "GRATIS",
      select: "Seleccionar"
    }),
    dialogs: Object.freeze({
      chooseBuilding: "Elige una construcción",
      buildingInteraction: "Interacción con {building}"
    }),
    actions: Object.freeze({
      placeSunShade: "COLOCAR SOMBRILLA — {cost}",
      firstSunShadeFree: "Tu primera sombrilla es gratis.",
      additionalSunShadeCost: "Cada sombrilla adicional cuesta $5."
    }),
    buildingButton: Object.freeze({
      available: "CONSTRUIR",
      missing: "FALTAN ${amount}",
      availableAria: "Elegir una construcción",
      missingAria: "Faltan {amount} dólares para construir"
    }),
    buildings: Object.freeze({
      kiosk: Object.freeze({
        label: "Quiosco"
      }),
      "beverage-store": Object.freeze({
        label: "Tienda de bebidas",
        role: "Bebidas",
        description: "Gana $1 cada 30 segundos cuando un bañista la usa."
      }),
      "lifeguard-building": Object.freeze({
        label: "Puesto de salvavidas",
        role: "Seguridad de la playa",
        description: "Mejora las reseñas. Cuesta $4 al final de cada día."
      }),
      "wifi-spot": Object.freeze({
        label: "Punto Wi-Fi",
        role: "Conexión de visitantes",
        description: "Gana $1 cada 30 segundos cuando un bañista lo usa."
      }),
      "toilet-building": Object.freeze({
        label: "Edificio de baños",
        role: "Instalaciones de playa",
        description: "Evita quejas por los baños. Cuesta $3 al final de cada día."
      }),
      "trash-cans": Object.freeze({
        label: "Papeleras",
        role: "Control de residuos",
        description: "No generan dinero, pero mejoran las reseñas de Google Maps."
      }),
      "volleyball-court": Object.freeze({
        label: "Cancha de voleibol",
        role: "Diversión",
        description: "Evita que los bañistas se aburran."
      })
    }),
    start: Object.freeze({
      title: "BEACH SIMULATOR",
      loading: "CARGANDO...",
      pressStart: "PULSA START",
      chooseLanguage: "ELIGE TU IDIOMA",
      screenAria: "Pantalla de inicio de Beach Simulator",
      languageAria: "Elige tu idioma"
    }),
    app: Object.freeze({
      title: "Beach Simulator",
      worldAria: "Mundo de Beach Simulator",
      gameHudAria: "Estado del juego",
      beachStatusAria: "Estado de la playa",
      loading: "Cargando la playa...",
      loadingAsset: "Cargando {asset}...",
      fpsAria: "Fotogramas por segundo",
      fps: "FPS {value}",
      worldLoadError: "No se pudo cargar el mundo de la playa.",
      rendererError: "No se pudo iniciar el renderizado."
    }),
    onboarding: Object.freeze({
      gameTip: "Consejo del juego",
      ok: "OK",
      batherNotice: "Los bañistas son tus clientes. Mantenlos felices para conseguir mejores reseñas."
    }),
    tasks: Object.freeze({
      ariaLabel: "Trabajo de hoy",
      title: "TRABAJO DE HOY",
      helper: "AYUDA A LA PLAYA, UN TRABAJO A LA VEZ",
      startHere: "EMPIEZA AQUÍ",
      complete: "¡TAREA COMPLETA!",
      progress: "Progreso de {label}",
      cleanBeach: "LIMPIA LA PLAYA",
      cleanAfterVisitor: "LIMPIA DESPUÉS DE UN VISITANTE",
      coolDownPeople: "ENFRÍA A {count} PERSONAS",
      buildFirstConstruction: "CONSTRUYE TU PRIMERA ESTRUCTURA",
      welcomeBathers: "DA LA BIENVENIDA A MÁS BAÑISTAS"
    }),
    run: Object.freeze({
      finalRating: "VALORACIÓN DE GUUGLE",
      continue: "CONTINUAR",
      playAgain: "JUGAR DE NUEVO",
      day: "DÍA {day}",
      forecastTitle: "PRONÓSTICO DEL DÍA",
      forecast: Object.freeze({
        heat: "CALOR {level}",
        crowd: "AFLUENCIA {level}",
        sharkRisk: "RIESGO DE TIBURONES {level}",
        litterPressure: "PRESIÓN DE BASURA {level}",
        levels: Object.freeze({
          low: "BAJO",
          comfortable: "CÓMODO",
          high: "ALTO",
          busy: "LLENA",
          steady: "ESTABLE",
          quiet: "TRANQUILA",
          medium: "MEDIA"
        })
      }),
      problems: Object.freeze({
        title: "PROBLEMAS DE LA PLAYA",
        heat: "EL CALOR FUE EL MAYOR PROBLEMA",
        litter: "LA BASURA PERJUDICÓ TU VALORACIÓN",
        entertainment: "POCA DIVERSIÓN",
        sharkRisk: "RIESGO DE TIBURONES SIN CONTROL",
        none: "NO HAY PROBLEMAS IMPORTANTES"
      })
    }),
    reports: Object.freeze({
      verdict: Object.freeze({
        beachOpened: "¡PLAYA ABIERTA!",
        amazing: "¡PLAYA INCREÍBLE!",
        great: "¡PLAYA GENIAL!",
        goodStart: "¡BUEN COMIENZO!",
        keepImproving: "¡SIGUE MEJORANDO!"
      }),
      rating: "VALORACIÓN {value}",
      stars: "{value} ESTRELLAS",
      noReviews: "SIN RESEÑAS",
      money: "DINERO {amount}",
      bathers: "BAÑISTAS {count}",
      buildings: "CONSTRUCCIONES {count}",
      nextTime: "LA PRÓXIMA VEZ: ¡{actions} ANTES!",
      loved: "¡A LOS BAÑISTAS LES ENCANTÓ!",
      actions: Object.freeze({
        drinks: "BEBIDAS",
        volleyball: "VOLEIBOL",
        toilets: "BAÑOS",
        wifi: "WI-FI",
        batherCare: "ATENCIÓN A LOS BAÑISTAS"
      }),
      dayClosing: Object.freeze({
        publicFund: "FONDO DE LA PLAYA PÚBLICA +{amount}",
        dailyCosts: "COSTES DIARIOS -{amount}",
        closed: "¡{service} CERRADO!",
        yesterdayRating: "AYER {rating} ESTRELLAS",
        reviewsCount: "{count} {label}",
        yesterdayNoReviews: "AYER SIN RESEÑAS",
        servicesHelped: "¡{services} AYUDARON!",
        helpedTarget: "¡AYUDASTE A {count} PERSONAS A REFRESCARSE!",
        helpedOne: "AYUDASTE A {count} PERSONA A REFRESCARSE",
        helpedMany: "AYUDASTE A {count} PERSONAS A REFRESCARSE",
        review: "RESEÑA",
        reviews: "RESEÑAS",
        services: Object.freeze({
          lifeguard: "SALVAVIDAS",
          toilet: "BAÑO",
          trashCans: "PAPELERAS"
        }),
        problems: Object.freeze({
          "heat-without-beverage": "¡LOS BAÑISTAS NECESITAN BEBIDAS!",
          "missing-entertainment": "¡LOS BAÑISTAS ESTÁN ABURRIDOS!",
          "missing-wifi": "¡LOS BAÑISTAS QUIEREN WI-FI!",
          "missing-toilet": "¡LOS BAÑISTAS NECESITAN BAÑOS!"
        })
      })
    }),
    feedback: Object.freeze({
      batherNeeds: Object.freeze({
        "heat-without-beverage": "¡NECESITA UNA BEBIDA!",
        "missing-entertainment": "¡ESTÁ ABURRIDO!",
        "missing-wifi": "¡QUIERE WI-FI!",
        "missing-toilet": "¡NECESITA UN BAÑO!",
        fallback: "¡EL BAÑISTA ESTÁ MOLESTO!"
      }),
      beachProblems: Object.freeze({
        "heat-without-beverage": "¡LOS BAÑISTAS NECESITAN BEBIDAS!",
        "missing-entertainment": "¡LOS BAÑISTAS ESTÁN ABURRIDOS!",
        "missing-wifi": "¡LOS BAÑISTAS QUIEREN WI-FI!",
        "missing-toilet": "¡LOS BAÑISTAS NECESITAN BAÑOS!",
        fallback: "¡LOS BAÑISTAS ESTÁN MOLESTOS!"
      }),
      pickup: Object.freeze({
        money: "+{amount}",
        moneyBonus: "+{amount} ¡BONIFICACIÓN!",
        beerLitter: "¡BASURA DE CERVEZA! ¡LÍMPIALA!",
        wantsBeer: "QUIERE UNA CERVEZA",
        serviceDecisions: Object.freeze({
          "lifeguard-building": "VA AL SALVAVIDAS",
          "wifi-spot": "VA AL WI-FI",
          "toilet-building": "VA AL BAÑO",
          "volleyball-court": "VA AL VOLEIBOL",
          "sun-shade": "VA A LA SOMBRA"
        }),
        serviceCompletions: Object.freeze({
          "lifeguard-building": "SALVAVIDAS +SEGURIDAD",
          "wifi-spot": "WI-FI +CONEXIÓN",
          "toilet-building": "BAÑO +ALIVIO",
          "volleyball-court": "VOLEIBOL +DIVERSIÓN",
          "sun-shade": "SOMBRA"
        }),
        beerSold: "¡CERVEZA VENDIDA! COBRA EL DINERO",
        review: "¡RESEÑA: {rating} {stars}!",
        reviewBonus: "¡BONIFICACIÓN DE RESEÑA! COBRA EL DINERO",
        star: "ESTRELLA",
        stars: "ESTRELLAS",
        moneyGained: "Dinero obtenido"
      })
    }),
    complaints: Object.freeze({
      heat: "¡Hace demasiado calor! ¡Prueba una bebida o sombra!",
      entertainment: "¡Estoy aburrido! ¡Prueba el voleibol!",
      wifi: "¡Necesito internet! ¡Prueba el punto Wi-Fi!",
      toilet: "¡Necesito un baño! ¡Construye uno!",
      toiletLeaving: "¡No hay baño! ¡Me voy!",
      toleranceExhausted: "¡Hay demasiados problemas! ¡Me voy!",
      needLevel: "Nivel de necesidad"
    })
  }),
  [LOCALES.PT_BR]: Object.freeze({
    hud: Object.freeze({
      timeRemaining: "Tempo restante: {time}",
      beachMoney: "Dinheiro da praia: {amount}",
      heat: Object.freeze({
        label: "CALOR",
        levels: Object.freeze({
          low: "BAIXO",
          comfortable: "CONFORTÁVEL",
          high: "ALTO"
        }),
        aria: "Calor {level}: {heat}%"
      }),
      rating: Object.freeze({
        label: "Avaliação",
        noReviews: "SEM AVALIAÇÕES",
        aria: "Avaliação da praia: {rating} de 5 com {count} {reviewLabel}",
        review: "avaliação",
        reviews: "avaliações"
      }),
      bathers: Object.freeze({
        singular: "banhista",
        plural: "banhistas",
        onBeach: "{count} {label} na praia",
        moodTitle: "HUMOR {band} {score}%",
        needs: "PRECISA DE {need} {value}%",
        focusAria: "{count} {label} na praia; humor {band} {score} por cento; precisa de {need}",
        bands: Object.freeze({
          happy: "FELIZ",
          okay: "BEM",
          uneasy: "INQUIETO",
          upset: "IRRITADO"
        }),
        needsByMotive: Object.freeze({
          connectivity: "CONEXÃO",
          relief: "ALÍVIO",
          entertainment: "DIVERSÃO",
          heat: "ESFRIAR"
        }),
        actions: Object.freeze({
          connectivity: "TENTE O PONTO DE WI-FI",
          relief: "TENTE O BANHEIRO",
          entertainment: "TENTE O VÔLEI",
          heat: "TENTE UMA BEBIDA OU SOMBRA",
          watchBeach: "OBSERVE A PRAIA"
        })
      }),
      gameModeAria: "Modo de jogo: {mode}",
      modes: Object.freeze({
        live: "AO VIVO",
        build: "CONSTRUIR"
      }),
      placement: Object.freeze({
        moveOverBeach: "Mova sobre a praia",
        spotBusy: "Este lugar está ocupado",
        notWater: "Não entre na água",
        stayOnSand: "Fique na areia",
        useSunShadeRow: "Use a fileira de guarda-sóis",
        useGreenRow: "Use a fileira verde"
      })
    }),
    common: Object.freeze({
      up: "MELHORIA",
      money: "Dinheiro",
      star: "Estrela",
      free: "GRÁTIS",
      select: "Selecionar"
    }),
    dialogs: Object.freeze({
      chooseBuilding: "Escolha uma construção",
      buildingInteraction: "Interação com {building}"
    }),
    actions: Object.freeze({
      placeSunShade: "COLOCAR GUARDA-SOL — {cost}",
      firstSunShadeFree: "Seu primeiro guarda-sol é grátis.",
      additionalSunShadeCost: "Cada guarda-sol adicional custa $5."
    }),
    buildingButton: Object.freeze({
      available: "CONSTRUIR",
      missing: "FALTAM ${amount}",
      availableAria: "Escolher uma construção",
      missingAria: "Faltam {amount} dólares para construir"
    }),
    buildings: Object.freeze({
      kiosk: Object.freeze({
        label: "Quiosque"
      }),
      "beverage-store": Object.freeze({
        label: "Loja de bebidas",
        role: "Bebidas",
        description: "Gera $1 a cada 30 segundos quando um banhista usa."
      }),
      "lifeguard-building": Object.freeze({
        label: "Posto de salva-vidas",
        role: "Segurança da praia",
        description: "Melhora as avaliações. Custa $4 no fim de cada dia."
      }),
      "wifi-spot": Object.freeze({
        label: "Ponto de Wi-Fi",
        role: "Conexão dos visitantes",
        description: "Gera $1 a cada 30 segundos quando um banhista usa."
      }),
      "toilet-building": Object.freeze({
        label: "Prédio de banheiros",
        role: "Estrutura da praia",
        description: "Evita reclamações sobre banheiros. Custa $3 no fim de cada dia."
      }),
      "trash-cans": Object.freeze({
        label: "Lixeiras",
        role: "Controle de resíduos",
        description: "Não geram dinheiro, mas melhoram as avaliações do Google Maps."
      }),
      "volleyball-court": Object.freeze({
        label: "Quadra de vôlei",
        role: "Diversão",
        description: "Evita que os banhistas fiquem entediados."
      })
    }),
    start: Object.freeze({
      title: "BEACH SIMULATOR",
      loading: "CARREGANDO...",
      pressStart: "PRESSIONE START",
      chooseLanguage: "ESCOLHA SEU IDIOMA",
      screenAria: "Tela inicial do Beach Simulator",
      languageAria: "Escolha seu idioma"
    }),
    app: Object.freeze({
      title: "Beach Simulator",
      worldAria: "Mundo do Beach Simulator",
      gameHudAria: "Status do jogo",
      beachStatusAria: "Status da praia",
      loading: "Carregando a praia...",
      loadingAsset: "Carregando {asset}...",
      fpsAria: "Quadros por segundo",
      fps: "FPS {value}",
      worldLoadError: "Não foi possível carregar o mundo da praia.",
      rendererError: "Não foi possível iniciar a renderização."
    }),
    onboarding: Object.freeze({
      gameTip: "Dica do jogo",
      ok: "OK",
      batherNotice: "Os banhistas são seus clientes. Mantenha-os felizes para conseguir avaliações melhores."
    }),
    tasks: Object.freeze({
      ariaLabel: "Trabalho de hoje",
      title: "TRABALHO DE HOJE",
      helper: "AJUDE A PRAIA, UM TRABALHO DE CADA VEZ",
      startHere: "COMECE AQUI",
      complete: "TAREFA CONCLUÍDA!",
      progress: "Progresso de {label}",
      cleanBeach: "LIMPE A PRAIA",
      cleanAfterVisitor: "LIMPE DEPOIS DE UM VISITANTE",
      coolDownPeople: "ESFRIE {count} PESSOAS",
      buildFirstConstruction: "CONSTRUA SUA PRIMEIRA ESTRUTURA",
      welcomeBathers: "RECEBA MAIS BANHISTAS"
    }),
    run: Object.freeze({
      finalRating: "AVALIAÇÃO GUUGLE",
      continue: "CONTINUAR",
      playAgain: "JOGAR NOVAMENTE",
      day: "DIA {day}",
      forecastTitle: "PREVISÃO DO DIA",
      forecast: Object.freeze({
        heat: "CALOR {level}",
        crowd: "MOVIMENTO {level}",
        sharkRisk: "RISCO DE TUBARÕES {level}",
        litterPressure: "PRESSÃO DE LIXO {level}",
        levels: Object.freeze({
          low: "BAIXO",
          comfortable: "CONFORTÁVEL",
          high: "ALTO",
          busy: "CHEIA",
          steady: "ESTÁVEL",
          quiet: "TRANQUILA",
          medium: "MÉDIA"
        })
      }),
      problems: Object.freeze({
        title: "PROBLEMAS DA PRAIA",
        heat: "O CALOR FOI O MAIOR PROBLEMA",
        litter: "O LIXO PREJUDICOU SUA AVALIAÇÃO",
        entertainment: "POUCA DIVERSÃO",
        sharkRisk: "RISCO DE TUBARÃO SEM CONTROLE",
        none: "NENHUM PROBLEMA GRAVE"
      })
    }),
    reports: Object.freeze({
      verdict: Object.freeze({
        beachOpened: "PRAIA ABERTA!",
        amazing: "PRAIA INCRÍVEL!",
        great: "PRAIA ÓTIMA!",
        goodStart: "BOM COMEÇO!",
        keepImproving: "CONTINUE MELHORANDO!"
      }),
      rating: "AVALIAÇÃO {value}",
      stars: "{value} ESTRELAS",
      noReviews: "SEM AVALIAÇÕES",
      money: "DINHEIRO {amount}",
      bathers: "BANHISTAS {count}",
      buildings: "CONSTRUÇÕES {count}",
      nextTime: "DA PRÓXIMA VEZ: {actions} MAIS CEDO!",
      loved: "OS BANHISTAS ADORARAM!",
      actions: Object.freeze({
        drinks: "BEBIDAS",
        volleyball: "VÔLEI",
        toilets: "BANHEIROS",
        wifi: "WI-FI",
        batherCare: "CUIDADO COM OS BANHISTAS"
      }),
      dayClosing: Object.freeze({
        publicFund: "FUNDO DA PRAIA PÚBLICA +{amount}",
        dailyCosts: "CUSTOS DIÁRIOS -{amount}",
        closed: "{service} FECHADO!",
        yesterdayRating: "ONTEM {rating} ESTRELAS",
        reviewsCount: "{count} {label}",
        yesterdayNoReviews: "ONTEM SEM AVALIAÇÕES",
        servicesHelped: "{services} AJUDARAM!",
        helpedTarget: "VOCÊ AJUDOU {count} PESSOAS A SE REFRESCAREM!",
        helpedOne: "VOCÊ AJUDOU {count} PESSOA A SE REFRESCAR",
        helpedMany: "VOCÊ AJUDOU {count} PESSOAS A SE REFRESCAREM",
        review: "AVALIAÇÃO",
        reviews: "AVALIAÇÕES",
        services: Object.freeze({
          lifeguard: "SALVA-VIDAS",
          toilet: "BANHEIRO",
          trashCans: "LIXEIRAS"
        }),
        problems: Object.freeze({
          "heat-without-beverage": "OS BANHISTAS PRECISAM DE BEBIDAS!",
          "missing-entertainment": "OS BANHISTAS ESTÃO ENTEDIADOS!",
          "missing-wifi": "OS BANHISTAS QUEREM WI-FI!",
          "missing-toilet": "OS BANHISTAS PRECISAM DE BANHEIROS!"
        })
      })
    }),
    feedback: Object.freeze({
      batherNeeds: Object.freeze({
        "heat-without-beverage": "PRECISA DE UMA BEBIDA!",
        "missing-entertainment": "ESTÁ ENTEDIADO!",
        "missing-wifi": "QUER WI-FI!",
        "missing-toilet": "PRECISA DE UM BANHEIRO!",
        fallback: "O BANHISTA ESTÁ IRRITADO!"
      }),
      beachProblems: Object.freeze({
        "heat-without-beverage": "OS BANHISTAS PRECISAM DE BEBIDAS!",
        "missing-entertainment": "OS BANHISTAS ESTÃO ENTEDIADOS!",
        "missing-wifi": "OS BANHISTAS QUEREM WI-FI!",
        "missing-toilet": "OS BANHISTAS PRECISAM DE BANHEIROS!",
        fallback: "OS BANHISTAS ESTÃO IRRITADOS!"
      }),
      pickup: Object.freeze({
        money: "+{amount}",
        moneyBonus: "+{amount} BÔNUS!",
        beerLitter: "LIXO DE CERVEJA! LIMPE!",
        wantsBeer: "QUER UMA CERVEJA",
        serviceDecisions: Object.freeze({
          "lifeguard-building": "INDO PARA O GUARDA-VIDAS",
          "wifi-spot": "INDO PARA O WI-FI",
          "toilet-building": "INDO PARA O BANHEIRO",
          "volleyball-court": "INDO PARA O VÔLEI",
          "sun-shade": "INDO PARA A SOMBRA"
        }),
        serviceCompletions: Object.freeze({
          "lifeguard-building": "GUARDA-VIDAS +SEGURANÇA",
          "wifi-spot": "WI-FI +CONEXÃO",
          "toilet-building": "BANHEIRO +ALÍVIO",
          "volleyball-court": "VÔLEI +DIVERSÃO",
          "sun-shade": "SOMBRA"
        }),
        beerSold: "CERVEJA VENDIDA! COLETE O DINHEIRO",
        review: "AVALIAÇÃO {rating} {stars}!",
        reviewBonus: "BÔNUS DE AVALIAÇÃO! COLETE O DINHEIRO",
        star: "ESTRELA",
        stars: "ESTRELAS",
        moneyGained: "Dinheiro ganho"
      })
    }),
    complaints: Object.freeze({
      heat: "Está quente demais! Tente uma bebida ou sombra!",
      entertainment: "Estou entediado! Tente o vôlei!",
      wifi: "Preciso de internet! Tente o ponto de Wi-Fi!",
      toilet: "Preciso de um banheiro! Construa um!",
      toiletLeaving: "Não tem banheiro. Vou embora!",
      toleranceExhausted: "Problemas demais. Vou embora!",
      needLevel: "Nível da necessidade"
    })
  }),
  [LOCALES.DE]: Object.freeze({
    hud: Object.freeze({
      timeRemaining: "Verbleibende Zeit: {time}",
      beachMoney: "Strandgeld: {amount}",
      heat: Object.freeze({
        label: "HITZE",
        levels: Object.freeze({
          low: "NIEDRIG",
          comfortable: "ANGENEHM",
          high: "HOCH"
        }),
        aria: "Hitze {level}: {heat}%"
      }),
      rating: Object.freeze({
        label: "Bewertung",
        noReviews: "KEINE BEWERTUNGEN",
        aria: "Strandbewertung: {rating} von 5 aus {count} {reviewLabel}",
        review: "Bewertung",
        reviews: "Bewertungen"
      }),
      bathers: Object.freeze({
        singular: "Badegast",
        plural: "Badegäste",
        onBeach: "{count} {label} am Strand",
        moodTitle: "STIMMUNG {band} {score}%",
        needs: "BRAUCHT {need} {value}%",
        focusAria: "{count} {label} am Strand; Stimmung {band} {score} Prozent; braucht {need}",
        bands: Object.freeze({
          happy: "GLÜCKLICH",
          okay: "OKAY",
          uneasy: "UNRUHIG",
          upset: "VERÄRGERT"
        }),
        needsByMotive: Object.freeze({
          connectivity: "VERBINDUNG",
          relief: "ERHOLUNG",
          entertainment: "SPASS",
          heat: "ABKÜHLUNG"
        }),
        actions: Object.freeze({
          connectivity: "WLAN-PUNKT NUTZEN",
          relief: "TOILETTE NUTZEN",
          entertainment: "VOLLEYBALL NUTZEN",
          heat: "GETRÄNK ODER SCHATTEN NUTZEN",
          watchBeach: "STRAND BEOBACHTEN"
        })
      }),
      gameModeAria: "Spielmodus: {mode}",
      modes: Object.freeze({
        live: "LIVE",
        build: "BAUEN"
      }),
      placement: Object.freeze({
        moveOverBeach: "Bewege dich über den Strand",
        spotBusy: "Dieser Platz ist besetzt",
        notWater: "Nicht ins Wasser",
        stayOnSand: "Bleib im Sand",
        useSunShadeRow: "Nutze die Sonnenschirmreihe",
        useGreenRow: "Nutze die grüne Reihe"
      })
    }),
    common: Object.freeze({
      up: "VERBESSERUNG",
      money: "Geld",
      star: "Stern",
      free: "KOSTENLOS",
      select: "Auswählen"
    }),
    dialogs: Object.freeze({
      chooseBuilding: "Gebäude auswählen",
      buildingInteraction: "{building}-Interaktion"
    }),
    actions: Object.freeze({
      placeSunShade: "SONNENSCHIRM AUFSTELLEN — {cost}",
      firstSunShadeFree: "Dein erster Sonnenschirm ist kostenlos.",
      additionalSunShadeCost: "Jeder weitere Sonnenschirm kostet $5."
    }),
    buildingButton: Object.freeze({
      available: "BAUEN",
      missing: "NOCH ${amount}",
      availableAria: "Gebäude auswählen",
      missingAria: "Zum Bauen fehlen noch {amount} Dollar"
    }),
    buildings: Object.freeze({
      kiosk: Object.freeze({
        label: "Kiosk"
      }),
      "beverage-store": Object.freeze({
        label: "Getränkeladen",
        role: "Getränke",
        description: "Bringt $1 alle 30 Sekunden, wenn ein Badegast ihn nutzt."
      }),
      "lifeguard-building": Object.freeze({
        label: "Rettungswache",
        role: "Strandsicherheit",
        description: "Verbessert Bewertungen. Kostet am Tagesende $4."
      }),
      "wifi-spot": Object.freeze({
        label: "WLAN-Punkt",
        role: "Verbindung für Badegäste",
        description: "Bringt $1 alle 30 Sekunden, wenn ein Badegast ihn nutzt."
      }),
      "toilet-building": Object.freeze({
        label: "Toilettengebäude",
        role: "Strandeinrichtungen",
        description: "Verhindert Toilettenbeschwerden. Kostet am Tagesende $3."
      }),
      "trash-cans": Object.freeze({
        label: "Mülleimer",
        role: "Abfallkontrolle",
        description: "Bringen kein Geld, verbessern aber die Google-Maps-Bewertungen."
      }),
      "volleyball-court": Object.freeze({
        label: "Volleyballplatz",
        role: "Spaß",
        description: "Verhindert, dass Badegäste sich langweilen."
      })
    }),
    start: Object.freeze({
      title: "BEACH SIMULATOR",
      loading: "LADEN...",
      pressStart: "START DRÜCKEN",
      chooseLanguage: "SPRACHE WÄHLEN",
      screenAria: "Startbildschirm von Beach Simulator",
      languageAria: "Wähle deine Sprache"
    }),
    app: Object.freeze({
      title: "Beach Simulator",
      worldAria: "Welt von Beach Simulator",
      gameHudAria: "Spielstatus",
      beachStatusAria: "Strandstatus",
      loading: "Strand wird geladen...",
      loadingAsset: "{asset} wird geladen...",
      fpsAria: "Bilder pro Sekunde",
      fps: "FPS {value}",
      worldLoadError: "Die Strandwelt konnte nicht geladen werden.",
      rendererError: "Die Darstellung konnte nicht gestartet werden."
    }),
    onboarding: Object.freeze({
      gameTip: "Spieletipp",
      ok: "OK",
      batherNotice: "Badegäste sind deine Kunden. Halte sie zufrieden, um bessere Bewertungen zu bekommen."
    }),
    tasks: Object.freeze({
      ariaLabel: "Heutiger Auftrag",
      title: "HEUTIGER AUFTRAG",
      helper: "HILF DEM STRAND, EINEN AUFTRAG NACH DEM ANDEREN",
      startHere: "HIER STARTEN",
      complete: "AUFGABE ERLEDIGT!",
      progress: "{label}: Fortschritt",
      cleanBeach: "STRAND SÄUBERN",
      cleanAfterVisitor: "NACH EINEM BESUCHER AUFRÄUMEN",
      coolDownPeople: "KÜHLE {count} PERSONEN AB",
      buildFirstConstruction: "BAUE DEINE ERSTE STRUKTUR",
      welcomeBathers: "BEGRÜSSE MEHR BADEGÄSTE"
    }),
    run: Object.freeze({
      finalRating: "GUUGLE-BEWERTUNG",
      continue: "WEITER",
      playAgain: "NOCH EINMAL SPIELEN",
      day: "TAG {day}",
      forecastTitle: "TAGESPROGNOSE",
      forecast: Object.freeze({
        heat: "HITZE {level}",
        crowd: "ANDRANG {level}",
        sharkRisk: "HAIRISIKO {level}",
        litterPressure: "MÜLLDRUCK {level}",
        levels: Object.freeze({
          low: "NIEDRIG",
          comfortable: "ANGENEHM",
          high: "HOCH",
          busy: "VOLL",
          steady: "STABIL",
          quiet: "RUHIG",
          medium: "MITTEL"
        })
      }),
      problems: Object.freeze({
        title: "STRANDPROBLEME",
        heat: "HITZE WAR DAS GRÖSSTE PROBLEM",
        litter: "MÜLL HAT DEINE BEWERTUNG VERSCHLECHTERT",
        entertainment: "WENIG SPASS",
        sharkRisk: "HAIRISIKO UNKONTROLLIERT",
        none: "KEINE GRÖSSEREN PROBLEME"
      })
    }),
    reports: Object.freeze({
      verdict: Object.freeze({
        beachOpened: "STRAND ERÖFFNET!",
        amazing: "TOLLER STRAND!",
        great: "GROSSARTIGER STRAND!",
        goodStart: "GUTER START!",
        keepImproving: "WEITER VERBESSERN!"
      }),
      rating: "BEWERTUNG {value}",
      stars: "{value} STERNE",
      noReviews: "KEINE BEWERTUNGEN",
      money: "GELD {amount}",
      bathers: "BADEGÄSTE {count}",
      buildings: "GEBÄUDE {count}",
      nextTime: "NÄCHSTES MAL: {actions} FRÜHER!",
      loved: "DIE BADEGÄSTE LIEBTEN ES!",
      actions: Object.freeze({
        drinks: "GETRÄNKE",
        volleyball: "VOLLEYBALL",
        toilets: "TOILETTEN",
        wifi: "WLAN",
        batherCare: "BADEGÄSTE BETREUEN"
      }),
      dayClosing: Object.freeze({
        publicFund: "ÖFFENTLICHER STRANDFONDS +{amount}",
        dailyCosts: "TÄGLICHE KOSTEN -{amount}",
        closed: "{service} GESCHLOSSEN!",
        yesterdayRating: "GESTERN {rating} STERNE",
        reviewsCount: "{count} {label}",
        yesterdayNoReviews: "GESTERN KEINE BEWERTUNGEN",
        servicesHelped: "{services} HABEN GEHOLFEN!",
        helpedTarget: "DU HAST {count} BADEGÄSTEN GEHOLFEN, SICH ABZUKÜHLEN!",
        helpedOne: "DU HAST {count} BADEGAST GEHOLFEN, SICH ABZUKÜHLEN",
        helpedMany: "DU HAST {count} BADEGÄSTEN GEHOLFEN, SICH ABZUKÜHLEN",
        review: "BEWERTUNG",
        reviews: "BEWERTUNGEN",
        services: Object.freeze({
          lifeguard: "RETTUNGSWACHE",
          toilet: "TOILETTE",
          trashCans: "MÜLLEIMER"
        }),
        problems: Object.freeze({
          "heat-without-beverage": "DIE BADEGÄSTE BRAUCHEN GETRÄNKE!",
          "missing-entertainment": "DIE BADEGÄSTE LANGWEILEN SICH!",
          "missing-wifi": "DIE BADEGÄSTE WOLLEN WLAN!",
          "missing-toilet": "DIE BADEGÄSTE BRAUCHEN TOILETTEN!"
        })
      })
    }),
    feedback: Object.freeze({
      batherNeeds: Object.freeze({
        "heat-without-beverage": "BRAUCHT EIN GETRÄNK!",
        "missing-entertainment": "IST GELANGWEILT!",
        "missing-wifi": "WILL WLAN!",
        "missing-toilet": "BRAUCHT EINE TOILETTE!",
        fallback: "DER BADEGAST IST UNZUFRIEDEN!"
      }),
      beachProblems: Object.freeze({
        "heat-without-beverage": "DIE BADEGÄSTE BRAUCHEN GETRÄNKE!",
        "missing-entertainment": "DIE BADEGÄSTE LANGWEILEN SICH!",
        "missing-wifi": "DIE BADEGÄSTE WOLLEN WLAN!",
        "missing-toilet": "DIE BADEGÄSTE BRAUCHEN TOILETTEN!",
        fallback: "DIE BADEGÄSTE SIND UNZUFRIEDEN!"
      }),
      pickup: Object.freeze({
        money: "+{amount}",
        moneyBonus: "+{amount} BONUS!",
        beerLitter: "BIERMÜLL! RÄUM IHN WEG!",
        wantsBeer: "MÖCHTE EIN BIER",
        serviceDecisions: Object.freeze({
          "lifeguard-building": "GEHT ZUR RETTUNG",
          "wifi-spot": "GEHT ZUM WLAN",
          "toilet-building": "GEHT ZUR TOILETTE",
          "volleyball-court": "GEHT ZUM VOLLEYBALL",
          "sun-shade": "GEHT ZUM SONNENSCHIRM"
        }),
        serviceCompletions: Object.freeze({
          "lifeguard-building": "RETTUNG +SICHERHEIT",
          "wifi-spot": "WLAN +VERBINDUNG",
          "toilet-building": "TOILETTE +ERLEICHTERUNG",
          "volleyball-court": "VOLLEYBALL +SPASS",
          "sun-shade": "SONNENSCHIRM"
        }),
        beerSold: "BIER VERKAUFT! GELD EINSAMMELN",
        review: "BEWERTUNG {rating} {stars}!",
        reviewBonus: "BEWERTUNGSBONUS! GELD EINSAMMELN",
        star: "STERN",
        stars: "STERNE",
        moneyGained: "Geld erhalten"
      })
    }),
    complaints: Object.freeze({
      heat: "Es ist zu heiß! Versuch es mit einem Getränk oder Schatten!",
      entertainment: "Mir ist langweilig! Versuch Volleyball!",
      wifi: "Ich brauche Internet! Nutze den WLAN-Punkt!",
      toilet: "Ich brauche eine Toilette! Bau eine!",
      toiletLeaving: "Keine Toilette. Ich gehe!",
      toleranceExhausted: "Zu viele Probleme. Ich gehe!",
      needLevel: "Bedürfnisstufe"
    })
  })
});

function normalizeLocale(locale) {
  return SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
}

function readCatalogValue(catalog, key) {
  return String(key)
    .split(".")
    .reduce((value, part) => value?.[part], catalog);
}

function formatMessage(template, params) {
  return String(template).replace(/\{([a-zA-Z0-9_.-]+)\}/g, (match, key) => {
    const value = params?.[key];

    return value === undefined || value === null ? match : String(value);
  });
}

export function createTranslator({
  initialLocale = DEFAULT_LOCALE,
  onMissingKey = () => {}
} = {}) {
  if (typeof onMissingKey !== "function") {
    throw new Error("Translator precisa de um callback de chave ausente.");
  }

  let locale = normalizeLocale(initialLocale);
  const observers = new Set();

  const getCatalogValue = (key) => {
    const localizedValue = readCatalogValue(CATALOGS[locale], key);

    if (localizedValue !== undefined) {
      return localizedValue;
    }

    return readCatalogValue(CATALOGS[DEFAULT_LOCALE], key);
  };

  const translate = (key, params = {}) => {
    const value = getCatalogValue(key);

    if (value === undefined) {
      onMissingKey({ key: String(key), locale });
      return String(key);
    }

    return formatMessage(value, params);
  };

  const notify = () => {
    for (const observer of observers) {
      observer(locale);
    }
  };

  return Object.freeze({
    getLocale() {
      return locale;
    },
    setLocale(nextLocale) {
      const next = normalizeLocale(nextLocale);

      if (next === locale) {
        return locale;
      }

      locale = next;
      notify();
      return locale;
    },
    t: translate,
    formatNumber(value, options = {}) {
      return new Intl.NumberFormat(locale, options).format(value);
    },
    formatCurrency(value, {
      currency = "USD",
      notation = "standard",
      minimumFractionDigits = 0,
      maximumFractionDigits = 0
    } = {}) {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        notation,
        minimumFractionDigits,
        maximumFractionDigits
      }).format(value);
    },
    subscribe(observer) {
      if (typeof observer !== "function") {
        throw new Error("Observer de idioma precisa ser uma funcao.");
      }

      observers.add(observer);
      observer(locale);

      let subscribed = true;
      return () => {
        if (!subscribed) {
          return;
        }

        subscribed = false;
        observers.delete(observer);
      };
    }
  });
}
