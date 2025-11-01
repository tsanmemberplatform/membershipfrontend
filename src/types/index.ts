export interface Submission {
    id: string
    name: string
    type: "Activity log" | "Certificate" | "Awards"
    submittedBy: string
    scoutingRole: string
    status: "Verified" | "Pending" | "Rejected"
    dateSubmitted: string
    description?: string
    image?: string
  }
  
  export interface Scout {
    id: string
    name: string
    memberId: string
    scoutingRole: string
    section: string
    state: string
    status: "Active" | "Suspended"
    avatar?: string
  }
  
  export interface ActivityLog {
    id: string
    activity: string
    date: string
    status: "Verified" | "Pending" | "Rejected"
  }
  
  export interface ScoutProfile {
    _id: string
    address: string
    authAppEnabled: boolean
    createdAt: string
    dateOfBirth: string
    email: string
    emailOtp: string
    emailVerified: boolean
    failedLoginAttempts: number
    fullName: string
    gender: string
    isLoggedIn: boolean
    lga: string
    otpExpires: string
    password: string
    phoneNumber: string
    phoneOtp: string
    profilePic: string
    role: string
    scoutDistrict: string
    scoutDivision: string
    scoutingRole: string
    section: string
    stateOfOrigin: string
    stateScoutCouncil: string
    profilePhoto: string
    troop: string
    membershipId: string
    status: string
  }
  
 