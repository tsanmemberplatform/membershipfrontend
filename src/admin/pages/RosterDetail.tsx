import { Link } from "react-router-dom";
import { ArrowLeft, ChevronDown, X } from "lucide-react";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import Swal from "sweetalert2";
import { getStatusColor, getStatusDot } from "@/utils/statusUtils";

import { useEffect, useState } from "react";
// import { authAPI } from "@/services/api";
import { adminAPI } from "@/services/api";
import { useParams } from "react-router-dom";
// import { _ } from "node_modules/tailwindcss/dist/colors-b_6i0Oi7";

export interface ScoutProfile {
  user: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    gender: string;
    dateOfBirth: string;
    stateOfOrigin: string;
    lga: string;
    address: string;
    stateScoutCouncil: string;
    scoutDivision: string;
    scoutingRole: string;
    scoutDistrict: string;
    troop: string;
    section: string;
    profilePic: string;
    role: string;
    status: string;
    membershipId: string;
  };
  awards?: [
    {
      _id: string;
      awardName: string;
      description: string;
      createdAt: string;
      verified: boolean;
      status: string;
    }
  ];
  trainings?: [
    {
      _id: string;
      trainingType: string;
      createdAt: string;
      verified: boolean;
      status: string;
    }
  ];
  events?: [
    {
      _id: string;
      title: string;
      date: string;
      createdAt: string;
      verified: boolean;
      status: string;
    }
  ];
  activities?: [
    {
      _id: string;
      title: string;
      description: string;
      date: string;
      verified: boolean;
      status: string;
    }
  ];
}

