// TypeScript Domain Types for CollegeFinder

export type CollegeType = 'PUBLIC' | 'PRIVATE_NON_PROFIT' | 'PRIVATE_FOR_PROFIT';
export type CampusSetting = 'URBAN' | 'SUBURBAN' | 'RURAL';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface CourseData {
  id: string;
  collegeId: string;
  name: string;
  degree: string;
  duration: string;
  fees: number;
}

export interface PlacementData {
  id: string;
  collegeId: string;
  averagePackage: number;
  highestPackage: number;
  placementRate: number;
  year: number;
}

export interface ReviewData {
  id: string;
  collegeId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    name: string;
  };
}

export interface CollegeSummary {
  id: string;
  name: string;
  slug: string;
  location: string;
  city: string;
  state: string;
  description: string;
  fees: number;
  rating: number;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  websiteUrl?: string | null;
  type: CollegeType;
  campusSetting: CampusSetting;
  nationalRanking?: number | null;
  acceptanceRate?: number | null;
  graduationRate?: number | null;
  studentBodySize?: number | null;
  studentFacultyRatio?: number | null;
  inStateTuition?: number | null;
  outOfStateTuition?: number | null;
  avgFinancialAid?: number | null;
  roomAndBoard?: number | null;
  avgSatScore?: number | null;
  avgActScore?: number | null;
  avgGpa?: number | null;
  applicationDeadline?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    courses: number;
    placements: number;
    reviews: number;
  };
}

export interface CollegeDetail extends CollegeSummary {
  courses: CourseData[];
  placements: PlacementData[];
  reviews: ReviewData[];
  isSaved?: boolean;
}

export interface SavedCollegeItem {
  id: string;
  userId: string;
  collegeId: string;
  notes?: string | null;
  createdAt: string;
  college: CollegeSummary;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
