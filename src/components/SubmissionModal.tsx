import { X } from "lucide-react"
import type { Submission } from "../types"
import Swal from "sweetalert2"

interface SubmissionModalProps {
  submission: Submission
  onClose: () => void
}

export default function SubmissionModal({ submission, onClose }: SubmissionModalProps) {
  const handleVerify = async () => {
    const result = await Swal.fire({
      title: "Confirmation",
      text: "Confirm that you want to verify that this scout member's has successfully completed this activity. This action cannot be undo",
      showCancelButton: true,
      confirmButtonText: "Yes, verify",
      cancelButtonText: "No, cancel",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
      customClass: {
        popup: "rounded-lg",
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-secondary",
      },
    })

    if (result.isConfirmed) {
      await Swal.fire({
        title: "Successful",
        text: "Your have verified this scout member's activity.",
        icon: "success",
        confirmButtonText: "Close",
        confirmButtonColor: "#16a34a",
        customClass: {
          popup: "rounded-lg",
          confirmButton: "btn btn-success",
        },
      })
      onClose()
    }
  }

  const handleReject = async () => {
    const result = await Swal.fire({
      title: "Confirmation",
      text: "Confirm that you want to reject this scout member's activity submission. This action cannot be undo",
      showCancelButton: true,
      confirmButtonText: "Yes, reject",
      cancelButtonText: "No, cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      customClass: {
        popup: "rounded-lg",
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-secondary",
      },
    })

    if (result.isConfirmed) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Submission</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Submission name</label>
            <p className="text-sm text-gray-900">{submission.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <p className="text-sm text-gray-900">{submission.type}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Submitted by</label>
            <p className="text-sm text-success-600 font-medium">{submission.submittedBy}</p>
          </div>

          {submission.image && (
            <div>
              <img
                src="/scouts-hiking-in-nature.jpg"
                alt="Submission evidence"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          {submission.description && (
            <div>
              <p className="text-sm text-gray-700 leading-relaxed">{submission.description}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button onClick={handleReject} className="btn btn-secondary">
            Reject
          </button>
          <button onClick={handleVerify} className="btn btn-success">
            Verify
          </button>
        </div>
      </div>
    </div>
  )
}
