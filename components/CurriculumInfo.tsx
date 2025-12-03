import React, { useState } from 'react';
import { M1_STUDY_PLANS, M4_STUDY_PLANS, CurriculumGroup, StudyPlan } from '../constants';
import { getComplexResponse } from '../services/geminiService';
import { BrainCircuitIcon } from './icons';

const CurriculumCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white rounded-lg shadow-md p-6 h-full">
        <h3 className="text-xl font-bold text-primary-dark mb-3">{title}</h3>
        <div className="text-gray-600 space-y-2">{children}</div>
    </div>
);

const CurriculumTable: React.FC<{ curriculum: CurriculumGroup[] }> = ({ curriculum }) => (
    <div className="overflow-x-auto rounded-lg border border-gray-200 mt-2">
        <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-xs text-gray-800 uppercase bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3 font-semibold w-1/4">รหัสวิชา</th>
                    <th scope="col" className="px-6 py-3 font-semibold w-1/2">รายวิชา</th>
                    <th scope="col" className="px-6 py-3 font-semibold w-1/4 text-right">หน่วยกิต</th>
                </tr>
            </thead>
            <tbody>
                {curriculum.map((group) => (
                    <React.Fragment key={group.category}>
                        <tr className="bg-gray-100 border-t border-b">
                            <td colSpan={3} className="px-6 py-2 font-bold text-gray-700">
                                {group.category}
                            </td>
                        </tr>
                        {group.subjects.map((subject) => (
                             <tr key={subject.code} className="bg-white hover:bg-gray-50">
                                <td className="px-6 py-3 font-mono text-gray-600">{subject.code}</td>
                                <td className="px-6 py-3 font-medium text-gray-900">{subject.name}</td>
                                <td className="px-6 py-3 text-right font-mono text-gray-600">{subject.credits.toFixed(1)}</td>
                            </tr>
                        ))}
                    </React.Fragment>
                ))}
            </tbody>
        </table>
    </div>
);


const M1StudyPlans: React.FC = () => {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [advice, setAdvice] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSelectPlan = async (planTitle: string) => {
        if (isLoading) return;

        if (planTitle === selectedPlan) {
            setSelectedPlan(null);
            setAdvice('');
            return;
        }

        setSelectedPlan(planTitle);
        setIsLoading(true);
        setAdvice('');
        const prompt = `ฉันสนใจแผนการเรียนระดับ ม.ต้น "${planTitle}" ของโรงเรียนเตรียมอุดมศึกษาน้อมเกล้า สมุทรปราการ ช่วยสรุปจุดเด่นของแผนการเรียนนี้ และแนะนำหน่อยว่าแผนการเรียนนี้จะช่วยปูพื้นฐานเพื่อต่อยอดในระดับ ม.ปลาย แผนการเรียนไหนได้บ้าง`;
        try {
            const response = await getComplexResponse(prompt);
            setAdvice(response.text);
        } catch (error) {
            console.error(error);
            setAdvice('ขออภัย, ไม่สามารถให้คำแนะนำได้ในขณะนี้');
        } finally {
            setIsLoading(false);
        }
    };
    
    const planDetails = selectedPlan ? M1_STUDY_PLANS.find(p => p.title === selectedPlan) : null;

    return (
        <div className="mt-8">
             <h3 className="text-2xl font-bold text-slate-100 mb-4 text-center">
                สำรวจแผนการเรียน (ม.ต้น)
            </h3>
            <p className="text-center text-slate-300 mb-6">คลิกที่แผนการเรียนเพื่อดูรายละเอียดและรับคำแนะนำจาก Gemini AI</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {M1_STUDY_PLANS.map(plan => (
                    <button
                        key={plan.title}
                        onClick={() => handleSelectPlan(plan.title)}
                        className={`p-4 rounded-lg text-center font-semibold transition-all duration-200 shadow-sm h-full flex items-center justify-center text-sm
                            ${selectedPlan === plan.title 
                                ? 'bg-primary text-white ring-2 ring-primary-dark scale-105 shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-primary-light hover:shadow-md'
                            }
                            ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}
                        `}
                        disabled={isLoading}
                    >
                        {plan.title}
                    </button>
                ))}
            </div>

            {planDetails && (
                <div className="mt-6 bg-white p-6 rounded-lg border border-gray-200 shadow-md animate-fade-in space-y-4">
                    <h4 className="text-xl font-bold text-gray-800">{planDetails.title}</h4>
                    <p className="text-gray-600">{planDetails.description}</p>
                    <div>
                        <h5 className="font-semibold text-gray-700 mb-2">โครงสร้างหลักสูตร</h5>
                        <CurriculumTable curriculum={planDetails.curriculum} />
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="mt-6 flex justify-center items-center flex-col text-center p-6 bg-white rounded-lg shadow-md animate-pulse">
                    <BrainCircuitIcon className="h-10 w-10 text-primary mb-3" />
                     <p className="text-gray-600 font-semibold">
                        Gemini กำลังวิเคราะห์แผนการเรียน "{selectedPlan}"...
                    </p>
                </div>
            )}

            {!isLoading && advice && selectedPlan && (
                <div className="mt-6 bg-primary-light p-6 rounded-lg border border-blue-200 animate-fade-in">
                    <h4 className="text-lg font-bold text-primary-dark mb-2 flex items-center">
                        <BrainCircuitIcon className="h-5 w-5 mr-2" />
                        คำแนะนำเพิ่มเติมจาก AI:
                    </h4>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{advice}</p>
                </div>
            )}
        </div>
    );
};


