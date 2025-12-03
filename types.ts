export enum Page {
  Home = 'HOME',
  Apply = 'APPLY',
  Curriculum = 'CURRICULUM',
  Seating = 'SEATING',
  AnnounceCandidates = 'ANNOUNCE_CANDIDATES',
  AnnounceResults = 'ANNOUNCE_RESULTS',
  Statistics = 'STATISTICS',
  ADMIN = 'ADMIN',
}

export enum GradeLevel {
  M1 = 'ม.1',
  M4 = 'ม.4',
}

export enum ApplicationRound {
  General = 'รอบทั่วไป',
  SpecialTalent = 'รอบความสามารถพิเศษ',
  SpecialProgram = 'รอบห้องเรียนพิเศษ',
}

export enum AreaType {
  InArea = 'ในเขตพื้นที่บริการ',
  OutOfArea = 'นอกเขตพื้นที่บริการ',
}

export interface SeatingInfo {
  name: string;
  applicationId: string;
  examId: string;
  date: string;
  time: string;
  building: string;
  room: string;
  seat: string;
  photoUrl: string;
}

export interface Address {
  detail: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
}

export interface StudentData {
  title: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  nationalId: string;
  phone: string;
  gender: string;
  bloodType: string;
  religion: string;
  otherReligion?: string;
  nationality: string;
  otherNationality?: string;
  permanentAddress: Address;
  currentAddress: Address;
  chronicDisease?: string;
}

export interface GuardianData {
  title: string;
  firstName: string;
  lastName: string;
  relationship: string;
  phone: string;
  occupation: string;
  nationalId: string;
  address: Address;
}

export interface ParentData {
  fatherTitle: string;
  fatherFirstName: string;
  fatherLastName: string;
  fatherPhone: string;
  fatherOccupation: string;
  fatherNationalId: string;
  fatherAddress: Address;
  motherTitle: string;
  motherFirstName: string;
  motherLastName: string;
  motherPhone: string;
  motherOccupation: string;
  motherNationalId: string;
  motherAddress: Address;
  contactEmail: string;
  livesWith: 'parents' | 'father' | 'mother' | 'guardian' | '';
  guardian?: GuardianData;
}

export interface SchoolData {
  previousSchool: string;
  previousSchoolProvince: string;
  gpax: string;
}

export interface ApplicationData {
  gradeLevel: GradeLevel | null;
  applicationRound?: ApplicationRound;
  areaType?: AreaType;
  student: StudentData;
  parent: ParentData;
  school: SchoolData;
  studyPlan?: string; // For M.1 and M.4
  specialTalentType?: string;
  specialTalentDescription?: string;
  photo?: File | string; // Can be File or base64 string
  transcript?: File | string;
  householdRegistration?: File | string;
  fatherHouseholdRegistration?: File | string;
  motherHouseholdRegistration?: File | string;
  guardianHouseholdRegistration?: File | string;
  guardianProof?: File | string;
  fatherNationalIdCard?: File | string;
  motherNationalIdCard?: File | string;
  guardianNationalIdCard?: File | string;
  applicationId?: string;
  submissionDate?: string;
  seatingInfo?: SeatingInfo;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: { uri: string; title: string; }[];
}