import "./App.css";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./Pages/Dashboard";
import PrivateRoom from "./Pages/CreateRoom";
import JoinRoom from "./Pages/JoinRoom";

function App() {
  return (
    <Routes>
      <Route index element={<Dashboard />}></Route>
      <Route path={"/private-room/:id"} element={<PrivateRoom />}></Route>
      <Route path={"/join-room/:id"} element={<JoinRoom />}></Route>A
    </Routes>
  );
}

export default App;
