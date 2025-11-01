import { useEffect, useState, useRef } from "react";
import type { ChangeEvent } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Upload,
  X,
  Check,
} from "lucide-react";
import Pagination from "../components/Pagination";
import { adminAPI, authAPI } from "@/services/api";
import { Plus } from "lucide-react";
import Modal from "../components/Modal";
import Swal from "sweetalert2";

interface Event {
  approved: boolean;
  date: string;
  location: string;
  title: string;
  _id: string;
  description?: string;
  time?: string;
  photo?: string;
}

// Add Event Modal Component
const AddEventModal = ({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    photo: null as File | null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, photo: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("date", formData.date);
      formDataToSend.append("time", formData.time);
      formDataToSend.append("location", formData.location);
      if (formData.photo) {
        formDataToSend.append("photo", formData.photo as Blob);
      }

      const response = await authAPI.addEvent(formDataToSend);
      if (response.status === true) {
        setIsLoading(false);
        onOpenChange(false);
        onSuccess();
        // Reset form
        setFormData({
          title: "",
          description: "",
          date: "",
          time: "",
          location: "",
          photo: null,
        });
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "An error occurred while adding the event.",
      });
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset form
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      photo: null,
    });
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Add event"
      size="md"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          Fill in the information to create an event.
        </p>

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter event title"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[100px] resize-none"
            placeholder="Enter event description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date
            </label>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label
              htmlFor="time"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Time
            </label>
            <input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Location
          </label>
          <input
            id="location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter event location"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Add a file
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png"
            className="hidden"
          />
          <div
            onClick={handleUploadClick}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-40 mx-auto mb-2 rounded"
              />
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-red-500">Click to upload</p>
                <p className="text-xs text-gray-500">JPG or PNG</p>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
          >
            {isLoading ? "Creating..." : "Add event"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Edit Event Modal Component
const EditEventModal = ({
  open,
  onOpenChange,
  onSuccess,
  event,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  event: Event | null;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    photo: null as File | null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form data when event changes
  useEffect(() => {
    if (event) {
      // Format date for HTML date input (YYYY-MM-DD)
      let formattedDate = event.date || "";
      if (formattedDate) {
        // Check if date is in DD/MM/YYYY format and convert to YYYY-MM-DD
        const dateMatch = formattedDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (dateMatch) {
          const [, day, month, year] = dateMatch;
          formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
            2,
            "0"
          )}`;
        }
        // If it's already in ISO format, extract just the date part
        else if (formattedDate.includes("T")) {
          formattedDate = formattedDate.split("T")[0];
        }
      }

      setFormData({
        title: event.title || "",
        description: event.description || "",
        date: formattedDate,
        time: event.time || "",
        location: event.location || "",
        photo: null,
      });
      setPreviewUrl(event.photo || null);
    }
  }, [event]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, photo: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!event) return;

    try {
      setIsLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("date", formData.date);
      formDataToSend.append("time", formData.time);
      formDataToSend.append("location", formData.location);
      if (formData.photo) {
        formDataToSend.append("photo", formData.photo as Blob);
      }

      const response = await adminAPI.editEvent(formDataToSend, event._id);
      if (response.status === true) {
        setIsLoading(false);
        onOpenChange(false);
        onSuccess();
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Event updated successfully!",
        });
      }
    } catch (err: any) {
      setIsLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "An error occurred while updating the event.",
      });
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Edit event"
      size="md"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          Update the event information.
        </p>

        <div>
          <label
            htmlFor="edit-title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <input
            id="edit-title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter event title"
          />
        </div>

        <div>
          <label
            htmlFor="edit-description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="edit-description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[100px] resize-none"
            placeholder="Enter event description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="edit-date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date
            </label>
            <input
              id="edit-date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label
              htmlFor="edit-time"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Time
            </label>
            <input
              id="edit-time"
              type="time"
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="edit-location"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Location
          </label>
          <input
            id="edit-location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter event location"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Add a file
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png"
            className="hidden"
          />
          <div
            onClick={handleUploadClick}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-40 mx-auto mb-2 rounded"
              />
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-red-500">Click to upload</p>
                <p className="text-xs text-gray-500">JPG or PNG</p>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
          >
            {isLoading ? "Updating..." : "Update event"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Success Modal Component
const SuccessModal = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => (
  <Modal isOpen={open} onClose={() => onOpenChange(false)} title="" size="sm">
    <div className="text-center">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => onOpenChange(false)}
          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-900">Success</h3>
      <p className="text-gray-600 mb-6 text-sm leading-relaxed">
        Your event has been created and it's under review by an admin.
      </p>
      <button
        onClick={() => onOpenChange(false)}
        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
      >
        Close
      </button>
    </div>
  </Modal>
);
// const events = [
//   {
//     id: 1,
//     title: "National Scout Parade and President Awards",
//     location: "Ronik international school ejigbo Lagos",
//     date: "03/03/2025",
//     status: "Active",
//   },
//   {
//     id: 2,
//     title: "National Scout Parade and President Awards",
//     location: "Ronik international school ejigbo Lagos",
//     date: "03/03/2025",
//     status: "Expired",
//   },
// ];

export default function Event() {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [eventList, setEventList] = useState<Event[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const fetchEvents = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: perPage.toString(),
      });

      if (search.trim()) {
        queryParams.append("title", search.trim());
      }

      const response = await adminAPI.getAllEvents(
        `?${queryParams.toString()}`
      );
      if (response.status) {
        // Handle fetched events
        setEventList(response?.events || []);
        // pagination: { totalUsers, currentPage, totalPages, perPage, hasNextPage, hasPrevPage }
        if (response.pagination) {
          setTotalItems(response.pagination.totalUsers || 0);
          setCurrentPage(response.pagination.currentPage || page);
          setTotalPages(response.pagination.totalPages || 1);
          setPerPage(response.pagination.perPage || perPage);
        }
        // console.log(response);
      }
    } catch (err: any) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(currentPage, searchQuery);
  }, [currentPage]);

  // Debug effect for showEditModal
  useEffect(() => {
    console.log("showEditModal state changed to:", showEditModal);
  }, [showEditModal]);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1); // Reset to first page when searching
      } else {
        fetchEvents(1, searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only run this if there's an open dropdown
      if (!openDropdown) return;

      // Get the dropdown menu element
      const dropdownMenu = dropdownRef.current?.querySelector(".dropdown-menu");
      const dropdownButton = dropdownRef.current?.querySelector(
        "button[aria-haspopup]"
      );

      // Check if the click is outside both the dropdown menu and the button
      if (
        dropdownRef.current &&
        dropdownMenu &&
        dropdownButton &&
        !dropdownMenu.contains(event.target as Node) &&
        !dropdownButton.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    // Use click instead of mousedown to allow the click to complete first
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [openDropdown]); // Only re-run when openDropdown changes

  const handleEdit = (eventId: string, e: React.MouseEvent) => {
    console.log("handleEdit called with eventId:", eventId);
    e.stopPropagation(); // Prevent event bubbling
    const event = eventList.find((e) => e._id === eventId);
    console.log("Found event:", event);
    if (event) {
      console.log("Setting editing event and showing modal");
      setEditingEvent(event);
      setShowEditModal(true);
      console.log("showEditModal after set:", showEditModal);
      setOpenDropdown(null); // Close the dropdown
    } else {
      console.error("No event found with id:", eventId);
    }
  };

  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (eventId: string) => {
    setEventToDelete(eventId);
    setShowDeleteConfirm(true);
    setOpenDropdown(null);
  };

  const confirmDelete = async () => {
    if (!eventToDelete || isDeleting) return;
    
    setIsDeleting(true);
    
    try {
      const response = await adminAPI.deleteEvent(eventToDelete);
      if (response.status === true) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Event deleted successfully!",
        });
        // Refresh the events list
        fetchEvents(currentPage, searchQuery);
        setShowDeleteConfirm(false);
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to delete event",
      });
      setShowDeleteConfirm(false);
      setEventToDelete(null);
      setIsDeleting(false);
    }
  };

  const toggleDropdown = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // Close if clicking the same dropdown
    if (openDropdown === eventId) {
      setOpenDropdown(null);
      return;
    }

    // Open the dropdown
    setOpenDropdown(eventId);

    // Position the dropdown after it's rendered
    setTimeout(() => {
      const dropdownButton = e.currentTarget as HTMLElement;
      const dropdownMenu = document.getElementById(`dropdown-menu-${eventId}`);

      if (dropdownButton && dropdownMenu) {
        const buttonRect = dropdownButton.getBoundingClientRect();
        const menuHeight = 200; // maxHeight from the dropdown
        const spaceBelow = window.innerHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;

        // Calculate position
        const buttonRight = window.innerWidth - buttonRect.right;

        // If not enough space below but more space above, show above
        if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
          // Position above the button
          dropdownMenu.style.top = "auto";
          dropdownMenu.style.bottom = `${
            window.innerHeight - buttonRect.top
          }px`;
          dropdownMenu.style.transform = "translateY(0)";
        } else {
          // Position below the button
          dropdownMenu.style.top = `${buttonRect.bottom}px`;
          dropdownMenu.style.bottom = "auto";
          dropdownMenu.style.transform = "translateY(0)";
        }

        // Position horizontally
        dropdownMenu.style.left = "auto";
        dropdownMenu.style.right = `${buttonRight}px`;

        // Position horizontally
        dropdownMenu.style.left = "auto";
        dropdownMenu.style.right = `${window.innerWidth - buttonRect.right}px`;
      }
    }, 0);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const handleModalSuccess = () => {
    setShowSuccessModal(true);
    fetchEvents(currentPage, searchQuery); // Refresh the events list
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Event</h1>
          <p className="text-gray-600">
            Here you can view and manage scouting events
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center bg-green-700 gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create event
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              {eventList.length} {eventList.length !== 1 ? "Events" : "Event"}
              {searchQuery && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (filtered by "{searchQuery}")
                </span>
              )}
            </h3>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                type="button"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="h-3 bg-gray-200 rounded w-40 animate-pulse" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="h-6 w-6 bg-gray-200 rounded animate-pulse ml-auto" />
                      </td>
                    </tr>
                  ))
                : eventList?.map((event) => {
                    // parse date - support ISO or dd/mm/yyyy
                    const parseDate = (d: string) => {
                      // try ISO parse first
                      const iso = new Date(d);
                      if (!isNaN(iso.getTime())) return iso;
                      // try dd/mm/yyyy
                      const parts = d.split("/");
                      if (parts.length === 3) {
                        const [dd, mm, yyyy] = parts;
                        const parsed = new Date(`${yyyy}-${mm}-${dd}`);
                        if (!isNaN(parsed.getTime())) return parsed;
                      }
                      return new Date(d);
                    };

                    const eventDate = parseDate(event.date);
                    const isExpired =
                      eventDate.getTime() < new Date().setHours(0, 0, 0, 0);

                    return (
                      <tr key={event._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <Link
                            to={`/admin/event/${event._id}`}
                            className="text-primary hover:underline font-medium"
                          >
                            {event.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {event.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 text-sm ${
                              isExpired ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isExpired ? "bg-red-600" : "bg-green-600"
                              }`}
                            />
                            {isExpired ? "Expired" : "Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="relative" ref={dropdownRef}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                toggleDropdown(event._id, e);
                              }}
                              className="p-1 hover:bg-gray-100 rounded focus:outline-none"
                              aria-haspopup="true"
                              aria-expanded={openDropdown === event._id}
                              aria-controls={`dropdown-menu-${event._id}`}
                            >
                              <MoreVertical className="w-5 h-5 text-gray-600" />
                            </button>

                            {openDropdown === event._id && (
                              <div
                                id={`dropdown-menu-${event._id}`}
                                className="dropdown-menu absolute bg-white rounded-md shadow-lg border border-gray-200 z-50"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  maxHeight: '200px',
                                  overflowY: 'auto',
                                  minWidth: '192px',
                                  position: 'absolute',
                                  right: '0',
                                  top: '100%',
                                  marginTop: '0.25rem',
                                }}
                                ref={(el) => {
                                  if (!el) return;
                                  // Calculate if dropdown would go off screen
                                  const rect = el.getBoundingClientRect();
                                  const viewportHeight = window.innerHeight;
                                  const viewportWidth = window.innerWidth;
                                  
                                  // Reset any previous positioning
                                  el.style.right = '0';
                                  el.style.left = 'auto';
                                  el.style.top = '100%';
                                  el.style.bottom = 'auto';
                                  
                                  // Check if dropdown would go off the right edge
                                  const rightEdge = rect.right;
                                  if (rightEdge > viewportWidth) {
                                    el.style.right = 'auto';
                                    el.style.left = '0';
                                  }
                                  
                                  // Check if dropdown would go off the bottom
                                  const bottomEdge = rect.bottom;
                                  if (bottomEdge > viewportHeight) {
                                    el.style.top = 'auto';
                                    el.style.bottom = '100%';
                                    el.style.marginTop = '0';
                                    el.style.marginBottom = '0.25rem';
                                  }
                                }}
                              >
                                <div className="py-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleEdit(event._id, e);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDelete(event._id);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => setCurrentPage(p)}
          totalItems={totalItems}
          itemsPerPage={perPage}
        />
      </div>

      {/* Add Event Modal */}
      <AddEventModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={handleModalSuccess}
      />

      {/* Edit Event Modal */}
      <EditEventModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onSuccess={() => {
          setShowEditModal(false);
          fetchEvents(currentPage, searchQuery);
          setShowSuccessModal(true);
        }}
        event={editingEvent}
      />

      {/* Success Modal */}
      <SuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
      />

      {/* Delete Confirmation Modal */}
      <div
        className={`fixed inset-0 z-[9999] ${
          showDeleteConfirm ? "block" : "hidden"
        }`}
      >
        <div className="flex items-center justify-center min-h-screen">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setShowDeleteConfirm(false)}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="relative z-50 w-full max-w-lg px-4">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="px-6 py-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <svg
                      className="h-6 w-6 text-red-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Delete Event
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this event? This action
                        cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className={`w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                    isDeleting 
                      ? 'bg-red-400 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  }`}
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : 'Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