export default function RosterDetail() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    awards: false,
    trainings: false,
    events: false,
    activities: false,
    certificates: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getItemsToShow = (items: any[] | undefined, section: string) => {
    if (!items) return [];
    return expandedSections[section] ? items : items.slice(0, 3);
  };

  const [scoutData, setScoutData] = useState<ScoutProfile | null>(null);
  const { id } = useParams();

  const getUserInfo = async () => {
    try {
      const response = await adminAPI.getUserInfo(id || "");
      if (response.status) {
        setScoutData(response?.data);
      }
      console.log(response);
    } catch (err: any) {
      console.log(err);
    }
  };

  const updateStatus = async (status: string) => {
    if (!id) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "User ID is missing",
      });
      return { success: false };
    }

    try {
      const response = await adminAPI.updateUserStatus({
        status,
        userId: id,
      });

      if (response && response.status) {
        await getUserInfo();
        return { success: true };
      }

      throw new Error("Failed to update status");
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  };

  const updateProfileInfo = async (data: Partial<ScoutProfile>) => {
    if (!scoutData?.user?._id) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "User information is not available",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const response = await adminAPI.updateUserProfileInfo({
        id: scoutData.user._id,
        ...data,
      });

      // Only show success and refresh if the update was successful
      if (response.status) {
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Profile updated successfully",
          timer: 2000,
          showConfirmButton: false,
        });
        await getUserInfo(); // Refresh the data
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    getUserInfo();
    // getActivities();
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Roster</h1>
        <p className="text-gray-600">
          Here you can view and manage all scout members
        </p>
      </div>

      <Link
        to="/admin/roster"
        className="inline-flex items-center gap-2 text-primary hover:underline mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Go Back
      </Link>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <img
              src={scoutData?.user?.profilePic || "/default-profile.png"}
              alt="profile picture"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {scoutData?.user?.fullName || "Loading..."}
              </h2>
              <div className="flex items-center gap-3 text-sm mb-2">
                <span className="text-gray-600">
                  ID: {scoutData?.user?.membershipId || "Loading..."}
                </span>
                <span className="inline-flex items-center gap-1.5 text-green-600">
                  <span className="w-2 h-2 rounded-full bg-green-600" />
                  {scoutData?.user?.status || "Loading..."}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{scoutData?.user?.scoutingRole}</span>
                <span>•</span>
                <span>{scoutData?.user?.role}</span>
              </div>
            </div>
          </div>
          {/* <button className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-green-50 rounded-lg transition-colors">
            Manage scout
            <ChevronDown className="w-4 h-4" />
          </button> */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-green-50 rounded-lg transition-colors"
            >
              Manage scout
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <button
                  onClick={() => {
                    setShowProfileModal(true);
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {/* <User className="w-4 h-4" /> */}
                  <span>Profile</span>
                </button>
                <button
                  onClick={async () => {
                    if (!scoutData?.user?._id) {
                      await Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "User information is not available",
                      });
                      return;
                    }

                    const newStatus =
                      scoutData.user.status === "active"
                        ? "suspended"
                        : "active";
                    const action =
                      newStatus === "suspended" ? "Suspend" : "Unsuspend";

                    setIsUpdating(true);

                    try {
                      // Show confirmation dialog
                      const swalResult = await Swal.fire({
                        title: `${action} User`,
                        text: `Are you sure you want to ${action.toLowerCase()} this user?`,
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: `Yes, ${action.toLowerCase()}`,
                        cancelButtonText: "Cancel",
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33",
                      });

                      if (!swalResult.isConfirmed) {
                        return;
                      }

                      // Show loading state
                      Swal.fire({
                        title: `${action}ing user...`,
                        text: "Please wait",
                        allowOutsideClick: false,
                        didOpen: () => {
                          Swal.showLoading();
                        },
                      });

                      const result = await updateStatus(newStatus);

                      if (result?.success) {
                        await Swal.fire({
                          icon: "success",
                          title: "Success!",
                          text: `User has been ${action.toLowerCase()}ed successfully`,
                          timer: 2000,
                          showConfirmButton: false,
                        });
                        setIsDropdownOpen(false);
                        await getUserInfo(); // Refresh the user data
                      } else {
                        throw new Error("Failed to update user status");
                      }
                    } catch (error) {
                      console.error("Error updating status:", error);
                      await Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: `Failed to ${action.toLowerCase()} user. Please try again.`,
                      });
                    } finally {
                      setIsUpdating(false);
                      setIsDropdownOpen(false);
                    }
                  }}
                  disabled={isUpdating}
                  className={`flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 ${
                    scoutData?.user?.status === "active"
                      ? "text-red-600"
                      : "text-green-600"
                  } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isUpdating ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {scoutData?.user?.status === "active"
                        ? "Suspending..."
                        : "Unsuspending..."}
                    </>
                  ) : (
                    <>
                      {scoutData?.user?.status === "active"
                        ? "Suspend"
                        : "Unsuspend"}
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    // open invite/change role modal
                    setShowInviteModal(true);
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100"
                >
                  {/* <Pause className="w-4 h-4" /> */}
                  <span>Change Role</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              Activity logs (
              {scoutData?.activities ? scoutData.activities.length : 0})
            </h3>
            {scoutData?.activities && scoutData.activities.length > 3 && (
              <button
                onClick={() => toggleSection("activities")}
                className="text-primary hover:underline text-sm"
              >
                {expandedSections.activities ? "View less" : "View more"}
              </button>
            )}
          </div>
          <div className="p-4 md:p-6">
            {scoutData?.activities && scoutData.activities.length > 0 ? (
              <div className="space-y-4">
                {getItemsToShow(scoutData.activities, "activities").map(
                  (log) => (
                    <div
                      key={log._id}
                      className="pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                    >
                      <p className="text-gray-900 font-medium">{log.title}</p>
                      <p className="text-sm text-gray-600">
                        Date: {new Date(log.date).toLocaleDateString()}
                      </p>
                      {log.status && (
                        <span
                          className={`inline-flex items-center gap-1.5 text-sm mt-1 ${getStatusColor(
                            log.status
                          )}`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${getStatusDot(
                              log.status
                            )}`}
                          />
                          {log.status}
                        </span>
                      )}
                    </div>
                  )
                )}
              </div>
            ) : (
              <EmptyState message="This scout member currently has no logged activity." />
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              Certificates (
              {scoutData?.trainings ? scoutData.trainings.length : 0})
            </h3>
            {scoutData?.trainings && scoutData.trainings.length > 3 && (
              <button
                onClick={() => toggleSection("certificates")}
                className="text-primary hover:underline text-sm"
              >
                {expandedSections.certificates ? "View less" : "View more"}
              </button>
            )}
          </div>
          <div className="p-4 md:p-6">
            {scoutData?.trainings && scoutData.trainings.length > 0 ? (
              <div className="space-y-4">
                {getItemsToShow(scoutData.trainings, "certificates").map(
                  (cert) => (
                    <div
                      key={cert._id}
                      className="flex items-start justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="text-gray-900 font-medium">
                          {cert.trainingType}
                        </p>
                        <p className="text-sm text-gray-600">
                          Date Sumitted: {cert.createdAt}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 text-sm whitespace-nowrap ${getStatusColor(
                          cert.verified ? "verified" : "unverified"
                        )}`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${getStatusDot(
                            cert.verified ? "verified" : "unverified"
                          )}`}
                        />
                        {cert.verified ? "Verified" : "Unverified"}
                      </span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <EmptyState message="This scout member currently has no certificate uploaded." />
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              Awards ({scoutData?.awards ? scoutData.awards.length : 0})
            </h3>
            {scoutData?.awards && scoutData.awards.length > 3 && (
              <button
                onClick={() => toggleSection("awards")}
                className="text-primary hover:underline text-sm"
              >
                {expandedSections.awards ? "View less" : "View more"}
              </button>
            )}
          </div>
          <div className="p-4 md:p-6">
            {scoutData?.awards && scoutData.awards.length > 0 ? (
              <div className="space-y-4">
                {getItemsToShow(scoutData.awards, "awards").map((award) => (
                  <div
                    key={award._id}
                    className="flex items-start justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-gray-900 font-medium">
                        {award.awardName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Date Submitted:{" "}
                        {new Date(award.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-sm whitespace-nowrap ${getStatusColor(
                        award.status
                      )}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${getStatusDot(
                          award.status
                        )}`}
                      />
                      {award.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="This scout member currently has no award uploaded." />
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              Events ({scoutData?.events ? scoutData.events.length : 0})
            </h3>
            {scoutData?.events && scoutData.events.length > 3 && (
              <button
                onClick={() => toggleSection("events")}
                className="text-primary hover:underline text-sm"
              >
                {expandedSections.events ? "View less" : "View more"}
              </button>
            )}
          </div>
          <div className="p-4 md:p-6">
            {scoutData?.events && scoutData.events.length > 0 ? (
              <div className="space-y-4">
                {getItemsToShow(scoutData.events, "events").map((event) => (
                  <div
                    key={event._id}
                    className="flex items-start justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-gray-900 font-medium">{event.title}</p>
                      <p className="text-sm text-gray-600">
                        Date: {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                    {event.status && (
                      <span
                        className={`inline-flex items-center gap-1.5 text-sm whitespace-nowrap ${getStatusColor(
                          event.status
                        )}`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${getStatusDot(
                            event.status
                          )}`}
                        />
                        {event.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="This scout member currently has no event submitted." />
            )}
          </div>
        </div>
      </div>

      {scoutData && showProfileModal && (
        <ProfileModal
          scout={scoutData}
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onSave={updateProfileInfo}
          isUpdating={isUpdating}
        />
      )}

      {/* Invite / Change Role Modal */}
      {showInviteModal && (
        <InviteUserModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          userEmail={scoutData?.user?.email || ""}
          onSuccess={(email: string) => {
            setShowInviteModal(false);
            Swal.fire({
              icon: "success",
              title: "Promoted",
              text: `${email} promoted successfully`,
            });
          }}
        />
      )}
    </div>
  );
}

const nigerianLGAs: Record<string, string[]> = {
  FCT: [
    "Abuja Municipal Area Council (AMAC)",
    "Abaji",
    "Bwari",
    "Gwagwalada",
    "Kuje",
    "Kwali",
  ],
  Abia: [
    "Aba North",
    "Aba South",
    "Arochukwu",
    "Bende",
    "Ikwuano",
    "Isiala Ngwa North",
    "Isiala Ngwa South",
    "Isuikwuato",
    "Obi Ngwa",
    "Ohafia",
    "Osisioma Ngwa",
    "Ugwunagbo",
    "Ukwa East",
    "Ukwa West",
    "Umuahia North",
    "Umuahia South",
    "Umu Nneochi",
  ],
  Adamawa: [
    "Demsa",
    "Fufure",
    "Ganye",
    "Gayuk",
    "Girei",
    "Gombi",
    "Guyuk",
    "Hong",
    "Jada",
    "Lamurde",
    "Madagali",
    "Maiha",
    "Mayo-Belwa",
    "Michika",
    "Mubi North",
    "Mubi South",
    "Numan",
    "Shelleng",
    "Song",
    "Toungo",
    "Yola North",
    "Yola South",
  ],
  "Akwa Ibom": [
    "Abak",
    "Eastern Obolo",
    "Eket",
    "Esit Eket",
    "Essien Udim",
    "Etim Ekpo",
    "Etinan",
    "Ibeno",
    "Ibesikpo Asutan",
    "Ibiono-Ibom",
    "Ika",
    "Ikono",
    "Ikot Abasi",
    "Ikot Ekpene",
    "Ini",
    "Itu",
    "Mbo",
    "Mkpat-Enin",
    "Nsit-Atai",
    "Nsit-Ibom",
    "Nsit-Ubium",
    "Obot Akara",
    "Okobo",
    "Onna",
    "Oron",
    "Oruk Anam",
    "Udung-Uko",
    "Ukanafun",
    "Uruan",
    "Urue-Offong/Oruko",
    "Uyo",
  ],
  Anambra: [
    "Aguata",
    "Anambra East",
    "Anambra West",
    "Anaocha",
    "Awka North",
    "Awka South",
    "Ayamelum",
    "Dunukofia",
    "Ekwusigo",
    "Idemili North",
    "Idemili South",
    "Ihiala",
    "Njikoka",
    "Nnewi North",
    "Nnewi South",
    "Ogbaru",
    "Onitsha North",
    "Onitsha South",
    "Orumba North",
    "Orumba South",
    "Oyi",
  ],
  Bauchi: [
    "Alkaleri",
    "Bauchi",
    "Bogoro",
    "Damban",
    "Darazo",
    "Dass",
    "Gamawa",
    "Ganjuwa",
    "Giade",
    "Itas/Gadau",
    "Jama'are",
    "Katagum",
    "Kirfi",
    "Misau",
    "Ningi",
    "Shira",
    "Tafawa Balewa",
    "Toro",
    "Warji",
    "Zaki",
  ],
  Bayelsa: [
    "Brass",
    "Ekeremor",
    "Kolokuma/Opokuma",
    "Nembe",
    "Ogbia",
    "Sagbama",
    "Southern Ijaw",
    "Yenagoa",
  ],
  Benue: [
    "Ado",
    "Agatu",
    "Apa",
    "Buruku",
    "Gboko",
    "Guma",
    "Gwer East",
    "Gwer West",
    "Katsina-Ala",
    "Konshisha",
    "Kwande",
    "Logo",
    "Makurdi",
    "Obi",
    "Ogbadibo",
    "Ohimini",
    "Oju",
    "Okpokwu",
    "Oturkpo",
    "Tarka",
    "Ukum",
    "Ushongo",
    "Vandeikya",
  ],
  Borno: [
    "Abadam",
    "Askira/Uba",
    "Bama",
    "Bayo",
    "Biu",
    "Chibok",
    "Damboa",
    "Dikwa",
    "Gubio",
    "Guzamala",
    "Gwoza",
    "Hawul",
    "Jere",
    "Kaga",
    "Kala/Balge",
    "Konduga",
    "Kukawa",
    "Kwaya Kusar",
    "Mafa",
    "Magumeri",
    "Maiduguri",
    "Marte",
    "Mobbar",
    "Monguno",
    "Ngala",
    "Nganzai",
    "Shani",
  ],
  "Cross River": [
    "Abi",
    "Akamkpa",
    "Akpabuyo",
    "Bakassi",
    "Bekwarra",
    "Biase",
    "Boki",
    "Calabar Municipal",
    "Calabar South",
    "Etung",
    "Ikom",
    "Obanliku",
    "Obubra",
    "Obudu",
    "Odukpani",
    "Ogoja",
    "Yakuur",
    "Yala",
  ],
  Delta: [
    "Aniocha North",
    "Aniocha South",
    "Bomadi",
    "Burutu",
    "Ethiope East",
    "Ethiope West",
    "Ika North East",
    "Ika South",
    "Isoko North",
    "Isoko South",
    "Ndokwa East",
    "Ndokwa West",
    "Okpe",
    "Oshimili North",
    "Oshimili South",
    "Patani",
    "Sapele",
    "Udu",
    "Ughelli North",
    "Ughelli South",
    "Ukwuani",
    "Uvwie",
    "Warri North",
    "Warri South",
    "Warri South West",
  ],
  Ebonyi: [
    "Abakaliki",
    "Afikpo North",
    "Afikpo South",
    "Ebonyi",
    "Ezza North",
    "Ezza South",
    "Ikwo",
    "Ishielu",
    "Ivo",
    "Izzi",
    "Ohaozara",
    "Ohaukwu",
    "Onicha",
  ],
  Edo: [
    "Akoko-Edo",
    "Egor",
    "Esan Central",
    "Esan North-East",
    "Esan South-East",
    "Esan West",
    "Etsako Central",
    "Etsako East",
    "Etsako West",
    "Igueben",
    "Ikpoba Okha",
    "Oredo",
    "Orhionmwon",
    "Ovia North-East",
    "Ovia South-West",
    "Owan East",
    "Owan West",
    "Uhunmwonde",
  ],
  Ekiti: [
    "Ado Ekiti",
    "Aiyekire",
    "Efon",
    "Ekiti East",
    "Ekiti South-West",
    "Ekiti West",
    "Emure",
    "Ido Osi",
    "Ijero",
    "Ikere",
    "Ikole",
    "Ilejemeje",
    "Irepodun/Ifelodun",
    "Ise/Orun",
    "Moba",
    "Oye",
  ],
  Enugu: [
    "Aninri",
    "Awgu",
    "Enugu East",
    "Enugu North",
    "Enugu South",
    "Ezeagu",
    "Igbo Etiti",
    "Igbo Eze North",
    "Igbo Eze South",
    "Isi Uzo",
    "Nkanu East",
    "Nkanu West",
    "Nsukka",
    "Oji River",
    "Udenu",
    "Udi",
    "Uzo-Uwani",
  ],
  Gombe: [
    "Akko",
    "Balanga",
    "Billiri",
    "Dukku",
    "Funakaye",
    "Gombe",
    "Kaltungo",
    "Kwami",
    "Nafada",
    "Shongom",
    "Yamaltu/Deba",
  ],
  Imo: [
    "Aboh Mbaise",
    "Ahiazu Mbaise",
    "Ehime Mbano",
    "Ezinihitte",
    "Ideato North",
    "Ideato South",
    "Ihitte/Uboma",
    "Ikeduru",
    "Isiala Mbano",
    "Isu",
    "Mbaitoli",
    "Ngor Okpala",
    "Njaba",
    "Nkwerre",
    "Nwangele",
    "Obowo",
    "Oguta",
    "Ohaji/Egbema",
    "Okigwe",
    "Onuimo",
    "Orlu",
    "Orsu",
    "Oru East",
    "Oru West",
    "Owerri Municipal",
    "Owerri North",
    "Owerri West",
    "Unuimo",
  ],
  Jigawa: [
    "Auyo",
    "Babura",
    "Biriniwa",
    "Birnin Kudu",
    "Buji",
    "Dutse",
    "Gagarawa",
    "Garki",
    "Gumel",
    "Guri",
    "Gwaram",
    "Gwiwa",
    "Hadejia",
    "Jahun",
    "Kafin Hausa",
    "Kaugama",
    "Kazaure",
    "Kiri Kasama",
    "Kiyawa",
    "Maigatari",
    "Malam Madori",
    "Miga",
    "Ringim",
    "Roni",
    "Sule Tankarkar",
    "Taura",
    "Yankwashi",
  ],
  Kaduna: [
    "Birnin Gwari",
    "Chikun",
    "Giwa",
    "Igabi",
    "Ikara",
    "Jaba",
    "Jema'a",
    "Kachia",
    "Kaduna North",
    "Kaduna South",
    "Kagarko",
    "Kajuru",
    "Kaura",
    "Kauru",
    "Kubau",
    "Kudan",
    "Lere",
    "Makarfi",
    "Sabon Gari",
    "Sanga",
    "Soba",
    "Zangon Kataf",
    "Zaria",
  ],
  Kano: [
    "Ajingi",
    "Albasu",
    "Bagwai",
    "Bebeji",
    "Bichi",
    "Bunkure",
    "Dala",
    "Dambatta",
    "Dawakin Kudu",
    "Dawakin Tofa",
    "Doguwa",
    "Fagge",
    "Gabasawa",
    "Garko",
    "Garun Mallam",
    "Gaya",
    "Gezawa",
    "Gwale",
    "Gwarzo",
    "Kabo",
    "Kano Municipal",
    "Karaye",
    "Kibiya",
    "Kiru",
    "Kumbotso",
    "Kunchi",
    "Kura",
    "Madobi",
    "Makoda",
    "Minjibir",
    "Nasarawa",
    "Rano",
    "Rimin Gado",
    "Rogo",
    "Shanono",
    "Sumaila",
    "Takai",
    "Tarauni",
    "Tofa",
    "Tsanyawa",
    "Tudun Wada",
    "Ungogo",
    "Warawa",
    "Wudil",
  ],
  Katsina: [
    "Bakori",
    "Batagarawa",
    "Batsari",
    "Baure",
    "Bindawa",
    "Charanchi",
    "Dandume",
    "Danja",
    "Dan Musa",
    "Daura",
    "Dutsi",
    "Dutsin Ma",
    "Faskari",
    "Funtua",
    "Ingawa",
    "Jibia",
    "Kafur",
    "Kaita",
    "Kankara",
    "Kankia",
    "Katsina",
    "Kurfi",
    "Kusada",
    "Mai'Adua",
    "Malumfashi",
    "Mani",
    "Mashi",
    "Matazu",
    "Musawa",
    "Rimi",
    "Sabuwa",
    "Safana",
    "Sandamu",
    "Zango",
  ],
  Kebbi: [
    "Aleiro",
    "Arewa Dandi",
    "Argungu",
    "Augie",
    "Bagudo",
    "Birnin Kebbi",
    "Bunza",
    "Dandi",
    "Fakai",
    "Gwandu",
    "Jega",
    "Kalgo",
    "Koko/Besse",
    "Maiyama",
    "Ngaski",
    "Sakaba",
    "Shanga",
    "Suru",
    "Wasagu/Danko",
    "Yauri",
    "Zuru",
  ],
  Kogi: [
    "Adavi",
    "Ajaokuta",
    "Ankpa",
    "Bassa",
    "Dekina",
    "Ibaji",
    "Idah",
    "Igalamela Odolu",
    "Ijumu",
    "Kabba/Bunu",
    "Kogi",
    "Lokoja",
    "Mopa-Muro",
    "Ofu",
    "Ogori/Magongo",
    "Okehi",
    "Okene",
    "Olamaboro",
    "Omala",
    "Yagba East",
    "Yagba West",
  ],
  Kwara: [
    "Asa",
    "Baruten",
    "Edu",
    "Ekiti",
    "Ifelodun",
    "Ilorin East",
    "Ilorin South",
    "Ilorin West",
    "Irepodun",
    "Isin",
    "Kaiama",
    "Moro",
    "Offa",
    "Oke Ero",
    "Oyun",
    "Pategi",
  ],
  Lagos: [
    "Agege",
    "Ajeromi-Ifelodun",
    "Alimosho",
    "Amuwo-Odofin",
    "Apapa",
    "Badagry",
    "Epe",
    "Eti Osa",
    "Ibeju-Lekki",
    "Ifako-Ijaiye",
    "Ikeja",
    "Ikorodu",
    "Kosofe",
    "Lagos Island",
    "Lagos Mainland",
    "Mushin",
    "Ojo",
    "Oshodi-Isolo",
    "Shomolu",
    "Surulere",
  ],
  Nasarawa: [
    "Akwanga",
    "Awe",
    "Doma",
    "Karu",
    "Keana",
    "Keffi",
    "Kokona",
    "Lafia",
    "Nasarawa",
    "Nasarawa Egon",
    "Obi",
    "Toto",
    "Wamba",
  ],
  Niger: [
    "Agaie",
    "Agwara",
    "Bida",
    "Borgu",
    "Bosso",
    "Chanchaga",
    "Edati",
    "Gbako",
    "Gurara",
    "Katcha",
    "Kontagora",
    "Lapai",
    "Lavun",
    "Magama",
    "Mariga",
    "Mashegu",
    "Mokwa",
    "Munya",
    "Paikoro",
    "Rafi",
    "Rijau",
    "Shiroro",
    "Suleja",
    "Tafa",
    "Wushishi",
  ],
  Ogun: [
    "Abeokuta North",
    "Abeokuta South",
    "Ado-Odo/Ota",
    "Egbado North",
    "Egbado South",
    "Ewekoro",
    "Ifo",
    "Ijebu East",
    "Ijebu North",
    "Ijebu North East",
    "Ijebu Ode",
    "Ikenne",
    "Imeko Afon",
    "Ipokia",
    "Obafemi Owode",
    "Odeda",
    "Odogbolu",
    "Ogun Waterside",
    "Remo North",
    "Shagamu",
    "Yewa North",
    "Yewa South",
  ],
  Ondo: [
    "Akoko North-East",
    "Akoko North-West",
    "Akoko South-East",
    "Akoko South-West",
    "Akure North",
    "Akure South",
    "Ese Odo",
    "Idanre",
    "Ifedore",
    "Ilaje",
    "Ile Oluji/Okeigbo",
    "Irele",
    "Odigbo",
    "Okitipupa",
    "Ondo East",
    "Ondo West",
    "Ose",
    "Owo",
  ],
  Osun: [
    "Atakunmosa East",
    "Atakunmosa West",
    "Aiyedaade",
    "Aiyedire",
    "Boluwaduro",
    "Boripe",
    "Ede North",
    "Ede South",
    "Ife Central",
    "Ife East",
    "Ife North",
    "Ife South",
    "Egbedore",
    "Ejigbo",
    "Ifedayo",
    "Ifelodun",
    "Ila",
    "Ilesa East",
    "Ilesa West",
    "Irepodun",
    "Irewole",
    "Isokan",
    "Iwo",
    "Obokun",
    "Odo Otin",
    "Ola Oluwa",
    "Olorunda",
    "Oriade",
    "Orolu",
    "Osogbo",
  ],
  Oyo: [
    "Afijio",
    "Akinyele",
    "Atiba",
    "Atisbo",
    "Egbeda",
    "Ibadan North",
    "Ibadan North-East",
    "Ibadan North-West",
    "Ibadan South-East",
    "Ibadan South-West",
    "Ibarapa Central",
    "Ibarapa East",
    "Ibarapa North",
    "Ido",
    "Irepo",
    "Iseyin",
    "Itesiwaju",
    "Iwajowa",
    "Kajola",
    "Lagelu",
    "Ogbomosho North",
    "Ogbomosho South",
    "Ogo Oluwa",
    "Olorunsogo",
    "Oluyole",
    "Ona Ara",
    "Orelope",
    "Ori Ire",
    "Oyo East",
    "Oyo West",
    "Saki East",
    "Saki West",
    "Surulere",
  ],
  Plateau: [
    "Barkin Ladi",
    "Bassa",
    "Bokkos",
    "Jos East",
    "Jos North",
    "Jos South",
    "Kanam",
    "Kanke",
    "Langtang North",
    "Langtang South",
    "Mangu",
    "Mikang",
    "Pankshin",
    "Qua'an Pan",
    "Riyom",
    "Shendam",
    "Wase",
  ],
  Rivers: [
    "Abua/Odual",
    "Ahoada East",
    "Ahoada West",
    "Akuku-Toru",
    "Andoni",
    "Asari-Toru",
    "Bonny",
    "Degema",
    "Eleme",
    "Emuoha",
    "Etche",
    "Gokana",
    "Ikwerre",
    "Khana",
    "Obio/Akpor",
    "Ogba/Egbema/Ndoni",
    "Ogu/Bolo",
    "Okrika",
    "Omuma",
    "Opobo/Nkoro",
    "Oyigbo",
    "Port Harcourt",
    "Tai",
  ],
  Sokoto: [
    "Binji",
    "Bodinga",
    "Dange Shuni",
    "Gada",
    "Goronyo",
    "Gudu",
    "Gwadabawa",
    "Illela",
    "Isa",
    "Kebbe",
    "Kware",
    "Rabah",
    "Sabon Birni",
    "Shagari",
    "Silame",
    "Sokoto North",
    "Sokoto South",
    "Tambuwal",
    "Tangaza",
    "Tureta",
    "Wamako",
    "Wurno",
    "Yabo",
  ],
  Taraba: [
    "Ardo Kola",
    "Bali",
    "Donga",
    "Gashaka",
    "Gassol",
    "Ibi",
    "Jalingo",
    "Karim Lamido",
    "Kumi",
    "Lau",
    "Sardauna",
    "Takum",
    "Ussa",
    "Wukari",
    "Yorro",
    "Zing",
  ],
  Yobe: [
    "Bade",
    "Bursari",
    "Damaturu",
    "Geidam",
    "Gujba",
    "Gulani",
    "Jakusko",
    "Karasuwa",
    "Machina",
    "Nangere",
    "Nguru",
    "Potiskum",
    "Tarmuwa",
    "Yunusari",
    "Yusufari",
  ],
  Zamfara: [
    "Anka",
    "Bakura",
    "Birnin Magaji/Kiyaw",
    "Bukkuyum",
    "Bungudu",
    "Gummi",
    "Gusau",
    "Kaura Namoda",
    "Maradun",
    "Maru",
    "Shinkafi",
    "Talata Mafara",
    "Tsafe",
    "Zurmi",
  ],
};

const nigerianStates = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
  "FCT",
];

function InviteUserModal({
  isOpen,
  onClose,
  onSuccess,
  userEmail,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
  userEmail: string;
}) {
  // const [firstName, setFirstName] = useState("");
  // const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(userEmail);
  const [role, setRole] = useState("");
  const [selectedStates, setSelectedStates] = useState<string>("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setSending(true);
    try {
      const response = await adminAPI.promoteUser({
        // fullName: firstName + " " + lastName,
        email,
        newRole:
          role === "Super Admin"
            ? "superAdmin"
            : role === "National Admin"
            ? "nsAdmin"
            : "ssAdmin",
        stateScoutCouncil:
          role === "State Admin"
            ? `${selectedStates} State Scout Council`
            : "All state council",
      });
      if (response.status === true) {
        onSuccess(email);
      }
    } catch (err: any) {
      console.error("Failed to invite user:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message
          ? err.message
          : "Failed to invite user. Please try again.",
      });
      return;
    } finally {
      // Reset form
      // setFirstName("");
      // setLastName("");
      setEmail("");
      setRole("");
      setSelectedStates("");
      setSending(false);
    }
  };

  const selectState = (state: string) => {
    setSelectedStates(state);
  };

  const getRoleDescription = () => {
    switch (role) {
      case "Super Admin":
        return "This type of user will have full access to all features on the platform";
      case "National Admin":
        return "This type of user will have full access to all features across all states";
      case "State Admin":
        return "This type of user will have full access to features within assigned state(s)";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Change role</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
            <div className="">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <button
                type="button"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <span className={role ? "text-gray-900" : "text-gray-400"}>
                  {role || "Select role"}
                </span>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {showRoleDropdown && (
                <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {["Super Admin", "National Admin", "State Admin"].map(
                    (roleOption) => (
                      <button
                        key={roleOption}
                        type="button"
                        onClick={() => {
                          setRole(roleOption);
                          setShowRoleDropdown(false);
                          if (roleOption !== "State Admin") {
                            setSelectedStates("");
                          }
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {roleOption}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {role && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-gray-700">{getRoleDescription()}</p>
            </div>
          )}

          {role === "State Admin" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Assign State Council
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-4 border border-gray-200 rounded-lg">
                {nigerianStates.map((state) => (
                  <label
                    key={state}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="stateSelection"
                      checked={selectedStates === state}
                      onChange={() => selectState(state)}
                      className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">{state}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              !role ||
              (role === "State Admin" && selectedStates === "") ||
              sending === true
            }
            className="px-6 py-2 bg-[#006400] text-white rounded-lg hover:bg-[#234623] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "Promoting..." : "Promote User"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ScoutProfileData {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  stateOfOrigin: string;
  lga: string;
  address: string;
  stateScoutCouncil: string;
  scoutDivision: string;
  scoutDistrict: string;
  troop: string;
  section: string;
  scoutingRole: string;
  membershipId: string;
  profilePic?: string;
  status?: string;
  role?: string;
  activities?: Array<{
    _id: string;
    title: string;
    description: string;
  }>;
  trainings?: Array<{
    _id: string;
    trainingType: string;
    createdAt: string;
    verified: boolean;
    status: string;
  }>;
  awards?: Array<{
    _id: string;
    title: string;
    description: string;
    status: string;
    createdAt?: string;
    verified?: boolean;
  }>;
  events?: Array<{
    _id: string;
    title: string;
    date: string;
  }>;
  user?: {
    _id: string;
    email: string;
    fullName?: string;
    profilePic?: string;
    membershipId?: string;
    status?: string;
    scoutingRole?: string;
    role?: string;
  };
}

interface ProfileModalProps {
  scout: ScoutProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  isUpdating: boolean;
}

function ProfileModal({
  scout,
  onClose,
  onSave,
  isOpen,
  isUpdating,
}: ProfileModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to safely get values from scout object
  const getScoutValue = (
    key: keyof ScoutProfileData,
    defaultValue: any = ""
  ) => {
    if (!scout) return defaultValue;
    return (scout as any)[key] ?? (scout.user as any)?.[key] ?? defaultValue;
  };
  const [formData, setFormData] = useState(() => ({
    _id: getScoutValue("_id"),
    firstName: getScoutValue("fullName", "").split(" ")[0] || "",
    lastName: getScoutValue("fullName", "").split(" ").slice(1).join(" ") || "",
    memberId: getScoutValue("membershipId", ""),
    dateOfBirth: getScoutValue("dateOfBirth", ""),
    gender: getScoutValue("gender", ""),
    stateOfOrigin: getScoutValue("stateOfOrigin", ""),
    localGovernmentArea: getScoutValue("lga", ""),
    residentialAddress: getScoutValue("address", ""),
    phoneNumber: getScoutValue("phoneNumber", ""),
    email: getScoutValue("email", ""),
    scoutingRole: getScoutValue("scoutingRole", ""),
    section: getScoutValue("section", ""),
    stateScoutCouncil: getScoutValue("stateScoutCouncil", ""),
    scoutDivision: getScoutValue("scoutDivision", ""),
    scoutDistrict: getScoutValue("scoutDistrict", ""),
    profilePic: getScoutValue("profilePic", ""),
    troop: getScoutValue("troop", ""),
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Format the data to match the expected API structure
      const formattedData = {
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        stateScoutCouncil: formData.stateScoutCouncil,
        scoutDivision: formData.scoutDivision,
        scoutDistrict: formData.scoutDistrict,
        troop: formData.troop,
        scoutingRole: formData.scoutingRole,
        section: formData.section,
        // Include other fields that might be needed
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        stateOfOrigin: formData.stateOfOrigin,
        lga: formData.localGovernmentArea,
        address: formData.residentialAddress,
        membershipId: formData.memberId,
      };

      if (onSave) {
        await onSave(formattedData);
      }

      onClose();
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Profile Management"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
              disabled={isSubmitting || isUpdating}
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
              disabled={isSubmitting || isUpdating}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="dateOfBirth"
              className="block text-sm font-medium text-gray-700"
            >
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
              disabled={isSubmitting || isUpdating}
            />
          </div>
          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700"
            >
              Gender
            </label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
              disabled={isSubmitting || isUpdating}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="stateOfOrigin"
              className="block text-sm font-medium text-gray-700"
            >
              State of Origin
            </label>
            <select
              id="stateOfOrigin"
              value={formData.stateOfOrigin}
              onChange={(e) => handleChange("stateOfOrigin", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
              disabled={isSubmitting || isUpdating}
            >
              <option value="">Select state</option>
              <option value="Abia">Abia</option>
              <option value="Adamawa">Adamawa</option>
              <option value="Akwa Ibom">Akwa Ibom</option>
              <option value="Anambra">Anambra</option>
              <option value="Bauchi">Bauchi</option>
              <option value="Bayelsa">Bayelsa</option>
              <option value="Benue">Benue</option>
              <option value="Borno">Borno</option>
              <option value="Cross River">Cross River</option>
              <option value="Delta">Delta</option>
              <option value="Ebonyi">Ebonyi</option>
              <option value="Edo">Edo</option>
              <option value="Ekiti">Ekiti</option>
              <option value="Enugu">Enugu</option>
              <option value="Gombe">Gombe</option>
              <option value="Imo">Imo</option>
              <option value="Jigawa">Jigawa</option>
              <option value="Kaduna">Kaduna</option>
              <option value="Kano">Kano</option>
              <option value="Katsina">Katsina</option>
              <option value="Kebbi">Kebbi</option>
              <option value="Kogi">Kogi</option>
              <option value="Kwara">Kwara</option>
              <option value="Lagos">Lagos</option>
              <option value="Nasarawa">Nasarawa</option>
              <option value="Niger">Niger</option>
              <option value="Ogun">Ogun</option>
              <option value="Ondo">Ondo</option>
              <option value="Osun">Osun</option>
              <option value="Oyo">Oyo</option>
              <option value="Plateau">Plateau</option>
              <option value="Rivers">Rivers</option>
              <option value="Sokoto">Sokoto</option>
              <option value="Taraba">Taraba</option>
              <option value="Yobe">Yobe</option>
              <option value="Zamfara">Zamfara</option>
              <option value="FCT">Federal Capital Territory (FCT)</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="localGovernmentArea"
              className="block text-sm font-medium text-gray-700"
            >
              Local Government Area
            </label>
            <select
              id="localGovernmentArea"
              value={formData.localGovernmentArea}
              onChange={(e) =>
                handleChange("localGovernmentArea", e.target.value)
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
              disabled={isSubmitting || isUpdating || !formData.stateOfOrigin}
            >
              <option value="">Select LGA</option>
              {nigerianLGAs[formData.stateOfOrigin]?.map((lga) => (
                <option key={lga} value={lga}>
                  {lga}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="residentialAddress"
            className="block text-sm font-medium text-gray-700"
          >
            Residential Address
          </label>
          <input
            type="text"
            id="residentialAddress"
            value={formData.residentialAddress}
            onChange={(e) => handleChange("residentialAddress", e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
            disabled={isSubmitting || isUpdating}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              maxLength={11}
              minLength={11}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
              disabled={isSubmitting || isUpdating}
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
              disabled={isSubmitting || isUpdating}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="memberId"
              className="block text-sm font-medium text-gray-700"
            >
              Member ID
            </label>
            <input
              type="text"
              id="memberId"
              value={formData.memberId}
              // onChange={(e) => handleChange("memberId", e.target.value)}
              className="mt-1 block w-full bg-amber-50 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
              disabled={isSubmitting || isUpdating}
            />
          </div>
          <div>
            <label
              htmlFor="scoutingRole"
              className="block text-sm font-medium text-gray-700"
            >
              Scouting Role
            </label>
            <input
              type="text"
              id="scoutingRole"
              value={formData.scoutingRole}
              onChange={(e) => handleChange("scoutingRole", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
              disabled={isSubmitting || isUpdating}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="section"
              className="block text-sm font-medium text-gray-700"
            >
              Section
            </label>
            <input
              type="text"
              id="section"
              value={formData.section}
              onChange={(e) => handleChange("section", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
              disabled={isSubmitting || isUpdating}
            />
          </div>
          <div>
            <label
              htmlFor="stateScoutCouncil"
              className="block text-sm font-medium text-gray-700"
            >
              State Scout Council
            </label>
            <input
              type="text"
              id="stateScoutCouncil"
              value={formData.stateScoutCouncil}
              onChange={(e) =>
                handleChange("stateScoutCouncil", e.target.value)
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
              disabled={isSubmitting || isUpdating}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="scoutDivision"
              className="block text-sm font-medium text-gray-700"
            >
              Scout Division
            </label>
            <input
              type="text"
              id="scoutDivision"
              value={formData.scoutDivision}
              onChange={(e) => handleChange("scoutDivision", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
              disabled={isSubmitting || isUpdating}
            />
          </div>
          <div>
            <label
              htmlFor="scoutDistrict"
              className="block text-sm font-medium text-gray-700"
            >
              Scout District
            </label>
            <input
              type="text"
              id="scoutDistrict"
              value={formData.scoutDistrict}
              onChange={(e) => handleChange("scoutDistrict", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
              disabled={isSubmitting || isUpdating}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="troop"
            className="block text-sm font-medium text-gray-700"
          >
            Troop
          </label>
          <input
            type="text"
            id="troop"
            value={formData.troop}
            onChange={(e) => handleChange("troop", e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
            disabled={isSubmitting || isUpdating}
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-6 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUpdating}
            className={`rounded-lg px-6 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isSubmitting || isUpdating
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
            }`}
          >
            {isSubmitting || isUpdating ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
