import type { ScoutProfile } from ".";

export interface SignUpCredentials {
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  stateOfOrigin: string;
  lga: string;
  address: string;
  stateScoutCouncil: string;
  scoutDivision: string;
  scoutDistrict: string;
  troop: string;
  section: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyCodeRequest {
  otp: string;
  email: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
  confirmPassword: string;
  otp: string;
  email: string;
}

export interface AuthResponse {
  status: boolean;
  message: string;
  data?: any;
  token?: string;
  refreshToken?: string; // Added refresh token support
  userInfo?: UserProfile; // Added user profile support
  tempToken?: string;
}

export interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  stateOfOrigin: string;
  lga: string;
  address: string;
  stateScoutCouncil: string;
  scoutDivision: string;
  scoutingRole: string;
  scoutDistrict: string;
  troop: string;
  section: string;
  profilePic: string;
  password: string;
  failedLoginAttempts: number;
  isLoggedIn: boolean;
  role: string;
  status: string;
  emailVerified: boolean;
  authAppEnabled: boolean;
  emailOtp: string;
  phoneOtp: string;
  otpExpires: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  membershipId: string;
  // phone?: string
  // firstName?: string
  // lastName?: string
  // avatar?: string
  // role: string
  // isEmailVerified: boolean
  // isPhoneVerified: boolean
  // createdAt: string
  // updatedAt: string
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  requestId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiRequestLog {
  method: string;
  url: string;
  headers: Record<string, string>;
  data?: any;
  timestamp: string;
  requestId: string;
}

export interface ApiResponseLog {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data?: any;
  timestamp: string;
  requestId: string;
  duration: number;
}

export interface UploadPhotoResponse {
  status: boolean;
  message: string;
  data?: any;
}

export interface GetUserResponse {
  status: boolean;
  message: string;
  data: ScoutProfile;
}

export interface AddActivityResponse {
  status: boolean;
  message: string;
  logs?: any;
  totalLogs?: number;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
}

export interface GetEventResponse {
  status: boolean;
  totalEvents: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  date?: string;
  events: [
    {
      _id: string;
      title: string;
      description: string;
      attendees: [{ scout: string; status: string }];
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
    }
  ];
}

export interface GetEvent {
  status: boolean;
  message?: string;
  event?: any;
}

export interface GetTrainingResponse {
  status: boolean;
  message: string;
  trainings?: any;
  pageSize?: number;
  currentPage: number;
  totalPages: number;
  totalTrainings?: number;
}

export interface GetAwardResponse {
  status: boolean;
  message: string;
  data?: any;
  pageSize?: number;
  currentPage: number;
  totalPages: number;
  totalAwards?: number;
}
