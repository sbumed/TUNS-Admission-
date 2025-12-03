import React, { useState } from 'react';
import { SeatingInfo, StudentData } from '../types';
import { PLACEHOLDER_IMAGE_URL } from '../constants';

// Copied from ExamSeating.tsx
const findApplication = (id: string): { seatingInfo: SeatingInfo; student: StudentData; } | null => {
  // Search by Application ID first
  let storedData = localStorage.getItem(`application-${id}`);
  if (storedData) {
      const parsed = JSON.parse(storedData);
      return {
          student: parsed.student,
          seatingInfo: parsed.seatingInfo
      };
  }
  
  // Then search by National ID
  storedData = localStorage.getItem(`application-by-nid-${id}`);
  if (storedData) {
      const parsed = JSON.parse(storedData);
      return {
          student: parsed.student,
          seatingInfo: parsed.seatingInfo
      };
  }

  return null;
};

// Simulated result logic
const checkExamResult = (applicationId: string): { passed: boolean; plan?: string } => {
    // A simple deterministic "result" based on the applicant's ID.
    let hash = 0;
    for (let i = 0; i < applicationId.length; i++) {
        const char = applicationId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    const passed = (Math.abs(hash) % 10) < 7; // ~70% pass rate
    const plan = passed ? 'แผนการเรียนวิทยาศาสตร์-คณิตศาสตร์' : undefined; 
    return { passed, plan };
};

const AnnounceResults: React.FC = () => {
    const [searchInput, setSearchInput] = useState('');
    const [searchResult, setSearchResult] = useState<{ student: { name: string; applicationId: string; examId: string; }; result: { passed: boolean; plan?: string; } } | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSearchResult(null);
        setTimeout(() => {
            const applicationData = findApplication(searchInput);
            if (applicationData) {
                const result = checkExamResult(applicationData.seatingInfo.applicationId);
                setSearchResult({
                    student: {
                        name: `${applicationData.student.title}${applicationData.student.firstName} ${applicationData.student.lastName}`,
                        applicationId: applicationData.seatingInfo.applicationId,
                        examId: applicationData.seatingInfo.examId
                    },
                    result
                });
            } else {
                setError('ไม่พบข้อมูลผู้สมัคร กรุณาตรวจสอบเลขที่ใบสมัครหรือเลขบัตรประชาชน');
            }
            setIsLoading(false);
        }, 500);
    };
    
    return (
        <div className="container mx-auto px-4 sm:p-8 max-w-4xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-slate-100 mt-8 mb-2">ประกาศผลการสอบคัดเลือก</h1>
            <p className="text-center text-slate-300 mb-8">ประกาศ ณ วันที่ 15 เมษายน 2569</p>
            <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-xl">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-8">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="กรอกเลขที่ใบสมัคร หรือ เลขบัตรประชาชน"
                        className="flex-1 p-3 border rounded-full focus:ring-2 focus:ring-primary"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-primary-hover transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'กำลังตรวจสอบ...' : 'ดูผลสอบ'}
                    </button>
                </form>

                {error && <p className="text-red-500 text-center">{error}</p>}
                
                {searchResult && (
                    <div className="animate-fade-in text-center">
                        {searchResult.result.passed ? (
                            <div className="bg-success-light border-2 border-success p-6 rounded-lg">
                                <h2 className="text-2xl font-bold text-success-dark">ขอแสดงความยินดี!</h2>
                                <p className="text-lg text-success-dark mt-2">คุณผ่านการคัดเลือก</p>
                                <div className="mt-4 text-left bg-white p-4 rounded-md space-y-1">
                                    <p><strong>ชื่อ-สกุล:</strong> {searchResult.student.name}</p>
                                    <p><strong>เลขที่ใบสมัคร:</strong> {searchResult.student.applicationId}</p>
                                    <p><strong>เลขประจำตัวสอบ:</strong> {searchResult.student.examId}</p>
                                    <p><strong>แผนการเรียนที่ได้รับคัดเลือก:</strong> {searchResult.result.plan || 'ตามที่สมัคร'}</p>
                                </div>
                                <div className="mt-6 text-left border-t pt-4">
                                    <h3 className="font-bold text-gray-800">ขั้นตอนถัดไป:</h3>
                                    <p className="text-gray-700">กรุณามารายงานตัวและมอบตัวนักเรียน ในวันที่ 25-26 เมษายน 2569 ณ หอประชุมของโรงเรียน พร้อมเอกสารฉบับจริงดังนี้:</p>
                                    <ul className="list-disc list-inside mt-2 text-gray-600">
                                        <li>บัตรประจำตัวประชาชน</li>
                                        <li>สำเนาทะเบียนบ้าน</li>
                                        <li>เอกสารแสดงผลการเรียน (ปพ.1)</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                             <div className="bg-gray-50 border-2 border-gray-300 p-6 rounded-lg">
                                <h2 className="text-2xl font-bold text-gray-800">ประกาศผลการคัดเลือก</h2>
                                <p className="text-lg text-gray-700 mt-2">เราเสียใจที่ต้องแจ้งให้ทราบว่าคุณไม่ผ่านการคัดเลือกในรอบนี้</p>
                                 <div className="mt-4 text-left bg-white p-4 rounded-md space-y-1">
                                    <p><strong>ชื่อ-สกุล:</strong> {searchResult.student.name}</p>
                                    <p><strong>เลขที่ใบสมัคร:</strong> {searchResult.student.applicationId}</p>
                                </div>
                                <p className="mt-4 text-gray-600">ทางโรงเรียนขอเป็นกำลังใจให้ในการสอบครั้งต่อไป และขอขอบคุณที่ให้ความสนใจสมัครเรียนกับเรา</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnnounceResults;