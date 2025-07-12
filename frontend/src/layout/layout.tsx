import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Camera from "../components/Camera";

function LayoutMain() {
  return (
    <div className="min-h-screen min-w-screen flex flex-col p-5">
      <Header></Header>
      <main>
        <Camera></Camera>
        <Outlet></Outlet>
      </main>
      <footer></footer>
    </div>
  );
}

export default LayoutMain;
