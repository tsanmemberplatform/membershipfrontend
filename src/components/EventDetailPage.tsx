"use client";

import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import * as React from "react";
import { authAPI } from "@/services/api";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppSelector } from "@/hooks/useAppSelector";
import Swal from "sweetalert2";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  photoUrl: string;
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  approved: boolean;
  rsvpStatus?: string;
  // attendees: [];
  createdAt: string;
  updatedAt: string;
  __v: number;
}
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline";
  }
>(({ className, variant = "default", ...props }, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "default" &&
          "bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2",
        variant === "outline" &&
          "border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

// const Dropdown = () => {
//   const [isOpen, setIsOpen] = React.useState(false);
//   const [selectedOption, setSelectedOption] = React.useState("Register");

//   const toggleDropdown = () => setIsOpen(!isOpen);

//   const handleOptionClick = (option: string) => {
//     setSelectedOption(option);
//     setIsOpen(false);
//     // Add your click handlers here
//     console.log(option, "clicked");
//   };

//   return (
//     <div className="relative inline-block">
//       <Button
//         variant="outline"
//         onClick={toggleDropdown}
//         className="flex items-center gap-2 bg-white w-48"
//       >
//         {selectedOption}
//         <ChevronDown
//           className={`w-4 h-4 transition-transform ${
//             isOpen ? "rotate-180" : ""
//           }`}
//         />
//       </Button>
//       {isOpen && (
//         <div className="absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
//           <div className="py-1">
//             <div
//               className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
//               onClick={() => handleOptionClick("Going")}
//             >
//               Going
//             </div>
//             <div
//               className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
//               onClick={() => handleOptionClick("Not Going")}
//             >
//               Not Going
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

export default function EventDetail() {
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = React.useState(false);
  // const [selectedOption, setSelectedOption] = React.useState("Register");
  const [registering, setRegistering] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const { user } = useAppSelector((state) => state.auth);
  const { id } = useParams();

  const getEvent = async (id: string) => {
    try {
      setLoading(true);
      const response = await authAPI.getEvent(id);

      if (typeof response.status) {
        let eventInfo = response.event;
        if (
          eventInfo.attendees.find(
            (attendee: { scout: string; status: string }) =>
              attendee.scout === user._id
          )
        ) {
          eventInfo.rsvpStatus = eventInfo.attendees.find(
            (attendee: { scout: string; status: string }) =>
              attendee.scout === user._id
          ).status;
        } else {
          eventInfo.rsvpStatus = "Register";
        }
        setEvent(eventInfo);
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to get all events";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (
    // eventId: string,
    status: "Going" | "Not Going" | "Maybe"
  ) => {
    try {
      setRegistering(true);
      setIsOpen(false);
      // Call your API to update the RSVP status
      const response = await authAPI.registerForAnEvent({
        id: id,
        status: status,
      });
      if (response.status) {
        // Update the UI accordingly
        // setEvents(
        //   events.map((event) =>
        //     event._id === eventId ? { ...event, rsvpStatus: status } : event
        //   )
        // );
        // setOpenDropdownId(null);
      }
      console.log(id);

      // For now, just close the dropdown
      // setOpenDropdownId(null);

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
      setIsOpen(false);
      if (id) getEvent(id);
    }
  };

  useEffect(() => {
    if (!id) return;
    getEvent(id);
  }, [id]);

  // Loading Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Back Button Skeleton */}
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>

          {/* Main Content Skeleton */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>

              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                ))}
              </div>

              <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>

              <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>

            {/* Right Column - Image Skeleton */}
            <div className="aspect-[4/3] bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Description Skeleton */}
          <div className="space-y-4 pt-8">
            <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-4 bg-gray-200 rounded w-full animate-pulse"
                ></div>
              ))}
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Actual Content
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Event</span>
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span className="text-gray-400">{event?.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Go Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Go Back</span>
        </button>

        {/* Event Header */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <h1 className="text-3xl font-semibold text-gray-900">
              {event?.title}
            </h1>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <span>
                  {event?.date
                    ? new Date(event.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : ""}
                </span>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <Clock className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <span>{event?.time}</span>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span>{event?.location}</span>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Organized by {event?.createdBy?.fullName}
            </p>

            <div className="relative inline-block">
              <Button
                variant="outline"
                onClick={toggleDropdown}
                className="flex items-center gap-2 bg-white w-48"
              >
                {registering
                  ? "registering..."
                  : event?.rsvpStatus || "Register"}
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>
              {isOpen && (
                //     <div className="absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                //       <div className="py-1">
                //         <div
                //           className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                //           onClick={() => handleOptionClick("Going")}
                //         >
                //           Going
                //         </div>
                //  <div
                //           className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                //           onClick={() => handleOptionClick("Not Going")}
                //         >
                //           Not Going
                //         </div>
                //       </div>
                //     </div>
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRSVP("Going");
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Going
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRSVP("Not Going");
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Not Going
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRSVP("Maybe");
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Maybe
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Event Image */}
          <div className="rounded-lg overflow-hidden">
            <img
              src={event?.photoUrl}
              alt="National Scout Parade"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* About Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            About this event
          </h2>
          <p className="text-gray-700 leading-relaxed">{event?.description}</p>
        </div>
      </div>
    </div>
  );
}
