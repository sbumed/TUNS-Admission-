import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { GradeLevel, ApplicationData, ParentData, GuardianData, AreaType, SeatingInfo, StudentData, Address, ApplicationRound } from '../types';
import { M1_STUDY_PLANS, M4_STUDY_PLANS, PLACEHOLDER_IMAGE_URL } from '../constants';
import { SchoolIcon, CheckCircleIcon, ExclamationCircleIcon, CameraIcon, ClipboardPasteIcon } from './icons';
import AddressInput from './AddressInput';
import BirthdateInput from './BirthdateInput';
import { THAI_PROVINCES } from '../data/provinces';
import ExamCard from './ExamCard';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ApplicationSummary from './ApplicationSummary';
import { sendApplicationToSheet } from '../services/googleSheetService';
import { extractDataFromImage, extractDataFromText } from '../services/geminiService';
import { AIAutoCompleteInput } from './AIAutoCompleteInput';

interface ApplicationFormProps {
    initialData?: ApplicationData | null;
    onSave?: () => void;
    onCancel?: () => void;
}


// Helper function to determine exam date based on application details
const getExamDate = (round?: ApplicationRound, grade?: GradeLevel | null): string => {
    if (round === ApplicationRound.SpecialProgram) {
        if (grade === GradeLevel.M1) {
            return '21 กุมภาพันธ์ 2569';
        }
        if (grade === GradeLevel.M4) {
            return '22 กุมภาพันธ์ 2569';
        }
    }
    if (round === ApplicationRound.SpecialTalent) {
        return '25 มีนาคม 2569';
    }
    if (round === ApplicationRound.General) {
        if (grade === GradeLevel.M1) {
            return '28 มีนาคม 2569';
        }
        if (grade === GradeLevel.M4) {
            return '29 มีนาคม 2569';
        }
    }
    // Fallback date, should ideally not be reached if form logic is correct.
    return 'โปรดตรวจสอบประกาศจากโรงเรียน';
};

// Seating Allocation Logic
const ROOM_CAPACITY = 20;

const ROOMS_M1_SPECIAL = [
    { building: 'อาคาร 2', room: '232' },
    { building: 'อาคาร 2', room: '233' },
    { building: 'อาคาร 2', room: '234' },
];

const ROOMS_M4_SPECIAL = [
    { building: 'อาคาร 2', room: '242' },
    { building: 'อาคาร 2', room: '243' },
    { building: 'อาคาร 2', room: '244' },
    { building: 'อาคาร 2', room: '245' },
];

const GENERAL_ROOM_NUMBERS = ['421', '422', '423', '424', '425', '426', '427', '428', '431', '432', '433', '434', '435', '436', '437', '438', '441', '442', '444', '445', '446', '447', '448'];
const ROOMS_GENERAL = GENERAL_ROOM_NUMBERS.map(r => ({ building: 'อาคาร 4', room: r }));

const getNextSeat = (counterKey: string, roomList: { building: string, room: string }[]): { building: string, room: string, seat: string } => {
    let currentCount = parseInt(localStorage.getItem(counterKey) || '0', 10);
    currentCount++;
    localStorage.setItem(counterKey, String(currentCount));

    const roomIndex = Math.floor((currentCount - 1) / ROOM_CAPACITY);
    const seatNumber = ((currentCount - 1) % ROOM_CAPACITY) + 1;

    if (roomIndex >= roomList.length) {
        // Fallback if rooms are full
        return { building: 'โปรดตรวจสอบประกาศ', room: 'N/A', seat: 'N/A' };
    }

    const { building, room } = roomList[roomIndex];
    const seat = `A-${String(seatNumber).padStart(2, '0')}`;

    return { building, room, seat };
};

const generateSeatingInfo = (formData: ApplicationData): { building: string, room: string, seat: string } => {
    const { gradeLevel, applicationRound, specialTalentType } = formData;

    if (applicationRound === ApplicationRound.SpecialTalent) {
        const seatInfo = 'ตามประกาศ ณ จุดสอบ';
        switch (specialTalentType) {
            case 'ด้านกีฬา':
                return { building: 'ลานอเนกประสงค์', room: 'ตามประเภทกีฬา', seat: seatInfo };
            case 'ด้านศิลปะ':
                return { building: '-', room: 'ห้องทัศนศิลป์', seat: seatInfo };
            case 'ด้านดนตรีไทย':
                return { building: 'เรือนฉัตรทองคำ', room: 'ห้องดนตรีไทย', seat: seatInfo };
            case 'ด้านดนตรีสากล':
                return { building: '-', room: 'ห้องปฏิบัติการดนตรีสากล', seat: seatInfo };
            case 'ด้านนาฏศิลป์':
                return { building: 'เรือนฉัตรทองคำ', room: 'ห้องนาฏศิลป์', seat: seatInfo };
            default:
                // This case should not be reached if form validation is correct
                return { building: 'โปรดตรวจสอบประกาศ', room: 'N/A', seat: 'N/A' };
        }
    }

    if (applicationRound === ApplicationRound.SpecialProgram) {
        if (gradeLevel === GradeLevel.M1) {
            return getNextSeat('seatingCounter_M1_SPECIAL', ROOMS_M1_SPECIAL);
        }
        if (gradeLevel === GradeLevel.M4) {
            // For IGP, SME, and other special programs in M.4
            return getNextSeat('seatingCounter_M4_SPECIAL', ROOMS_M4_SPECIAL);
        }
    }

    if (applicationRound === ApplicationRound.General) {
        if (gradeLevel === GradeLevel.M1) {
            return getNextSeat('seatingCounter_M1_GENERAL', ROOMS_GENERAL);
        }
        if (gradeLevel === GradeLevel.M4) {
            return getNextSeat('seatingCounter_M4_GENERAL', ROOMS_GENERAL);
        }
    }
    
    // Fallback for any unhandled cases
    return { building: 'โปรดตรวจสอบประกาศ', room: 'N/A', seat: 'N/A' };
};


const StepIndicator: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => (
  <div className="flex justify-center items-center space-x-2 mb-8 no-print">
    {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
      <React.Fragment key={step}>
        <div
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-base sm:text-lg transition-all duration-300 ${
            step < currentStep ? 'bg-green-500 text-white' : 
            step === currentStep ? 'bg-primary text-white scale-110 shadow-lg' : 'bg-slate-700 text-slate-300'
          }`}
        >
          {step < currentStep ? '✓' : step}
        </div>
        {step < totalSteps && <div className={`flex-1 h-1 rounded-full ${step < currentStep ? 'bg-green-500' : 'bg-slate-700'}`}></div>}
      </React.Fragment>
    ))}
  </div>
);

const FileUpload: React.FC<{ label: string; onFileChange: (file: File | undefined) => void; isUploaded: boolean; isRequired?: boolean; }> = ({ label, onFileChange, isUploaded, isRequired=true }) => {
    const [fileName, setFileName] = useState('');
    const id = `file-upload-${label.replace(/\s+/g, '-')}`;
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}{isRequired && <span className="text-red-500">*</span>}</label>
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${isUploaded ? 'border-green-400 bg-green-50' : 'border-gray-300'}`}>
                <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                        <label htmlFor={id} className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                            <span>อัปโหลดไฟล์</span>
                            <input id={id} name={id} type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png" required={isRequired} onChange={e => {
                                const file = e.target.files?.[0];
                                setFileName(file?.name || '');
                                onFileChange(file);
                            }}/>
                        </label>
                        <p className="pl-1">หรือลากและวาง</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, PNG, JPG ขนาดไม่เกิน 10MB</p>
                    {fileName && <p className="text-xs text-green-600 mt-2">{fileName}</p>}
                </div>
            </div>
        </div>
    );
};

// Helper function to convert a file to a Base64 string
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string)); // Keep data URL prefix
        reader.onerror = error => reject(error);
    });
};

function dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error('Invalid data URL');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

