import {
  ArrowBigDown,
  ArrowBigLeft,
  ArrowBigRight,
  ArrowBigUp,
} from "lucide-react";
function MovimientoCarro() {
  return (
    <div>
      <div className="grid grid-cols-3 gap-4 grid-rows-2">
        <ArrowBigUp className="size-10 col-start-2 cursor-pointer hover:bg-white/20  hover:scale-105 transition-all" />
        <ArrowBigLeft className="size-10 col-start-1 cursor-pointer hover:bg-white/20  hover:scale-105 transition-all" />
        <ArrowBigRight className="size-10 col-start-3 cursor-pointer hover:bg-white/20  hover:scale-105 transition-all" />
        <ArrowBigDown className="size-10 col-2 row-start-2 cursor-pointer hover:bg-white/20  hover:scale-105 transition-all" />
      </div>
      <div></div>
    </div>
  );
}

export default MovimientoCarro;
