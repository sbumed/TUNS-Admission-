import React from 'react';
import { ApplicationData, Address } from '../types';
import { SCHOOL_LOGO_URL } from '../constants';

const AddressDetail: React.FC<{ address: Address, title: string }> = ({ address, title }) => (
    <div>
        <p className="font-semibold">{title}</p>
        <p className="pl-4">
            {address.detail} ต.{address.subdistrict} อ.{address.district} จ.{address.province} {address.postalCode}
        </p>
    </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-3">
        <h3 className="text-lg font-bold bg-gray-100 p-2 rounded-md mb-2">{title}</h3>
        <div className="pl-4 space-y-1 text-sm">
            {children}
        </div>
    </div>
);

const InfoPair: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
    value ? <p><strong>{label}:</strong> {value}</p> : null
);

const ApplicationSummary: React.FC<{
    formData: ApplicationData;
    photoUrl: string;
}> = ({ formData, photoUrl }) => {
    const { student, parent, school, gradeLevel, applicationRound, areaType, studyPlan, applicationId } = formData;

    return (
        <div id={`application-summary-${applicationId}`} className="printable-summary bg-white p-6 rounded-lg border-2 border-gray-300 shadow-lg max-w-4xl mx-auto font-sans text-gray-800">
            {/* Header */}
            <div className="text-center border-b-2 border-gray-200 pb-4 mb-4">
                <img src={SCHOOL_LOGO_URL} alt="School Logo" className="h-20 w-20 mx-auto mb-2 object-contain" />
                <h2 className="text-xl font-bold">ใบสมัครเข้าศึกษาต่อ ปีการศึกษา 2569</h2>
                <p className="text-md">โรงเรียนเตรียมอุดมศึกษาน้อมเกล้า สมุทรปราการ</p>
            </div>

            {/* Main Content */}
            <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 space-y-3">
                    <Section title="ข้อมูลการสมัคร">
                        <InfoPair label="เลขที่ใบสมัคร" value={applicationId} />
                        <InfoPair label="ระดับชั้น" value={gradeLevel} />
                        <InfoPair label="ประเภทการรับสมัคร" value={applicationRound} />
                        {applicationRound === 'รอบความสามารถพิเศษ' && (
                            <>
                                <InfoPair label="ประเภทความสามารถพิเศษ" value={formData.specialTalentType} />
                                <InfoPair label="รายละเอียด" value={formData.specialTalentDescription} />
                            </>
                        )}
                        <InfoPair label="ประเภทพื้นที่" value={areaType} />
                        <InfoPair label="แผนการเรียน" value={studyPlan} />
                    </Section>

                    <Section title="ข้อมูลนักเรียน">
                         <InfoPair label="ชื่อ-สกุล" value={`${student.title}${student.firstName} ${student.lastName}`} />
                         <InfoPair label="วันเกิด" value={student.birthDate} />
                         <InfoPair label="เลขประจำตัวประชาชน" value={student.nationalId} />
                         <InfoPair label="เพศ" value={student.gender} />
                         <InfoPair label="หมู่เลือด" value={student.bloodType} />
                         <InfoPair label="สัญชาติ" value={student.nationality === 'อื่นๆ' ? student.otherNationality : student.nationality} />
                         <InfoPair label="ศาสนา" value={student.religion === 'อื่นๆ' ? student.otherReligion : student.religion} />
                         <InfoPair label="เบอร์โทรศัพท์" value={student.phone} />
                         <InfoPair label="โรคประจำตัว (ถ้ามี)" value={student.chronicDisease} />
                         <AddressDetail address={student.permanentAddress} title="ที่อยู่ตามทะเบียนบ้าน" />
                         <AddressDetail address={student.currentAddress} title="ที่อยู่ปัจจุบัน" />
                    </Section>

                </div>
                <div className="w-32 flex-shrink-0">
                    <img src={photoUrl} alt="student" className="w-32 h-40 rounded-md object-cover border-2 border-gray-300" />
                </div>
            </div>

            <Section title="ข้อมูลการศึกษา">
                <InfoPair label="โรงเรียนเดิม" value={school.previousSchool} />
                <InfoPair label="จังหวัด" value={school.previousSchoolProvince} />
                <InfoPair label="เกรดเฉลี่ยสะสม (GPAX)" value={school.gpax} />
            </Section>

             <Section title="ข้อมูลผู้ปกครอง">
                <p className="text-sm">นักเรียนอาศัยอยู่กับ: {
                    {
                        'parents': 'บิดา-มารดา',
                        'father': 'บิดา',
                        'mother': 'มารดา',
                        'guardian': 'ผู้ปกครอง',
                    }[parent.livesWith || '']
                }</p>
                <InfoPair label="อีเมลติดต่อ" value={parent.contactEmail} />
                <hr className="my-2" />
                <h4 className="font-semibold text-base mb-1">ข้อมูลบิดา</h4>
                <div className="pl-4">
                    <InfoPair label="ชื่อ-สกุลบิดา" value={`${parent.fatherTitle}${parent.fatherFirstName} ${parent.fatherLastName}`} />
                    <InfoPair label="เลขประจำตัวประชาชน" value={parent.fatherNationalId} />
                    <InfoPair label="อาชีพ" value={parent.fatherOccupation} />
                    <InfoPair label="เบอร์โทรศัพท์" value={parent.fatherPhone} />
                    <AddressDetail address={parent.fatherAddress} title="ที่อยู่บิดา" />
                </div>
                 <hr className="my-2" />
                <h4 className="font-semibold text-base mb-1">ข้อมูลมารดา</h4>
                 <div className="pl-4">
                    <InfoPair label="ชื่อ-สกุลมารดา" value={`${parent.motherTitle}${parent.motherFirstName} ${parent.motherLastName}`} />
                    <InfoPair label="เลขประจำตัวประชาชน" value={parent.motherNationalId} />
                    <InfoPair label="อาชีพ" value={parent.motherOccupation} />
                    <InfoPair label="เบอร์โทรศัพท์" value={parent.motherPhone} />
                    <AddressDetail address={parent.motherAddress} title="ที่อยู่มารดา" />
                </div>

                {parent.livesWith === 'guardian' && parent.guardian && (
                    <>
                        <hr className="my-2" />
                        <h4 className="font-semibold text-base mb-1">ข้อมูลผู้ปกครอง (ที่ไม่ใช่บิดา-มารดา)</h4>
                         <div className="pl-4">
                            <InfoPair label="ชื่อ-สกุล" value={`${parent.guardian.title}${parent.guardian.firstName} ${parent.guardian.lastName}`} />
                            <InfoPair label="ความสัมพันธ์" value={parent.guardian.relationship} />
                            <InfoPair label="เลขประจำตัวประชาชน" value={parent.guardian.nationalId} />
                            <InfoPair label="อาชีพ" value={parent.guardian.occupation} />
                            <InfoPair label="เบอร์โทรศัพท์" value={parent.guardian.phone} />
                            <AddressDetail address={parent.guardian.address} title="ที่อยู่ผู้ปกครอง" />
                        </div>
                    </>
                )}
            </Section>
            
            <div className="mt-8 border-t pt-4 text-center text-sm text-gray-600">
                <p>ข้าพเจ้าขอรับรองว่าข้อความข้างต้นเป็นความจริงทุกประการ</p>
                <div className="mt-8 flex justify-end">
                    <p className="border-t-2 border-dotted border-gray-400 px-16 py-1">ลายมือชื่อผู้สมัคร</p>
                </div>
            </div>

        </div>
    );
};

export default ApplicationSummary;