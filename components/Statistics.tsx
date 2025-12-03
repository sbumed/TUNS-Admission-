
import React, { useState, useEffect, useMemo } from 'react';
import { AcademicCapIcon, ClipboardListIcon, UserGroupIcon, BookOpenIcon } from './icons';

interface DailyStat {
    date: string;
    m1: number;
    m4: number;
    total: number;
}

interface PlanStat {
    name: string;
    count: number;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType; }> = ({ title, value, icon: Icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4 animate-fade-in-up">
        <div className="bg-primary-light p-3 rounded-full">
            <Icon className="h-7 w-7 text-primary" />
        </div>
        <div>
            <p className="text-sm text-secondary-dark font-medium">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold text-primary-dark truncate">{value}</p>
        </div>
    </div>
);

const AreaStatCard: React.FC<{ inArea: number; outOfArea: number }> = ({ inArea, outOfArea }) => {
    const total = inArea + outOfArea;
    const inAreaPercentage = total > 0 ? (inArea / total) * 100 : 0;

    return (
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-between animate-fade-in-up h-full">
            <div>
                <div className="flex items-center space-x-4">
                    <div className="bg-primary-light p-3 rounded-full">
                        <UserGroupIcon className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                         <p className="text-sm text-secondary-dark font-medium">เขตพื้นที่บริการ (7 วัน)</p>
                         <p className="text-3xl font-bold text-primary-dark">{total.toLocaleString()}</p>
                    </div>
                </div>
            </div>
            <div className="mt-4 space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-accent h-2.5 rounded-full transition-all duration-500" style={{ width: `${inAreaPercentage}%` }} title={`ในเขต: ${inAreaPercentage.toFixed(1)}%`}></div>
                </div>
                <div className="flex justify-between text-xs font-medium text-gray-500">
                    <span>ในเขต: {inArea.toLocaleString()}</span>
                    <span>นอกเขต: {outOfArea.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

const Statistics: React.FC = () => {
    const [stats, setStats] = useState<DailyStat[]>([]);
    const [planStats, setPlanStats] = useState<PlanStat[]>([]);
    const [areaStats, setAreaStats] = useState<{ inArea: number; outOfArea: number }>({ inArea: 0, outOfArea: 0 });


    useEffect(() => {
        const calculateStats = () => {
            const statsByDate: { [key: string]: { m1: number; m4: number } } = {};
            const planCounts: { [key: string]: number } = {};
            const areaCounts = { inArea: 0, outOfArea: 0 };
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Initialize stats for the last 7 days
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
                statsByDate[dateString] = { m1: 0, m4: 0 };
            }

            // Iterate through localStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                // Filter to only count main application keys, excluding the duplicate by-nid keys
                if (key && key.startsWith('application-') && !key.startsWith('application-by-nid-')) {
                    try {
                        const storedData = localStorage.getItem(key);
                        if (storedData) {
                            const parsedData = JSON.parse(storedData);
                            if (parsedData.submissionDate) {
                                const submissionDate = new Date(parsedData.submissionDate);
                                // Set submission date to 00:00:00 local time for date comparison
                                submissionDate.setHours(0, 0, 0, 0);

                                const diffTime = today.getTime() - submissionDate.getTime();
                                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                                
                                if (diffDays >= 0 && diffDays < 7) {
                                    // Daily counts for bar chart
                                    // Get key in UTC format to match initialization
                                    const dateString = submissionDate.toISOString().split('T')[0];
                                    
                                    // Check if key exists (it should, given diffDays logic, but safe check)
                                    if (statsByDate[dateString]) {
                                        if (parsedData.gradeLevel === 'ม.1') {
                                            statsByDate[dateString].m1++;
                                        } else if (parsedData.gradeLevel === 'ม.4') {
                                            statsByDate[dateString].m4++;
                                        }
                                    }

                                    // Plan counts
                                    if (parsedData.studyPlan) {
                                        planCounts[parsedData.studyPlan] = (planCounts[parsedData.studyPlan] || 0) + 1;
                                    }

                                    // Area counts
                                    if (parsedData.areaType === 'ในเขตพื้นที่บริการ') {
                                        areaCounts.inArea++;
                                    } else if (parsedData.areaType === 'นอกเขตพื้นที่บริการ') {
                                        areaCounts.outOfArea++;
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        console.error(`Error parsing localStorage item ${key}:`, e);
                    }
                }
            }
            
            // Process plan counts
            const sortedPlans = Object.entries(planCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count);
            setPlanStats(sortedPlans);
            
            // Set area stats
            setAreaStats(areaCounts);

            // Set daily stats for bar chart
            const dailyStatsData = Object.entries(statsByDate).map(([dateStr, counts]) => {
                const date = new Date(dateStr);
                return {
                    date: date.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' }),
                    m1: counts.m1,
                    m4: counts.m4,
                    total: counts.m1 + counts.m4,
                };
            });
            // Sort by date key to ensure correct order
            dailyStatsData.sort((a, b) => {
               // We can infer date order from the original keys, but re-sorting is safer
               // Since dateStr is YYYY-MM-DD, alpha sort works.
               return 0; 
            });
            
            setStats(dailyStatsData);
        };

        calculateStats();
    }, []);

    const totals = useMemo(() => {
        if (stats.length === 0) {
            return { today: 0, grandTotal: 0 };
        }
        const todayStat = stats[stats.length - 1];
        const today = todayStat ? todayStat.total : 0;
        const grandTotal = stats.reduce((acc, day) => acc + day.total, 0);

        return { today, grandTotal };
    }, [stats]);
    
    const maxDailyTotal = useMemo(() => {
        if (stats.length === 0) return 1; // Avoid division by zero
        const max = Math.max(...stats.map(s => s.total));
        return max === 0 ? 1 : max; // Ensure it's at least 1
    }, [stats]);


    return (
        <div className="container mx-auto p-4 sm:p-8 max-w-6xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-slate-100 mb-4 animate-fade-in-down">
                สถิติผู้สมัคร (7 วันย้อนหลัง)
            </h1>
            <p className="text-center text-slate-300 mb-10 animate-fade-in-down" style={{animationDelay: '0.1s'}}>
                ข้อมูลจริงจากระบบรับสมัครในเบราว์เซอร์นี้
            </p>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="สมัครวันนี้" value={totals.today.toLocaleString()} icon={ClipboardListIcon} />
                <StatCard title="ยอดรวมทั้งหมด (7 วัน)" value={totals.grandTotal.toLocaleString()} icon={UserGroupIcon} />
                <StatCard title="แผนการเรียนยอดนิยม" value={planStats.length > 0 ? planStats[0].name : 'N/A'} icon={BookOpenIcon} />
                <AreaStatCard inArea={areaStats.inArea} outOfArea={areaStats.outOfArea} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Bar Chart */}
                <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl shadow-xl animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
                        จำนวนผู้สมัครรายวัน
                    </h2>
                    <div className="flex justify-between items-end h-72 border-b-2 border-gray-200 space-x-2 sm:space-x-4 pb-2">
                        {stats.map((day, index) => {
                            const barHeight = day.total > 0 ? (day.total / maxDailyTotal) * 100 : 0;
                            const m1Percent = day.total > 0 ? (day.m1 / day.total) * 100 : 0;
                            const m4Percent = day.total > 0 ? (day.m4 / day.total) * 100 : 0;
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center group h-full justify-end relative">
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                                         <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                            รวม: {day.total} (ม.1: {day.m1}, ม.4: {day.m4})
                                        </div>
                                    </div>
                                    
                                    <div
                                        className="w-full sm:w-10 bg-gray-100 rounded-t-md flex flex-col justify-end overflow-hidden transition-all duration-500 ease-out"
                                        style={{ height: `${barHeight}%` }}
                                    >
                                        {day.m4 > 0 && (
                                            <div 
                                                className="bg-accent hover:bg-accent-dark transition-colors w-full"
                                                style={{ height: `${m4Percent}%`}}
                                            ></div>
                                        )}
                                        {day.m1 > 0 && (
                                             <div 
                                                className="bg-primary hover:bg-primary-dark transition-colors w-full"
                                                style={{ height: `${m1Percent}%`}}
                                            ></div>
                                        )}
                                    </div>
                                    <p className="mt-2 text-xs text-center font-semibold text-gray-500">{day.date}</p>
                                </div>
                            );
                        })}
                    </div>
                     <div className="mt-4 flex justify-center gap-6 text-sm font-medium text-gray-600">
                        <div className="flex items-center">
                            <span className="w-3 h-3 bg-primary rounded-sm mr-2"></span>
                            <span>ม.1</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-3 h-3 bg-accent rounded-sm mr-2"></span>
                            <span>ม.4</span>
                        </div>
                    </div>
                </div>

                {/* Plan Breakdown */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl animate-fade-in-up lg:h-full overflow-y-auto" style={{animationDelay: '0.4s'}}>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
                        แยกตามแผนการเรียน
                    </h2>
                    <div className="space-y-5">
                        {planStats.map((plan, index) => (
                            <div key={index}>
                                <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                                    <span className="truncate pr-2" title={plan.name}>{plan.name}</span>
                                    <span className="flex-shrink-0">{plan.count} คน</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                    <div 
                                        className={`h-2.5 rounded-full transition-all duration-700 ease-out ${index % 2 === 0 ? 'bg-primary' : 'bg-accent'}`}
                                        style={{ width: `${totals.grandTotal > 0 ? (plan.count / totals.grandTotal) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        {planStats.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                                <p>ยังไม่มีข้อมูลการสมัคร</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Statistics;
