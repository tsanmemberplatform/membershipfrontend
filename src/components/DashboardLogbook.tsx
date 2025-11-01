import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import LogImage from "../assets/LogBookImage.png";
import { authAPI } from "../services/api";

interface Activity {
  _id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  fileUrl: string;
  status: "Verified" | "Pending" | "Rejected";
}

interface AddActivityForm {
  title: string;
  date: string;
  location: string;
  description: string;
  image: File | null;
}

export const DashboardLogbook: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [pageSize] = useState(4);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<AddActivityForm>({
    title: "",
    date: "",
    location: "",
    description: "",
    image: null,
  });

  const getActivities = async (page: number = currentPage) => {
    try {
      const response = await authAPI.getAllLogs(
        `?page=${page}&limit=${pageSize}`
      );
      if (response.status) {
        setActivities(response.logs || []);

        // Safely update pagination state with fallbacks
        if (typeof response.totalPages === "number") {
          setTotalPages(response.totalPages);
        }

        if (typeof response.totalLogs === "number") {
          setTotalLogs(response.totalLogs);
        }

        if (typeof response.currentPage === "number") {
          setCurrentPage(response.currentPage);
        }
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadActivities = async () => {
      setIsLoading(true);
      await getActivities(1);
      //   {
      //     id: "1",
      //     title: "Hiking Adventure",
      //     date: "8 May, 2025",
      //     location: "National Park",
      //     description:
      //       "Today, I completed a hike that challenged my strength and built my confidence. I followed the trail with my troop, carried my gear, and practiced the skills I have learned, like staying safe, observing nature, and working as a team. Along the way, I admired the trees, streams, and wildlife, which reminded me of the importance of caring for the environment. Logging this activity helps me remember the distance covered, lessons learned, and the fun shared, while preparing for future hikes.",
      //     image: LogImage,
      //     status: "Verified",
      //   },
      //   {
      //     id: "2",
      //     title: "Hiking Adventure",
      //     date: "8 May, 2025",
      //     location: "Mountain Trail",
      //     description: "Another great hiking experience with the troop.",
      //     image: LogImage,
      //     status: "Pending",
      //   },
      //   {
      //     id: "3",
      //     title: "Hiking Adventure",
      //     date: "8 May, 2025",
      //     location: "Forest Path",
      //     description: "Challenging hike through the forest.",
      //     image: LogImage,
      //     status: "Rejected",
      //   },
      //   {
      //     id: "4",
      //     title: "Hiking Adventure",
      //     date: "8 May, 2025",
      //     location: "River Trail",
      //     description: "Beautiful hike along the river.",
      //     image: LogImage,
      //     status: "Rejected",
      //   },
      //   {
      //     id: "5",
      //     title: "Hiking Adventure",
      //     date: "8 May, 2025",
      //     location: "Hill Country",
      //     description: "Scenic hike through rolling hills.",
      //     image: LogImage,
      //     status: "Verified",
      //   },
      //   {
      //     id: "6",
      //     title: "Hiking Adventure",
      //     date: "8 May, 2025",
      //     location: "Coastal Path",
      //     description: "Amazing coastal hiking experience.",
      //     image: LogImage,
      //     status: "Verified",
      //   },
      //   {
      //     id: "7",
      //     title: "Hiking Adventure",
      //     date: "8 May, 2025",
      //     location: "Desert Trail",
      //     description: "Challenging desert hiking adventure.",
      //     image: LogImage,
      //     status: "Verified",
      //   },
      //   {
      //     id: "8",
      //     title: "Hiking Adventure",
      //     date: "8 May, 2025",
      //     location: "Valley Walk",
      //     description: "Peaceful valley hiking experience.",
      //     image: LogImage,
      //     status: "Verified",
      //   },
      // ];

      // setActivities(mockActivities);
      setIsLoading(false);
    };

    loadActivities();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, image: file }));
  };

  const handleAddActivity = async () => {
    setIsAdding(true);
    try {
      if (!form.title || !form.date || !form.location || !form.description) {
        alert("Please fill in all required fields");
        return;
      }

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("date", form.date);
      formData.append("location", form.location);
      formData.append("description", form.description);
      formData.append("photo", form.image || "");

      const response = await authAPI.addLogs(formData);
      console.log(response);

      if (response.status) {
        getActivities();
      }

      setShowAddModal(false);
    } catch (error: any) {
      console.log(error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleActivityClick = (activity: Activity) => {
    navigate(`/dashboard/logbook/${activity._id}`, { state: { activity } });
  };

  const getStatusBadge = (status: Activity["status"]) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "Verified":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "Rejected":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return baseClasses;
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm overflow-hidden"
        >
          <div className="w-full h-48 bg-gray-200 animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Logbook</h1>
          <p className="text-gray-600">
            Here you can add and view all your scouting activities
          </p>
        </div>
        {!isLoading && activities.length > 0 && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium"
          >
            Add new activity
          </button>
        )}
      </div>

      {isLoading ? (
        renderSkeleton()
      ) : activities.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-gray-500">
              Your logbook is empty. Start logging your scouting activities!
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center mx-auto"
            >
              <span className="mr-2">+</span>
              Add Entry
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activities.map((activity) => (
              <div
                key={activity._id}
                onClick={() => handleActivityClick(activity)}
                className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              >
                <img
                  src={activity.fileUrl || "/placeholder.svg"}
                  alt={activity.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {activity.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {formatDate(activity.date)}
                  </div>
                  <span className={getStatusBadge(activity.status)}>
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-4 mt-8">
              <button
                onClick={() => getActivities(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md font-medium ${
                  currentPage === 1
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {currentPage} of {totalPages} ({totalLogs} total logs)
              </span>
              <button
                onClick={() => getActivities(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md font-medium ${
                  currentPage === totalPages
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

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
                    onChange={handleInputChange}
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
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Describe your activity..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add a file
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                      id="file-upload"
                    />
                    {form.image ? (
                      <div className="space-y-2">
                        <div className="mx-auto max-w-xs overflow-hidden rounded-md">
                          <img
                            src={URL.createObjectURL(form.image)}
                            alt="Preview"
                            className="w-full h-auto max-h-40 object-contain mx-auto"
                          />
                        </div>
                        <p className="text-sm text-gray-600">
                          {form.image.name}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({ ...prev, image: null }))
                          }
                          className="text-red-600 text-sm hover:text-red-800"
                        >
                          Change image
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="w-12 h-12 mx-auto mb-2 text-gray-400">
                          <svg
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                        </div>
                        <p className="text-green-600 font-medium">
                          Click to upload
                        </p>
                        <p className="text-gray-500 text-sm">
                          or drag and drop
                        </p>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddActivity}
                  disabled={isAdding}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAdding ? "Adding..." : "Add activity"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
