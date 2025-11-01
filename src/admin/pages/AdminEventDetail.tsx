import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  ArrowUpRight,
  Search,
} from "lucide-react";
// import Pagination from "../components/Pagination";
import { useEffect, useState } from "react";
// import Image from "../../assets/LogBookImage.png";
import { authAPI } from "@/services/api";
import { useParams } from "react-router-dom";

// const attendees = Array.from({ length: 20 }, (_, i) => ({
//   id: i + 1,
//   name: "Chiroma Bisi Adamu",
//   section: "Scout",
//   attending: i === 0 ? "Going" : i % 3 === 0 ? "Not going" : "Maybe",
// }));

export default function EventDetail() {
  // const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [eventInfo, setEventInfo] = useState<any>(null);
  const [allAttendees, setAllAttendees] = useState<any[]>([]);
  const [filteredAttendees, setFilteredAttendees] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { id } = useParams();

  const fetchEventInfo = async () => {
    try {
      const response = await authAPI.getEvent(id || "");
      if (response.status) {
        // Handle fetched event info
        const attendees = response?.event?.attendees || [];
        setEventInfo(response?.event);
        setAllAttendees(attendees);
        setFilteredAttendees(attendees);
      }
    } catch (err: any) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventInfo();
  }, []);

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-6 text-sm text-gray-600">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
        </div>

        <div className="mb-8">
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="h-9 bg-gray-200 rounded w-3/4 mb-6 animate-pulse" />
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-40 animate-pulse" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
              </div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-28 animate-pulse" />
          </div>
          <div>
            <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>

        <div className="mb-8">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-28 animate-pulse" />
          </div>

          <div className="p-6 border-b border-gray-200">
            <div className="h-10 bg-gray-200 rounded w-full animate-pulse" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
                  </th>
                  <th className="px-6 py-3 text-left">
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                  </th>
                  <th className="px-6 py-3 text-left">
                    <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.from({ length: 8 }).map((_, i) => (
                  <tr key={`skeleton-${i}`}>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-40 animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-8 w-8 bg-gray-200 rounded animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 text-sm text-gray-600">
        <Link to="/event" className="hover:underline">
          Event
        </Link>
        <span className="mx-2">›</span>
        <span>{eventInfo?.title}</span>
      </div>

      <Link
        to="/admin/event"
        className="inline-flex items-center gap-2 text-primary hover:underline mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Go Back
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {eventInfo?.title}
          </h1>
          <div className="space-y-3 mb-6">
            {(() => {
              // helper to parse and format date/time
              const parseDate = (d: any) => {
                if (!d) return null;
                // try ISO
                const iso = new Date(d);
                if (!isNaN(iso.getTime())) return iso;
                if (typeof d === "string") {
                  const parts = d.split("/");
                  if (parts.length === 3) {
                    const [dd, mm, yyyy] = parts;
                    const parsed = new Date(`${yyyy}-${mm}-${dd}`);
                    if (!isNaN(parsed.getTime())) return parsed;
                  }
                }
                return null;
              };

              const dateObj = parseDate(eventInfo?.date);

              const formatWithSuffix = (dt: Date) => {
                const opts: Intl.DateTimeFormatOptions = {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                };
                const base = dt.toLocaleDateString("en-GB", opts);
                // add ordinal to day
                const day = dt.getDate();
                const suffix =
                  day > 3 && day < 21
                    ? "th"
                    : { 1: "st", 2: "nd", 3: "rd" }[day % 10] || "th";
                return base.replace(/(\d+)(?=\s)/, `${day}${suffix}`);
              };

              const formattedDate = dateObj ? formatWithSuffix(dateObj) : "TBA";

              // derive time from eventInfo.time or from dateObj
              const parseTimeFromString = (t: any) => {
                if (!t) return null;
                // try Date parse
                const d = new Date(t);
                if (!isNaN(d.getTime())) return d;
                // if format like HH:mm or H:mm
                const hm = String(t).trim();
                const match = hm.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
                if (match) {
                  const hour = parseInt(match[1], 10);
                  const minute = match[2] ? parseInt(match[2], 10) : 0;
                  let h = hour;
                  if (match[3]) {
                    const period = match[3].toLowerCase();
                    if (period === "pm" && h < 12) h += 12;
                    if (period === "am" && h === 12) h = 0;
                  }
                  const now = new Date();
                  now.setHours(h, minute, 0, 0);
                  return now;
                }
                return null;
              };

              const formatCompact = (dt: Date) => {
                if (!dt) return "TBA";
                let h = dt.getHours();
                const m = dt.getMinutes();
                const period = h >= 12 ? "pm" : "am";
                h = h % 12;
                if (h === 0) h = 12;
                return m === 0
                  ? `${h}${period}`
                  : `${h}:${String(m).padStart(2, "0")}${period}`;
              };

              let timeObj: Date | null = null;
              // priority: explicit eventInfo.time, then dateObj
              timeObj = parseTimeFromString(eventInfo?.time) || null;
              if (!timeObj && dateObj) {
                // if dateObj includes time (not midnight), use it
                if (!(dateObj.getHours() === 0 && dateObj.getMinutes() === 0)) {
                  timeObj = dateObj;
                }
              }

              const timeString = timeObj ? formatCompact(timeObj) : "All day";

              return (
                <>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="w-5 h-5" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="w-5 h-5" />
                    <span>{timeString}</span>
                  </div>
                </>
              );
            })()}
            <div className="flex items-center gap-3 text-gray-700">
              <MapPin className="w-5 h-5" />
              <span>{eventInfo?.location}</span>
            </div>
          </div>
          <button className="px-6 py-2 bg-[#006400] hover:bg-primary-dark text-white rounded-lg transition-colors">
            Unpublish
          </button>
        </div>
        <div>
          <img
            src={eventInfo?.photoUrl || ""}
            alt="Event"
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          About this event
        </h2>
        <p className="text-gray-700 leading-relaxed">
          {eventInfo?.description}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">
            {eventInfo?.attendees.length} Attendees
          </h3>
          <button className="flex items-center gap-2 text-primary hover:underline text-sm">
            Export attendees
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name"
              value={searchQuery}
              onChange={(e) => {
                const query = e.target.value.toLowerCase();
                setSearchQuery(query);
                if (query.trim() === "") {
                  setFilteredAttendees(allAttendees);
                } else {
                  const filtered = allAttendees.filter((attendee) =>
                    attendee?.scout?.fullName?.toLowerCase().includes(query)
                  );
                  setFilteredAttendees(filtered);
                }
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  RSVP
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendees.map((attendee) => (
                <tr key={attendee._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {attendee?.scout?.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {attendee?.scout?.section}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {attendee?.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* <Pagination
          currentPage={currentPage}
          totalPages={10}
          onPageChange={setCurrentPage}
          totalItems={2000}
          itemsPerPage={20}
        /> */}
      </div>
    </div>
  );
}