// Helper functions for generating a unique, sequential ID
const getNextId = (counterKey: string, prefixKeyCheck: string | null = null): string => {
    let currentId = parseInt(localStorage.getItem(counterKey) || '0', 10);
    let nextIdStr = '';
    let exists = true;

    // If we have a prefixKeyCheck (e.g., 'application-'), verify it doesn't exist to prevent overwrite
    if (prefixKeyCheck) {
        while (exists) {
            currentId++;
            nextIdStr = String(currentId).padStart(5, '0');
            if (!localStorage.getItem(`${prefixKeyCheck}${nextIdStr}`)) {
                exists = false;
            }
        }
    } else {
        currentId++;
        nextIdStr = String(currentId).padStart(5, '0');
    }

    localStorage.setItem(counterKey, String(currentId));
    return nextIdStr;
};

const generateExamId = (formData: ApplicationData): string => {
    const { gradeLevel, applicationRound, studyPlan } = formData;

    // 1. M.1 Special Program (ห้องเรียนพิเศษ) -> MEP-XXXXX
    if (applicationRound === ApplicationRound.SpecialProgram && gradeLevel === GradeLevel.M1) {
        return `MEP-${getNextId('examIdCounter_MEP')}`;
    }

    // 2. M.4 Special Program (ห้องเรียนพิเศษ) -> IGP-XXXXX or SME-XXXXX
    if (applicationRound === ApplicationRound.SpecialProgram && gradeLevel === GradeLevel.M4) {
        if (studyPlan === 'Intensive Gifted (IGP)') {
            return `IGP-${getNextId('examIdCounter_IGP')}`;
        }
        if (studyPlan === 'Science Mathematics and English(SME)') {
            return `SME-${getNextId('examIdCounter_SME')}`;
        }
    }

    // 3. M.1 General Round (รอบทั่วไป) - also handles Special Talent
    if (gradeLevel === GradeLevel.M1) {
        return `M1-${getNextId('examIdCounter_M1_GENERAL')}`;
    }

    // 4. M.4 General Round (รอบทั่วไป) - also handles Special Talent
    if (gradeLevel === GradeLevel.M4) {
        return `M4-${getNextId('examIdCounter_M4_GENERAL')}`;
    }

    // Fallback for any edge cases
    return `ERR-${Date.now().toString().slice(-5)}`;
};

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {children}
        </div>
    </div>
);

const THAI_MONTH_MAP: { [key: string]: number } = {
    'ม.ค.': 1, 'มกราคม': 1,
    'ก.พ.': 2, 'กุมภาพันธ์': 2,
    'มี.ค.': 3, 'มีนาคม': 3,
    'เม.ย.': 4, 'เมษายน': 4,
    'พ.ค.': 5, 'พฤษภาคม': 5,
    'มิ.ย.': 6, 'มิถุนายน': 6,
    'ก.ค.': 7, 'กรกฎาคม': 7,
    'ส.ค.': 8, 'สิงหาคม': 8,
    'ก.ย.': 9, 'กันยายน': 9,
    'ต.ค.': 10, 'ตุลาคม': 10,
    'พ.ย.': 11, 'พฤศจิกายน': 11,
    'ธ.ค.': 12, 'ธันวาคม': 12,
};

const parseThaiDate = (thaiDate: string): string => {
    if (!thaiDate) return '';
    const parts = thaiDate.replace('.', '').split(' ');
    if (parts.length < 3) return '';

    const day = parts[0].padStart(2, '0');
    const monthStr = parts[1];
    const buddhistYear = parseInt(parts[2], 10);

    const monthNumber = THAI_MONTH_MAP[monthStr];
    if (!monthNumber) return '';

    const month = String(monthNumber).padStart(2, '0');
    const gregorianYear = buddhistYear - 543;

    if (isNaN(gregorianYear) || isNaN(parseInt(day)) || isNaN(parseInt(month))) return '';

    return `${gregorianYear}-${month}-${day}`;
};


