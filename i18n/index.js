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
        needsByMotive: Object.freeze({
          connectivity: "CONNECTION",
          relief: "A TOILET",
          entertainment: "TO PLAY",
          heat: "TO COOL DOWN"
        })
      }),
      gameModeAria: "Game mode: {mode}",
      modes: Object.freeze({
        live: "PLAY",
        build: "BUILD"
      }),
      placement: Object.freeze({
        moveOverBeach: "MOVE IT ONTO THE BEACH",
        spotBusy: "SOMETHING IS ALREADY HERE",
        notWater: "PUT IT IN THE WATER",
        stayOnSand: "PUT IT ON THE SAND",
        useSunShadeRow: "PLACE IT ON THE GREEN AREA",
        useGreenRow: "PLACE IT ON THE GREEN AREA"
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
      "sun-shade": Object.freeze({
        label: "Sun-shade"
      }),
      "beverage-store": Object.freeze({
        label: "Beverage Store",
        description: "BATHERS BUY DRINKS. YOU EARN $1."
      }),
      "lifeguard-building": Object.freeze({
        label: "Lifeguard Post",
        description: "KEEPS BATHERS SAFE. COSTS $4 EACH DAY."
      }),
      "wifi-spot": Object.freeze({
        label: "Wi-Fi Spot",
        description: "BATHERS USE WI-FI. YOU EARN $1."
      }),
      "toilet-building": Object.freeze({
        label: "Toilets",
        description: "GIVES BATHERS A TOILET. COSTS $3 EACH DAY."
      }),
      "trash-cans": Object.freeze({
        label: "Trash Cans",
        description: "LESS TRASH FALLS ON THE SAND."
      }),
      "volleyball-court": Object.freeze({
        label: "Volleyball Court",
        description: "KEEPS BATHERS HAPPY."
      })
    }),
    start: Object.freeze({
      title: "BEACH SIMULATOR",
      loading: "LOADING...",
      pressStart: "START GAME",
      chooseLanguage: "CHOOSE YOUR LANGUAGE",
      storyAria: "Story scene",
      storyImageAlt: "A girl speaking into a podcast microphone",
      storyBegin: "BEGIN",
      storyRatingLabel: "STARS",
      storyPages: Object.freeze({
        welcome: "HEY OOO, SONS OF A BEACH! WHOS READY FOR THE BEST SEASON OF THE YEAR?!",
        locations: "OH YEAH. THIS YEAR WE HAVE NEW LOCATIONS TO GET A GNARLY TAN, KNOW WHAT UM SAYNG!",
        competition: "SO WHO'S GONNA WIN THE BEST BEACH OF THE SUMMER!!! UH LA LA!",
        ratingBefore: "REMEMBER, PEOPLE WANNA HAVE FUN, THE MORE ",
        ratingAfter: " YOU GET, THE BETTER!",
        goodLuck: "GOOD LUCK, YOU BEACH BOSS SIX SEVEN AURA FARMER!"
      }),
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
      batherNotice: "HAPPY BATHERS GIVE YOU MORE STARS."
    }),
    tasks: Object.freeze({
      ariaLabel: "Tasks",
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
      buildingsUnlocked: "NOW YOU CAN BUILD: {buildings}",
      leaderboard: Object.freeze({
        eyebrow: "SUMMER RESULTS",
        title: "BEACH RANKING",
        yourScore: "YOUR STAR RATING",
        connecting: "CONNECTING...",
        worldTitle: "WORLD TOP 5",
        personalTitle: "YOUR BEST RUNS",
        platformTitle: "PLATFORM RANKING",
        scale: "STARS",
        loading: "CHECKING THE RANKING...",
        playerFallback: "PLAYER",
        reviewCountOne: "{count} REVIEW",
        reviewCount: "{count} REVIEWS",
        namePlaceholder: "NAME OR INITIALS",
        nameAria: "Player name or initials",
        saveScore: "SAVE SCORE",
        openRanking: "OPEN RANKING",
        saveHelp: "SAVE THIS RUN ON THIS DEVICE.",
        submitFailed: "WORLD RANKING OFFLINE. SAVE IT HERE.",
        scoreSaved: "SCORE SAVED!",
        empty: "NO SCORES YET.",
        loadFailed: "SCORE SENT. RANKING COULD NOT LOAD.",
        nativePopupHelp: "SCORE SENT. OPEN THE PLATFORM RANKING.",
        nativeManaged: "SCORE SENT. THE PLATFORM SHOWS THE RANKING.",
        scoreSubmittedAs: "SCORE SENT AS {name}.",
        scoreSubmitted: "SCORE SENT TO THE WORLD RANKING.",
        saveFailed: "COULD NOT SAVE THIS SCORE.",
        openFailed: "THE PLATFORM RANKING COULD NOT OPEN."
      }),
      problems: Object.freeze({
        title: "WHAT WENT WRONG",
        heat: "TOO MANY BATHERS GOT HOT",
        litter: "THERE WAS TOO MUCH TRASH",
        entertainment: "BATHERS GOT BORED",
        sharkRisk: "NO LIFEGUARD FOR THE SHARK",
        none: "EVERYTHING WENT WELL"
      })
    }),
    demand: Object.freeze({
      title: "TODAY'S FOCUS",
      focus: Object.freeze({
        hotDay: "IT'S VERY HOT",
        dirtyBeach: "THE BEACH IS DIRTY",
        needs: Object.freeze({
          refreshment: "BATHERS MAY GET THIRSTY",
          safety: "KEEP BATHERS SAFE",
          connectivity: "BATHERS WANT WI-FI",
          relief: "BATHERS NEED A TOILET",
          cleanliness: "KEEP THE BEACH CLEAN",
          entertainment: "BATHERS WANT TO PLAY"
        }),
        actions: Object.freeze({
          pickUpTrash: "PICK UP THE TRASH",
          missing: Object.freeze({
            refreshment: "BUILD A DRINK SHOP",
            safety: "ADD A LIFEGUARD",
            connectivity: "BUILD A WI-FI SPOT",
            relief: "BUILD A TOILET",
            cleanliness: "ADD TRASH CANS",
            entertainment: "BUILD A VOLLEYBALL COURT"
          }),
          degraded: Object.freeze({
            refreshment: "CHECK THE DRINK SHOP",
            safety: "PAY THE LIFEGUARD",
            connectivity: "CHECK THE WI-FI",
            relief: "CLEAN THE TOILET",
            cleanliness: "CHECK THE TRASH CANS",
            entertainment: "CHECK THE COURT"
          }),
          available: Object.freeze({
            refreshment: "YOUR DRINK SHOP CAN HELP",
            safety: "YOUR LIFEGUARD CAN HELP",
            connectivity: "YOUR WI-FI CAN HELP",
            relief: "YOUR TOILET CAN HELP",
            cleanliness: "YOUR TRASH CANS CAN HELP",
            entertainment: "YOUR COURT CAN HELP"
          })
        })
      }),
      motives: Object.freeze({
        refreshment: "DRINKS",
        safety: "LIFEGUARD",
        connectivity: "WI-FI",
        relief: "TOILET",
        cleanliness: "TRASH CANS",
        entertainment: "VOLLEYBALL"
      }),
      summary: Object.freeze({
        mostUsed: "MOST POPULAR: {building} ×{count}",
        commercialRevenue: "YOU EARNED {amount}",
        missed: "NO {motive}: {count} BATHERS"
      })
    }),
    buildingSynergies: Object.freeze({
      title: "BUILDINGS WORK TOGETHER",
      drinksAndBins: "DRINKS + BINS: LESS TRASH",
      shadeAndDrinks: "SHADE + DRINKS: LONGER VISITS",
      safeVolleyball: "COURT + LIFEGUARD: SAFE FUN",
      maintainedToilet: "CLEAN TOILET: LONGER VISITS"
    }),
    cleanup: Object.freeze({
      title: "CLEAN THE BEACH?",
      summary: "{count} PIECES OF TRASH LEFT",
      conditions: Object.freeze({
        clean: "CLEAN",
        attention: "A LITTLE DIRTY",
        dirty: "DIRTY",
        critical: "VERY DIRTY"
      }),
      pay: Object.freeze({
        title: "PAY {amount} TO CLEAN",
        effect: "{count} TRASH TOMORROW"
      }),
      save: Object.freeze({
        title: "KEEP THE MONEY",
        effect: "{count} TRASH STAYS TOMORROW"
      }),
      report: Object.freeze({
        final: "DAY ENDS WITH {count} TRASH",
        paid: "YOU PAID {amount} TO CLEAN",
        saved: "YOU KEPT THE MONEY",
        condition: "THE BEACH IS {condition}",
        litter: "{debt} TRASH STAYS FOR TOMORROW",
        attractionPenalty: "A DIRTY BEACH BRINGS FEWER BATHERS",
        noAttractionPenalty: "A CLEAN BEACH KEEPS BATHERS COMING"
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
      scoreHistory: "DAY SCORES {scores}",
      scoreDay: "D{day} {rating}",
      scoreDayNoReviews: "D{day} —",
      money: "MONEY {amount}",
      bathers: "BATHERS {count}",
      buildings: "BUILDINGS {count}",
      nextTime: "NEXT TIME, ADD: {actions}",
      loved: "BATHERS LOVED IT!",
      actions: Object.freeze({
        drinks: "DRINKS",
        volleyball: "VOLLEYBALL",
        toilets: "TOILETS",
        wifi: "WI-FI",
        batherCare: "HELP FOR BATHERS"
      }),
      dayClosing: Object.freeze({
        publicFund: "CITY HELP +{amount}",
        dailyCosts: "BILLS PAID -{amount}",
        closed: "NO MONEY: {service} CLOSED",
        yesterdayRating: "TODAY {rating} STARS",
        reviewsCount: "{count} {label}",
        yesterdayNoReviews: "NO REVIEWS TODAY",
        runRating: "TOTAL {rating}",
        runRatingChange: "TOTAL {previous} {arrow} {rating}",
        servicesHelped: "GOOD CHOICE: {services}",
        helpedTarget: "YOU HELPED {count} PEOPLE COOL OFF!",
        helpedOne: "YOU HELPED {count} PERSON COOL OFF",
        helpedMany: "YOU HELPED {count} PEOPLE COOL OFF",
        review: "REVIEW",
        reviews: "REVIEWS",
        services: Object.freeze({
          lifeguard: "LIFEGUARD",
          toilet: "TOILET",
          trashCans: "TRASH CANS",
          volleyball: "VOLLEYBALL"
        }),
        problems: Object.freeze({
          "heat-without-beverage": "BATHERS NEED DRINKS!",
          "missing-entertainment": "BATHERS ARE BORED!",
          "missing-wifi": "BATHERS WANT WI-FI!",
          "missing-toilet": "BATHERS NEED TOILETS!",
          "visible-litter": "BATHERS SAW TOO MUCH LITTER!"
        })
      })
    }),
    feedback: Object.freeze({
      batherNeeds: Object.freeze({
        "heat-without-beverage": "NEEDS A DRINK!",
        "missing-entertainment": "IS BORED!",
        "missing-wifi": "WANTS WI-FI!",
        "missing-toilet": "NEEDS A TOILET!",
        "visible-litter": "THIS AREA IS FILTHY!",
        fallback: "BATHER IS UPSET!"
      }),
      beachProblems: Object.freeze({
        "heat-without-beverage": "BATHERS NEED DRINKS!",
        "missing-entertainment": "BATHERS ARE BORED!",
        "missing-wifi": "BATHERS WANT WI-FI!",
        "missing-toilet": "BATHERS NEED TOILETS!",
        "visible-litter": "BATHERS SAW TOO MUCH LITTER!",
        fallback: "BATHERS WERE UPSET!"
      }),
      pickup: Object.freeze({
        money: "+{amount}",
        moneyBonus: "+{amount} BONUS!",
        treasureArrived: "PIRATE TREASURE! CLICK FOR {amount}",
        treasureCoin: "TREASURE +{amount}",
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
          "lifeguard-building": "LIFEGUARD HELPED",
          "wifi-spot": "WI-FI HELPED",
          "toilet-building": "TOILET HELPED",
          "volleyball-court": "VOLLEYBALL WAS FUN",
          "sun-shade": "FOUND SHADE"
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
      entertainment: "Im bored, do some sports would be nice",
      wifi: "I need internet! Try the Wi-Fi spot!",
      toilet: "I need a toilet! Build one!",
      litter: "This area is filthy!",
      toiletLeaving: "No toilet. I'm leaving!",
      toleranceExhausted: "Too many problems. I'm leaving!",
      needLevel: "How much they need it"
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
        needsByMotive: Object.freeze({
          connectivity: "CONEXIÓN",
          relief: "UN BAÑO",
          entertainment: "JUGAR",
          heat: "REFRESCARSE"
        })
      }),
      gameModeAria: "Modo de juego: {mode}",
      modes: Object.freeze({
        live: "JUGAR",
        build: "CONSTRUIR"
      }),
      placement: Object.freeze({
        moveOverBeach: "MUÉVELO A LA PLAYA",
        spotBusy: "YA HAY ALGO AQUÍ",
        notWater: "PONLO EN EL AGUA",
        stayOnSand: "PONLO EN LA ARENA",
        useSunShadeRow: "PONLO CERCA DE LAS SOMBRILLAS",
        useGreenRow: "PONLO EN LA HIERBA"
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
      "sun-shade": Object.freeze({
        label: "Sombrilla"
      }),
      "beverage-store": Object.freeze({
        label: "Tienda de bebidas",
        description: "VENDES BEBIDAS. GANAS $1."
      }),
      "lifeguard-building": Object.freeze({
        label: "Puesto de salvavidas",
        description: "CUIDA A LOS BAÑISTAS. CUESTA $4 AL DÍA."
      }),
      "wifi-spot": Object.freeze({
        label: "Punto Wi-Fi",
        description: "USAN EL WI-FI. GANAS $1."
      }),
      "toilet-building": Object.freeze({
        label: "Baños",
        description: "DA UN BAÑO. CUESTA $3 AL DÍA."
      }),
      "trash-cans": Object.freeze({
        label: "Papeleras",
        description: "MENOS BASURA CAE EN LA ARENA."
      }),
      "volleyball-court": Object.freeze({
        label: "Cancha de voleibol",
        description: "MANTIENE FELICES A LOS BAÑISTAS."
      })
    }),
    start: Object.freeze({
      title: "BEACH SIMULATOR",
      loading: "CARGANDO...",
      pressStart: "PULSA START",
      chooseLanguage: "ELIGE TU IDIOMA",
      storyAria: "Escena de historia",
      storyImageAlt: "Una chica hablando ante un micrófono de podcast",
      storyBegin: "EMPEZAR",
      storyRatingLabel: "ESTRELLAS",
      storyPages: Object.freeze({
        welcome: "¡HEY OOO, HIJOS DE LA PLAYA! ¿QUIÉN ESTÁ LISTO PARA LA MEJOR TEMPORADA DEL AÑO?!",
        locations: "¡OH, SÍ! ESTE AÑO TENEMOS NUEVOS LUGARES PARA CONSEGUIR UN BRONCEADO BRUTAL, ¿SABEN LO QUE DIGO?!",
        competition: "¡¡¡ASÍ QUE QUIÉN VA A GANAR LA MEJOR PLAYA DEL VERANO!!! ¡UH LA LA!",
        ratingBefore: "RECUERDEN, LA GENTE QUIERE DIVERTIRSE. CUANTAS MÁS ",
        ratingAfter: " CONSIGAN, ¡MEJOR!",
        goodLuck: "¡BUENA SUERTE, BEACH BOSS SIX SEVEN AURA FARMER!"
      }),
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
      batherNotice: "LOS BAÑISTAS FELICES TE DAN MÁS ESTRELLAS."
    }),
    tasks: Object.freeze({
      ariaLabel: "Tareas",
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
      buildingsUnlocked: "AHORA PUEDES CONSTRUIR: {buildings}",
      leaderboard: Object.freeze({
        eyebrow: "RESULTADOS DEL VERANO",
        title: "RANKING DE PLAYAS",
        yourScore: "TU NOTA EN ESTRELLAS",
        connecting: "CONECTANDO...",
        worldTitle: "TOP 5 MUNDIAL",
        personalTitle: "TUS MEJORES PARTIDAS",
        platformTitle: "RANKING DE LA PLATAFORMA",
        scale: "ESTRELLAS",
        loading: "BUSCANDO EL RANKING...",
        playerFallback: "JUGADOR",
        reviewCountOne: "{count} RESEÑA",
        reviewCount: "{count} RESEÑAS",
        namePlaceholder: "NOMBRE O INICIALES",
        nameAria: "Nombre o iniciales del jugador",
        saveScore: "GUARDAR",
        openRanking: "ABRIR RANKING",
        saveHelp: "GUARDA ESTA PARTIDA EN ESTE DISPOSITIVO.",
        submitFailed: "RANKING MUNDIAL SIN CONEXIÓN. GUÁRDALO AQUÍ.",
        scoreSaved: "¡PUNTUACIÓN GUARDADA!",
        empty: "TODAVÍA NO HAY PUNTUACIONES.",
        loadFailed: "PUNTUACIÓN ENVIADA. NO SE PUDO CARGAR EL RANKING.",
        nativePopupHelp: "PUNTUACIÓN ENVIADA. ABRE EL RANKING.",
        nativeManaged: "PUNTUACIÓN ENVIADA. LA PLATAFORMA MUESTRA EL RANKING.",
        scoreSubmittedAs: "PUNTUACIÓN ENVIADA COMO {name}.",
        scoreSubmitted: "PUNTUACIÓN ENVIADA AL RANKING MUNDIAL.",
        saveFailed: "NO SE PUDO GUARDAR LA PUNTUACIÓN.",
        openFailed: "NO SE PUDO ABRIR EL RANKING."
      }),
      problems: Object.freeze({
        title: "QUÉ SALIÓ MAL",
        heat: "MUCHOS BAÑISTAS TUVIERON CALOR",
        litter: "HUBO DEMASIADA BASURA",
        entertainment: "LOS BAÑISTAS SE ABURRIERON",
        sharkRisk: "NO HABÍA SOCORRISTA PARA EL TIBURÓN",
        none: "TODO SALIÓ BIEN"
      })
    }),
    demand: Object.freeze({
      title: "OBJETIVO DE HOY",
      focus: Object.freeze({
        hotDay: "HOY HACE MUCHO CALOR",
        dirtyBeach: "LA PLAYA ESTÁ SUCIA",
        needs: Object.freeze({
          refreshment: "LOS BAÑISTAS TENDRÁN SED",
          safety: "CUIDA A LOS BAÑISTAS",
          connectivity: "LOS BAÑISTAS QUIEREN WI-FI",
          relief: "NECESITAN UN BAÑO",
          cleanliness: "MANTÉN LA PLAYA LIMPIA",
          entertainment: "LOS BAÑISTAS QUIEREN JUGAR"
        }),
        actions: Object.freeze({
          pickUpTrash: "RECOGE LA BASURA",
          missing: Object.freeze({
            refreshment: "CONSTRUYE UNA TIENDA DE BEBIDAS",
            safety: "PON UN SOCORRISTA",
            connectivity: "PON UN PUNTO WI-FI",
            relief: "CONSTRUYE UN BAÑO",
            cleanliness: "PON PAPELERAS",
            entertainment: "CONSTRUYE UNA CANCHA"
          }),
          degraded: Object.freeze({
            refreshment: "REVISA LA TIENDA",
            safety: "PAGA AL SOCORRISTA",
            connectivity: "REVISA EL WI-FI",
            relief: "LIMPIA EL BAÑO",
            cleanliness: "REVISA LAS PAPELERAS",
            entertainment: "REVISA LA CANCHA"
          }),
          available: Object.freeze({
            refreshment: "TU TIENDA PUEDE AYUDAR",
            safety: "TU SOCORRISTA PUEDE AYUDAR",
            connectivity: "TU WI-FI PUEDE AYUDAR",
            relief: "TU BAÑO PUEDE AYUDAR",
            cleanliness: "TUS PAPELERAS PUEDEN AYUDAR",
            entertainment: "TU CANCHA PUEDE AYUDAR"
          })
        })
      }),
      motives: Object.freeze({
        refreshment: "BEBIDAS",
        safety: "SOCORRISTA",
        connectivity: "WI-FI",
        relief: "BAÑO",
        cleanliness: "PAPELERAS",
        entertainment: "VOLEIBOL"
      }),
      summary: Object.freeze({
        mostUsed: "MÁS POPULAR: {building} ×{count}",
        commercialRevenue: "GANASTE {amount}",
        missed: "SIN {motive}: {count} BAÑISTAS"
      })
    }),
    buildingSynergies: Object.freeze({
      title: "LOS EDIFICIOS SE AYUDAN",
      drinksAndBins: "BEBIDAS + PAPELERAS: MENOS BASURA",
      shadeAndDrinks: "SOMBRA + BEBIDAS: VISITAS MÁS LARGAS",
      safeVolleyball: "CANCHA + SOCORRISTA: JUEGO SEGURO",
      maintainedToilet: "BAÑO LIMPIO: VISITAS MÁS LARGAS"
    }),
    cleanup: Object.freeze({
      title: "¿LIMPIAR LA PLAYA?",
      summary: "QUEDAN {count} BASURAS",
      conditions: Object.freeze({
        clean: "LIMPIA",
        attention: "UN POCO SUCIA",
        dirty: "SUCIA",
        critical: "MUY SUCIA"
      }),
      pay: Object.freeze({
        title: "PAGA {amount} PARA LIMPIAR",
        effect: "{count} BASURAS MAÑANA"
      }),
      save: Object.freeze({
        title: "GUARDA EL DINERO",
        effect: "QUEDAN {count} BASURAS MAÑANA"
      }),
      report: Object.freeze({
        final: "EL DÍA TERMINA CON {count} BASURAS",
        paid: "PAGASTE {amount} PARA LIMPIAR",
        saved: "GUARDASTE EL DINERO",
        condition: "LA PLAYA ESTÁ {condition}",
        litter: "QUEDAN {debt} BASURAS PARA MAÑANA",
        attractionPenalty: "UNA PLAYA SUCIA TRAE MENOS BAÑISTAS",
        noAttractionPenalty: "UNA PLAYA LIMPIA ATRAE BAÑISTAS"
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
      scoreHistory: "PUNTOS POR DÍA {scores}",
      scoreDay: "D{day} {rating}",
      scoreDayNoReviews: "D{day} —",
      money: "DINERO {amount}",
      bathers: "BAÑISTAS {count}",
      buildings: "CONSTRUCCIONES {count}",
      nextTime: "LA PRÓXIMA VEZ, AÑADE: {actions}",
      loved: "¡A LOS BAÑISTAS LES ENCANTÓ!",
      actions: Object.freeze({
        drinks: "BEBIDAS",
        volleyball: "VOLEIBOL",
        toilets: "BAÑOS",
        wifi: "WI-FI",
        batherCare: "AYUDA PARA BAÑISTAS"
      }),
      dayClosing: Object.freeze({
        publicFund: "AYUDA DE LA CIUDAD +{amount}",
        dailyCosts: "CUENTAS PAGADAS -{amount}",
        closed: "SIN DINERO: {service} CERRADO",
        yesterdayRating: "HOY {rating} ESTRELLAS",
        reviewsCount: "{count} {label}",
        yesterdayNoReviews: "HOY NO HUBO RESEÑAS",
        runRating: "TOTAL {rating}",
        runRatingChange: "TOTAL {previous} {arrow} {rating}",
        servicesHelped: "BUENA ELECCIÓN: {services}",
        helpedTarget: "¡AYUDASTE A {count} PERSONAS A REFRESCARSE!",
        helpedOne: "AYUDASTE A {count} PERSONA A REFRESCARSE",
        helpedMany: "AYUDASTE A {count} PERSONAS A REFRESCARSE",
        review: "RESEÑA",
        reviews: "RESEÑAS",
        services: Object.freeze({
          lifeguard: "SALVAVIDAS",
          toilet: "BAÑO",
          trashCans: "PAPELERAS",
          volleyball: "VOLEIBOL"
        }),
        problems: Object.freeze({
          "heat-without-beverage": "¡LOS BAÑISTAS NECESITAN BEBIDAS!",
          "missing-entertainment": "¡LOS BAÑISTAS ESTÁN ABURRIDOS!",
          "missing-wifi": "¡LOS BAÑISTAS QUIEREN WI-FI!",
          "missing-toilet": "¡LOS BAÑISTAS NECESITAN BAÑOS!",
          "visible-litter": "¡LOS BAÑISTAS VIERON DEMASIADA BASURA!"
        })
      })
    }),
    feedback: Object.freeze({
      batherNeeds: Object.freeze({
        "heat-without-beverage": "¡NECESITA UNA BEBIDA!",
        "missing-entertainment": "¡ESTÁ ABURRIDO!",
        "missing-wifi": "¡QUIERE WI-FI!",
        "missing-toilet": "¡NECESITA UN BAÑO!",
        "visible-litter": "¡ESTA ZONA ESTÁ SUCIA!",
        fallback: "¡EL BAÑISTA ESTÁ MOLESTO!"
      }),
      beachProblems: Object.freeze({
        "heat-without-beverage": "¡LOS BAÑISTAS NECESITAN BEBIDAS!",
        "missing-entertainment": "¡LOS BAÑISTAS ESTÁN ABURRIDOS!",
        "missing-wifi": "¡LOS BAÑISTAS QUIEREN WI-FI!",
        "missing-toilet": "¡LOS BAÑISTAS NECESITAN BAÑOS!",
        "visible-litter": "¡LOS BAÑISTAS VIERON DEMASIADA BASURA!",
        fallback: "¡LOS BAÑISTAS ESTÁN MOLESTOS!"
      }),
      pickup: Object.freeze({
        money: "+{amount}",
        moneyBonus: "+{amount} ¡BONIFICACIÓN!",
        treasureArrived: "¡TESORO PIRATA! HAZ CLIC POR {amount}",
        treasureCoin: "TESORO +{amount}",
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
          "lifeguard-building": "EL SOCORRISTA AYUDÓ",
          "wifi-spot": "EL WI-FI AYUDÓ",
          "toilet-building": "EL BAÑO AYUDÓ",
          "volleyball-court": "EL VOLEIBOL FUE DIVERTIDO",
          "sun-shade": "ENCONTRÓ SOMBRA"
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
      litter: "¡Esta zona está sucia!",
      toiletLeaving: "¡No hay baño! ¡Me voy!",
      toleranceExhausted: "¡Hay demasiados problemas! ¡Me voy!",
      needLevel: "Cuánto lo necesita"
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
        needsByMotive: Object.freeze({
          connectivity: "CONEXÃO",
          relief: "UM BANHEIRO",
          entertainment: "BRINCAR",
          heat: "SE REFRESCAR"
        })
      }),
      gameModeAria: "Modo de jogo: {mode}",
      modes: Object.freeze({
        live: "JOGAR",
        build: "CONSTRUIR"
      }),
      placement: Object.freeze({
        moveOverBeach: "MOVA PARA A PRAIA",
        spotBusy: "JÁ TEM ALGO AQUI",
        notWater: "COLOQUE NA ÁGUA",
        stayOnSand: "COLOQUE NA AREIA",
        useSunShadeRow: "COLOQUE PERTO DOS GUARDA-SÓIS",
        useGreenRow: "COLOQUE NA GRAMA"
      })
    }),
    common: Object.freeze({
      up: "UP",
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
      "sun-shade": Object.freeze({
        label: "Guarda-sol"
      }),
      "beverage-store": Object.freeze({
        label: "Loja de bebidas",
        description: "VENDA BEBIDAS. GANHE $1."
      }),
      "lifeguard-building": Object.freeze({
        label: "Posto de salva-vidas",
        description: "PROTEGE OS BANHISTAS. CUSTA $4 POR DIA."
      }),
      "wifi-spot": Object.freeze({
        label: "Ponto de Wi-Fi",
        description: "ELES USAM WI-FI. GANHE $1."
      }),
      "toilet-building": Object.freeze({
        label: "Banheiros",
        description: "DÁ UM BANHEIRO. CUSTA $3 POR DIA."
      }),
      "trash-cans": Object.freeze({
        label: "Lixeiras",
        description: "MENOS LIXO CAI NA AREIA."
      }),
      "volleyball-court": Object.freeze({
        label: "Quadra de vôlei",
        description: "DEIXA OS BANHISTAS FELIZES."
      })
    }),
    start: Object.freeze({
      title: "BEACH SIMULATOR",
      loading: "CARREGANDO...",
      pressStart: "PRESSIONE START",
      chooseLanguage: "ESCOLHA SEU IDIOMA",
      storyAria: "Cena da história",
      storyImageAlt: "Uma garota falando em um microfone de podcast",
      storyBegin: "COMEÇAR",
      storyRatingLabel: "ESTRELAS",
      storyPages: Object.freeze({
        welcome: "EI OOO, FILHOS DA PRAIA! QUEM ESTÁ PRONTO PARA A MELHOR ESTAÇÃO DO ANO?!",
        locations: "AH, SIM! ESTE ANO TEMOS NOVOS LUGARES PARA PEGAR AQUELE BRONZE INSANO, TÁ LIGADO!",
        competition: "ENTÃO, QUEM VAI GANHAR A MELHOR PRAIA DO VERÃO!!! UH LA LA!",
        ratingBefore: "LEMBREM-SE, AS PESSOAS QUEREM SE DIVERTIR. QUANTO MAIS ",
        ratingAfter: " VOCÊS CONSEGUIREM, MELHOR!",
        goodLuck: "BOA SORTE, SEU BEACH BOSS SIX SEVEN AURA FARMER!"
      }),
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
      batherNotice: "BANHISTAS FELIZES DÃO MAIS ESTRELAS."
    }),
    tasks: Object.freeze({
      ariaLabel: "Tarefas",
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
      buildingsUnlocked: "AGORA VOCÊ PODE CONSTRUIR: {buildings}",
      leaderboard: Object.freeze({
        eyebrow: "RESULTADOS DO VERÃO",
        title: "RANKING DAS PRAIAS",
        yourScore: "SUA NOTA EM ESTRELAS",
        connecting: "CONECTANDO...",
        worldTitle: "TOP 5 MUNDIAL",
        personalTitle: "SUAS MELHORES PARTIDAS",
        platformTitle: "RANKING DA PLATAFORMA",
        scale: "ESTRELAS",
        loading: "BUSCANDO O RANKING...",
        playerFallback: "JOGADOR",
        reviewCountOne: "{count} AVALIAÇÃO",
        reviewCount: "{count} AVALIAÇÕES",
        namePlaceholder: "NOME OU INICIAIS",
        nameAria: "Nome ou iniciais do jogador",
        saveScore: "SALVAR NOTA",
        openRanking: "ABRIR RANKING",
        saveHelp: "SALVE ESTA PARTIDA NESTE DISPOSITIVO.",
        submitFailed: "RANKING MUNDIAL OFFLINE. SALVE AQUI.",
        scoreSaved: "NOTA SALVA!",
        empty: "AINDA NÃO HÁ NOTAS.",
        loadFailed: "NOTA ENVIADA. NÃO FOI POSSÍVEL CARREGAR O RANKING.",
        nativePopupHelp: "NOTA ENVIADA. ABRA O RANKING DA PLATAFORMA.",
        nativeManaged: "NOTA ENVIADA. A PLATAFORMA MOSTRA O RANKING.",
        scoreSubmittedAs: "NOTA ENVIADA COMO {name}.",
        scoreSubmitted: "NOTA ENVIADA AO RANKING MUNDIAL.",
        saveFailed: "NÃO FOI POSSÍVEL SALVAR A NOTA.",
        openFailed: "NÃO FOI POSSÍVEL ABRIR O RANKING."
      }),
      problems: Object.freeze({
        title: "O QUE DEU ERRADO",
        heat: "MUITOS BANHISTAS SENTIRAM CALOR",
        litter: "TINHA LIXO DEMAIS",
        entertainment: "OS BANHISTAS FICARAM ENTEDIADOS",
        sharkRisk: "NÃO TINHA SALVA-VIDAS PARA O TUBARÃO",
        none: "DEU TUDO CERTO"
      })
    }),
    demand: Object.freeze({
      title: "FOCO DE HOJE",
      focus: Object.freeze({
        hotDay: "HOJE ESTÁ MUITO QUENTE",
        dirtyBeach: "A PRAIA ESTÁ SUJA",
        needs: Object.freeze({
          refreshment: "OS BANHISTAS TERÃO SEDE",
          safety: "CUIDE DOS BANHISTAS",
          connectivity: "OS BANHISTAS QUEREM WI-FI",
          relief: "ELES PRECISAM DE BANHEIRO",
          cleanliness: "MANTENHA A PRAIA LIMPA",
          entertainment: "OS BANHISTAS QUEREM BRINCAR"
        }),
        actions: Object.freeze({
          pickUpTrash: "RECOLHA O LIXO",
          missing: Object.freeze({
            refreshment: "CONSTRUA UMA LOJA DE BEBIDAS",
            safety: "COLOQUE UM SALVA-VIDAS",
            connectivity: "COLOQUE UM PONTO DE WI-FI",
            relief: "CONSTRUA UM BANHEIRO",
            cleanliness: "COLOQUE LIXEIRAS",
            entertainment: "CONSTRUA UMA QUADRA"
          }),
          degraded: Object.freeze({
            refreshment: "VEJA A LOJA DE BEBIDAS",
            safety: "PAGUE O SALVA-VIDAS",
            connectivity: "VEJA O WI-FI",
            relief: "LIMPE O BANHEIRO",
            cleanliness: "VEJA AS LIXEIRAS",
            entertainment: "VEJA A QUADRA"
          }),
          available: Object.freeze({
            refreshment: "SUA LOJA PODE AJUDAR",
            safety: "O SALVA-VIDAS PODE AJUDAR",
            connectivity: "SEU WI-FI PODE AJUDAR",
            relief: "SEU BANHEIRO PODE AJUDAR",
            cleanliness: "SUAS LIXEIRAS PODEM AJUDAR",
            entertainment: "SUA QUADRA PODE AJUDAR"
          })
        })
      }),
      motives: Object.freeze({
        refreshment: "BEBIDAS",
        safety: "SALVA-VIDAS",
        connectivity: "WI-FI",
        relief: "BANHEIRO",
        cleanliness: "LIXEIRAS",
        entertainment: "VÔLEI"
      }),
      summary: Object.freeze({
        mostUsed: "MAIS POPULAR: {building} ×{count}",
        commercialRevenue: "VOCÊ GANHOU {amount}",
        missed: "SEM {motive}: {count} BANHISTAS"
      })
    }),
    buildingSynergies: Object.freeze({
      title: "CONSTRUÇÕES SE AJUDAM",
      drinksAndBins: "BEBIDAS + LIXEIRAS: MENOS LIXO",
      shadeAndDrinks: "SOMBRA + BEBIDAS: VISITAS MAIORES",
      safeVolleyball: "QUADRA + SALVA-VIDAS: JOGO SEGURO",
      maintainedToilet: "BANHEIRO LIMPO: VISITAS MAIORES"
    }),
    cleanup: Object.freeze({
      title: "LIMPAR A PRAIA?",
      summary: "RESTAM {count} LIXOS",
      conditions: Object.freeze({
        clean: "LIMPA",
        attention: "UM POUCO SUJA",
        dirty: "SUJA",
        critical: "MUITO SUJA"
      }),
      pay: Object.freeze({
        title: "PAGUE {amount} PARA LIMPAR",
        effect: "{count} LIXOS AMANHÃ"
      }),
      save: Object.freeze({
        title: "GUARDE O DINHEIRO",
        effect: "{count} LIXOS FICAM PARA AMANHÃ"
      }),
      report: Object.freeze({
        final: "O DIA TERMINA COM {count} LIXOS",
        paid: "VOCÊ PAGOU {amount} PARA LIMPAR",
        saved: "VOCÊ GUARDOU O DINHEIRO",
        condition: "A PRAIA ESTÁ {condition}",
        litter: "{debt} LIXOS FICAM PARA AMANHÃ",
        attractionPenalty: "PRAIA SUJA TRAZ MENOS BANHISTAS",
        noAttractionPenalty: "PRAIA LIMPA ATRAI BANHISTAS"
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
      scoreHistory: "NOTAS POR DIA {scores}",
      scoreDay: "D{day} {rating}",
      scoreDayNoReviews: "D{day} —",
      money: "DINHEIRO {amount}",
      bathers: "BANHISTAS {count}",
      buildings: "CONSTRUÇÕES {count}",
      nextTime: "DA PRÓXIMA VEZ, COLOQUE: {actions}",
      loved: "OS BANHISTAS ADORARAM!",
      actions: Object.freeze({
        drinks: "BEBIDAS",
        volleyball: "VÔLEI",
        toilets: "BANHEIROS",
        wifi: "WI-FI",
        batherCare: "AJUDA PARA BANHISTAS"
      }),
      dayClosing: Object.freeze({
        publicFund: "AJUDA DA CIDADE +{amount}",
        dailyCosts: "CONTAS PAGAS -{amount}",
        closed: "SEM DINHEIRO: {service} FECHADO",
        yesterdayRating: "HOJE {rating} ESTRELAS",
        reviewsCount: "{count} {label}",
        yesterdayNoReviews: "SEM AVALIAÇÕES HOJE",
        runRating: "TOTAL {rating}",
        runRatingChange: "TOTAL {previous} {arrow} {rating}",
        servicesHelped: "BOA ESCOLHA: {services}",
        helpedTarget: "VOCÊ AJUDOU {count} PESSOAS A SE REFRESCAREM!",
        helpedOne: "VOCÊ AJUDOU {count} PESSOA A SE REFRESCAR",
        helpedMany: "VOCÊ AJUDOU {count} PESSOAS A SE REFRESCAREM",
        review: "AVALIAÇÃO",
        reviews: "AVALIAÇÕES",
        services: Object.freeze({
          lifeguard: "SALVA-VIDAS",
          toilet: "BANHEIRO",
          trashCans: "LIXEIRAS",
          volleyball: "VÔLEI"
        }),
        problems: Object.freeze({
          "heat-without-beverage": "OS BANHISTAS PRECISAM DE BEBIDAS!",
          "missing-entertainment": "OS BANHISTAS ESTÃO ENTEDIADOS!",
          "missing-wifi": "OS BANHISTAS QUEREM WI-FI!",
          "missing-toilet": "OS BANHISTAS PRECISAM DE BANHEIROS!",
          "visible-litter": "OS BANHISTAS VIRAM LIXO DEMAIS!"
        })
      })
    }),
    feedback: Object.freeze({
      batherNeeds: Object.freeze({
        "heat-without-beverage": "PRECISA DE UMA BEBIDA!",
        "missing-entertainment": "ESTÁ ENTEDIADO!",
        "missing-wifi": "QUER WI-FI!",
        "missing-toilet": "PRECISA DE UM BANHEIRO!",
        "visible-litter": "ESTA ÁREA ESTÁ SUJA!",
        fallback: "O BANHISTA ESTÁ IRRITADO!"
      }),
      beachProblems: Object.freeze({
        "heat-without-beverage": "OS BANHISTAS PRECISAM DE BEBIDAS!",
        "missing-entertainment": "OS BANHISTAS ESTÃO ENTEDIADOS!",
        "missing-wifi": "OS BANHISTAS QUEREM WI-FI!",
        "missing-toilet": "OS BANHISTAS PRECISAM DE BANHEIROS!",
        "visible-litter": "OS BANHISTAS VIRAM LIXO DEMAIS!",
        fallback: "OS BANHISTAS ESTÃO IRRITADOS!"
      }),
      pickup: Object.freeze({
        money: "+{amount}",
        moneyBonus: "+{amount} BÔNUS!",
        treasureArrived: "TESOURO DO PIRATA! CLIQUE POR {amount}",
        treasureCoin: "TESOURO +{amount}",
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
          "lifeguard-building": "O SALVA-VIDAS AJUDOU",
          "wifi-spot": "O WI-FI AJUDOU",
          "toilet-building": "O BANHEIRO AJUDOU",
          "volleyball-court": "O VÔLEI FOI DIVERTIDO",
          "sun-shade": "ACHOU SOMBRA"
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
      litter: "Esta área está suja!",
      toiletLeaving: "Não tem banheiro. Vou embora!",
      toleranceExhausted: "Problemas demais. Vou embora!",
      needLevel: "O quanto precisa"
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
        needsByMotive: Object.freeze({
          connectivity: "VERBINDUNG",
          relief: "EIN WC",
          entertainment: "SPIELEN",
          heat: "ABKÜHLUNG"
        })
      }),
      gameModeAria: "Spielmodus: {mode}",
      modes: Object.freeze({
        live: "SPIEL",
        build: "BAUEN"
      }),
      placement: Object.freeze({
        moveOverBeach: "BEWEGE ES ZUM STRAND",
        spotBusy: "HIER STEHT SCHON ETWAS",
        notWater: "STELLE ES INS WASSER",
        stayOnSand: "STELLE ES AUF DEN SAND",
        useSunShadeRow: "STELLE ES ZU DEN SCHIRMEN",
        useGreenRow: "STELLE ES INS GRAS"
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
      "sun-shade": Object.freeze({
        label: "Sonnenschirm"
      }),
      "beverage-store": Object.freeze({
        label: "Getränkeladen",
        description: "VERKAUFE GETRÄNKE. DU BEKOMMST $1."
      }),
      "lifeguard-building": Object.freeze({
        label: "Rettungswache",
        description: "SCHÜTZT DIE GÄSTE. KOSTET $4 PRO TAG."
      }),
      "wifi-spot": Object.freeze({
        label: "WLAN-Punkt",
        description: "GÄSTE NUTZEN WLAN. DU BEKOMMST $1."
      }),
      "toilet-building": Object.freeze({
        label: "Toiletten",
        description: "GIBT GÄSTEN EIN WC. KOSTET $3 PRO TAG."
      }),
      "trash-cans": Object.freeze({
        label: "Mülleimer",
        description: "WENIGER MÜLL LANDET IM SAND."
      }),
      "volleyball-court": Object.freeze({
        label: "Volleyballplatz",
        description: "MACHT DIE GÄSTE GLÜCKLICH."
      })
    }),
    start: Object.freeze({
      title: "BEACH SIMULATOR",
      loading: "LADEN...",
      pressStart: "START DRÜCKEN",
      chooseLanguage: "SPRACHE WÄHLEN",
      storyAria: "Geschichtsszene",
      storyImageAlt: "Ein Mädchen spricht in ein Podcast-Mikrofon",
      storyBegin: "BEGINNEN",
      storyRatingLabel: "STERNE",
      storyPages: Object.freeze({
        welcome: "HEY OOO, KINDER DES STRANDES! WER IST BEREIT FÜR DIE BESTE JAHRESZEIT?!",
        locations: "OH JA! DIESES JAHR GIBT ES NEUE ORTE FÜR EINE RICHTIG KRASSE BRÄUNE, WISST IHR, WAS ICH MEINE?!",
        competition: "WER GEWINNT ALSO DEN TITEL BESTER STRAND DES SOMMERS!!! UH LA LA!",
        ratingBefore: "DENKT DARAN: DIE LEUTE WOLLEN SPASS. JE MEHR ",
        ratingAfter: " IHR BEKOMMT, DESTO BESSER!",
        goodLuck: "VIEL GLÜCK, BEACH BOSS SIX SEVEN AURA FARMER!"
      }),
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
      batherNotice: "GLÜCKLICHE GÄSTE GEBEN MEHR STERNE."
    }),
    tasks: Object.freeze({
      ariaLabel: "Aufgaben",
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
      buildingsUnlocked: "JETZT KANNST DU BAUEN: {buildings}",
      leaderboard: Object.freeze({
        eyebrow: "SOMMERERGEBNIS",
        title: "STRAND-RANGLISTE",
        yourScore: "DEINE STERNEBEWERTUNG",
        connecting: "VERBINDEN...",
        worldTitle: "WELTWEITE TOP 5",
        personalTitle: "DEINE BESTEN RUNDEN",
        platformTitle: "PLATTFORM-RANGLISTE",
        scale: "STERNE",
        loading: "RANGLISTE WIRD GELADEN...",
        playerFallback: "SPIELER",
        reviewCountOne: "{count} BEWERTUNG",
        reviewCount: "{count} BEWERTUNGEN",
        namePlaceholder: "NAME ODER INITIALEN",
        nameAria: "Name oder Initialen des Spielers",
        saveScore: "WERT SPEICHERN",
        openRanking: "RANGLISTE ÖFFNEN",
        saveHelp: "SPEICHERE DIESE RUNDE AUF DIESEM GERÄT.",
        submitFailed: "WELTRANGLISTE OFFLINE. HIER SPEICHERN.",
        scoreSaved: "WERT GESPEICHERT!",
        empty: "NOCH KEINE WERTE.",
        loadFailed: "WERT GESENDET. RANGLISTE KONNTE NICHT LADEN.",
        nativePopupHelp: "WERT GESENDET. ÖFFNE DIE RANGLISTE.",
        nativeManaged: "WERT GESENDET. DIE PLATTFORM ZEIGT DIE RANGLISTE.",
        scoreSubmittedAs: "WERT ALS {name} GESENDET.",
        scoreSubmitted: "WERT AN DIE WELTRANGLISTE GESENDET.",
        saveFailed: "WERT KONNTE NICHT GESPEICHERT WERDEN.",
        openFailed: "RANGLISTE KONNTE NICHT GEÖFFNET WERDEN."
      }),
      problems: Object.freeze({
        title: "WAS SCHIEF GING",
        heat: "VIELE GÄSTE HATTEN ZU HEISS",
        litter: "ES LAG ZU VIEL MÜLL HERUM",
        entertainment: "DIE GÄSTE LANGWEILTEN SICH",
        sharkRisk: "KEIN RETTER BEIM HAI",
        none: "ALLES LIEF GUT"
      })
    }),
    demand: Object.freeze({
      title: "HEUTE WICHTIG",
      focus: Object.freeze({
        hotDay: "ES IST SEHR HEISS",
        dirtyBeach: "DER STRAND IST SCHMUTZIG",
        needs: Object.freeze({
          refreshment: "DIE GÄSTE HABEN DURST",
          safety: "PASS AUF DIE GÄSTE AUF",
          connectivity: "DIE GÄSTE WOLLEN WI-FI",
          relief: "DIE GÄSTE BRAUCHEN EIN WC",
          cleanliness: "HALTE DEN STRAND SAUBER",
          entertainment: "DIE GÄSTE WOLLEN SPIELEN"
        }),
        actions: Object.freeze({
          pickUpTrash: "SAMMLE DEN MÜLL AUF",
          missing: Object.freeze({
            refreshment: "BAUE EINEN GETRÄNKESTAND",
            safety: "HOL EINEN RETTUNGSSCHWIMMER",
            connectivity: "BAUE EINEN WI-FI-PUNKT",
            relief: "BAUE EIN WC",
            cleanliness: "STELLE MÜLLEIMER AUF",
            entertainment: "BAUE EIN VOLLEYBALLFELD"
          }),
          degraded: Object.freeze({
            refreshment: "PRÜFE DEN GETRÄNKESTAND",
            safety: "BEZAHLE DEN RETTUNGSSCHWIMMER",
            connectivity: "PRÜFE DAS WI-FI",
            relief: "PUTZE DAS WC",
            cleanliness: "PRÜFE DIE MÜLLEIMER",
            entertainment: "PRÜFE DAS SPIELFELD"
          }),
          available: Object.freeze({
            refreshment: "DEIN GETRÄNKESTAND HILFT",
            safety: "DEIN RETTUNGSSCHWIMMER HILFT",
            connectivity: "DEIN WI-FI HILFT",
            relief: "DEIN WC HILFT",
            cleanliness: "DEINE MÜLLEIMER HELFEN",
            entertainment: "DEIN SPIELFELD HILFT"
          })
        })
      }),
      motives: Object.freeze({
        refreshment: "GETRÄNKE",
        safety: "RETTUNGSSCHWIMMER",
        connectivity: "WLAN",
        relief: "WC",
        cleanliness: "MÜLLEIMER",
        entertainment: "VOLLEYBALL"
      }),
      summary: Object.freeze({
        mostUsed: "AM BELIEBTESTEN: {building} ×{count}",
        commercialRevenue: "DU HAST {amount} VERDIENT",
        missed: "KEIN {motive}: {count} GÄSTE"
      })
    }),
    buildingSynergies: Object.freeze({
      title: "GEBÄUDE HELFEN EINANDER",
      drinksAndBins: "GETRÄNKE + MÜLLEIMER: WENIGER MÜLL",
      shadeAndDrinks: "SCHATTEN + GETRÄNKE: LÄNGERE BESUCHE",
      safeVolleyball: "SPIELFELD + RETTER: SICHERER SPASS",
      maintainedToilet: "SAUBERES WC: LÄNGERE BESUCHE"
    }),
    cleanup: Object.freeze({
      title: "STRAND SAUBER MACHEN?",
      summary: "{count} MÜLLSTÜCKE SIND ÜBRIG",
      conditions: Object.freeze({
        clean: "SAUBER",
        attention: "ETWAS SCHMUTZIG",
        dirty: "SCHMUTZIG",
        critical: "SEHR SCHMUTZIG"
      }),
      pay: Object.freeze({
        title: "{amount} FÜRS PUTZEN",
        effect: "{count} MÜLL MORGEN"
      }),
      save: Object.freeze({
        title: "GELD BEHALTEN",
        effect: "{count} MÜLL BLEIBT BIS MORGEN"
      }),
      report: Object.freeze({
        final: "AM ENDE LIEGEN {count} MÜLLSTÜCKE",
        paid: "DU HAST {amount} FÜRS PUTZEN BEZAHLT",
        saved: "DU HAST DAS GELD BEHALTEN",
        condition: "DER STRAND IST {condition}",
        litter: "{debt} MÜLL BLEIBT BIS MORGEN",
        attractionPenalty: "EIN DRECKIGER STRAND BRINGT WENIGER GÄSTE",
        noAttractionPenalty: "EIN SAUBERER STRAND BRINGT MEHR GÄSTE"
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
      scoreHistory: "STERNE PRO TAG {scores}",
      scoreDay: "T{day} {rating}",
      scoreDayNoReviews: "T{day} —",
      money: "GELD {amount}",
      bathers: "BADEGÄSTE {count}",
      buildings: "GEBÄUDE {count}",
      nextTime: "BAUE NÄCHSTES MAL: {actions}",
      loved: "DIE BADEGÄSTE LIEBTEN ES!",
      actions: Object.freeze({
        drinks: "GETRÄNKE",
        volleyball: "VOLLEYBALL",
        toilets: "TOILETTEN",
        wifi: "WLAN",
        batherCare: "HILFE FÜR GÄSTE"
      }),
      dayClosing: Object.freeze({
        publicFund: "HILFE DER STADT +{amount}",
        dailyCosts: "RECHNUNGEN BEZAHLT -{amount}",
        closed: "KEIN GELD: {service} GESCHLOSSEN",
        yesterdayRating: "HEUTE {rating} STERNE",
        reviewsCount: "{count} {label}",
        yesterdayNoReviews: "HEUTE KEINE BEWERTUNGEN",
        runRating: "GESAMT {rating}",
        runRatingChange: "GESAMT {previous} {arrow} {rating}",
        servicesHelped: "GUTE WAHL: {services}",
        helpedTarget: "DU HAST {count} BADEGÄSTEN GEHOLFEN, SICH ABZUKÜHLEN!",
        helpedOne: "DU HAST {count} BADEGAST GEHOLFEN, SICH ABZUKÜHLEN",
        helpedMany: "DU HAST {count} BADEGÄSTEN GEHOLFEN, SICH ABZUKÜHLEN",
        review: "BEWERTUNG",
        reviews: "BEWERTUNGEN",
        services: Object.freeze({
          lifeguard: "RETTUNGSWACHE",
          toilet: "TOILETTE",
          trashCans: "MÜLLEIMER",
          volleyball: "VOLLEYBALL"
        }),
        problems: Object.freeze({
          "heat-without-beverage": "DIE BADEGÄSTE BRAUCHEN GETRÄNKE!",
          "missing-entertainment": "DIE BADEGÄSTE LANGWEILEN SICH!",
          "missing-wifi": "DIE BADEGÄSTE WOLLEN WLAN!",
          "missing-toilet": "DIE BADEGÄSTE BRAUCHEN TOILETTEN!",
          "visible-litter": "DIE BADEGÄSTE SAHEN ZU VIEL MÜLL!"
        })
      })
    }),
    feedback: Object.freeze({
      batherNeeds: Object.freeze({
        "heat-without-beverage": "BRAUCHT EIN GETRÄNK!",
        "missing-entertainment": "IST GELANGWEILT!",
        "missing-wifi": "WILL WLAN!",
        "missing-toilet": "BRAUCHT EINE TOILETTE!",
        "visible-litter": "DIESER BEREICH IST SCHMUTZIG!",
        fallback: "DER BADEGAST IST UNZUFRIEDEN!"
      }),
      beachProblems: Object.freeze({
        "heat-without-beverage": "DIE BADEGÄSTE BRAUCHEN GETRÄNKE!",
        "missing-entertainment": "DIE BADEGÄSTE LANGWEILEN SICH!",
        "missing-wifi": "DIE BADEGÄSTE WOLLEN WLAN!",
        "missing-toilet": "DIE BADEGÄSTE BRAUCHEN TOILETTEN!",
        "visible-litter": "DIE BADEGÄSTE SAHEN ZU VIEL MÜLL!",
        fallback: "DIE BADEGÄSTE SIND UNZUFRIEDEN!"
      }),
      pickup: Object.freeze({
        money: "+{amount}",
        moneyBonus: "+{amount} BONUS!",
        treasureArrived: "PIRATENSCHATZ! KLICKE FÜR {amount}",
        treasureCoin: "SCHATZ +{amount}",
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
          "lifeguard-building": "DER RETTER HAT GEHOLFEN",
          "wifi-spot": "DAS WLAN HAT GEHOLFEN",
          "toilet-building": "DAS WC HAT GEHOLFEN",
          "volleyball-court": "VOLLEYBALL MACHTE SPASS",
          "sun-shade": "SCHATTEN GEFUNDEN"
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
      litter: "Dieser Bereich ist schmutzig!",
      toiletLeaving: "Keine Toilette. Ich gehe!",
      toleranceExhausted: "Zu viele Probleme. Ich gehe!",
      needLevel: "Wie sehr es gebraucht wird"
    })
  })
});

export function resolveSupportedLocale(locale) {
  const requestedLocale = String(locale || "").trim();
  const exactLocale = SUPPORTED_LOCALES.find((supportedLocale) => (
    supportedLocale.toLowerCase() === requestedLocale.toLowerCase()
  ));

  if (exactLocale) {
    return exactLocale;
  }

  const language = requestedLocale.toLowerCase().split(/[-_]/)[0];

  if (language === "pt") {
    return LOCALES.PT_BR;
  }

  return SUPPORTED_LOCALES.find((supportedLocale) => (
    supportedLocale.toLowerCase().split("-")[0] === language
  )) || DEFAULT_LOCALE;
}

function normalizeLocale(locale) {
  return resolveSupportedLocale(locale);
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
