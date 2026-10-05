export function MaskedWordBoard({ maskedWord }: { readonly maskedWord: string }) {
  return (
    <div className="word-board multiplayer-word" aria-label={`Palabra: ${[...maskedWord].map((letter) => letter === "_" ? "espacio oculto" : letter).join(", ")}`}>
      {[...maskedWord].map((letter, index) => letter === " "
        ? <span className="word-space" key={index} />
        : <span className={`letter-slot${letter !== "_" ? " revealed" : ""}`} key={index}>{letter === "_" ? <span className="sr-only">Letra oculta</span> : letter}</span>)}
    </div>
  );
}

