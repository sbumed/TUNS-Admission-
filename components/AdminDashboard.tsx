import React, { useState, useEffect, useCallback } from 'react';
import { ApplicationData } from '../types';
import ApplicationForm from './ApplicationForm';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ApplicationSummary from './ApplicationSummary';

const AdminDashboard: React.FC = () => {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState('');
    const [applicants, setApplicants] = useState<ApplicationData[]>([]);
    const [editingApplicant, setEditingApplicant] = useState<ApplicationData | null>(null);
    const [downloadingApplicant, setDownloadingApplicant] = useState<ApplicationData | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    const loadApplicants = useCallback(() => {
        const loadedApplicants: ApplicationData[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('application-')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key) as string);
                    loadedApplicants.push(data);
                } catch (e) {
                    console.error(`Failed to parse applicant data for key ${key}`, e);
                }
            }
        }
        // Sort by submission date, newest first
        loadedApplicants.sort((a, b) => new Date(b.submissionDate!).getTime() - new Date(a.submissionDate!).getTime());
        setApplicants(loadedApplicants);
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            loadApplicants();
        }
    }, [isAuthenticated, loadApplicants]);
    
    useEffect(() => {
        if (downloadingApplicant) {
            const download = async () => {
                const appId = downloadingApplicant.applicationId;
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

                        // Fetch and add image attachments
                        const imageFields = [
                            'transcript', 'householdRegistration', 'fatherHouseholdRegistration',
                            'motherHouseholdRegistration', 'guardianHouseholdRegistration', 'guardianProof',
                            'fatherNationalIdCard', 'motherNationalIdCard', 'guardianNationalIdCard'
                        ];

                        for (const field of imageFields) {
                            const fileData = (downloadingApplicant as any)[field];
                            if (typeof fileData === 'string' && fileData.startsWith('data:image')) {
                                try {
                                    pdf.addPage();
                                    pdf.text(`เอกสารแนบ: ${field}`, 10, 10);
                                    pdf.addImage(fileData, 'JPEG', 10, 20, 190, 0);
                                } catch (imgError) {
                                    console.error(`Could not add image for ${field}:`, imgError);
                                    pdf.text(`Could not embed image for: ${field}`, 10, 20);
                                }
                            } else if (typeof fileData === 'string' && fileData.startsWith('data:application/pdf')) {
                                pdf.addPage();
                                pdf.text(`เอกสารแนบ: ${field}`, 10, 10);
                                pdf.text(`(ไฟล์ PDF ไม่สามารถแสดงผลในนี้ได้)`, 10, 20);
                            }
                        }

                        pdf.save(`application_form_${appId}.pdf`);

                    } catch (error) {
                        console.error("PDF Download Error:", error);
                        alert("เกิดข้อผิดพลาดในการสร้างไฟล์ PDF");
                    } finally {
                       setDownloadingApplicant(null);
                    }
                } else {
                     alert("ไม่พบใบสมัครสำหรับดาวน์โหลด");
                     setDownloadingApplicant(null);
                }
            };
            // Use timeout to allow the component to render before starting download
            setTimeout(download, 100);
        }
    }, [downloadingApplicant]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'tunsadmin2569') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('รหัสผ่านไม่ถูกต้อง');
        }
    };
    
    const handleEdit = (applicant: ApplicationData) => {
        setEditingApplicant(applicant);
    };

    const handleSave = () => {
        setEditingApplicant(null);
        loadApplicants(); // Reload to see updated data
    };

    const handleExportCSV = () => {
        if (applicants.length === 0) {
            alert("ไม่มีข้อมูลผู้สมัครให้ส่งออก");
            return;
        }
        setIsExporting(true);

        const headers = [
            'เลขที่ใบสมัคร', 'วันที่สมัคร', 'ระดับชั้น', 'ประเภทการรับสมัคร', 'แผนการเรียน', 'ประเภทเขตพื้นที่', 'ความสามารถพิเศษ', 'รายละเอียดความสามารถพิเศษ',
            'คำนำหน้า', 'ชื่อจริง', 'นามสกุล', 'เลขประจำตัวประชาชน', 'วันเกิด', 'เบอร์โทรศัพท์นักเรียน', 'เพศ', 'หมู่เลือด', 'ศาสนา', 'สัญชาติ', 'โรคประจำตัว',
            'ที่อยู่ตามทะเบียนบ้าน', 'ตำบล/แขวง', 'อำเภอ/เขต', 'จังหวัด', 'รหัสไปรษณีย์',
            'ที่อยู่ปัจจุบัน', 'ตำบล/แขวง', 'อำเภอ/เขต', 'จังหวัด', 'รหัสไปรษณีย์',
            'อาศัยอยู่กับ', 'อีเมลผู้ปกครอง',
            'คำนำหน้าบิดา', 'ชื่อบิดา', 'นามสกุลบิดา', 'เลขประจำตัวประชาชนบิดา', 'เบอร์โทรศัพท์บิดา', 'อาชีพบิดา',
            'คำนำหน้ามารดา', 'ชื่อมารดา', 'นามสกุลมารดา', 'เลขประจำตัวประชาชนมารดา', 'เบอร์โทรศัพท์มารดา', 'อาชีพมารดา',
            'คำนำหน้าผู้ปกครอง', 'ชื่อผู้ปกครอง', 'นามสกุลผู้ปกครอง', 'ความสัมพันธ์', 'เลขประจำตัวประชาชนผู้ปกครอง', 'เบอร์โทรศัพท์ผู้ปกครอง', 'อาชีพผู้ปกครอง',
            'โรงเรียนเดิม', 'จังหวัดโรงเรียนเดิม', 'GPAX',
            'เลขประจำตัวสอบ', 'อาคารสอบ', 'ห้องสอบ', 'ที่นั่งสอบ',
            'รูปถ่าย (base64)', 'ใบแสดงผลการเรียน (base64)', 'สำเนาทะเบียนบ้านนักเรียน (base64)',
            'สำเนาบัตรประชาชนบิดา (base64)', 'สำเนาทะเบียนบ้านบิดา (base64)',
            'สำเนาบัตรประชาชนมารดา (base64)', 'สำเนาทะเบียนบ้านมารดา (base64)',
            'สำเนาบัตรประชาชนผู้ปกครอง (base64)', 'สำเนาทะเบียนบ้านผู้ปกครอง (base64)', 'หลักฐานแสดงความสัมพันธ์ (base64)'
        ];

        const escapeCSV = (field: any): string => {
            if (field === null || field === undefined) return '""';
            const str = String(field);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                const escapedStr = str.replace(/"/g, '""');
                return `"${escapedStr}"`;
            }
            return `"${str}"`;
        };

        const rows = applicants.map(app => {
            const { student, parent, school, ...rest } = app;
            return [
                rest.applicationId, new Date(rest.submissionDate!).toLocaleString('th-TH'), rest.gradeLevel, rest.applicationRound, rest.studyPlan, rest.areaType, rest.specialTalentType, rest.specialTalentDescription,
                student.title, student.firstName, student.lastName, student.nationalId, student.birthDate, student.phone, student.gender, student.bloodType, student.religion, student.nationality, student.chronicDisease,
                student.permanentAddress.detail, student.permanentAddress.subdistrict, student.permanentAddress.district, student.permanentAddress.province, student.permanentAddress.postalCode,
                student.currentAddress.detail, student.currentAddress.subdistrict, student.currentAddress.district, student.currentAddress.province, student.currentAddress.postalCode,
                parent.livesWith, parent.contactEmail,
                parent.fatherTitle, parent.fatherFirstName, parent.fatherLastName, parent.fatherNationalId, parent.fatherPhone, parent.fatherOccupation,
                parent.motherTitle, parent.motherFirstName, parent.motherLastName, parent.motherNationalId, parent.motherPhone, parent.motherOccupation,
                parent.guardian?.title, parent.guardian?.firstName, parent.guardian?.lastName, parent.guardian?.relationship, parent.guardian?.nationalId, parent.guardian?.phone, parent.guardian?.occupation,
                school.previousSchool, school.previousSchoolProvince, school.gpax,
                rest.seatingInfo?.examId, rest.seatingInfo?.building, rest.seatingInfo?.room, rest.seatingInfo?.seat,
                rest.photo, rest.transcript, rest.householdRegistration,
                rest.fatherNationalIdCard, rest.fatherHouseholdRegistration,
                rest.motherNationalIdCard, rest.motherHouseholdRegistration,
                rest.guardianNationalIdCard, rest.guardianHouseholdRegistration, rest.guardianProof
            ].map(escapeCSV).join(',');
        });

        const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "tuns_applications.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        setIsExporting(false);
    };

    if (editingApplicant) {
        return <ApplicationForm initialData={editingApplicant} onSave={handleSave} onCancel={() => setEditingApplicant(null)} />;
    }

    if (!isAuthenticated) {
        return (
            <div className="container mx-auto p-8 max-w-md">
                <div className="bg-white p-8 rounded-2xl shadow-xl mt-10">
                    <h1 className="text-2xl font-bold text-center mb-6">สำหรับผู้ดูแลระบบ</h1>
                    <form onSubmit={handleLogin}>
                        <label className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full p-3 border rounded-md"
                        />
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        <button type="submit" className="mt-6 w-full bg-primary text-white font-bold py-3 rounded-full hover:bg-primary-hover">
                            เข้าสู่ระบบ
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-8 max-w-7xl">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                 <h1 className="text-3xl font-extrabold text-slate-100">
                    จัดการข้อมูลผู้สมัคร
                </h1>
                <button
                    onClick={handleExportCSV}
                    disabled={isExporting || applicants.length === 0}
                    className="bg-green-600 text-white font-bold py-2 px-6 rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isExporting ? 'กำลังส่งออก...' : 'ส่งออกเป็น CSV'}
                </button>
            </div>
            <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-xl">
                {applicants.length === 0 ? (
                    <p className="text-center text-gray-500">ยังไม่มีผู้สมัครในเบราว์เซอร์นี้</p>
                ) : (
                    <table className="w-full text-left">
                        <thead className="hidden md:table-header-group">
                            <tr className="border-b bg-gray-50">
                                <th className="p-4 font-semibold">ชื่อ-สกุล</th>
                                <th className="p-4 font-semibold">เลขที่ใบสมัคร</th>
                                <th className="p-4 font-semibold">ระดับชั้น</th>
                                <th className="p-4 font-semibold">วันที่สมัคร</th>
                                <th className="p-4 font-semibold text-right">ดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applicants.map(app => (
                                <tr key={app.applicationId} className="block mb-4 border rounded-lg md:table-row md:border-b md:rounded-none md:mb-0 hover:bg-gray-50">
                                    <td data-label="ชื่อ-สกุล:" className="block p-3 text-right border-b md:border-none before:content-[attr(data-label)] before:float-left before:font-bold md:table-cell md:text-left md:before:content-none md:p-4">
                                        {app.student.firstName} {app.student.lastName}
                                    </td>
                                    <td data-label="เลขที่ใบสมัคร:" className="block p-3 text-right border-b md:border-none before:content-[attr(data-label)] before:float-left before:font-bold md:table-cell md:text-left md:before:content-none md:p-4 font-mono">
                                        {app.applicationId}
                                    </td>
                                    <td data-label="ระดับชั้น:" className="block p-3 text-right border-b md:border-none before:content-[attr(data-label)] before:float-left before:font-bold md:table-cell md:text-left md:before:content-none md:p-4">
                                        {app.gradeLevel}
                                    </td>
                                    <td data-label="วันที่สมัคร:" className="block p-3 text-right border-b md:border-none before:content-[attr(data-label)] before:float-left before:font-bold md:table-cell md:text-left md:before:content-none md:p-4">
                                        {new Date(app.submissionDate!).toLocaleDateString('th-TH')}
                                    </td>
                                    <td className="block p-3 md:table-cell md:p-4 text-right">
                                        <div className="space-x-2">
                                            <button onClick={() => handleEdit(app)} className="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm hover:bg-yellow-600">แก้ไข</button>
                                            <button 
                                                onClick={() => setDownloadingApplicant(app)} 
                                                className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-wait"
                                                disabled={!!downloadingApplicant}
                                            >
                                               {downloadingApplicant?.applicationId === app.applicationId ? 'กำลังโหลด...' : 'PDF'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {/* Hidden container for PDF rendering */}
            {downloadingApplicant && (
                 <div className="absolute -left-[9999px] -top-[9999px]">
                    <ApplicationSummary 
                        formData={downloadingApplicant} 
                        photoUrl={typeof downloadingApplicant.photo === 'string' ? downloadingApplicant.photo : ''}
                    />
                 </div>
            )}
        </div>
    );
};

export default AdminDashboard;