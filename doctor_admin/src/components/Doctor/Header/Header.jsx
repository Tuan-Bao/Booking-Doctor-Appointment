import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../../context/AppContext";
import "./Header.css";
import { assets } from "../../../assets/assets";

const Header = () => {
  const navigate = useNavigate();
  const { logout } = useAppContext();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="admin-header">
      <div className="header-left">
        <div className="logo-container">
          <img src={assets.logo} alt="Prescripto" className="logo" />
          <span className="logo-text">Prescripto</span>
        </div>
        <div className="admin-tag">Doctor</div>
      </div>

      <div className="header-right">
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
