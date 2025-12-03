import React, { useState } from 'react';
import { SeatingInfo, StudentData } from '../types';
import ExamCard from './ExamCard';
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

const AnnounceCandidates: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchResult, setSearchResult] = useState<{ seatingInfo: SeatingInfo; student: StudentData; } | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSearchResult(null);
    setTimeout(() => {
      const result = findApplication(searchInput);
      if (result) {
        setSearchResult(result);
      } else {
        setError('ไม่พบข้อมูลผู้สมัคร กรุณาตรวจสอบเลขที่ใบสมัครหรือเลขบัตรประชาชน');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="container mx-auto px-4 sm:p-8 max-w-4xl">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-slate-100 mt-8 mb-2">ประกาศรายชื่อผู้มีสิทธิ์สอบ</h1>
      <p className="text-center text-slate-300 mb-8">ประกาศ ณ วันที่ 15 กุมภาพันธ์ 2569</p>
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
            {isLoading ? 'กำลังค้นหา...' : 'ตรวจสอบสิทธิ์'}
          </button>
        </form>

        {error && <p className="text-red-500 text-center">{error}</p>}
        
        {searchResult && (
          <div className="animate-fade-in space-y-6 text-center">
            <div className="bg-success-light border-l-4 border-success text-success-dark p-4 rounded-md">
                <p className="font-bold">คุณมีสิทธิ์เข้าสอบ</p>
                <p>ขอให้เตรียมตัวให้พร้อมสำหรับวันสอบ และนำบัตรประจำตัวผู้เข้าสอบมาด้วย</p>
            </div>
            <ExamCard
              student={searchResult.student}
              applicationId={searchResult.seatingInfo.applicationId}
              examDetails={searchResult.seatingInfo}
              photoUrl={searchResult.seatingInfo.photoUrl}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnounceCandidates;