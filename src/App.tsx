import "./App.css";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./Pages/Dashboard";
import PrivateRoom from "./Pages/CreateRoom";
import JoinRoom from "./Pages/JoinRoom";
import AutoMatchmaking from "./Pages/JoinRandom";
import ListMatches from "./Pages/ListMatches";

function App() {
  return (
    <Routes>
      <Route index element={<Dashboard />}></Route>
      <Route path={"/private-room/:id"} element={<PrivateRoom />}></Route>
      <Route path={"/join-room/:id"} element={<JoinRoom />}></Route>
      <Route path={"/random-room/:id"} element={<AutoMatchmaking />}></Route>
      <Route path={"/list-rooms"} element={<ListMatches />}></Route>
    </Routes>
  );
}

export default App;
