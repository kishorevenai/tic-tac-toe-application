import { useContext } from "react";
import Logo from "../assets/logo.png";
import Profile from "../assets/profile.png";
import { MyContext } from "../store/nakamaContext";

const Header = () => {
  const { user } = useContext(MyContext);
  console.log("header user", user);

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-5">
        <img src={Logo}></img>
        <p className="span">TICTACTOE</p>
      </div>
      <div className="flex items-center gap-5">
        <p>{user?.username}</p>
        <img className="w-[70px]" src={Profile}></img>
      </div>
    </div>
  );
};

export default Header;
