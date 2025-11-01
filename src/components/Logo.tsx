import type React from "react"
import LogoImage from "../assets/TSAN.png"

const Logo: React.FC = () => {
  return (
    <div className="flex justify-center mb-8">
      <img src={LogoImage} alt="Logo"  className="h-[40px] sm:h-[50px] w-auto"/>
    </div>
  )
}

export default Logo
