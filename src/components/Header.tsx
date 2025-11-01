import Logo from "../assets/TSAN.png"
import { useNavigate } from "react-router-dom"
// import { useAppSelector } from "../hooks/useAppSelector";
// import { RootState } from "../store/store";

const Header = () => {
  const navigate = useNavigate();

  // const { user } = useAppSelector((state: RootState) => state.auth);

  
  return (
    <div className="w-full flex items-center h-[60px] sm:h-[80px] pl-4 sm:pl-6">
        <img src={Logo} className="h-[40px] sm:h-[50px] w-auto" alt="TSAN Logo" onClick={() => navigate("/")}/>
    </div>
  )
}

export default Header