import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Send,
  MoreVertical,
  X,
  Upload,
  CheckCircle,
} from "lucide-react";
import { adminAPI } from "@/services/api";
import Swal from "sweetalert2";

interface Message {
  _id: string;
  subject: string;
  sentBy: string;
  // email: string;
  sentTo: string;
  dateSent: string;
}

// const mockMessages: Message[] = [
//   {
//     id: "1",
//     subject: "Edet Adamu",
//     sentBy: "Edet Adamu",
//     email: "admin@example.com",
//     sentTo: "All scouts",
//     dateSent: "03/03/2025",
//   },
// ];

export default function Message() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [goToPage, setGoToPage] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);

  // Form state
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(
    null
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
  const allowedTypes = [
    "image/",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  const [totalPages, setTotalPages] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);

  const handleGoToPage = () => {
    const pageNum = Number.parseInt(goToPage);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setGoToPage("");
    }
  };

  const getAllMessages = async (page = 1, limit = 20, search = searchQuery) => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllMessages(
        `?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`
      );

      if (response && response.status) {
        setMessages(response.data || []);
        const p = response.pagination || response.data?.pagination || null;
        if (p) {
          setTotalMessages(p.totalMessages ?? p.total ?? 0);
          setTotalPages(p.totalPages ?? 1);
          setPerPage(p.perPage ?? limit);
          setCurrentPage(p.currentPage ?? page);
        } else if (response.total !== undefined) {
          setTotalMessages(response.total ?? 0);
          setTotalPages(response.totalPages ?? 1);
          setPerPage(limit);
          setCurrentPage(response.currentPage ?? page);
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce function with TypeScript types
  const debounce = <F extends (...args: any[]) => any>(func: F, delay: number) => {
    let timer: NodeJS.Timeout;
    const debounced = (...args: Parameters<F>) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
    debounced.cancel = () => clearTimeout(timer);
    return debounced;
  };

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      getAllMessages(1, perPage, query);
      setIsSearching(false);
    }, 500),
    [perPage]
  );

  // Handle search query change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim() === '') {
      // If search is cleared, reset immediately
      debouncedSearch.cancel();
      getAllMessages(1, perPage, '');
      setIsSearching(false);
    } else {
      setIsSearching(true);
      debouncedSearch(query);
    }
  };

  useEffect(() => {
    // Initial load
    getAllMessages(currentPage, perPage);
  }, [currentPage, perPage]);

  const handleSendMail = async () => {
    // Start progress UI
    setSendProgress(0);
    setIsSending(true);
    const interval = setInterval(() => {
      setSendProgress((prev) => Math.min(99, prev + 5));
    }, 200);

    try {
      const formData = new FormData();
      // Append attachment only if selected
      if (attachment) {
        formData.append("attachment", attachment, attachment.name);
      }
      formData.append("recipient", recipient);
      formData.append("subject", subject);
      formData.append("message", message);

      // Call API to send mail
      const response = await adminAPI.sendMessageToUsers(formData);

      // Finish progress
      clearInterval(interval);
      setSendProgress(100);
      setTimeout(() => {
        setIsSending(false);
        setShowSuccess(true);
        // cleanup attachment preview
        if (attachmentPreview) {
          try {
            URL.revokeObjectURL(attachmentPreview);
          } catch (e) {
            /* ignore */
          }
        }
        setAttachment(null);
        setAttachmentPreview(null);
        const el = document.getElementById(
          "message-attachment"
        ) as HTMLInputElement | null;
        if (el) el.value = "";
      }, 300);

      console.log("Mail send response:", response);
    } catch (error) {
      clearInterval(interval);
      setIsSending(false);
      setSendProgress(0);
      console.error("Error sending mail:", error);
      const errMsg = (error as any)?.message || "Failed to send message";
      Swal.fire({
        icon: "error",
        title: "Send failed",
        text: errMsg,
      });
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setIsComposeOpen(false);
    setRecipient("");
    setSubject("");
    setMessage("");
    setSendProgress(0);
  };

  // Mock delete handler: confirms then removes the message from local state
  const deleteMessage = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete message",
      text: "Are you sure you want to delete this message? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      // Simulate API delay
      try {
        setLoading(true);
        const response = await adminAPI.deleteMessage(id);

        if (response && response.status) {
          Swal.fire({
            icon: "success",
            title: "Deleted",
            text: "Message deleted",
          });

          setMessages((prev) => prev.filter((m) => m._id !== id));
        }
      } catch (e) {
        console.error("Failed to delete message (mock):", e);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete message",
        });
      } finally {
        setLoading(false);
        setOpenMenuFor(null);
      }
    } else {
      setOpenMenuFor(null);
    }
  };

  // Clear compose form fields and attachment preview/input
  const resetComposeForm = () => {
    setRecipient("");
    setSubject("");
    setMessage("");
    setSendProgress(0);
    if (attachmentPreview) {
      try {
        URL.revokeObjectURL(attachmentPreview);
      } catch (e) {
        /* ignore */
      }
    }
    setAttachment(null);
    setAttachmentPreview(null);
    setIsDragOver(false);
    const el = document.getElementById(
      "message-attachment"
    ) as HTMLInputElement | null;
    if (el) el.value = "";
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Message</h1>
        <p className="text-gray-600">Here you can send mail to all scouts</p>
      </div>

      {/* Send a mail button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setIsComposeOpen(true)}
          className="flex items-center gap-2 bg-[#006400] hover:bg-[#234623] text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Send className="w-4 h-4" />
          Send a mail
        </button>
      </div>

      {/* Messages count */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-900">2000 Messages</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5a2d] focus:border-transparent disabled:opacity-70"
              disabled={loading}
            />
            {isSearching || loading ? (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2d5a2d]"></div>
              </div>
            ) : searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  getAllMessages(1, perPage, '');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-visible">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Sent by
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Sent to
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Date sent
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 overflow-y-auto">
            {loading
              ? Array.from({ length: perPage }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-6" />
                    </td>
                  </tr>
                ))
              : messages.map((msg) => (
                  <tr key={msg._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">
                          {msg.subject}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {msg.sentBy}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {msg.sentTo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {msg.dateSent}
                    </td>
                    <td className="px-6 py-4 relative">
                      <button
                        onClick={() =>
                          setOpenMenuFor(
                            openMenuFor === msg._id ? null : msg._id
                          )
                        }
                        className="text-gray-400 hover:text-gray-600"
                        aria-haspopup="true"
                        aria-expanded={openMenuFor === msg._id}
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {/* Dropdown menu */}
                      {openMenuFor === msg._id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-md z-50 origin-top-right"
                          style={{ transform: "translateY(4px)" }}
                        >
                          <button
                            onClick={() => deleteMessage(msg._id)}
                            className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {totalMessages === 0 ? 0 : (currentPage - 1) * perPage + 1} to{" "}
          {Math.min(totalMessages, currentPage * perPage)} of {totalMessages}{" "}
          messages
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <span className="text-sm text-gray-600">
              {currentPage}/{totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Go to:</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={goToPage}
              onChange={(e) => setGoToPage(e.target.value)}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a2d]"
            />
            <button
              onClick={handleGoToPage}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium transition-colors"
            >
              Go
            </button>
          </div>
        </div>
      </div>

      {/* Compose Mail Modal */}
      {isComposeOpen && !isSending && !showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  Create a mail
                </h2>
                <button
                  onClick={() => {
                    resetComposeForm();
                    setIsComposeOpen(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {/* To */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    To
                  </label>
                  <div className="relative">
                    <select
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#2d5a2d] text-gray-500"
                    >
                      <option value="">Select recipient</option>
                      <option value="all">All scouts</option>
                      {/* <option value="cubs">Cubs</option>
                      <option value="scouts">Scouts</option>
                      <option value="venturers">Venturers</option> */}
                    </select>
                    <svg
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
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
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5a2d]"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Start typing..."
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5a2d] resize-none"
                  />
                </div>

                {/* Attachment */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Attachment
                  </label>
                  <input
                    type="file"
                    id="message-attachment"
                    accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      if (!f) {
                        setAttachment(null);
                        setAttachmentPreview(null);
                        return;
                      }
                      // validation
                      if (f.size > MAX_FILE_SIZE) {
                        Swal.fire({
                          icon: "error",
                          title: "File too large",
                          text: "Maximum file size is 10 MB",
                        });
                        const el = document.getElementById(
                          "message-attachment"
                        ) as HTMLInputElement | null;
                        if (el) el.value = "";
                        return;
                      }
                      const allowed = allowedTypes.some((t) =>
                        t.endsWith("/") ? f.type.startsWith(t) : f.type === t
                      );
                      if (!allowed) {
                        Swal.fire({
                          icon: "error",
                          title: "Unsupported file type",
                          text: "Allowed: images, PDF, Word, Excel",
                        });
                        const el = document.getElementById(
                          "message-attachment"
                        ) as HTMLInputElement | null;
                        if (el) el.value = "";
                        return;
                      }

                      setAttachment(f);
                      // Preview images inline, embed pdf; for others show filename
                      if (f.type.startsWith("image/")) {
                        const url = URL.createObjectURL(f);
                        setAttachmentPreview(url);
                      } else if (f.type === "application/pdf") {
                        const url = URL.createObjectURL(f);
                        setAttachmentPreview(url);
                      } else {
                        setAttachmentPreview(null);
                      }
                    }}
                  />

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      const f = e.dataTransfer?.files?.[0] ?? null;
                      if (!f) return;
                      if (f.size > MAX_FILE_SIZE) {
                        Swal.fire({
                          icon: "error",
                          title: "File too large",
                          text: "Maximum file size is 10 MB",
                        });
                        return;
                      }
                      const allowed = allowedTypes.some((t) =>
                        t.endsWith("/") ? f.type.startsWith(t) : f.type === t
                      );
                      if (!allowed) {
                        Swal.fire({
                          icon: "error",
                          title: "Unsupported file type",
                          text: "Allowed: images, PDF, Word, Excel",
                        });
                        return;
                      }
                      setAttachment(f);
                      if (f.type.startsWith("image/")) {
                        setAttachmentPreview(URL.createObjectURL(f));
                      } else if (f.type === "application/pdf") {
                        setAttachmentPreview(URL.createObjectURL(f));
                      } else {
                        setAttachmentPreview(null);
                      }
                    }}
                    className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer ${
                      isDragOver
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300"
                    }`}
                    onClick={() => {
                      const el = document.getElementById(
                        "message-attachment"
                      ) as HTMLInputElement | null;
                      el?.click();
                    }}
                  >
                    {!attachment && (
                      <div>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-[#c85a3a] font-medium">
                          Click to upload or drag and drop file
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Accepts images, PDF, Word, Excel
                        </p>
                      </div>
                    )}

                    {attachment && attachment.type.startsWith("image/") && (
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={attachmentPreview ?? undefined}
                          alt={attachment.name}
                          className="max-h-52 object-contain rounded"
                        />
                        <div className="text-sm text-gray-700">
                          {attachment.name}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            // revoke object URL
                            if (attachmentPreview)
                              URL.revokeObjectURL(attachmentPreview);
                            setAttachment(null);
                            setAttachmentPreview(null);
                            const el = document.getElementById(
                              "message-attachment"
                            ) as HTMLInputElement | null;
                            if (el) el.value = "";
                          }}
                          className="text-sm text-red-600 underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    {attachment && attachment.type === "application/pdf" && (
                      <div className="flex flex-col items-center gap-2">
                        <embed
                          src={attachmentPreview ?? undefined}
                          type="application/pdf"
                          className="w-full h-72"
                        />
                        <div className="text-sm text-gray-700">
                          {attachment.name}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (attachmentPreview)
                              URL.revokeObjectURL(attachmentPreview);
                            setAttachment(null);
                            setAttachmentPreview(null);
                            const el = document.getElementById(
                              "message-attachment"
                            ) as HTMLInputElement | null;
                            if (el) el.value = "";
                          }}
                          className="text-sm text-red-600 underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    {attachment &&
                      !attachment.type.startsWith("image/") &&
                      attachment.type !== "application/pdf" && (
                        <div className="flex flex-col items-center gap-2">
                          <div className="text-sm text-gray-700">
                            {attachment.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {attachment.type}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAttachment(null);
                              setAttachmentPreview(null);
                              const el = document.getElementById(
                                "message-attachment"
                              ) as HTMLInputElement | null;
                              if (el) el.value = "";
                            }}
                            className="text-sm text-red-600 underline"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 mt-8">
                <button
                  onClick={() => {
                    resetComposeForm();
                    setIsComposeOpen(false);
                  }}
                  className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMail}
                  className="px-8 py-3 bg-[#2d5a2d] hover:bg-[#234623] text-white rounded-lg font-medium transition-colors"
                >
                  Send Mail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sending Progress Modal */}
      {isSending && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8">
            <div className="text-center">
              {/* Mail icon */}
              <div className="mb-6 flex justify-center">
                <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                  <rect
                    x="20"
                    y="30"
                    width="60"
                    height="40"
                    rx="4"
                    stroke="#d4a574"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M20 35 L50 55 L80 35"
                    stroke="#d4a574"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="45"
                    r="8"
                    stroke="#d4a574"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M50 42 L50 48 M47 45 L53 45"
                    stroke="#d4a574"
                    strokeWidth="2"
                  />
                </svg>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <p className="text-4xl font-bold text-gray-600 mb-4">
                  {sendProgress}%
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#2d5a2d] h-full transition-all duration-300"
                    style={{ width: `${sendProgress}%` }}
                  />
                </div>
              </div>

              <p className="text-gray-600 mb-6">Sending mail...</p>

              <button
                onClick={() => {
                  setIsSending(false);
                  setSendProgress(0);
                }}
                className="px-8 py-3 bg-[#2d5a2d] hover:bg-[#234623] text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8">
            <div className="text-center">
              {/* Close button */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleCloseSuccess}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Success icon */}
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">Success</h3>
              <p className="text-gray-600 mb-8">
                Message was sent successfully
              </p>

              <button
                onClick={handleCloseSuccess}
                className="px-8 py-3 bg-[#2d5a2d] hover:bg-[#234623] text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
