import Logo from "../assets/logo.png";
import Profile from "../assets/profile.png";

const Header = () => {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-5">
        <img src={Logo}></img>
        <p className="span">TICTACTOE</p>
      </div>
      <div>
        <img className="w-[70px]" src={Profile}></img>
      </div>
    </div>
  );
};

export default Header;
