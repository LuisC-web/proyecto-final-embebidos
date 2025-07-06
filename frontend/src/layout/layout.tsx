import { Outlet } from "react-router-dom";
import Header from "../components/Header";

function LayoutMain() {
  return (
    <div className="min-h-screen min-w-screen flex flex-col items-center p-5">
      <Header></Header>
      <main>
        <Outlet></Outlet>
      </main>
      <footer></footer>
    </div>
  );
}

export default LayoutMain;