const M4StudyPlans: React.FC = () => {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [advice, setAdvice] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSelectPlan = async (planTitle: string) => {
        if (isLoading) return;

        if (planTitle === selectedPlan) {
            setSelectedPlan(null);
            setAdvice('');
            return;
        }

        setSelectedPlan(planTitle);
        setIsLoading(true);
        setAdvice('');
        const prompt = `ฉันสนใจแผนการเรียน "${planTitle}" ของโรงเรียนเตรียมอุดมศึกษาน้อมเกล้า สมุทรปราการ ช่วยสรุปโครงสร้างรายวิชาที่สำคัญ และแนะนำหน่อยว่าแผนการเรียนนี้เหมาะกับอาชีพอะไรในอนาคตบ้าง`;
        try {
            const response = await getComplexResponse(prompt);
            setAdvice(response.text);
        } catch (error) {
            console.error(error);
            setAdvice('ขออภัย, ไม่สามารถให้คำแนะนำได้ในขณะนี้');
        } finally {
            setIsLoading(false);
        }
    };

    const planDetails = selectedPlan ? M4_STUDY_PLANS.find(p => p.title === selectedPlan) : null;

    return (
        <div className="mt-8">
            <h3 className="text-2xl font-bold text-slate-100 mb-4 text-center">
                สำรวจแผนการเรียน (ม.ปลาย)
            </h3>
            <p className="text-center text-slate-300 mb-6">คลิกที่แผนการเรียนเพื่อดูรายละเอียดและรับคำแนะนำจาก Gemini AI</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                {M4_STUDY_PLANS.map(plan => (
                    <button
                        key={plan.title}
                        onClick={() => handleSelectPlan(plan.title)}
                        className={`p-4 rounded-lg text-center font-semibold transition-all duration-200 shadow-sm h-full flex items-center justify-center text-sm
                            ${selectedPlan === plan.title
                                ? 'bg-accent text-white ring-2 ring-accent-dark scale-105 shadow-lg' 
                                : 'bg-white text-gray-700 hover:bg-accent-light hover:shadow-md'
                            }
                            ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}
                        `}
                        disabled={isLoading}
                    >
                        {plan.title}
                    </button>
                ))}
            </div>

            {planDetails && (
                 <div className="mt-6 bg-white p-6 rounded-lg border border-gray-200 shadow-md animate-fade-in space-y-4">
                    <h4 className="text-xl font-bold text-gray-800">{planDetails.title}</h4>
                    <p className="text-gray-600">{planDetails.description}</p>
                    <div>
                        <h5 className="font-semibold text-gray-700 mb-2">โครงสร้างหลักสูตร</h5>
                        <CurriculumTable curriculum={planDetails.curriculum} />
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="mt-6 flex justify-center items-center flex-col text-center p-6 bg-white rounded-lg shadow-md animate-pulse">
                    <BrainCircuitIcon className="h-10 w-10 text-accent mb-3" />
                     <p className="text-gray-600 font-semibold">
                        Gemini กำลังวิเคราะห์แผนการเรียน "{selectedPlan}"...
                    </p>
                </div>
            )}

            {!isLoading && advice && selectedPlan && (
                <div className="mt-6 bg-accent-light p-6 rounded-lg border border-cyan-200 animate-fade-in">
                    <h4 className="text-lg font-bold text-accent-dark mb-2 flex items-center">
                         <BrainCircuitIcon className="h-5 w-5 mr-2" />
                        คำแนะนำเพิ่มเติมจาก AI:
                    </h4>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{advice}</p>
                </div>
            )}
        </div>
    );
};

