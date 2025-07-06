import { Route, Routes } from "react-router-dom";
import LayoutMain from "./layout/layout";
import MovimientoCarro from "./view/MovimientoCarro";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LayoutMain />}>
        <Route index element={<MovimientoCarro></MovimientoCarro>}></Route>
      </Route>
    </Routes>
  );
}

export default App;
