"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import {
  Upload,
  X,
  Eye,
  Calendar,
  Plus,
  MapPin,
  Clock,
  // ChevronDown,
  Check,
  // Badge,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { EditEventModal } from "./EditEventModal";
import type { ChangeEvent } from "react";
import { adminAPI, authAPI } from "../services/api";
import Swal from "sweetalert2";

// Types
interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  photoUrl?: string;
  photo?: string;
  createdBy?: {
    _id: string;
    fullName: string;
    email: string;
  };
  attendees?: Array<{
    scout: string;
    status: string;
  }>;
  approved?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

// Mock data for events
// const mockEvents: Event[] = [
//   {
//     _id: "1",
//     title: "National Scout Parade and President Awards (NISPPA)",
//     location: "Abuja",
//     date: "8 May, 2025",
//     description: "National Scout Parade and President Awards (NISPPA)",
//     photoUrl: "/scout-parade-event-poster.jpg",
//   },
//   {
//     _id: "2",
//     title: "National Scout Parade and President Awards (NISPPA)",
//     location: "Abuja",
//     date: "8 May, 2025",
//     description: "National Scout Parade and President Awards (NISPPA)",
//     photoUrl: "/scout-parade-event-poster.jpg",
//   },
//   {
//     _id: "3",
//     title: "National Scout Parade and President Awards (NISPPA)",
//     location: "Abuja",
//     date: "8 May, 2025",
//     description: "National Scout Parade and President Awards (NISPPA)",
//     photoUrl: "/scout-parade-event-poster.jpg",
//   },
//   {
//     _id: "4",
//     title: "National Scout Parade and President Awards (NISPPA)",
//     location: "Abuja",
//     date: "8 May, 2025",
//     description: "National Scout Parade and President Awards (NISPPA)",
//     photoUrl: "/scout-parade-event-poster.jpg",
//   },
// ];

// UI Components (inline implementations)
const Button = ({
  children,
  onClick,
  variant = "default",
  size = "default",
  className = "",
  disabled = false,
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm";
  className?: string;
  disabled?: boolean;
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  };

  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <div
    className={`rounded-lg border bg-card text-card-foreground shadow-sm h-auto max-h-[350px] w-[250px] ${className}`}
    onClick={onClick}
    style={{ cursor: onClick ? "pointer" : "default" }}
  >
    {children}
  </div>
);

const Input = ({
  className = "",
  type = "text",
  placeholder = "",
  value,
  onChange,
  id,
  ...props
}: {
  className?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
}) => (
  <input
    type={type}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    id={id}
    {...props}
  />
);

const Textarea = ({
  className = "",
  placeholder = "",
  value,
  onChange,
  id,
  ...props
}: {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  id?: string;
}) => (
  <textarea
    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    id={id}
    {...props}
  />
);

const Label = ({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) => (
  <label
    htmlFor={htmlFor}
    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  >
    {children}
  </label>
);

const Dialog = ({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50">{children}</div>
    </div>
  );
};

const DialogContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`bg-background p-6 shadow-lg rounded-lg border ${className}`}>
    {children}
  </div>
);

const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
    {children}
  </div>
);

const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold leading-none tracking-tight">
    {children}
  </h3>
);

// Sub-components
import { useNavigate } from "react-router-dom";

