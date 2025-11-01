import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";

interface GroupOption {
  id: string;
  title: string;
  description: string;
}

const groups: GroupOption[] = [
  { id: "Cub", title: "Cubs", description: "Entry-level section (5-10 years)" },
  {
    id: "Scout",
    title: "Scouts",
    description: "Scouting adventure (11-15 years)",
  },
  {
    id: "Venturer",
    title: "Venturer",
    description: "Advanced Scouting (16-20 years)",
  },
  {
    id: "Rover",
    title: "Rovers",
    description: "Young adult section (21+ years)",
  },
  {
    id: "Volunteers",
    title: "Adult/Volunteers",
    description: "Adult leaders and supporters",
  },
];

export const SignUp: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<string>(() => {
    const savedData = localStorage.getItem("signupInfo");
    const parsedData = savedData ? JSON.parse(savedData) : {};
    return parsedData.section || "";
  });
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedGroup) {
      localStorage.setItem(
        "signupInfo",
        JSON.stringify({
          ...JSON.parse(localStorage.getItem("signupInfo") || "{}"),
          section: selectedGroup,
        })
      );
      navigate("/signup/personal-details");
    }
  };

  return (
    <AuthLayout title="">
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
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          Let's get started
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Please select a group/section you belong to.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedGroup(group.id)}
              className={`p-4 text-left border rounded-lg transition-colors ${
                selectedGroup === group.id
                  ? "border-green-600 bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-medium text-gray-900">{group.title}</div>
              <div className="text-sm text-gray-600">{group.description}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleContinue}
        disabled={!selectedGroup}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Continue
      </button>
    </AuthLayout>
  );
};
