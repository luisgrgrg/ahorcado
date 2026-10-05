(() => {
  "use strict";

  const MAX_ERRORS = 6;
  const ALPHABET = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
  const WORDS = {
    animales: [
      { word: "JIRAFA", hint: "Tiene el cuello muy largo" },
      { word: "PINGÜINO", hint: "Ave que nada entre hielos" },
      { word: "MARIPOSA", hint: "Cambia antes de tener alas" },
      { word: "CAMALEÓN", hint: "Puede cambiar de color" },
      { word: "TIBURÓN", hint: "Gran nadador de dientes afilados" }
    ],
    comida: [
      { word: "CHOCOLATE", hint: "Dulce que nace del cacao" },
      { word: "EMPANADA", hint: "Masa rellena y crujiente" },
      { word: "LIMONADA", hint: "Bebida fresca y un poco ácida" },
      { word: "AREQUIPE", hint: "Dulce cremoso hecho con leche" },
      { word: "ZANAHORIA", hint: "Hortaliza naranja y crujiente" }
    ],
    aventura: [
      { word: "BRÚJULA", hint: "Señala el camino hacia el norte" },
      { word: "TESORO", hint: "Los piratas lo guardan muy bien" },
      { word: "CASCADA", hint: "Un río que cae desde lo alto" },
      { word: "MONTAÑA", hint: "Llegar a su cima es todo un reto" },
      { word: "MOCHILA", hint: "Lleva lo necesario en tu espalda" }
    ]
  };

  const state = {
    category: "variado",
    entry: null,
    guessed: new Set(),
    errors: 0,
    wins: Number(sessionStorage.getItem("hangmanWins") || 0),
    streak: Number(sessionStorage.getItem("hangmanStreak") || 0),
    finished: false,
    previousWord: ""
  };

  const el = Object.fromEntries([
    "playerName", "roundLabel", "statusTitle", "attemptCount", "attemptPill", "wordBoard", "hintText",
    "keyboard", "wrongList", "errorProgress", "progressTrack", "progressFill", "hangmanAlt", "figureCaption",
    "winsCount", "streakCount", "newGameButton", "categoryDialog", "categoryGrid", "resultDialog", "resultIcon",
    "resultKicker", "resultTitle", "resultMessage", "resultWord", "resultErrors", "resultLetters", "resultStreak",
    "playAgainButton", "changeCategoryButton", "announcer"
  ].map(id => [id, document.getElementById(id)]));

  function normalize(value) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  }

  function categoryLabel(category) {
    return ({ animales: "Animales", comida: "Comida", aventura: "Aventura", variado: "Variado" })[category];
  }

  function poolFor(category) {
    return category === "variado" ? Object.values(WORDS).flat() : WORDS[category];
  }

  function pickWord(category) {
    const pool = poolFor(category);
    const options = pool.filter(item => item.word !== state.previousWord);
    return options[Math.floor(Math.random() * options.length)] || pool[0];
  }

  function setupKeyboard() {
    el.keyboard.innerHTML = "";
    ALPHABET.forEach(letter => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "letter-button";
      button.dataset.letter = letter;
      button.setAttribute("aria-label", `Letra ${letter}`);
      button.innerHTML = `<span>${letter}</span><span class="key-state" aria-hidden="true"></span>`;
      button.addEventListener("click", () => guess(letter));
      el.keyboard.appendChild(button);
    });
  }

  function startGame(category = state.category) {
    state.category = category;
    state.previousWord = state.entry?.word || state.previousWord;
    state.entry = pickWord(category);
    state.guessed.clear();
    state.errors = 0;
    state.finished = false;
    setupKeyboard();
    render();
    el.categoryDialog.close();
    el.resultDialog.close();
    el.statusTitle.textContent = "¡Descubre la palabra!";
    requestAnimationFrame(() => el.game?.focus?.());
  }

  function isLetterRevealed(character) {
    const clean = normalize(character);
    return !/[A-ZÑ]/.test(clean) || state.guessed.has(clean) || state.finished;
  }

  function renderWord() {
    el.wordBoard.innerHTML = "";
    const readable = [];
    [...state.entry.word].forEach(character => {
      if (character === " ") {
        const space = document.createElement("span");
        space.className = "word-space";
        el.wordBoard.appendChild(space);
        readable.push("espacio");
        return;
      }
      const revealed = isLetterRevealed(character);
      const slot = document.createElement("span");
      slot.className = `letter-slot${revealed ? " revealed" : ""}`;
      slot.textContent = revealed ? character : "";
      slot.setAttribute("aria-hidden", "true");
      el.wordBoard.appendChild(slot);
      readable.push(revealed ? character : "guion");
    });
    el.wordBoard.setAttribute("aria-label", readable.join(", "));
  }

  function renderFigure() {
    document.querySelectorAll(".body-part").forEach((part, index) => part.classList.toggle("visible", index < state.errors));
    const remaining = MAX_ERRORS - state.errors;
    el.attemptCount.textContent = remaining;
    el.errorProgress.textContent = `${state.errors} de ${MAX_ERRORS}`;
    el.progressTrack.setAttribute("aria-valuenow", state.errors);
    el.progressFill.style.width = `${(state.errors / MAX_ERRORS) * 100}%`;
    el.hangmanAlt.setAttribute("aria-label", state.errors === 0 ? "Ahorcado sin errores" : `Ahorcado con ${state.errors} de ${MAX_ERRORS} partes dibujadas`);
    const captions = [
      ["¡Todo bien!", "Aún no hay errores"], ["Primer tropiezo", "Te quedan 5 intentos"],
      ["Sigue pensando", "Te quedan 4 intentos"], ["Mitad del camino", "Te quedan 3 intentos"],
      ["¡Tú puedes!", "Te quedan 2 intentos"], ["Última oportunidad", "Respira y elige bien"],
      ["Fin de la ronda", "La palabra se escapó"]
    ][state.errors];
    el.figureCaption.innerHTML = `<strong>${captions[0]}</strong><span>${captions[1]}</span>`;
  }

  function renderKeyboard() {
    const normalizedWord = normalize(state.entry.word);
    document.querySelectorAll(".letter-button").forEach(button => {
      const letter = button.dataset.letter;
      const used = state.guessed.has(letter);
      const correct = normalizedWord.includes(letter);
      button.disabled = used || state.finished;
      button.classList.toggle("correct", used && correct);
      button.classList.toggle("incorrect", used && !correct);
      const stateIcon = button.querySelector(".key-state");
      stateIcon.textContent = used ? (correct ? "✓" : "×") : "";
      if (used) button.setAttribute("aria-label", `Letra ${letter}, ${correct ? "correcta" : "incorrecta"}`);
    });
  }

  function render() {
    el.roundLabel.textContent = `Ronda · ${categoryLabel(state.category)}`;
    el.hintText.innerHTML = `<span aria-hidden="true">✦</span> Pista: ${state.entry.hint}`;
    el.winsCount.textContent = state.wins;
    el.streakCount.textContent = state.streak;
    const wrong = [...state.guessed].filter(letter => !normalize(state.entry.word).includes(letter));
    el.wrongList.textContent = wrong.length ? wrong.join(" · ") : "Ninguna todavía";
    renderWord();
    renderFigure();
    renderKeyboard();
  }

  function wordIsComplete() {
    return [...normalize(state.entry.word)].every(character => !/[A-ZÑ]/.test(character) || state.guessed.has(character));
  }

  function guess(letter) {
    if (state.finished || state.guessed.has(letter) || !ALPHABET.includes(letter)) return;
    state.guessed.add(letter);
    const correct = normalize(state.entry.word).includes(letter);
    if (!correct) state.errors += 1;
    render();
    el.announcer.textContent = correct ? `La letra ${letter} es correcta.` : `La letra ${letter} no está. Quedan ${MAX_ERRORS - state.errors} intentos.`;

    if (wordIsComplete()) finish(true);
    else if (state.errors >= MAX_ERRORS) finish(false);
  }

  function finish(won) {
    state.finished = true;
    if (won) {
      state.wins += 1;
      state.streak += 1;
    } else {
      state.streak = 0;
    }
    sessionStorage.setItem("hangmanWins", state.wins);
    sessionStorage.setItem("hangmanStreak", state.streak);
    render();
    el.statusTitle.textContent = won ? "¡Misión cumplida!" : "La palabra se escapó";
    const card = el.resultDialog.querySelector(".result-card");
    card.classList.toggle("loss", !won);
    el.resultIcon.textContent = won ? "★" : "!";
    el.resultKicker.textContent = won ? "Ronda completada" : "Fin de la ronda";
    el.resultTitle.textContent = won ? "¡Palabra descubierta!" : "¡Buen intento!";
    el.resultMessage.textContent = won ? "Tu intuición estuvo a la altura." : "Cada intento te acerca a la próxima victoria.";
    el.resultWord.textContent = state.entry.word;
    el.resultErrors.textContent = state.errors;
    el.resultLetters.textContent = state.guessed.size;
    el.resultStreak.textContent = state.streak;
    window.setTimeout(() => el.resultDialog.showModal(), 420);
  }

  el.newGameButton.addEventListener("click", () => el.categoryDialog.showModal());
  el.categoryGrid.addEventListener("click", event => {
    const button = event.target.closest("[data-category]");
    if (button) startGame(button.dataset.category);
  });
  el.playAgainButton.addEventListener("click", () => startGame(state.category));
  el.changeCategoryButton.addEventListener("click", () => {
    el.resultDialog.close();
    el.categoryDialog.showModal();
  });
  el.categoryDialog.addEventListener("click", event => {
    if (event.target === el.categoryDialog) el.categoryDialog.close();
  });
  el.resultDialog.addEventListener("cancel", event => event.preventDefault());
  document.addEventListener("keydown", event => {
    if (el.categoryDialog.open || el.resultDialog.open || event.ctrlKey || event.metaKey || event.altKey) return;
    const letter = normalize(event.key);
    if (letter.length === 1 && ALPHABET.includes(letter)) guess(letter);
  });

  const playerNumber = String(100 + Math.floor(Math.random() * 900));
  el.playerName.textContent = `Explorador ${playerNumber}`;
  startGame("variado");
})();