const CurriculumInfo: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'m1' | 'm4'>('m1');

    return (
        <div className="container mx-auto p-4 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-slate-100 mb-8">ข้อมูลหลักสูตร</h1>

            <div className="flex justify-center border-b border-slate-700 mb-8">
                <button
                    onClick={() => setActiveTab('m1')}
                    className={`px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg font-semibold transition-colors ${activeTab === 'm1' ? 'border-b-4 border-primary text-primary' : 'text-slate-400'}`}
                >
                    หลักสูตร ม.ต้น
                </button>
                <button
                    onClick={() => setActiveTab('m4')}
                    className={`px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg font-semibold transition-colors ${activeTab === 'm4' ? 'border-b-4 border-accent text-accent' : 'text-slate-400'}`}
                >
                    หลักสูตร ม.ปลาย
                </button>
            </div>

            {activeTab === 'm1' && (
                <div className="animate-fade-in">
                    <div className="grid md:grid-cols-2 gap-8">
                        <CurriculumCard title="ภาพรวมหลักสูตร ม.ต้น">
                            <p>หลักสูตรที่มุ่งเน้นการปูพื้นฐานความรู้ที่สำคัญใน 8 กลุ่มสาระการเรียนรู้ตามหลักสูตรแกนกลางฯ พร้อมเสริมสร้างทักษะที่จำเป็นในศตวรรษที่ 21 เพื่อให้นักเรียนค้นพบศักยภาพและความถนัดของตนเอง</p>
                        </CurriculumCard>
                        <CurriculumCard title="เกณฑ์การจบหลักสูตร">
                            <ul className="list-disc list-inside space-y-1">
                                <li>ต้องได้หน่วยกิตรวมตลอดหลักสูตรไม่น้อยกว่า <strong>77 หน่วยกิต</strong></li>
                                <li>รายวิชาพื้นฐาน <strong>66 หน่วยกิต</strong></li>
                                <li>รายวิชาเพิ่มเติมไม่น้อยกว่า <strong>11 หน่วยกิต</strong></li>
                                <li>ผ่านการประเมินการอ่าน คิดวิเคราะห์และเขียน</li>
                                <li>ผ่านการประเมินคุณลักษณะอันพึงประสงค์</li>
                                <li>เข้าร่วมกิจกรรมพัฒนาผู้เรียนและผ่านการประเมิน</li>
                            </ul>
                        </CurriculumCard>
                    </div>
                    <M1StudyPlans />
                </div>
            )}

            {activeTab === 'm4' && (
                <div className="animate-fade-in">
                    <div className="grid md:grid-cols-2 gap-8">
                        <CurriculumCard title="ภาพรวมหลักสูตร ม.ปลาย">
                            <p>ต่อยอดจากหลักสูตรแกนกลางฯ โดยเน้นการเรียนรู้ตามความถนัดและความสนใจของผู้เรียน เพื่อเตรียมความพร้อมสู่ระดับอุดมศึกษา</p>
                        </CurriculumCard>
                        <CurriculumCard title="เกณฑ์การจบหลักสูตร">
                            <ul className="list-disc list-inside space-y-1">
                                <li>ต้องได้หน่วยกิตรวมไม่น้อยกว่า <strong>77 หน่วยกิต</strong></li>
                                <li>รายวิชาพื้นฐาน <strong>41 หน่วยกิต</strong></li>
                                <li>รายวิชาเพิ่มเติมไม่น้อยกว่า <strong>36 หน่วยกิต</strong></li>
                                <li>ผ่านการประเมินการอ่าน คิดวิเคราะห์และเขียน</li>
                                <li>ผ่านการประเมินคุณลักษณะอันพึงประสงค์</li>
                                <li>เข้าร่วมกิจกรรมพัฒนาผู้เรียนและผ่านการประเมิน</li>
                            </ul>
                        </CurriculumCard>
                    </div>
                    <M4StudyPlans />
                </div>
            )}
        </div>
    );
};

export default CurriculumInfo;