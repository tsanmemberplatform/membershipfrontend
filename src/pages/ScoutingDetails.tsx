import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";

export const nigerianStateCouncils = [
  "Abia State Scout Council",
  "Adamawa State Scout Council",
  "Akwa Ibom State Scout Council",
  "Anambra State Scout Council",
  "Bauchi State Scout Council",
  "Bayelsa State Scout Council",
  "Benue State Scout Council",
  "Borno State Scout Council",
  "Cross River State Scout Council",
  "Delta State Scout Council",
  "Ebonyi State Scout Council",
  "Edo State Scout Council",
  "Ekiti State Scout Council",
  "Enugu State Scout Council",
  "Gombe State Scout Council",
  "Imo State Scout Council",
  "Jigawa State Scout Council",
  "Kaduna State Scout Council",
  "Kano State Scout Council",
  "Katsina State Scout Council",
  "Kebbi State Scout Council",
  "Kogi State Scout Council",
  "Kwara State Scout Council",
  "Lagos State Scout Council",
  "Nasarawa State Scout Council",
  "Niger State Scout Council",
  "Ogun State Scout Council",
  "Ondo State Scout Council",
  "Osun State Scout Council",
  "Oyo State Scout Council",
  "Plateau State Scout Council",
  "Rivers State Scout Council",
  "Sokoto State Scout Council",
  "Taraba State Scout Council",
  "Yobe State Scout Council",
  "Zamfara State Scout Council",
  "FCT Scout Council",
];

export const ScoutingDetails: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isValidCouncil, setIsValidCouncil] = useState(true);
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("signupInfo");
    const parsedData = savedData ? JSON.parse(savedData) : {};

    if (!parsedData.stateScoutCouncil) {
      return {
        scoutingRole: "",
        stateScoutCouncil: "",
        scoutDivision: "",
        scoutDistrict: "",
        troop: "",
      };
    }
    return {
      scoutingRole: parsedData.scoutingRole || "",
      stateScoutCouncil: parsedData.stateScoutCouncil || "",
      scoutDivision: parsedData.scoutDivision || "",
      scoutDistrict: parsedData.scoutDistrict || "",
      troop: parsedData.troop || "",
    };
  });
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that the state council is in the list
    const isValid = nigerianStateCouncils.includes(formData.stateScoutCouncil);
    setIsValidCouncil(isValid);

    if (!isValid) {
      return;
    }

    localStorage.setItem(
      "signupInfo",
      JSON.stringify({
        ...JSON.parse(localStorage.getItem("signupInfo") || "{}"),
        scoutingRole: formData.scoutingRole,
        stateScoutCouncil: formData.stateScoutCouncil,
        scoutDivision: formData.scoutDivision,
        scoutDistrict: formData.scoutDistrict,
        troop: formData.troop,
      })
    );
    navigate("/signup/password");
  };

  const handleBack = () => {
    navigate("/signup/personal-details");
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Welcome to TSAN
        </h1>
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 hover:text-green-700">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Scouting details
          </h2>
          <span className="text-sm text-gray-500">2/3</span>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Fill in the required information below to create your account.
        </p>

        <form onSubmit={handleContinue} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scouting Role
            </label>
            <input
              type="text"
              required
              value={formData.scoutingRole}
              onChange={(e) =>
                handleInputChange("scoutingRole", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <p className="text-sm text-gray-600">
              e.g., member, Scout Leader, Group Scout Leader
            </p>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State Scout Council
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.stateScoutCouncil}
                onChange={(e) => {
                  handleInputChange("stateScoutCouncil", e.target.value);
                  setShowDropdown(true);
                  setIsValidCouncil(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10 ${
                  !isValidCouncil ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Search state council..."
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                {nigerianStateCouncils
                  .filter((council) =>
                    council
                      .toLowerCase()
                      .includes(formData.stateScoutCouncil.toLowerCase())
                  )
                  .map((council, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        handleInputChange("stateScoutCouncil", council);
                        setShowDropdown(false);
                        setIsValidCouncil(true);
                      }}
                    >
                      {council}
                    </div>
                  ))}
              </div>
            )}
            {!isValidCouncil && (
              <p className="text-sm text-red-600 mt-1">
                Please select a valid state council from the list
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scout Division
            </label>
            <input
              type="text"
              required
              value={formData.scoutDivision}
              onChange={(e) =>
                handleInputChange("scoutDivision", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scout District
            </label>
            <input
              type="text"
              required
              value={formData.scoutDistrict}
              onChange={(e) =>
                handleInputChange("scoutDistrict", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Troop
            </label>
            <input
              type="text"
              required
              value={formData.troop}
              onChange={(e) => handleInputChange("troop", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="flex gap-4 mt-4">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
            <button
              // onClick={handleContinue}
              type="submit"
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};
