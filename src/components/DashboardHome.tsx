import React, { useEffect, useState } from "react";
// import profileImage from "../assets/ImagePlaceHolder.png"
// import eventImage from "../assets/EventImage.png";
import { useAppSelector } from "../hooks/useAppSelector";
import { authAPI } from "../services/api";

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30;
  const year = day * 365;

  if (diffInSeconds < minute) {
    return "just now";
  } else if (diffInSeconds < hour) {
    const minutes = Math.floor(diffInSeconds / minute);
    return rtf.format(-minutes, "minute");
  } else if (diffInSeconds < day) {
    const hours = Math.floor(diffInSeconds / hour);
    return rtf.format(-hours, "hour");
  } else if (diffInSeconds < month) {
    const days = Math.floor(diffInSeconds / day);
    return rtf.format(-days, "day");
  } else if (diffInSeconds < year) {
    const months = Math.floor(diffInSeconds / month);
    return rtf.format(-months, "month");
  } else {
    const years = Math.floor(diffInSeconds / year);
    return rtf.format(-years, "year");
  }
};
import Swal from "sweetalert2";
// import { GetEventResponse } from "../types/auth";

interface DashboardInfo {
  totalLogs: number;
  totalEvents: number;
  achievement: number;
}

interface Events {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  photoUrl: string;
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  approved: true;
  // attendees: [];
  createdAt: string;
  updatedAt: string;
  __v: number;
  rsvpStatus?: string;
}

interface AddActivityForm {
  title: string;
  date: string;
  location: string;
  description: string;
  image: File | null;
}

interface Activities {
  createdAt: string;
  date: string;
  description: string;
  fileUrl: string;
  location: string;
  scout: string;
  title: string;
  updatedAt: string;
  _id: string;
}

