import type React from "react";
import { useState, useEffect } from "react";
import { authAPI } from "../services/api";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import Swal from "sweetalert2";

interface Achievement {
  _id: string;
  customTrainingName?: string;
  trainingType?: string;
  certificateUrl?: string;
  uploadDate: string;
  status: "verified" | "pending" | "rejected";
  awardName?: string;
  awardLocation?: string;
  awardUrl?: string;
  progress?: number;
  createdAt: string;
}
interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "certificate" | "award";
  onSubmit: (data: any) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  type,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    trainingType: "",
    customTraining: "",
    file: null as File | null,
    customTrainingLocation: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [sending, setSending] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const trainingOptions = [
    "Tenderfoot",
    "Second Class",
    "First Class",
    "Basic Training Course",
    "Woodbadge",
    "Assistant Leader Trainer",
    "Leader Trainer",
    "Others",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, file }));
      // Revoke old preview URL if present
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      // Only preview image files
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const clearForm = () => {
    setFormData({
      name: "",
      trainingType: "",
      customTraining: "",
      file: null,
      customTrainingLocation: "",
    });
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isOthers = formData.trainingType === "Others";
    const trainingValue =
      isOthers && formData.customTraining
        ? formData.customTraining
        : formData.trainingType;

    try {
      setSending(true);
      if (type === "certificate") {
        // Certificates: multipart/form-data with required keys
        const fd = new FormData();
        fd.append("trainingType", formData.trainingType);
        fd.append(
          "customTrainingName",
          isOthers ? formData.customTraining : trainingValue
        );
        fd.append(
          "customTrainingLocation",
          formData.customTrainingLocation || ""
        );
        if (formData.file) fd.append("photo", formData.file);
        // Add required fields for the certificate
        fd.append("scoutId", user?._id || "");
        fd.append("trainingType", trainingValue);

        await authAPI.addCertificate(fd);
      } else {
        // Awards: AwardName, Event and optional photo
        if (formData.file) {
          const awardData = new FormData();
          awardData.append("scoutId", user?._id || "");
          awardData.append("awardName", formData.name);
          awardData.append("awardLocation", trainingValue);
          awardData.append("file", formData.file);
          // Use addAward with the FormData
          await authAPI.addAward(awardData);
        }
        // else {
        //   await api.post("/createAward", {
        //     awardName: formData.name,
        //     awardLocation: trainingValue,
        //   });
        // }
      }

      // Preserve existing success UI flow
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        onSubmit({
          ...formData,
          id: Date.now().toString(),
          uploadDate: new Date().toLocaleDateString(),
          status: "pending",
        });
        setFormData({
          name: "",
          trainingType: "",
          customTraining: "",
          file: null,
          customTrainingLocation: "",
        });
        setPreviewUrl(null);
      }, 2000);
      setSending(false);
    } catch (err) {
      // Keep UI unchanged; log the error only
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Upload failed",
      });
      console.error("Upload failed:", err);
      setSending(false);
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-50">
      {showSuccess ? (
        <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Upload Successful</h3>
          <p className="text-gray-600 mb-4">
            Your {type} has been saved and under review
          </p>
          <button
            onClick={() => setShowSuccess(false)}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
          >
            Close
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Upload {type === "certificate" ? "Certificate" : "Award"}
            </h3>
            <button
              onClick={() => {
                clearForm();
                onClose();
              }}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {type === "certificate" ? "Certificate number" : "Award name"}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {type === "certificate"
                  ? "Training type"
                  : "Where did this happen?"}
              </label>
              {type === "certificate" ? (
                <select
                  value={formData.trainingType}
                  onChange={(e) =>
                    setFormData({ ...formData, trainingType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">
                    {type === "certificate"
                      ? "Select a Training"
                      : "Training/Event "}
                  </option>
                  {trainingOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="training/event"
                  value={formData.trainingType}
                  onChange={(e) =>
                    setFormData({ ...formData, trainingType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              )}
              {/* <select
                value={formData.trainingType}
                onChange={(e) =>
                  setFormData({ ...formData, trainingType: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">
                  {type === "certificate"
                    ? "Select a Training"
                    : "Training/Event "}
                </option>
                {trainingOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select> */}
            </div>

            {formData.trainingType === "Others" && (
              <div>
                <input
                  type="text"
                  placeholder="Please specify"
                  value={formData.customTraining}
                  onChange={(e) =>
                    setFormData({ ...formData, customTraining: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            )}

            {type === "certificate" && (
              <p className="text-sm text-gray-600">
                Training is linked to the certificate issued
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add a file
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="w-12 h-12 mx-auto mb-2 text-gray-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <p className="text-red-500 text-sm">Click to upload</p>
                  <p className="text-gray-400 text-xs">JPG or PNG</p>
                </label>
                {previewUrl ? (
                  <div className="mt-4 flex flex-col items-center">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-40 rounded-md border"
                    />
                    {formData.file && (
                      <p className="text-sm text-green-600 mt-2 truncate max-w-xs">
                        {formData.file.name}
                      </p>
                    )}
                  </div>
                ) : (
                  formData.file && (
                    <p className="text-sm text-green-600 mt-2">
                      {formData.file.name}
                    </p>
                  )
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  clearForm();
                  onClose();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className={
                  sending
                    ? "flex-1 px-4 py-2 bg-green-200 text-white rounded-md hover:bg-green-700 cursor-not-allowed"
                    : "flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                }
              >
                {sending ? "Submiting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export const DashboardAchievements: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<"certifications" | "awards">(
    "certifications"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [certifications, setCertifications] = useState<Achievement[]>([]);
  const [awards, setAwards] = useState<Achievement[]>([]);

  const [certificationsPagination, setCertificationsPagination] =
    useState<PaginationState>({
      currentPage: 1,
      pageSize: 10,
      totalPages: 1,
      totalItems: 0,
      hasMore: false,
    });

  const [awardsPagination, setAwardsPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0,
    hasMore: false,
  });

  // Get user data from Redux store
  const { user } = useSelector((state: RootState) => state.auth);

  const fetchAchievements = async (page = 1, loadMore = false) => {
    try {
      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const response = await authAPI.getAllCertificates(
        `?page=${page}&limit=10`
      );

      if (
        response.status &&
        response.trainings &&
        Array.isArray(response.trainings)
      ) {
        setCertifications((prev) =>
          loadMore ? [...prev, ...response.trainings] : response.trainings
        );
        setCertificationsPagination({
          currentPage: response.currentPage || 1,
          pageSize: response.pageSize || 10,
          totalPages: response.totalPages || 1,
          totalItems: response.totalTrainings || response.trainings.length,
          hasMore: response.currentPage < response.totalPages,
        });
      }
    } catch (error) {
      console.error("Error fetching achievements:", error);
    } finally {
      if (loadMore) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const fetchAwards = async (page = 1, loadMore = false) => {
    try {
      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const response = await authAPI.getAwards(
        user?._id,
        `?page=${page}&limit=10`
      );

      if (response.status && response.data && Array.isArray(response.data)) {
        setAwards((prev) =>
          loadMore ? [...prev, ...response.data] : response.data
        );
        setAwardsPagination({
          currentPage: response.currentPage || 1,
          pageSize: response.pageSize || 10,
          totalPages: response.totalPages || 1,
          totalItems: response.totalAwards || response.data.length,
          hasMore: response.currentPage < response.totalPages,
        });
      }
    } catch (error) {
      console.error("Error fetching awards:", error);
    } finally {
      if (loadMore) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const handleLoadMore = () => {
    console.log("Loading more...");
    if (activeTab === "certifications" && certificationsPagination.hasMore) {
      fetchAchievements(certificationsPagination.currentPage + 1, true);
    } else if (activeTab === "awards" && awardsPagination.hasMore) {
      fetchAwards(awardsPagination.currentPage + 1, true);
    }
  };

  const firstFetch = () => {
    fetchAchievements();
    fetchAwards();
  };

  const handleRefresh = () => {
    setIsLoading(true);
    Promise.all([fetchAchievements(), fetchAwards()]).finally(() =>
      setIsLoading(false)
    );
  };

  useEffect(() => {
    firstFetch();
  }, []);

  const getStatusBadge = (status: string) => {
    const styles = {
      verified: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles]
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const renderSkeletonCards = () => (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-20 mt-1 animate-pulse"></div>
              </div>
            </div>
            <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <p className="text-gray-500 mb-4">
        You currently have no{" "}
        {activeTab === "certifications" ? "certificate" : "award"} uploaded
      </p>
      <button
        onClick={() => setShowUploadModal(true)}
        className="text-green-600 hover:text-green-700 font-medium"
      >
        Submit a {activeTab === "certifications" ? "certificate" : "award"}
      </button>
    </div>
  );

  const renderAchievements = (items: Achievement[]) => {
    if (items.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-lg p-4 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  {/* <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg> */}
                  <img
                    src={item.certificateUrl || item.awardUrl}
                    className="w-5 h-5"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {item.customTrainingName || item.awardName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {item.trainingType || item.awardLocation}
                  </p>
                  {/* <p className="text-xs text-gray-500">
                    Uploaded on {item.uploadDate || item.createdAt}
                  </p> */}
                  <p className="text-xs text-gray-500">
                    Uploaded on{" "}
                    {new Date(
                      item.uploadDate || item.createdAt
                    ).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              {getStatusBadge(item.status || "pending")}
            </div>
          </div>
        ))}
        {/* <div className="text-center pt-4">
          <button className="text-green-600 hover:text-green-700 font-medium">
            Load more
          </button>
        </div> */}
      </div>
    );
  };

  // Render the appropriate content based on the active tab and loading state
  // const renderContent = () => {
  //   if (isLoading) {
  //     return renderSkeletonCards();
  //   }

  //   const items = activeTab === "certifications" ? certifications : awards;

  //   if (items.length === 0) {
  //     return renderEmptyState();
  //   }

  //   return renderAchievements(items);
  // };

  const renderContent = () => {
    if (isLoading && !isLoadingMore) {
      return renderSkeletonCards();
    }

    const items = activeTab === "certifications" ? certifications : awards;
    const pagination =
      activeTab === "certifications"
        ? certificationsPagination
        : awardsPagination;

    if (items.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="space-y-4">
        {renderAchievements(items)}
        {pagination.hasMore && (
          <div className="text-center pt-4">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="text-green-600 hover:text-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Achievements</h1>
          <p className="text-gray-600">
            Here you can upload and track your accomplishments
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Upload {activeTab === "certifications" ? "Certificate" : "Award"}
        </button>
      </div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("certifications")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "certifications"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Certifications
          </button>
          <button
            onClick={() => setActiveTab("awards")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "awards"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Awards
          </button>
        </nav>
      </div>

      <div className="mt-6">{renderContent()}</div>

      <UploadModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
        }}
        type={activeTab === "certifications" ? "certificate" : "award"}
        onSubmit={handleRefresh}
      />
    </div>
  );
};
