import type { Submission, Scout, ActivityLog, ScoutProfile } from "../types"

export const mockSubmissions: Submission[] = [
  {
    id: "1",
    name: "Hiking Adventure",
    type: "Activity log",
    submittedBy: "Chiroma Bisi Adamu",
    scoutingRole: "Scout Leader",
    status: "Verified",
    dateSubmitted: "3/03/2025",
    description:
      "Today, I completed a hike that challenged my strength and built my confidence. I followed the trail with my troop, carried my gear, and practiced the skills I have learned, like staying safe, observing nature, and working as a team. Along the way, I admired the trees, streams, and wildlife, which reminded me of the importance of caring for the environment. Logging this activity helps me remember the distance covered, lessons learned, and the fun shared, while preparing for future hikes.",
    image: "/scouts-hiking-in-nature.jpg",
  },
  {
    id: "2",
    name: "Woodbadge Certification",
    type: "Certificate",
    submittedBy: "Chiroma Bisi Adamu",
    scoutingRole: "Scout",
    status: "Pending",
    dateSubmitted: "3/03/2025",
  },
  {
    id: "3",
    name: "Woodbadge Level 1",
    type: "Awards",
    submittedBy: "Chiroma Bisi Adamu",
    scoutingRole: "Member",
    status: "Rejected",
    dateSubmitted: "3/03/2025",
  },
]

export const mockScouts: Scout[] = [
  {
    id: "1",
    name: "Chiroma Bisi Adamu",
    memberId: "TSAN-AKS-10225",
    scoutingRole: "Scout Leader",
    section: "Adults/Volunteers",
    state: "Akwa Ibom",
    status: "Active",
  },
  {
    id: "2",
    name: "Chiroma Bisi Adamu",
    memberId: "TSAN-AKS-10225",
    scoutingRole: "Member",
    section: "Scout",
    state: "Akwa Ibom",
    status: "Active",
  },
  {
    id: "3",
    name: "Chiroma Bisi Adamu",
    memberId: "TSAN-AKS-10225",
    scoutingRole: "Member",
    section: "Cub",
    state: "Akwa Ibom",
    status: "Active",
  },
  {
    id: "4",
    name: "Chiroma Bisi Adamu",
    memberId: "TSAN-AKS-10225",
    scoutingRole: "Member",
    section: "Scout",
    state: "Akwa Ibom",
    status: "Suspended",
  },
  {
    id: "5",
    name: "Chiroma Bisi Adamu",
    memberId: "TSAN-AKS-10225",
    scoutingRole: "Member",
    section: "Rover",
    state: "Akwa Ibom",
    status: "Active",
  },
]

export const mockActivityLogs: ActivityLog[] = [
  {
    id: "1",
    activity: "Community Service - Park Cleanup",
    date: "03/03/25",
    status: "Verified",
  },
  {
    id: "2",
    activity: "Community Service - Park Cleanup",
    date: "03/03/25",
    status: "Pending",
  },
]

export const mockScoutProfile: ScoutProfile = {
  _id: "1",
  address: "No 10 Airport road",
  authAppEnabled: false,
  createdAt: new Date().toISOString(),
  dateOfBirth: "10/01/2005",
  email: "example@gmail.com",
  emailOtp: "",
  emailVerified: true,
  failedLoginAttempts: 0,
  fullName: "Chiroma Adamu",
  gender: "Female",
  isLoggedIn: false,
  lga: "Oio",
  otpExpires: "",
  password: "hashedpassword123", // Note: In a real app, never store plain text passwords
  phoneNumber: "07012345678",
  phoneOtp: "",
  profilePic: "",
  role: "scout",
  scoutDistrict: "",
  scoutDivision: "",
  scoutingRole: "Member",
  section: "Scout",
  stateOfOrigin: "Akwa Ibom",
  stateScoutCouncil: "Abuja Council",
  profilePhoto: "",
  troop: "",
  membershipId: "TSAN-AKS-10225",
  status: "Active"
}
