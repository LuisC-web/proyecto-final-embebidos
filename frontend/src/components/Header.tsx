import TypeWriter from "./TypeWriter";

function Header() {
  return (
    <header className="w-full">
      <TypeWriter
        words={[
          "Proyecto final de embebidos",
          "Brazo robotico",
          "Gemelo de un brazo",
        ]}
      />
    </header>
  );
}

export default Header;
