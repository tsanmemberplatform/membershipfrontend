import type React from "react";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ImagePlaceHolder from "../assets/ImagePlaceHolder.png";
import { authAPI } from "../services/api";
import Swal from "sweetalert2";

export const UploadPhoto: React.FC = () => {
  const [uploadState, setUploadState] = useState<
    "idle" | "uploading" | "success"
  >("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileSelect = (file: File) => {
    // Check file type
    if (!file || !(file.type === "image/jpeg" || file.type === "image/png")) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid file type',
        text: 'Please upload a JPG or PNG image',
      });
      return;
    }

    // Check file size (2MB in bytes)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      Swal.fire({
        icon: 'error',
        title: 'File too large',
        text: 'Maximum file size is 2MB',
      });
      return;
    }

    // Show loading prompt
    Swal.fire({
      title: 'Uploading...',
      text: 'Please wait while we process your image',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    setUploadState("uploading");
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadState("success");
          
          // Create preview URL
          const reader = new FileReader();
          reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
            setUploadedFile(file);
            // Close loading prompt and show success message
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Image uploaded successfully',
              timer: 2000,
              showConfirmButton: false,
            });
          };
          reader.readAsDataURL(file);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleContinue = async () => {
    if (!uploadedFile) {
      Swal.fire({
        icon: "error",
        title: "Please select a file to upload",
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    try {
      setLoading(true);

      const email = JSON.parse(
        localStorage.getItem("signupInfo") || "{}"
      )?.email;

      // Create FormData object
      const formData = new FormData();
      formData.append("email", email);
      formData.append("profilePic", uploadedFile);

      // Make sure your authAPI.uploadUserPhoto is configured to send FormData
      const response = await authAPI.uploadUserPhoto(formData);

      if (response.status) {
        Swal.fire({
          icon: "success",
          title: "Profile photo uploaded successfully",
          showConfirmButton: false,
          timer: 1500,
        });
        setLoading(false);
        localStorage.removeItem("signupInfo");
        navigate("/login");
      } else {
        throw new Error(response?.message || "Upload failed");
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: error?.message || "An error occurred during upload",
        showConfirmButton: false,
        timer: 1500,
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 max-w-md mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 text-center mb-8">
          Upload profile photo
        </h1>

        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Profile photo guidelines
          </h2>

          <div className="flex gap-4 mb-6">
            <img
              src={ImagePlaceHolder}
              alt="Profile example"
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1 space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-600">
                  Photo in scout uniform or casual wears are allowed
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-600">
                  Photo background can be white (recommended) or non-white
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-600">
                  Acceptable format is JPG/PNG, max size 1MB
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          {uploadState === "idle" && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mb-4">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto"
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
              <p className="text-gray-600 mb-2">
                Drag your image here to upload
              </p>
              <p className="text-sm text-gray-500 mb-4">
                JPG or PNG (max. size 1MB)
              </p>
              <button
                type="button"
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Browse file
              </button>
            </div>
          )}

          {uploadState === "uploading" && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="mb-4">
                <div className="bg-purple-100 text-purple-600 px-3 py-1 rounded text-sm font-medium inline-block mb-4">
                  JPG
                </div>
              </div>
              <p className="text-gray-600 mb-4">{uploadProgress}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">Uploading Document...</p>
              <p className="text-xs text-gray-500">(Name of document)</p>
            </div>
          )}

          {uploadState === "success" && (
            <div className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center">
              <div className="mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-green-600 font-medium mb-4">
                Setup successful
              </p>
              {imagePreview && (
                <div className="mb-4">
                  <img
                    src={imagePreview}
                    alt="Uploaded profile"
                    className="w-24 h-24 rounded-lg object-cover mx-auto"
                  />
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        <button
          onClick={handleContinue}
          disabled={uploadState !== "success"}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Uploading..." : "Continue"}
        </button>
      </div>
    </div>
  );
};
