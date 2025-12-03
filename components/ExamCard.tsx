import React from 'react';
import { SeatingInfo, StudentData } from '../types';
import { SCHOOL_LOGO_URL } from '../constants';

const ExamCard: React.FC<{
    student: StudentData;
    applicationId: string;
    examDetails: SeatingInfo;
    photoUrl: string;
}> = ({ student, applicationId, examDetails, photoUrl }) => {
    return (
        <div id={`exam-card-${applicationId}`} className="printable-card bg-white p-6 rounded-lg border-2 border-indigo-500 shadow-lg max-w-lg mx-auto font-sans">
            <div className="text-center border-b-2 border-gray-200 pb-4 mb-4">
                <img src={SCHOOL_LOGO_URL} alt="School Logo" className="h-20 w-20 mx-auto mb-2 object-contain" />
                <h3 className="text-xl font-bold text-gray-800">บัตรประจำตัวผู้เข้าสอบ</h3>
                <p className="text-md text-gray-600">โรงเรียนเตรียมอุดมศึกษาน้อมเกล้า สมุทรปราการ</p>
                <p className="text-sm text-gray-500">ปีการศึกษา 2569</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <img src={photoUrl} alt="student" className="w-32 h-40 rounded-md object-cover border-2 border-gray-300" />
                <div className="flex-1 text-left space-y-1">
                    <p><strong>ชื่อ-สกุล:</strong> {student.title}{student.firstName} {student.lastName}</p>
                    <p><strong>เลขที่ใบสมัคร:</strong> {applicationId}</p>
                    <p><strong>เลขประจำตัวสอบ:</strong> {examDetails.examId}</p>
                    <hr className="my-2"/>
                    <p><strong>วันที่สอบ:</strong> {examDetails.date}</p>
                    <p><strong>เวลา:</strong> {examDetails.time}</p>
                    <p><strong>อาคาร:</strong> {examDetails.building}</p>
                    <p><strong>ห้องสอบ:</strong> ห้อง {examDetails.room}</p>
                    <p className="text-indigo-600 font-bold"><strong>ที่นั่งสอบ:</strong> {examDetails.seat}</p>
                </div>
            </div>
        </div>
    );
};

export default ExamCard;