const ApplicationForm: React.FC<ApplicationFormProps> = ({ initialData, onSave, onCancel }) => {
  const isEditMode = !!initialData;
  const [step, setStep] = useState(isEditMode ? 1 : 0);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ 
    applicationId: string; 
    examDetails: SeatingInfo; 
    photoUrl: string;
  } | null>(null);

  const [formData, setFormData] = useState<ApplicationData>({
    gradeLevel: null,
    applicationRound: undefined,
    student: { title: '', firstName: '', lastName: '', birthDate: '', nationalId: '', phone: '', gender: '', bloodType: '', religion: '', otherReligion: '', nationality: 'ไทย', otherNationality: '', permanentAddress: { detail: '', subdistrict: '', district: '', province: '', postalCode: '' }, currentAddress: { detail: '', subdistrict: '', district: '', province: '', postalCode: '' }, chronicDisease: '' },
    parent: { fatherTitle: '', fatherFirstName: '', fatherLastName: '', fatherPhone: '', fatherOccupation: '', fatherNationalId: '', fatherAddress: { detail: '', subdistrict: '', district: '', province: '', postalCode: '' }, motherTitle: '', motherFirstName: '', motherLastName: '', motherPhone: '', motherOccupation: '', motherNationalId: '', motherAddress: { detail: '', subdistrict: '', district: '', province: '', postalCode: '' }, contactEmail: '', livesWith: '', guardian: { title: '', firstName: '', lastName: '', relationship: '', phone: '', occupation: '', nationalId: '', address: { detail: '', subdistrict: '', district: '', province: '', postalCode: '' } } },
    school: { previousSchool: '', previousSchoolProvince: '', gpax: '' },
    specialTalentType: '',
    specialTalentDescription: '',
  });

  const [isCurrentAddressSame, setIsCurrentAddressSame] = useState(false);
  const [fatherAddressSync, setFatherAddressSync] = useState<'none' | 'permanent' | 'current'>('none');
  const [motherAddressSync, setMotherAddressSync] = useState<'none' | 'permanent' | 'current'>('none');
  const [guardianAddressSync, setGuardianAddressSync] = useState<'none' | 'permanent' | 'current'>('none');
  const [isDownloadingCard, setIsDownloadingCard] = useState(false);
  const [isDownloadingApplication, setIsDownloadingApplication] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(PLACEHOLDER_IMAGE_URL);

  // State for student photo camera
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // State for ID card scanning
  const [isIdCameraOpen, setIsIdCameraOpen] = useState(false);
  const [isScanningId, setIsScanningId] = useState(false);
  const idVideoRef = useRef<HTMLVideoElement>(null);
  const idCanvasRef = useRef<HTMLCanvasElement>(null);
  const idStreamRef = useRef<MediaStream | null>(null);

  // State for text paste parsing
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [textToParse, setTextToParse] = useState('');
  const [isParsing, setIsParsing] = useState(false);


    useEffect(() => {
        if (initialData) {
            // Convert file fields back to their original state if they are strings
            const dataWithFiles = { ...initialData };
            const fileFields: (keyof ApplicationData)[] = [
                'photo', 'transcript', 'householdRegistration', 'fatherHouseholdRegistration',
                'motherHouseholdRegistration', 'guardianHouseholdRegistration', 'guardianProof',
                'fatherNationalIdCard', 'motherNationalIdCard', 'guardianNationalIdCard'
            ];
            fileFields.forEach(field => {
                if (typeof dataWithFiles[field] === 'string') {
                    dataWithFiles[field] = undefined; // Or handle displaying the existing file info
                }
            });
            setFormData(dataWithFiles);
            setPhotoPreviewUrl(initialData.seatingInfo?.photoUrl || PLACEHOLDER_IMAGE_URL);
        }
    }, [initialData]);
  
    const openCamera = async () => {
        setCapturedImage(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsCameraOpen(true);
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("ไม่สามารถเข้าถึงกล้องได้ กรุณาตรวจสอบการตั้งค่าเบราว์เซอร์ของคุณ");
        }
    };

    const closeCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setIsCameraOpen(false);
        setCapturedImage(null);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setCapturedImage(dataUrl);

            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        }
    };

    const useCapturedPhoto = () => {
        if (capturedImage) {
            const photoFile = dataURLtoFile(capturedImage, `student-photo-${Date.now()}.jpg`);
            setFormData(prev => ({ ...prev, photo: photoFile }));
            setPhotoPreviewUrl(capturedImage);
            closeCamera();
        }
    };

    const retakePhoto = async () => {
        setCapturedImage(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error restarting camera:", err);
        }
    };
    
    // Functions for ID card scanning
    const openIdCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            idStreamRef.current = stream;
            if (idVideoRef.current) {
                idVideoRef.current.srcObject = stream;
            }
            setIsIdCameraOpen(true);
        } catch (err) {
            console.error("Error accessing camera for ID scan:", err);
            alert("ไม่สามารถเข้าถึงกล้องได้ กรุณาตรวจสอบการตั้งค่าเบราว์เซอร์ของคุณ");
        }
    };

    const closeIdCamera = () => {
        if (idStreamRef.current) {
            idStreamRef.current.getTracks().forEach(track => track.stop());
        }
        setIsIdCameraOpen(false);
    };

    const captureIdPhotoAndScan = async () => {
        if (idVideoRef.current && idCanvasRef.current) {
            const video = idVideoRef.current;
            const canvas = idCanvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUrl = canvas.toDataURL('image/jpeg');
            
            closeIdCamera();
            setIsScanningId(true);

            try {
                const base64Image = dataUrl.split(',')[1];
                const response = await extractDataFromImage(base64Image);
                const responseText = response.text.trim();
                const extractedData = JSON.parse(responseText);

                const sanitizedNationalId = extractedData.nationalId.replace(/\D/g, '');
                const formattedBirthDate = parseThaiDate(extractedData.birthDate);

                if (!formattedBirthDate) {
                    throw new Error('Invalid date format received from AI.');
                }
                
                setFormData(prev => ({
                    ...prev,
                    student: {
                        ...prev.student,
                        title: extractedData.title,
                        firstName: extractedData.firstName,
                        lastName: extractedData.lastName,
                        nationalId: sanitizedNationalId,
                        birthDate: formattedBirthDate,
                    }
                }));

                alert('ข้อมูลถูกกรอกอัตโนมัติเรียบร้อยแล้ว');

            } catch (error) {
                console.error("Failed to scan ID card:", error);
                alert("ไม่สามารถดึงข้อมูลจากบัตรได้ กรุณาลองอีกครั้งหรือกรอกข้อมูลด้วยตนเอง");
            } finally {
                setIsScanningId(false);
            }
        }
    };

    const handleParseText = async () => {
        if (!textToParse.trim()) {
            alert("กรุณาวางข้อมูลลงในช่องข้อความ");
            return;
        }
        setIsParsing(true);
        try {
            const response = await extractDataFromText(textToParse);
            const extractedData = JSON.parse(response.text.trim());

            setFormData(prev => {
                const newStudentData = { ...prev.student };

                if (extractedData.title) newStudentData.title = extractedData.title;
                if (extractedData.firstName) newStudentData.firstName = extractedData.firstName;
                if (extractedData.lastName) newStudentData.lastName = extractedData.lastName;
                if (extractedData.nationalId) newStudentData.nationalId = extractedData.nationalId.replace(/\D/g, '');
                if (extractedData.phone) newStudentData.phone = extractedData.phone.replace(/\D/g, '');
                
                if (extractedData.birthDate) {
                    if (/^\d{4}-\d{2}-\d{2}$/.test(extractedData.birthDate)) {
                        newStudentData.birthDate = extractedData.birthDate;
                    } else {
                        const formattedDate = parseThaiDate(extractedData.birthDate);
                        if(formattedDate) newStudentData.birthDate = formattedDate;
                    }
                }
                
                if (extractedData.permanentAddress) {
                    newStudentData.permanentAddress = {
                        ...prev.student.permanentAddress,
                        ...extractedData.permanentAddress
                    };
                }

                return { ...prev, student: newStudentData };
            });
            
            setIsPasteModalOpen(false);
            setTextToParse('');
            alert('ข้อมูลถูกกรอกอัตโนมัติเรียบร้อยแล้ว');

        } catch (error) {
            console.error("Failed to parse text data:", error);
            alert("ไม่สามารถประมวลผลข้อมูลที่วางได้ กรุณาตรวจสอบรูปแบบข้อมูล หรือกรอกด้วยตนเอง");
        } finally {
            setIsParsing(false);
        }
    };


    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, photo: file }));
            setPhotoPreviewUrl(URL.createObjectURL(file));
        }
    };

  const studyPlanOptions = useMemo(() => {
    let plans = [];
    if (formData.gradeLevel === GradeLevel.M1) {
        if (formData.applicationRound === ApplicationRound.SpecialProgram) {
            plans = M1_STUDY_PLANS.filter(plan => plan.type === 'special');
        } else if (formData.applicationRound === ApplicationRound.General || formData.applicationRound === ApplicationRound.SpecialTalent) {
            plans = M1_STUDY_PLANS.filter(plan => plan.type === 'general');
        }
        return plans.map(p => p.title);
    }
    if (formData.gradeLevel === GradeLevel.M4) {
        if (formData.applicationRound === ApplicationRound.SpecialProgram) {
            plans = M4_STUDY_PLANS.filter(plan => plan.type === 'special');
        } else if (formData.applicationRound === ApplicationRound.General || formData.applicationRound === ApplicationRound.SpecialTalent) {
            plans = M4_STUDY_PLANS.filter(plan => plan.type === 'general');
        }
        return plans.map(p => p.title);
    }
    return [];
  }, [formData.gradeLevel, formData.applicationRound]);
  
  useEffect(() => {
    if (studyPlanOptions.length === 1 && formData.studyPlan !== studyPlanOptions[0]) {
      setFormData(prev => ({ ...prev, studyPlan: studyPlanOptions[0] }));
    }
  }, [studyPlanOptions, formData.studyPlan]);
  
    useEffect(() => {
        const livesWith = formData.parent.livesWith;
        // Clear father's documents if not needed
        if (livesWith !== 'parents' && livesWith !== 'father') {
            if(formData.fatherHouseholdRegistration || formData.fatherNationalIdCard) {
                setFormData(prev => ({...prev, fatherHouseholdRegistration: undefined, fatherNationalIdCard: undefined}));
            }
        }
        // Clear mother's documents if not needed
        if (livesWith !== 'parents' && livesWith !== 'mother') {
            if(formData.motherHouseholdRegistration || formData.motherNationalIdCard) {
                setFormData(prev => ({...prev, motherHouseholdRegistration: undefined, motherNationalIdCard: undefined}));
            }
        }
        // Clear guardian documents and data if not needed
        if (livesWith !== 'guardian') {
            if(formData.guardianHouseholdRegistration || formData.guardianProof || formData.guardianNationalIdCard) {
                setFormData(prev => ({...prev, guardianHouseholdRegistration: undefined, guardianProof: undefined, guardianNationalIdCard: undefined}));
            }
            if (Object.values(formData.parent.guardian || {}).some(v => v !== '' && (typeof v !== 'object' || Object.values(v).some(sub => sub !== '')))) {
                 setFormData(prev => ({ ...prev, parent: {...prev.parent, guardian: { title: '', firstName: '', lastName: '', relationship: '', phone: '', occupation: '', nationalId: '', address: { detail: '', subdistrict: '', district: '', province: '', postalCode: '' } } }}));
            }
        }
    }, [formData.parent.livesWith]);

    // Derived state for addresses to improve performance
    const currentStudentAddress = useMemo(() => {
        return isCurrentAddressSame ? formData.student.permanentAddress : formData.student.currentAddress;
    }, [isCurrentAddressSame, formData.student.permanentAddress, formData.student.currentAddress]);

    const getSyncedAddress = (syncType: 'none' | 'permanent' | 'current', ownAddress: Address): Address => {
        if (syncType === 'permanent') return formData.student.permanentAddress;
        if (syncType === 'current') return currentStudentAddress;
        return ownAddress;
    };
    
    const fatherAddress = useMemo(() => getSyncedAddress(fatherAddressSync, formData.parent.fatherAddress), [fatherAddressSync, formData.parent.fatherAddress, formData.student.permanentAddress, currentStudentAddress]);
    const motherAddress = useMemo(() => getSyncedAddress(motherAddressSync, formData.parent.motherAddress), [motherAddressSync, formData.parent.motherAddress, formData.student.permanentAddress, currentStudentAddress]);
    const guardianAddress = useMemo(() => getSyncedAddress(guardianAddressSync, formData.parent.guardian!.address), [guardianAddressSync, formData.parent.guardian, formData.student.permanentAddress, currentStudentAddress]);


  const handleSelectGrade = (grade: GradeLevel) => {
    setFormData({
      ...formData,
      gradeLevel: grade,
      applicationRound: undefined,
      studyPlan: '',
    });
    setStep(1);
  };
  
    const handleApplicationRoundChange = (newRound: ApplicationRound) => {
        const isM1General = newRound === ApplicationRound.General && formData.gradeLevel === GradeLevel.M1;
        setFormData(prev => ({
            ...prev,
            applicationRound: newRound,
            studyPlan: '',
            areaType: isM1General ? prev.areaType : undefined,
        }));
    };

  const handleBack = () => {
    if (isConfirming) {
      setIsConfirming(false);
    } else if (step > (isEditMode ? 1 : 0)) {
      setStep(step - 1);
    } else if (isEditMode && onCancel) {
      onCancel();
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
    } else {
      setIsConfirming(true);
    }
  };

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);

    let finalApplicationId: string;
    let finalExamId: string;
    let seatingDetails;
    let submissionDate: string;
    
    let photoDataUrl = '';
    if (formData.photo instanceof File) {
        photoDataUrl = await fileToBase64(formData.photo);
    } else if (typeof formData.photo === 'string') {
        photoDataUrl = formData.photo; // Assuming it's already a data URL from edit mode
    } else {
        photoDataUrl = formData.seatingInfo?.photoUrl || PLACEHOLDER_IMAGE_URL;
    }


    if (isEditMode) {
        finalApplicationId = formData.applicationId!;
        finalExamId = formData.seatingInfo?.examId || 'N/A'; // Use existing IDs
        seatingDetails = { building: formData.seatingInfo?.building || '', room: formData.seatingInfo?.room || '', seat: formData.seatingInfo?.seat || '' };
        submissionDate = new Date().toISOString(); // Update submission date
    } else {
        // Check for existence to prevent overwrite
        finalApplicationId = getNextId('applicationIdCounter', 'application-');
        finalExamId = generateExamId(formData);
        seatingDetails = generateSeatingInfo(formData);
        submissionDate = new Date().toISOString();
    }

    const examInfo: SeatingInfo = {
      name: `${formData.student.title}${formData.student.firstName} ${formData.student.lastName}`,
      applicationId: finalApplicationId,
      examId: finalExamId,
      date: getExamDate(formData.applicationRound, formData.gradeLevel),
      time: '09:00 - 12:00 น.',
      building: seatingDetails.building,
      room: seatingDetails.room,
      seat: seatingDetails.seat,
      photoUrl: photoDataUrl,
    };
    
    const dataToStore: ApplicationData = {
        ...formData,
        applicationId: finalApplicationId,
        seatingInfo: examInfo,
        submissionDate: submissionDate,
        photo: photoDataUrl, // Store photo as base64 string
    };
    
    // Save/Update in localStorage
    localStorage.setItem(`application-${finalApplicationId}`, JSON.stringify(dataToStore));
    localStorage.setItem(`application-by-nid-${formData.student.nationalId}`, JSON.stringify(dataToStore));
    
    await sendApplicationToSheet(dataToStore);

    setIsSubmitting(false);

    if (isEditMode && onSave) {
        alert('บันทึกข้อมูลสำเร็จ');
        onSave();
    } else {
         setSubmissionResult({
            applicationId: finalApplicationId,
            examDetails: examInfo,
            photoUrl: examInfo.photoUrl,
        });
    }

  }, [formData, isEditMode, onSave]);
  
  const handleDownloadCardPdf = async (appId: string) => {
    setIsDownloadingCard(true);
    const cardElement = document.getElementById(`exam-card-${appId}`);
    if (cardElement) {
        try {
            const canvas = await html2canvas(cardElement, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const margin = 10;
            const contentWidth = pdfWidth - (margin * 2);
            const contentHeight = pdfHeight - (margin * 2);
            const imgProps = pdf.getImageProperties(imgData);
            const imgAspectRatio = imgProps.width / imgProps.height;
            const contentAspectRatio = contentWidth / contentHeight;
            let finalImgWidth, finalImgHeight;

            if (imgAspectRatio > contentAspectRatio) {
                finalImgWidth = contentWidth;
                finalImgHeight = finalImgWidth / imgAspectRatio;
            } else {
                finalImgHeight = contentHeight;
                finalImgWidth = finalImgHeight * imgAspectRatio;
            }
            const x = margin + (contentWidth - finalImgWidth) / 2;
            const y = margin + (contentHeight - finalImgHeight) / 2;
            pdf.addImage(imgData, 'PNG', x, y, finalImgWidth, finalImgHeight);
            pdf.save(`exam_card_${appId}.pdf`);
        } catch (error) {
            console.error("PDF Download Error:", error);
            alert("เกิดข้อผิดพลาดในการสร้างไฟล์ PDF");
        } finally {
            setIsDownloadingCard(false);
        }
    } else {
        alert("ไม่พบบัตรเข้าห้องสอบสำหรับดาวน์โหลด");
        setIsDownloadingCard(false);
    }
  };
  
    const handleDownloadApplicationPdf = async (appId: string) => {
        setIsDownloadingApplication(true);
        const applicationElement = document.getElementById(`application-summary-${appId}`);
        if (applicationElement) {
            try {
                const canvas = await html2canvas(applicationElement, {
                    scale: 2,
                    useCORS: true,
                    windowWidth: applicationElement.scrollWidth,
                    windowHeight: applicationElement.scrollHeight,
                });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const imgProps = pdf.getImageProperties(imgData);
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`application_form_${appId}.pdf`);
            } catch (error) {
                console.error("PDF Download Error:", error);
                alert("เกิดข้อผิดพลาดในการสร้างไฟล์ PDF");
            } finally {
                setIsDownloadingApplication(false);
            }
        } else {
            alert("ไม่พบใบสมัครสำหรับดาวน์โหลด");
            setIsDownloadingApplication(false);
        }
    };

    if (submissionResult) {
        return (
          <div className="container mx-auto p-4 sm:p-8 max-w-4xl text-center">
            <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl animate-pop-in">
              <h2 className="text-3xl font-bold text-green-600 mb-4">สมัครเรียนสำเร็จ!</h2>
              <p className="text-gray-600 mb-6">
                ข้อมูลการสมัครของคุณถูกบันทึกเรียบร้อยแล้ว กรุณาพิมพ์หรือดาวน์โหลดบัตรประจำตัวผู้เข้าสอบและใบสมัครเก็บไว้เป็นหลักฐาน
              </p>
              
              <div className="my-8">
                <ExamCard
                  student={formData.student}
                  applicationId={submissionResult.applicationId}
                  examDetails={submissionResult.examDetails}
                  photoUrl={submissionResult.photoUrl}
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-4 no-print">
                <button onClick={() => window.print()} className="bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-primary-hover transition-transform transform hover:scale-105 text-lg">
                  พิมพ์บัตรและใบสมัคร
                </button>
                <button
                  onClick={() => handleDownloadCardPdf(submissionResult.applicationId)}
                  disabled={isDownloadingCard}
                  className="bg-accent text-white font-bold py-3 px-8 rounded-full hover:bg-accent-hover transition-transform transform hover:scale-105 text-lg disabled:opacity-50 disabled:cursor-wait"
                >
                  {isDownloadingCard ? 'กำลังสร้าง...' : 'ดาวน์โหลดบัตรสอบ (PDF)'}
                </button>
                <button
                  onClick={() => handleDownloadApplicationPdf(submissionResult.applicationId)}
                  disabled={isDownloadingApplication}
                  className="bg-secondary text-white font-bold py-3 px-8 rounded-full hover:bg-secondary-hover transition-transform transform hover:scale-105 text-lg disabled:opacity-50 disabled:cursor-wait"
                >
                  {isDownloadingApplication ? 'กำลังสร้าง...' : 'ดาวน์โหลดใบสมัคร (PDF)'}
                </button>
              </div>
              {/* Hidden printable summary */}
              <div className="absolute -left-[9999px] -top-[9999px]">
                 <ApplicationSummary formData={{ ...formData, applicationId: submissionResult.applicationId }} photoUrl={submissionResult.photoUrl} />
              </div>
            </div>
          </div>
        );
    }

    if (isConfirming) {
        const fullFormData = { ...formData, applicationId: isEditMode ? formData.applicationId : 'PREVIEW' };
        return (
          <div className="container mx-auto p-4 sm:p-8 max-w-4xl">
            <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl animate-fade-in">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">ตรวจสอบข้อมูลการสมัคร</h2>
              <p className="text-center text-gray-600 mb-8">กรุณาตรวจสอบข้อมูลทั้งหมดให้ถูกต้องก่อนยืนยัน</p>
              <ApplicationSummary formData={fullFormData} photoUrl={photoPreviewUrl} />
              <div className="mt-8 flex justify-between no-print">
                <button type="button" onClick={handleBack} className="bg-gray-200 text-gray-700 font-bold py-3 px-8 rounded-full hover:bg-gray-300 transition-colors">
                  กลับไปแก้ไข
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-green-500 text-white font-bold py-3 px-8 rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-wait"
                >
                  {isSubmitting ? (isEditMode ? 'กำลังบันทึก...' : 'กำลังส่งใบสมัคร...') : (isEditMode ? 'บันทึกการเปลี่ยนแปลง' : 'ยืนยันและส่งใบสมัคร')}
                </button>
              </div>
            </div>
          </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-8 max-w-5xl">
            {isCameraOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 no-print">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                        <h3 className="text-xl font-bold mb-4">ถ่ายรูปนักเรียน</h3>
                        {capturedImage ? (
                            <div>
                                <img src={capturedImage} alt="Captured" className="rounded-md w-full" />
                                <div className="flex justify-center gap-4 mt-4">
                                    <button onClick={retakePhoto} className="px-4 py-2 bg-gray-300 rounded-md">ถ่ายใหม่</button>
                                    <button onClick={useCapturedPhoto} className="px-4 py-2 bg-primary text-white rounded-md">ใช้รูปนี้</button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <video ref={videoRef} autoPlay playsInline className="rounded-md w-full bg-gray-200"></video>
                                <canvas ref={canvasRef} className="hidden"></canvas>
                                <div className="flex justify-center gap-4 mt-4">
                                    <button onClick={closeCamera} className="px-4 py-2 bg-red-500 text-white rounded-md">ยกเลิก</button>
                                    <button onClick={capturePhoto} className="px-4 py-2 bg-green-500 text-white rounded-md">ถ่ายรูป</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
             {isIdCameraOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 no-print">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                        <h3 className="text-xl font-bold mb-4">ถ่ายรูปบัตรประชาชน</h3>
                        <p className="text-sm text-gray-600 mb-4">จัดวางบัตรให้อยู่ในกรอบและตรวจสอบให้แน่ใจว่าแสงสว่างเพียงพอและข้อความคมชัด</p>
                        <video ref={idVideoRef} autoPlay playsInline className="rounded-md w-full bg-gray-200"></video>
                        <canvas ref={idCanvasRef} className="hidden"></canvas>
                        <div className="flex justify-center gap-4 mt-4">
                            <button onClick={closeIdCamera} className="px-4 py-2 bg-red-500 text-white rounded-md">ยกเลิก</button>
                            <button onClick={captureIdPhotoAndScan} className="px-4 py-2 bg-green-500 text-white rounded-md">ถ่ายรูปและสแกน</button>
                        </div>
                    </div>
                </div>
            )}
             {isPasteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 no-print">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                        <h3 className="text-xl font-bold mb-2">วางข้อมูลเพื่อกรอกอัตโนมัติ</h3>
                        <p className="text-sm text-gray-600 mb-4">คัดลอกข้อมูลนักเรียน เช่น ชื่อ, เลขบัตร, วันเกิด, ที่อยู่ แล้ววางลงในช่องด้านล่างนี้</p>
                        <textarea
                            value={textToParse}
                            onChange={(e) => setTextToParse(e.target.value)}
                            rows={8}
                            className="w-full p-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-primary"
                            placeholder="ตัวอย่าง: เด็กชาย ทดสอบ ระบบดี เลขบัตร 1234567890123 เกิด 15 พ.ค. 2550..."
                        />
                        <div className="flex justify-end gap-4 mt-4">
                            <button onClick={() => setIsPasteModalOpen(false)} disabled={isParsing} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 disabled:opacity-50">ยกเลิก</button>
                            <button onClick={handleParseText} disabled={isParsing} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:bg-blue-300 disabled:cursor-wait">
                                {isParsing ? 'กำลังประมวลผล...' : 'ประมวลผลข้อมูล'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl border-t-8 border-primary">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-secondary-dark mb-4">
                    {isEditMode ? `แก้ไขใบสมัคร: ${initialData?.applicationId}` : 'ใบสมัครเข้าศึกษาต่อ'}
                </h1>
                <p className="text-center text-secondary mb-8">ปีการศึกษา 2569</p>
                {!isEditMode && <StepIndicator currentStep={step + 1} totalSteps={5} />}

                <form onSubmit={handleNext}>
                    {step === 0 && (
                        <div className="animate-fade-in text-center">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">เลือกระดับชั้นที่ต้องการสมัคร</h2>
                            <div className="flex flex-col sm:flex-row justify-center gap-6">
                                <button type="button" onClick={() => handleSelectGrade(GradeLevel.M1)} className="group flex flex-col items-center p-8 border-2 border-transparent rounded-lg bg-blue-50 hover:border-blue-500 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-2">
                                    <SchoolIcon className="h-16 w-16 text-blue-500 mb-4 transition-transform duration-300 group-hover:scale-110"/>
                                    <span className="text-2xl font-bold text-blue-800">มัธยมศึกษาปีที่ 1</span>
                                </button>
                                <button type="button" onClick={() => handleSelectGrade(GradeLevel.M4)} className="group flex flex-col items-center p-8 border-2 border-transparent rounded-lg bg-green-50 hover:border-green-500 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-2">
                                    <SchoolIcon className="h-16 w-16 text-green-500 mb-4 transition-transform duration-300 group-hover:scale-110"/>
                                    <span className="text-2xl font-bold text-green-800">มัธยมศึกษาปีที่ 4</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <FormSection title="1. ข้อมูลการสมัคร">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ประเภทการรับสมัคร<span className="text-red-500">*</span></label>
                                <div className="mt-2 space-y-2">
                                    {Object.values(ApplicationRound).map(round => (
                                        <label key={round} className="flex items-center">
                                            <input type="radio" name="applicationRound" value={round}
                                                checked={formData.applicationRound === round}
                                                onChange={() => handleApplicationRoundChange(round)}
                                                required className="h-4 w-4 text-primary focus:ring-primary border-gray-300"/>
                                            <span className="ml-3 text-gray-700">{round}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            {formData.gradeLevel === GradeLevel.M1 && formData.applicationRound === ApplicationRound.General && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">ประเภทเขตพื้นที่บริการ<span className="text-red-500">*</span></label>
                                    <select value={formData.areaType || ''} onChange={e => setFormData({...formData, areaType: e.target.value as AreaType})} required
                                        className="mt-1 block w-full p-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                                        <option value="" disabled>-- กรุณาเลือก --</option>
                                        {Object.values(AreaType).map(area => <option key={area} value={area}>{area}</option>)}
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500">เขตพื้นที่บริการ: ตำบลบางหัวเสือ, บางหญ้าแพรก, บางด้วน, บางโปรง, บางจาก, สำโรงใต้</p>
                                </div>
                            )}
                            {studyPlanOptions.length > 0 && (
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700">แผนการเรียนที่ต้องการสมัคร<span className="text-red-500">*</span></label>
                                    <select value={formData.studyPlan || ''} onChange={e => setFormData({...formData, studyPlan: e.target.value})} required
                                        className="mt-1 block w-full p-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                        disabled={studyPlanOptions.length === 1}>
                                        {studyPlanOptions.length > 1 && <option value="" disabled>-- กรุณาเลือก --</option>}
                                        {studyPlanOptions.map(plan => <option key={plan} value={plan}>{plan}</option>)}
                                    </select>
                                </div>
                            )}
                            {formData.applicationRound === ApplicationRound.SpecialTalent && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">ประเภทความสามารถพิเศษ<span className="text-red-500">*</span></label>
                                        <select value={formData.specialTalentType || ''} onChange={e => setFormData({...formData, specialTalentType: e.target.value})} required
                                            className="mt-1 block w-full p-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                                            <option value="" disabled>-- กรุณาเลือก --</option>
                                            <option>ด้านกีฬา</option><option>ด้านศิลปะ</option><option>ด้านดนตรีไทย</option><option>ด้านดนตรีสากล</option><option>ด้านนาฏศิลป์</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">อธิบายความสามารถพิเศษ / รางวัลที่เคยได้รับ</label>
                                        <textarea value={formData.specialTalentDescription || ''} onChange={e => setFormData({...formData, specialTalentDescription: e.target.value})}
                                            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                            rows={3}></textarea>
                                    </div>
                                </>
                            )}
                        </FormSection>
                    )}

                     {step === 2 && (
                        <FormSection title="2. ข้อมูลนักเรียน">
                             <div className="md:col-span-2 flex flex-col sm:flex-row gap-2">
                                <button 
                                    type="button" 
                                    onClick={openIdCamera}
                                    disabled={isScanningId || isParsing}
                                    className="flex-1 flex items-center justify-center gap-2 p-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300">
                                    <CameraIcon className="w-6 h-6" />
                                    {isScanningId ? 'กำลังสแกน...' : 'สแกนบัตรประชาชน'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsPasteModalOpen(true)}
                                    disabled={isScanningId || isParsing}
                                    className="flex-1 flex items-center justify-center gap-2 p-3 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-colors disabled:bg-teal-300"
                                >
                                    <ClipboardPasteIcon className="w-6 h-6" />
                                    {isParsing ? 'กำลังประมวลผล...' : 'วางข้อมูลเพื่อกรอกอัตโนมัติ'}
                                </button>
                            </div>
                            {/* Student Name */}
                            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-4 gap-x-4 gap-y-6">
                                <div><label className="block text-sm font-medium text-gray-700">คำนำหน้า<span className="text-red-500">*</span></label><select value={formData.student.title} onChange={e => setFormData({...formData, student: {...formData.student, title: e.target.value}})} required className="mt-1 w-full p-3 border rounded-md bg-white"><option value="">-เลือก-</option><option>เด็กชาย</option><option>เด็กหญิง</option><option>นาย</option><option>นางสาว</option></select></div>
                                <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700">ชื่อ<span className="text-red-500">*</span></label><input type="text" value={formData.student.firstName} onChange={e => setFormData({...formData, student: {...formData.student, firstName: e.target.value}})} required className="mt-1 w-full p-3 border rounded-md" /></div>
                                <div><label className="block text-sm font-medium text-gray-700">นามสกุล<span className="text-red-500">*</span></label><input type="text" value={formData.student.lastName} onChange={e => setFormData({...formData, student: {...formData.student, lastName: e.target.value}})} required className="mt-1 w-full p-3 border rounded-md" /></div>
                            </div>
                            {/* Birthdate */}
                            <BirthdateInput value={formData.student.birthDate} onChange={val => setFormData({...formData, student: {...formData.student, birthDate: val}})} required/>
                            {/* National ID */}
                            <div><label className="block text-sm font-medium text-gray-700">เลขประจำตัวประชาชน<span className="text-red-500">*</span></label><input type="text" value={formData.student.nationalId} onChange={e => setFormData({...formData, student: {...formData.student, nationalId: e.target.value}})} required pattern="\d{13}" title="กรอกเลข 13 หลัก" className="mt-1 w-full p-3 border rounded-md" inputMode="numeric"/></div>
                            {/* Phone */}
                            <div><label className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์นักเรียน<span className="text-red-500">*</span></label><input type="tel" value={formData.student.phone} onChange={e => setFormData({...formData, student: {...formData.student, phone: e.target.value}})} required pattern="\d{9,10}" title="กรอกเบอร์โทร 9-10 หลัก" className="mt-1 w-full p-3 border rounded-md" inputMode="tel"/></div>
                            {/* Gender */}
                            <div><label className="block text-sm font-medium text-gray-700">เพศ<span className="text-red-500">*</span></label><select value={formData.student.gender} onChange={e => setFormData({...formData, student: {...formData.student, gender: e.target.value}})} required className="mt-1 w-full p-3 border rounded-md bg-white"><option value="">-เลือก-</option><option>ชาย</option><option>หญิง</option></select></div>
                            {/* Blood Type, Nationality, Religion */}
                            <div><label className="block text-sm font-medium text-gray-700">หมู่เลือด<span className="text-red-500">*</span></label><select value={formData.student.bloodType} onChange={e => setFormData({...formData, student: {...formData.student, bloodType: e.target.value}})} required className="mt-1 w-full p-3 border rounded-md bg-white"><option value="">-เลือก-</option><option>A</option><option>B</option><option>O</option><option>AB</option></select></div>
                            <div><label className="block text-sm font-medium text-gray-700">สัญชาติ<span className="text-red-500">*</span></label><select value={formData.student.nationality} onChange={e => setFormData({...formData, student: {...formData.student, nationality: e.target.value}})} required className="mt-1 w-full p-3 border rounded-md bg-white"><option>ไทย</option><option>อื่นๆ</option></select></div>
                            {formData.student.nationality === 'อื่นๆ' && <div><label className="block text-sm font-medium text-gray-700">ระบุสัญชาติ</label><input type="text" value={formData.student.otherNationality} onChange={e => setFormData({...formData, student: {...formData.student, otherNationality: e.target.value}})} required className="mt-1 w-full p-3 border rounded-md"/></div>}
                            <div><label className="block text-sm font-medium text-gray-700">ศาสนา<span className="text-red-500">*</span></label><select value={formData.student.religion} onChange={e => setFormData({...formData, student: {...formData.student, religion: e.target.value}})} required className="mt-1 w-full p-3 border rounded-md bg-white"><option>พุทธ</option><option>คริสต์</option><option>อิสลาม</option><option>อื่นๆ</option></select></div>
                            {formData.student.religion === 'อื่นๆ' && <div><label className="block text-sm font-medium text-gray-700">ระบุศาสนา</label><input type="text" value={formData.student.otherReligion} onChange={e => setFormData({...formData, student: {...formData.student, otherReligion: e.target.value}})} required className="mt-1 w-full p-3 border rounded-md"/></div>}
                            {/* Chronic Disease */}
                            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">โรคประจำตัว (ถ้ามี)</label><input type="text" value={formData.student.chronicDisease} onChange={e => setFormData({...formData, student: {...formData.student, chronicDisease: e.target.value}})} className="mt-1 w-full p-3 border rounded-md"/></div>
                            {/* Addresses */}
                            <div className="md:col-span-2"><AddressInput address={formData.student.permanentAddress} onAddressChange={addr => setFormData({...formData, student: {...formData.student, permanentAddress: addr}})} title="ที่อยู่ตามทะเบียนบ้าน" isRequired={true} /></div>
                            <div className="md:col-span-2">
                                <label className="flex items-center"><input type="checkbox" checked={isCurrentAddressSame} onChange={e => setIsCurrentAddressSame(e.target.checked)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"/>
                                <span className="ml-2 text-gray-700">ที่อยู่ปัจจุบันตรงกับที่อยู่ตามทะเบียนบ้าน</span></label>
                            </div>
                            <div className="md:col-span-2"><AddressInput address={currentStudentAddress} onAddressChange={addr => setFormData({...formData, student: {...formData.student, currentAddress: addr}})} title="ที่อยู่ปัจจุบัน" isRequired={true} isDisabled={isCurrentAddressSame} /></div>
                        </FormSection>
                    )}

                    {step === 3 && (
                        <FormSection title="3. ข้อมูลผู้ปกครอง">
                             {/* Lives with & Contact Email */}
                             <div><label className="block text-sm font-medium text-gray-700">นักเรียนอาศัยอยู่กับ<span className="text-red-500">*</span></label><select value={formData.parent.livesWith} onChange={e => setFormData({...formData, parent: {...formData.parent, livesWith: e.target.value as any}})} required className="mt-1 w-full p-3 border rounded-md bg-white"><option value="" disabled>-เลือก-</option><option value="parents">บิดา-มารดา</option><option value="father">บิดา</option><option value="mother">มารดา</option><option value="guardian">ผู้ปกครอง</option></select></div>
                             <div><label className="block text-sm font-medium text-gray-700">อีเมลติดต่อผู้ปกครอง<span className="text-red-500">*</span></label><input type="email" value={formData.parent.contactEmail} onChange={e => setFormData({...formData, parent: {...formData.parent, contactEmail: e.target.value}})} required className="mt-1 w-full p-3 border rounded-md"/></div>
                             {/* Father's Info */}
                             <div className="md:col-span-2 border-t pt-4 mt-2"><h3 className="font-semibold text-lg text-gray-700">ข้อมูลบิดา</h3></div>
                             <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-4 gap-x-4 gap-y-6">
                                <div><label className="block text-sm font-medium text-gray-700">คำนำหน้า<span className="text-red-500">*</span></label><select value={formData.parent.fatherTitle} onChange={e => setFormData({...formData, parent: {...formData.parent, fatherTitle: e.target.value}})} required className="mt-1 w-full p-3 border rounded-md bg-white"><option value="">-เลือก-</option><option>นาย</option></select></div>
                                <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700">ชื่อ<span className="text-red-500">*</span></label><input type="text" value={formData.parent.fatherFirstName} onChange={e => setFormData({...formData, parent: {...formData.parent, fatherFirstName: e.target.value}})} required className="mt-1 w-full p-3 border rounded-md" /></div>
                                <div><label className="block text-sm font-medium text-gray-700">นามสกุล<span className="text-red-500">*</span></label><input type="text" value={formData.parent.fatherLastName} onChange={e => setFormData({...formData, parent: {...formData.parent, fatherLastName: e.target.value}})} required className="mt-1 w-full p-3 border rounded-md" /></div>
                             </div>
                             <div><label className="block text-sm font-medium text-gray-700">เลขประจำตัวประชาชน<span className="text-red-500">*</span></label><input type="text" value={formData.parent.fatherNationalId} onChange={e => setFormData({...formData, parent: {...formData.parent, fatherNationalId: e.target.value}})} required pattern="\d{13}" title="กรอกเลข 13 หลัก" className="mt-1 w-full p-3 border rounded-md" inputMode="numeric"/></div>
                             <AIAutoCompleteInput
                                label="อาชีพ"
                                value={formData.parent.fatherOccupation}
                                onValueChange={value => setFormData({...formData, parent: {...formData.parent, fatherOccupation: value}})}
                                fieldType="occupation"
                                isRequired={true}
                            />
                             <div><label className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์<span className="text-red-500">*</span></label><input type="tel" value={formData.parent.fatherPhone} onChange={e => setFormData({...formData, parent: {...formData.parent, fatherPhone: e.target.value}})} required pattern="\d{9,10}" title="กรอกเบอร์โทร 9-10 หลัก" className="mt-1 w-full p-3 border rounded-md" inputMode="tel"/></div>
                             <div className="md:col-span-2"><AddressInput address={fatherAddress} onAddressChange={addr => setFormData({...formData, parent: {...formData.parent, fatherAddress: addr}})} title="ที่อยู่บิดา" isRequired={true} isDisabled={fatherAddressSync !== 'none'} /><div className="flex gap-4 mt-1 text-sm"><label><input type="radio" name="fatherAddrSync" checked={fatherAddressSync === 'none'} onChange={() => setFatherAddressSync('none')} /> กรอกเอง</label><label><input type="radio" name="fatherAddrSync" checked={fatherAddressSync === 'permanent'} onChange={() => setFatherAddressSync('permanent')} /> ที่อยู่เดียวกับทะเบียนบ้านนักเรียน</label><label><input type="radio" name="fatherAddrSync" checked={fatherAddressSync === 'current'} onChange={() => setFatherAddressSync('current')} /> ที่อยู่เดียวกับที่อยู่ปัจจุบันนักเรียน</label></div></div>
                              {/* Mother's Info */}
                             <div className="md:col-span-2 border-t pt-4 mt-2"><h3 className="font-semibold text-lg text-gray-700">ข้อมูลมารดา</h3></div>
                             <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-4 gap-x-4 gap-y-6">
                                <div><label className="block text-sm font-medium text-gray-700">คำนำหน้า<span className="text-red-500">*</span></label><select value={formData.parent.motherTitle} onChange={e => setFormData({...formData, parent: {...formData.parent, motherTitle: e.target.value}})} required className="mt-1 w-full p-3 border rounded-md bg-white"><option value="">-เลือก-</option><option>นาง</option><option>นางสาว</option></select></div>
                                <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700">ชื่อ<span className="text-red-500">*</span></label><input type="text" value={formData.parent.motherFirstName} onChange={e => setFormData({...formData, parent: {...formData.parent, motherFirstName: e.target.value}})} required className="mt-1 w-full p-3 border rounded-md" /></div>
                                <div><label className="block text-sm font-medium text-gray-700">นามสกุล<span className="text-red-500">*</span></label><input type="text" value={formData.parent.motherLastName} onChange={e => setFormData({...formData, parent: {...formData.parent, motherLastName: e.target.value}})} required className="mt-1 w-full p-3 border rounded-md" /></div>
                             </div>
                             <div><label className="block text-sm font-medium text-gray-700">เลขประจำตัวประชาชน<span className="text-red-500">*</span></label><input type="text" value={formData.parent.motherNationalId} onChange={e => setFormData({...formData, parent: {...formData.parent, motherNationalId: e.target.value}})} required pattern="\d{13}" title="กรอกเลข 13 หลัก" className="mt-1 w-full p-3 border rounded-md" inputMode="numeric"/></div>
                             <AIAutoCompleteInput
                                label="อาชีพ"
                                value={formData.parent.motherOccupation}
                                onValueChange={value => setFormData({...formData, parent: {...formData.parent, motherOccupation: value}})}
                                fieldType="occupation"
                                isRequired={true}
                            />
                             <div><label className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์<span className="text-red-500">*</span></label><input type="tel" value={formData.parent.motherPhone} onChange={e => setFormData({...formData, parent: {...formData.parent, motherPhone: e.target.value}})} required pattern="\d{9,10}" title="กรอกเบอร์โทร 9-10 หลัก" className="mt-1 w-full p-3 border rounded-md" inputMode="tel"/></div>
                             <div className="md:col-span-2"><AddressInput address={motherAddress} onAddressChange={addr => setFormData({...formData, parent: {...formData.parent, motherAddress: addr}})} title="ที่อยู่มารดา" isRequired={true} isDisabled={motherAddressSync !== 'none'} /><div className="flex gap-4 mt-1 text-sm"><label><input type="radio" name="motherAddrSync" checked={motherAddressSync === 'none'} onChange={() => setMotherAddressSync('none')} /> กรอกเอง</label><label><input type="radio" name="motherAddrSync" checked={motherAddressSync === 'permanent'} onChange={() => setMotherAddressSync('permanent')} /> ที่อยู่เดียวกับทะเบียนบ้านนักเรียน</label><label><input type="radio" name="motherAddrSync" checked={motherAddressSync === 'current'} onChange={() => setMotherAddressSync('current')} /> ที่อยู่เดียวกับที่อยู่ปัจจุบันนักเรียน</label></div></div>
                            {/* Guardian Info */}
                             {formData.parent.livesWith === 'guardian' && (
                                <>
                                <div className="md:col-span-2 border-t pt-4 mt-2"><h3 className="font-semibold text-lg text-gray-700">ข้อมูลผู้ปกครอง (ที่ไม่ใช่บิดา-มารดา)</h3></div>
                                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-4 gap-x-4 gap-y-6">
                                    <div><label className="block text-sm font-medium text-gray-700">คำนำหน้า<span className="text-red-500">*</span></label><select value={formData.parent.guardian?.title} onChange={e => setFormData({...formData, parent: {...formData.parent, guardian: {...formData.parent.guardian!, title: e.target.value}}})} required className="mt-1 w-full p-3 border rounded-md bg-white"><option value="">-เลือก-</option><option>นาย</option><option>นาง</option><option>นางสาว</option></select></div>
                                    <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700">ชื่อ<span className="text-red-500">*</span></label><input type="text" value={formData.parent.guardian?.firstName} onChange={e => setFormData({...formData, parent: {...formData.parent, guardian: {...formData.parent.guardian!, firstName: e.target.value}}})} required className="mt-1 w-full p-3 border rounded-md" /></div>
                                    <div><label className="block text-sm font-medium text-gray-700">นามสกุล<span className="text-red-500">*</span></label><input type="text" value={formData.parent.guardian?.lastName} onChange={e => setFormData({...formData, parent: {...formData.parent, guardian: {...formData.parent.guardian!, lastName: e.target.value}}})} required className="mt-1 w-full p-3 border rounded-md" /></div>
                                </div>
                                <div><label className="block text-sm font-medium text-gray-700">ความสัมพันธ์<span className="text-red-500">*</span></label><input type="text" value={formData.parent.guardian?.relationship} onChange={e => setFormData({...formData, parent: {...formData.parent, guardian: {...formData.parent.guardian!, relationship: e.target.value}}})} required className="mt-1 w-full p-3 border rounded-md"/></div>
                                <div><label className="block text-sm font-medium text-gray-700">เลขประจำตัวประชาชน<span className="text-red-500">*</span></label><input type="text" value={formData.parent.guardian?.nationalId} onChange={e => setFormData({...formData, parent: {...formData.parent, guardian: {...formData.parent.guardian!, nationalId: e.target.value}}})} required pattern="\d{13}" title="กรอกเลข 13 หลัก" className="mt-1 w-full p-3 border rounded-md" inputMode="numeric"/></div>
                                <AIAutoCompleteInput
                                    label="อาชีพ"
                                    value={formData.parent.guardian!.occupation}
                                    onValueChange={value => setFormData({...formData, parent: {...formData.parent, guardian: {...formData.parent.guardian!, occupation: value}}})}
                                    fieldType="occupation"
                                    isRequired={true}
                                />
                                <div><label className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์<span className="text-red-500">*</span></label><input type="tel" value={formData.parent.guardian?.phone} onChange={e => setFormData({...formData, parent: {...formData.parent, guardian: {...formData.parent.guardian!, phone: e.target.value}}})} required pattern="\d{9,10}" title="กรอกเบอร์โทร 9-10 หลัก" className="mt-1 w-full p-3 border rounded-md" inputMode="tel"/></div>
                                <div className="md:col-span-2"><AddressInput address={guardianAddress} onAddressChange={addr => setFormData({...formData, parent: {...formData.parent, guardian: {...formData.parent.guardian!, address: addr}}})} title="ที่อยู่ผู้ปกครอง" isRequired={true} isDisabled={guardianAddressSync !== 'none'} /><div className="flex gap-4 mt-1 text-sm"><label><input type="radio" name="guardianAddrSync" checked={guardianAddressSync === 'none'} onChange={() => setGuardianAddressSync('none')} /> กรอกเอง</label><label><input type="radio" name="guardianAddrSync" checked={guardianAddressSync === 'permanent'} onChange={() => setGuardianAddressSync('permanent')} /> ที่อยู่เดียวกับทะเบียนบ้านนักเรียน</label><label><input type="radio" name="guardianAddrSync" checked={guardianAddressSync === 'current'} onChange={() => setGuardianAddressSync('current')} /> ที่อยู่เดียวกับที่อยู่ปัจจุบันนักเรียน</label></div></div>
                                </>
                             )}
                        </FormSection>
                    )}
                    
                    {step === 4 && (
                        <FormSection title="4. ข้อมูลการศึกษาและเอกสาร">
                            <AIAutoCompleteInput
                                label="โรงเรียนเดิม"
                                value={formData.school.previousSchool}
                                onValueChange={value => setFormData({...formData, school: {...formData.school, previousSchool: value}})}
                                fieldType="school"
                                isRequired={true}
                                className="md:col-span-2"
                            />
                            <div><label className="block text-sm font-medium text-gray-700">จังหวัด<span className="text-red-500">*</span></label><select value={formData.school.previousSchoolProvince} onChange={e => setFormData({...formData, school: {...formData.school, previousSchoolProvince: e.target.value}})} required className="mt-1 w-full p-3 border rounded-md bg-white"><option value="">--เลือกจังหวัด--</option>{THAI_PROVINCES.map(p=><option key={p.id} value={p.name_th}>{p.name_th}</option>)}</select></div>
                            <div><label className="block text-sm font-medium text-gray-700">เกรดเฉลี่ยสะสม (GPAX)<span className="text-red-500">*</span></label><input type="number" step="0.01" min="0" max="4" value={formData.school.gpax} onChange={e => setFormData({...formData, school: {...formData.school, gpax: e.target.value}})} required className="mt-1 w-full p-3 border rounded-md"/></div>
                            <div className="md:col-span-2 border-t pt-6 mt-4">
                                <h3 className="font-semibold text-lg text-gray-700 mb-2">รูปถ่ายนักเรียน</h3>
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <img src={photoPreviewUrl} alt="Student" className="w-32 h-40 object-cover rounded-md border-2 border-gray-200" />
                                    <div className="space-y-2 flex flex-col items-center sm:items-start">
                                        <label htmlFor="photo-upload" className="cursor-pointer px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover w-full sm:w-auto text-center">อัปโหลดรูป</label>
                                        <input id="photo-upload" type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                                        <button type="button" onClick={openCamera} className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-hover w-full sm:w-auto">ถ่ายรูป</button>
                                        <p className="text-xs text-gray-500">รูปหน้าตรง ไม่สวมหมวก ไม่สวมแว่นตาดำ</p>
                                    </div>
                                </div>
                            </div>
                            <div className="md:col-span-2 border-t pt-6 mt-4"><h3 className="font-semibold text-lg text-gray-700 mb-4">เอกสารประกอบการสมัคร</h3></div>
                            <FileUpload label="ใบแสดงผลการเรียน (ปพ.1)" onFileChange={file => setFormData({...formData, transcript: file})} isUploaded={!!formData.transcript} />
                            <FileUpload label="สำเนาทะเบียนบ้านของนักเรียน" onFileChange={file => setFormData({...formData, householdRegistration: file})} isUploaded={!!formData.householdRegistration} />
                            
                            { (formData.parent.livesWith === 'parents' || formData.parent.livesWith === 'father') && (
                                <React.Fragment>
                                    <FileUpload label="สำเนาบัตรประชาชนของบิดา" onFileChange={file => setFormData({...formData, fatherNationalIdCard: file})} isUploaded={!!formData.fatherNationalIdCard} />
                                    <FileUpload label="สำเนาทะเบียนบ้านของบิดา" onFileChange={file => setFormData({...formData, fatherHouseholdRegistration: file})} isUploaded={!!formData.fatherHouseholdRegistration} />
                                </React.Fragment>
                            ) }
                            { (formData.parent.livesWith === 'parents' || formData.parent.livesWith === 'mother') && (
                                <React.Fragment>
                                    <FileUpload label="สำเนาบัตรประชาชนของมารดา" onFileChange={file => setFormData({...formData, motherNationalIdCard: file})} isUploaded={!!formData.motherNationalIdCard} />
                                    <FileUpload label="สำเนาทะเบียนบ้านของมารดา" onFileChange={file => setFormData({...formData, motherHouseholdRegistration: file})} isUploaded={!!formData.motherHouseholdRegistration} />
                                </React.Fragment>
                            ) }
                            { formData.parent.livesWith === 'guardian' && (
                                <React.Fragment>
                                    <FileUpload label="สำเนาบัตรประชาชนของผู้ปกครอง" onFileChange={file => setFormData({...formData, guardianNationalIdCard: file})} isUploaded={!!formData.guardianNationalIdCard} />
                                    <FileUpload label="สำเนาทะเบียนบ้านของผู้ปกครอง" onFileChange={file => setFormData({...formData, guardianHouseholdRegistration: file})} isUploaded={!!formData.guardianHouseholdRegistration} />
                                    <FileUpload label="หลักฐานแสดงความสัมพันธ์" onFileChange={file => setFormData({...formData, guardianProof: file})} isUploaded={!!formData.guardianProof} />
                                </React.Fragment>
                            ) }
                        </FormSection>
                    )}
                    
                    <div className="mt-10 flex justify-between no-print">
                        <button type="button" onClick={handleBack} className={`bg-gray-200 text-gray-700 font-bold py-3 px-8 rounded-full hover:bg-gray-300 transition-colors ${step === 0 && !isEditMode ? 'invisible' : ''}`}>
                            {isEditMode ? 'ยกเลิก' : 'ย้อนกลับ'}
                        </button>
                        <button type="submit" className="bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-primary-hover transition-colors">
                            {step === 4 ? 'ตรวจสอบข้อมูล' : 'ต่อไป'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplicationForm;