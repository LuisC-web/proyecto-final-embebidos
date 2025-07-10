import { useEffect, useState } from "react";

type TypewriterEffectProps = {
  words: string[];
  speed?: number;
};

const TypeWriter = ({ words, speed = 50 }: TypewriterEffectProps) => {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (index >= words.length) return;

    const currentWord = words[index];

    const timeout = setTimeout(
      () => {
        if (!deleting && subIndex < currentWord.length) {
          // Escribiendo
          setText(currentWord.slice(0, subIndex + 1));
          setSubIndex(subIndex + 1);
        } else if (deleting && subIndex > 0) {
          // Borrando
          setText(currentWord.slice(0, subIndex - 1));
          setSubIndex(subIndex - 1);
        } else if (!deleting && subIndex === currentWord.length) {
          // Pausa antes de borrar
          setTimeout(() => setDeleting(true), 1000);
        } else if (deleting && subIndex === 0) {
          // Cambiar a la siguiente palabra
          setDeleting(false);
          setIndex((prev) => (prev + 1) % words.length);
        }
      },
      deleting ? speed / 2 : speed
    ); // Borrar más rápido que escribir

    return () => clearTimeout(timeout);
  }, [subIndex, deleting, index, words, speed]);

  return (
    <h1 className="text-3xl text-orange-500 text-center">
      {text}
      <span className="cursor">|</span>
    </h1>
  );
};

export default TypeWriter;