const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "approved":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const EventCard = ({
  event,
  activeTab,
  onEdit,
  onDelete,
  // onApprove,
  // onReject,
  openDropdown,
  toggleDropdown,
}: {
  event: Event;
  activeTab: string;
  onEdit: (eventId: string, e: React.MouseEvent) => void;
  onDelete: (eventId: string) => void;
  onApprove?: (eventId: string) => void;
  onReject?: (eventId: string) => void;
  openDropdown: string | null;
  toggleDropdown: (eventId: string, e: React.MouseEvent) => void;
}) => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });

  const handleCardClick = () => {
    if (activeTab === "My events") {
      // navigate(`/dashboard/my-events/${event._id}`);
    } else {
      navigate(`/dashboard/events/${event._id}`);
    }
  };

  const handleToggleDropdown = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownPosition({ x: e.clientX, y: e.clientY });
    toggleDropdown(eventId, e);
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-md transition-shadow py-2 cursor-pointer hover:bg-gray-50"
      onClick={handleCardClick}
    >
      <div className="aspect-[4/3] bg-gray-200 w-[95%] mx-auto border-2 border-gray-300 rounded-lg overflow-hidden">
        <img
          src={
            event.photoUrl ||
            `https://via.placeholder.com/300x200?text=Scout+Event`
          }
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-sm mb-3 line-clamp-2">{event.title}</h3>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span>
              {event.date
                ? new Date(event.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "No date provided"}
            </span>
          </div>
        </div>

        {activeTab === "My events" && (
          <div className="flex items-center justify-between mt-3">
            <div
              className={`text-xs px-2 py-1 rounded text-center w-24 ${getStatusColor(
                event.approved ? "approved" : "pending"
              )} border-0`}
            >
              {event.approved ? "Approved" : "Pending"}
            </div>

            <div
              className="flex items-center justify-between mt-3 relative"
              ref={dropdownRef}
              style={{ position: "relative", zIndex: 1 }}
            >
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => handleToggleDropdown(event._id, e)}
                  className="p-1 hover:bg-gray-100 rounded focus:outline-none z-10"
                  aria-haspopup="true"
                  aria-expanded={openDropdown === event._id}
                  aria-controls={`dropdown-menu-${event._id}`}
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>

                {openDropdown === event._id && (
                  <div
                    id={`dropdown-menu-${event._id}`}
                    className="fixed w-48 bg-white rounded-md shadow-lg py-1 z-[1000] border border-gray-200"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="options-menu"
                    style={{
                      willChange: "transform",
                      top: `${dropdownPosition.y}px`,
                      left: `${dropdownPosition.x}px`,
                    }}
                  >
                    <button
                      onClick={(e) => onEdit(event._id, e)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Event
                    </button>
                    <button
                      onClick={() => onDelete(event._id)}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      role="menuitem"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Event
                    </button>
                    <button
                      onClick={() => navigate(`/dashboard/events/${event._id}`)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Event
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

const EventSkeleton = () => (
  <Card className="overflow-hidden">
    <div className="aspect-[4/3] bg-gray-200 animate-pulse"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>

      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
      </div>

      <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>

      <div className="flex items-center justify-between">
        <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
        <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  </Card>
);

const EmptyState = ({ onCreateEvent }: { onCreateEvent: () => void }) => (
  <div className="text-center py-16">
    <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
      <Calendar className="w-full h-full" />
    </div>
    <p className="text-gray-500 mb-4">You currently have not event</p>
    <Button
      onClick={onCreateEvent}
      variant="outline"
      className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
    >
      Add new event
    </Button>
  </div>
);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Add event</DialogTitle>
          <p className="text-sm text-gray-600">
            Fill in the information to create an event.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="mt-1"
              placeholder="Enter event title"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="mt-1 min-h-[100px] resize-none"
              placeholder="Enter event description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="mt-1"
                placeholder="DD/MM/YYYY"
              />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                className="mt-1"
                placeholder="00:00am"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="mt-1"
              placeholder="Enter event location"
            />
          </div>

          <div>
            <Label>Add a file</Label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png"
              className="hidden"
            />
            <div
              onClick={handleUploadClick}
              className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
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
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 bg-transparent"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Creating..." : "Add event"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SuccessModal = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-sm text-center p-6 bg-white">
      <div className="flex justify-end mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOpenChange(false)}
          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="w-8 h-8 text-green-600" />
      </div>

      <h3 className="text-lg font-semibold mb-2 text-gray-900">Success</h3>
      <p className="text-gray-600 mb-6 text-sm leading-relaxed">
        Your event has been created and it's under review by an admin.
      </p>

      <Button
        onClick={() => onOpenChange(false)}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        Close
      </Button>
    </DialogContent>
  </Dialog>
);

// Main Component
export const DashboardEvents = () => {
  const [activeTab, setActiveTab] = useState("All events");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalEvents: 0,
    pageSize: 8,
  });

  const mapToEvent = (eventData: any): Event => ({
    _id: eventData._id,
    title: eventData.title || "",
    description: eventData.description || "",
    date: eventData.date || new Date().toISOString().split("T")[0],
    time: eventData.time || "12:00",
    location: eventData.location || "",
    photoUrl: eventData.photoUrl || eventData.photo || "",
    photo: eventData.photo || eventData.photoUrl || "",
    createdBy: eventData.createdBy,
    attendees: eventData.attendees || [],
    approved: eventData.approved,
    createdAt: eventData.createdAt,
    updatedAt: eventData.updatedAt,
    __v: eventData.__v,
  });

  const getEvents = async (page: number = 1, loadMore: boolean = false) => {
    try {
      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const response = await authAPI.getAllEvents(
        `?page=${page}&limit=${pagination.pageSize}`
      );
      if (response.status === true) {
        const formattedEvents = (response.events || []).map(mapToEvent);
        if (loadMore) {
          setEvents((prev) => [...prev, ...formattedEvents]);
        } else {
          setEvents(formattedEvents);
        }

        setPagination((prev) => ({
          ...prev,
          currentPage: response.currentPage || 1,
          totalPages: response.totalPages || 1,
          totalEvents: response.totalEvents || 0,
        }));
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "An error occurred while fetching events.",
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const getMyEvents = async (page: number = 1, loadMore: boolean = false) => {
    try {
      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const response = await authAPI.getMyEvents(
        `?page=${page}&limit=${pagination.pageSize}`
      );
      if (response.status === true) {
        const formattedEvents = (response.events || []).map(mapToEvent);
        if (loadMore) {
          setMyEvents((prev) => [...prev, ...formattedEvents]);
        } else {
          setMyEvents(formattedEvents);
        }

        setPagination((prev) => ({
          ...prev,
          currentPage: response.currentPage || 1,
          totalPages: response.totalPages || 1,
          totalEvents: response.totalEvents || 0,
        }));
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "An error occurred while fetching events.",
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!openDropdown) return;

      const dropdownMenu = dropdownRef.current?.querySelector(".dropdown-menu");
      const dropdownButton = dropdownRef.current?.querySelector(
        "button[aria-haspopup]"
      );

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

    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [openDropdown]);

  const handleEdit = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const event = [...events, ...myEvents].find((e) => e._id === eventId);
    if (event) {
      setEditingEvent(event);
      // Here you would typically open an edit modal or navigate to edit page
      // For now, let's just log it
      console.log("Editing event:", event);
      // You can implement the edit functionality here
    }
  };

  const handleDelete = (eventId: string) => {
    setEventToDelete(eventId);
    setShowDeleteConfirm(true);
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
        if (activeTab === "My events") {
          getMyEvents(1, false);
        } else {
          getEvents(1, false);
        }
        setShowDeleteConfirm(false);
        setEventToDelete(null);
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to delete event",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleDropdown = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // const buttonRect = e.currentTarget.getBoundingClientRect();
    // setDropdownPosition({
    //   x: buttonRect.right - 200, // Adjust the horizontal position
    //   y: buttonRect.bottom + window.scrollY + 5, // Position below the button
    // });
    setOpenDropdown(openDropdown === eventId ? null : eventId);
  };

  const handleLoadMore = () => {
    const nextPage = pagination.currentPage + 1;
    if (activeTab === "All events") {
      getEvents(nextPage, true);
    } else {
      getMyEvents(nextPage, true);
    }
  };

  // Load events when tab changes or on initial load
  useEffect(() => {
    if (activeTab === "All events") {
      getEvents(1, false);
    } else {
      getMyEvents(1, false);
    }
  }, [activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsLoading(true);

    if (tab === "My events") {
      getMyEvents(1, false);
    } else {
      getEvents(1, false);
    }
  };

  const handleEventCreated = () => {
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Events</h1>
        <p className="text-gray-600">
          Discover and register for upcoming scouting events
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 mb-6 border-b">
        <button
          onClick={() => handleTabChange("All events")}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "All events"
              ? "border-green-600 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          All events
        </button>
        <button
          onClick={() => handleTabChange("My events")}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "My events"
              ? "border-green-600 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          My events
        </button>
      </div>

      {/* Create Event Button */}
      <div className="flex justify-end mb-6">
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create event
        </Button>
      </div>

      {/* Content Area */}
      {isLoading ? (
        // Loading State
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 8 }).map((_, index) => (
            <EventSkeleton key={index} />
          ))}
        </div>
      ) : (activeTab === "All events" ? events : myEvents).length === 0 ? (
        // Empty State
        <EmptyState onCreateEvent={() => setIsCreateModalOpen(true)} />
      ) : (
        // Events Grid
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {activeTab === "My events"
              ? myEvents.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    activeTab={activeTab}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    openDropdown={openDropdown}
                    toggleDropdown={toggleDropdown}
                  />
                ))
              : events.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    activeTab={activeTab}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    openDropdown={openDropdown}
                    toggleDropdown={toggleDropdown}
                  />
                ))}
          </div>

          {pagination.currentPage < pagination.totalPages && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
              >
                {isLoadingMore ? "Loading..." : "Load more"}
              </Button>
              <p className="mt-2 text-sm text-gray-500">
                Showing {events.length} of {pagination.totalEvents} events
              </p>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <AddEventModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleEventCreated}
      />

      <SuccessModal
        open={isSuccessModalOpen}
        onOpenChange={setIsSuccessModalOpen}
      />

      {/* Edit Event Modal */}
      <EditEventModal
        open={!!editingEvent}
        onOpenChange={(open) => !open && setEditingEvent(null)}
        onSuccess={() => {
          // Refresh events after successful update
          if (activeTab === "My events") {
            getMyEvents(1, false);
          } else {
            getEvents(1, false);
          }
        }}
        event={editingEvent}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDeleteConfirm(false)}
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Delete Event
              </h2>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="mb-6 text-gray-700">
                Are you sure you want to delete this event? This action cannot
                be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
