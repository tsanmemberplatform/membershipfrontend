import { Routes, Route, Navigate } from "react-router-dom";
import { useCrossTabAuth } from "./hooks/useCrossTabAuth";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyCode from "./pages/VerifyCode";
import ResetPassword from "./pages/ResetPassword";
import { DashboardLayout } from "./components/DashboardLayout";
import { DashboardHome } from "./components/DashboardHome";
import { SignUp } from "./pages/SignUp";
import { PersonalDetails } from "./pages/PersonalDetails";
import { ScoutingDetails } from "./pages/ScoutingDetails";
import { SignUpPassword } from "./pages/SignUpPassword";
import { ActivateAccount } from "./pages/ActivateAccount";
import { LoadingScreen } from "./pages/LoadingScreen";
import { UploadPhoto } from "./pages/UploadPhoto";
import { DashboardProfile } from "./components/DashboardProfile";
import { DashboardSecurity } from "./components/DashboardSecurity";
import { DashboardAchievements } from "./components/DashboardAchievements";
import { DashboardLogbook } from "./components/DashboardLogbook";
import { DashboardEvents } from "./components/DashboardEvents";
import { ActivityDetail } from "./pages/ActivityDetail";
// import AdminLayout from "./components/AdminLayout";
// import Dashboard from "./adminPages/Dashboard";
import Roster from "./admin/pages/Roster";
// import MemberDetail from "./adminPages/MemberDetail";
import EventDetail from "./components/EventDetailPage";
import MyEventDetails from "./components/MyEventsDetailsPage";
import { VerifyLogin } from "./pages/VerifyLogin";
import Layout from "./admin/components/Layout";
import Home from "./admin/pages/Home";
import Event from "./admin/pages/Event";
import Reports from "./admin/pages/Reports";
import Message from "./admin/pages/Message";
import Users from "./admin/pages/Users";
import AuditLog from "./admin/pages/AuditLog";
import AdminEventDetail from "./admin/pages/AdminEventDetail";
import RosterDetail from "./admin/pages/RosterDetail";
import RosterPending from "./admin/pages/RosterPending";
import AdminPersonalDetails from "./admin/pages/PersonalDetails";
import AdminSignUpPersonal from "./pages/AdminSignUpPersonal";
import AdminSignUpScouting from "./pages/AdminSignUpScouting";
import AdminSignUpPassword from "./pages/AdminSignUpPassword";

function App() {
  // Initialize cross-tab authentication synchronization
  useCrossTabAuth();

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-login" element={<VerifyLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/reset" element={<ResetPassword />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="achievements" element={<DashboardAchievements />} />
          <Route path="logbook" element={<DashboardLogbook />} />
          <Route path="logbook/:id" element={<ActivityDetail />} />
          <Route path="events" element={<DashboardEvents />} />
          <Route path="profile" element={<DashboardProfile />} />
          <Route path="security" element={<DashboardSecurity />} />
          <Route path="events/:id" element={<EventDetail />} />
          <Route path="my-events/:id" element={<MyEventDetails />} />
        </Route>

        {/* <AdminLayout> */}
        {/* <Routes> */}
        {/* <Route
          path="/admin"
          element={<AdminLayout children={<Dashboard />} />}
        />
        <Route
          path="/admin/roster"
          element={<AdminLayout children={<Roster />} />}
        />
        <Route
          path="/admin/roster/member/:id"
          element={<AdminLayout children={<MemberDetail />} />}
        /> */}
        {/* <Route path="/roster" element={<Roster />} />
        <Route path="/roster/member/:id" element={<MemberDetail />} />
        <Route path="/event" element={<Event />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/users" element={<Users />} />
        <Route path="/audit-log" element={<AuditLog />} /> */}
        {/* </Routes> */}
        {/* </AdminLayout> */}
        <Route path="/admin" element={<Layout />}>
          {/* <Routes> */}
          <Route index element={<Home />} />
          <Route path="roster" element={<Roster />} />
          <Route path="roster/pending" element={<RosterPending />} />
          <Route path="roster/:id" element={<RosterDetail />} />
          <Route path="event" element={<Event />} />
          <Route path="event/:id" element={<AdminEventDetail />} />
          <Route path="reports" element={<Reports />} />
          <Route path="message" element={<Message />} />
          <Route path="users" element={<Users />} />
          <Route path="audit-log" element={<AuditLog />} />
          <Route path="personal-details" element={<AdminPersonalDetails />} />

          {/* </Routes> */}
        </Route>

        <Route path="/signup" element={<SignUp />} />
        <Route path="/signup/personal-details" element={<PersonalDetails />} />
        <Route path="/signup/scouting-details" element={<ScoutingDetails />} />
        <Route path="/signup/password" element={<SignUpPassword />} />
        <Route path="/signup/activate" element={<ActivateAccount />} />
        <Route path="/signup/loading" element={<LoadingScreen />} />
        <Route path="/signup/upload-photo" element={<UploadPhoto />} />

        <Route
          path="/invite/personal-details/:first/:last/:role/:council/:email"
          element={<AdminSignUpPersonal />}
        />
        <Route path="/invite/scout-details" element={<AdminSignUpScouting />} />
        <Route path="/invite/password" element={<AdminSignUpPassword />} />
      </Routes>
    </div>
  );
}

export default App;