export const DashboardHome: React.FC = () => {
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [events, setEvents] = useState<Events[]>([]);
  const [activities, setActivities] = useState<Activities[]>([]);
  const [registering, setRegistering] = useState(false);
  const [form, setForm] = useState<AddActivityForm>({
    title: "",
    date: "",
    location: "",
    description: "",
    image: null,
  });
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dashboardInfo, setDashboardInfo] = useState<DashboardInfo | null>(
    null
  );
  // const [loadingDashboardInfo, setLoadingDashboardInfo] = useState(false);
  // const {user} = useAppSelector((state) => state.auth);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (eventId: string) => {
    setOpenDropdownId(openDropdownId === eventId ? null : eventId);
  };

  const handleRSVP = async (
    eventId: string,
    status: "Going" | "Not Going" | "Maybe"
  ) => {
    try {
      setRegistering(true);
      openDropdownId && setOpenDropdownId(null);
      // Call your API to update the RSVP status
      const response = await authAPI.registerForAnEvent({
        id: eventId,
        status: status,
      });
      if (response.status) {
        // Update the UI accordingly
        setEvents(
          events.map((event) =>
            event._id === eventId ? { ...event, rsvpStatus: status } : event
          )
        );
        setOpenDropdownId(null);
      }
      console.log(eventId);

      // For now, just close the dropdown
      setOpenDropdownId(null);

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Success",
        text: `You have marked yourself as ${status}`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error updating RSVP:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update RSVP status",
      });
    } finally {
      setRegistering(false);
    }
  };

  const getUserDashboardInfo = async () => {
    try {
      // setLoadingDashboardInfo(true);
      const response = await authAPI.getUserDashboardInfo();
      if (response.status) {
        setDashboardInfo(response.data);
        // console.log(response.data);
      }
    } catch (error) {
      console.error("Error fetching user dashboard info:", error);
    } finally {
      // setLoadingDashboardInfo(false);
    }
  };

  const getUpcomingEvents = async () => {
    try {
      setLoadingEvents(true);

      const response = await authAPI.upcomingEvents();
      // console.log(response.events);
      if (response.status) {
        // Ensure each event has a 'date' property, fallback to createdAt if missing
        let eventInfo = (response?.events as any[]).map((event) => ({
          ...event,
          date: event.date || event.createdAt || "",
        }));
        let eventToSet = eventInfo.map((event) => {
          let rsvpStatus: string;
          const attendee = (event as any).attendees?.find(
            (attendee: any) => attendee.scout === user?._id
          );
          if (attendee) {
            rsvpStatus = attendee.status;
          } else {
            rsvpStatus = "Register";
          }
          return { ...event, rsvpStatus };
        });

        setEvents(eventToSet);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingEvents(false);
      getRecentActivities();
    }
  };

  const getRecentActivities = async () => {
    try {
      setLoadingActivities(true);
      const res = await authAPI.getAllLogs();
      if (res.status) {
        // console.log(res);
        const latestThree = res.logs.slice(-3).reverse();
        setActivities(latestThree);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    getUpcomingEvents();
    getRecentActivities();
    getUserDashboardInfo();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-[#F0F2F5] rounded-lg shadow-sm pt-6 px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <img
                src={user?.profilePic}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500">
                {new Date()
                  .toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                  .replace(/(\d+)/, (_, p1) => {
                    const day = parseInt(p1);
                    const suffix =
                      day > 3 && day < 21
                        ? "th"
                        : { 1: "st", 2: "nd", 3: "rd" }[day % 10] || "th";
                    return day + suffix;
                  })}
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Good{" "}
                {new Date().getHours() < 12
                  ? "Morning"
                  : new Date().getHours() < 17
                  ? "Afternoon"
                  : "Evening"}
                , {user?.fullName?.split(" ")[0] || "Member"}
              </h1>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 md:mt-0 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
          >
            <span className="mr-2">+</span>
            Log my activity
          </button>
        </div>

        {/* Add Activity Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Add Activity
                  </h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <p className="text-gray-600 mb-6">
                  Fill in the information to add your activity to the logbook
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title*
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter activity title"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date*
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={(e) =>
                          setForm({ ...form, date: e.target.value })
                        }
                        min={`${new Date().getFullYear()}-01-01`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={form.location}
                        onChange={(e) =>
                          setForm({ ...form, location: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter location"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description/Story*
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      placeholder="Describe your activity..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Add a file
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setForm({ ...form, image: e.target.files[0] });
                          }
                        }}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center justify-center text-gray-600"
                      >
                        <svg
                          className="w-12 h-12 mb-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        <p className="text-sm">
                          {form.image
                            ? form.image.name
                            : "Click to upload an image (optional)"}
                        </p>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (
                        !form.title ||
                        !form.date ||
                        !form.location ||
                        !form.description
                      ) {
                        alert("Please fill in all required fields");
                        return;
                      }

                      setIsAdding(true);
                      try {
                        const formData = new FormData();
                        formData.append("title", form.title);
                        formData.append("date", form.date);
                        formData.append("location", form.location);
                        formData.append("description", form.description);
                        if (form.image) {
                          formData.append("photo", form.image);
                        }

                        const response = await authAPI.addLogs(formData);
                        console.log(response);

                        if (response.status) {
                          // Refresh activities if needed
                          Swal.fire({
                            icon: "success",
                            title: "Activity added successfully",
                            showConfirmButton: false,
                            timer: 1500,
                          });
                          setShowAddModal(false);
                          setForm({
                            title: "",
                            date: "",
                            location: "",
                            description: "",
                            image: null,
                          });
                        }
                      } catch (error) {
                        Swal.fire({
                          icon: "error",
                          title: "Error adding activity",
                          showConfirmButton: false,
                          timer: 1500,
                        });
                        console.error("Error adding activity:", error);
                      } finally {
                        setIsAdding(false);
                      }
                    }}
                    disabled={isAdding}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {isAdding ? "Adding..." : "Add Activity"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="">
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-gray-700 w-24">Member ID:</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                {user?.membershipId}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-700 w-24">Council:</span>
              <span className="text-gray-900">{user?.stateScoutCouncil}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-700 w-24">Scouting role:</span>
              <span className="text-gray-900">{user?.scoutingRole}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-700 w-24">Section:</span>
              <span className="text-gray-900">{user?.section}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-6 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
              <span className="font-medium">
                {dashboardInfo?.totalLogs}
              </span>{" "}
              Activities log
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
              <span className="font-medium">
                {dashboardInfo?.totalEvents}
              </span>{" "}
              Events attended
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
              <span className="font-medium">
                {dashboardInfo?.achievement}
              </span>{" "}
              Achievements
            </div>
          </div>
        </div>
        {user?.status === "suspended" && (
          <div className="mt-4 -mx-6 px-6 bg-red-50 border-t flex justify-center items-center border-red-200 py-4 w-[calc(100%+3rem)]">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-red-500 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-red-700 font-medium">
                Your account has been suspended
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Upcoming Events */}
      <div className="">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Upcoming events
        </h2>

        {loadingEvents ? (
          <div className="space-y-4 bg-white rounded-lg shadow-sm p-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-4 w-full">
                  <div className="w-16 h-12 bg-gray-200 rounded animate-pulse"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                  </div>
                </div>
                <div className="w-24 h-9 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-4 bg-white rounded-lg shadow-sm p-6">
            {events.map((event) => (
              <div
                key={event._id}
                className="flex items-center flex-col gap-1.5 justify-between p-4 border border-gray-200 rounded-lg sm:flex-row"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={event.photoUrl || "/placeholder.svg"}
                    alt={event.title}
                    className="w-16 h-12 rounded object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {new Date(event.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
                <div className="relative dropdown-container w-full sm:w-auto flex justify-center">
                  <button
                    disabled={registering}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown(event._id);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 flex justify-between items-center gap-1 w-full sm:w-auto"
                  >
                    {registering
                      ? "registering..."
                      : event.rsvpStatus || "Register"}
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        openDropdownId === event._id
                          ? "transform rotate-180"
                          : ""
                      }`}
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

                  {openDropdownId === event._id && (
                    <div className="absolute right-0 mt-1 w-full bg-white rounded-md shadow-lg z-10 border border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRSVP(event._id, "Going");
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Going
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRSVP(event._id, "Not Going");
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Not Going
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRSVP(event._id, "Maybe");
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Maybe
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-gray-500">There are no available events yet</p>
          </div>
        )}
      </div>

      {/* My Recent Activity */}
      <div className="">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          My recent activity
        </h2>

        {loadingActivities ? (
          <div className="space-y-4 bg-white rounded-lg shadow-sm p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 w-full">
                  <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="w-full">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-4 bg-white rounded-lg shadow-sm p-6">
            {activities.map((activity) => (
              <div
                key={activity._id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {activity.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatRelativeTime(activity.createdAt)}
                    </div>
                  </div>
                </div>
                {/* <span className={`text-sm font-medium ${activity.statusColor}`}>
                  {activity.status}
                </span> */}
              </div>
            ))}
            <div className="flex w-full justify-center">
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center w-auto"
              >
                <span className="mr-2">+</span>
                Log my activity
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">
              You have no logs yet, start your first activity
            </p>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center mx-auto">
              <span className="mr-2">+</span>
              Log my activity
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
