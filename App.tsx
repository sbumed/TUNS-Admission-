
import React, { useState, useRef, useEffect } from 'react';
import { Page } from './types';
import Chatbot from './components/Chatbot';
import { AcademicCapIcon, HomeIcon, ClipboardListIcon, BookOpenIcon, TicketIcon, UserGroupIcon, BadgeCheckIcon, PencilIcon, MenuIcon, XIcon, ChartBarIcon, ShieldCheckIcon } from './components/icons';
import ApplicationForm from './components/ApplicationForm';
import CurriculumInfo from './components/CurriculumInfo';
import ExamSeating from './components/ExamSeating';
import AnnounceCandidates from './components/AnnounceCandidates';
import AnnounceResults from './components/AnnounceResults';
import Statistics from './components/Statistics';
import AdminDashboard from './components/AdminDashboard';

const Header: React.FC<{ setPage: (page: Page) => void, currentPage: Page }> = ({ setPage, currentPage }) => {
    const [customIconUrl, setCustomIconUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const savedIcon = localStorage.getItem('custom-app-icon');
        if (savedIcon) {
            setCustomIconUrl(savedIcon);
        }
    }, []);
    
    const handleIconChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Url = reader.result as string;
                setCustomIconUrl(base64Url);
                localStorage.setItem('custom-app-icon', base64Url);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleIconClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleNavClick = (page: Page) => {
        setPage(page);
        setIsMobileMenuOpen(false); // Close mobile menu on navigation
    };

    const navItems = [
        { page: Page.Home, label: 'หน้าแรก', icon: HomeIcon },
        { page: Page.Apply, label: 'สมัครเรียน', icon: ClipboardListIcon },
        { page: Page.Curriculum, label: 'หลักสูตร', icon: BookOpenIcon },
        { page: Page.Seating, label: 'ที่นั่งสอบ', icon: TicketIcon },
        { page: Page.AnnounceCandidates, label: 'ประกาศรายชื่อ', icon: UserGroupIcon },
        { page: Page.AnnounceResults, label: 'ประกาศผลสอบ', icon: BadgeCheckIcon },
        { page: Page.Statistics, label: 'สถิติรายวัน', icon: ChartBarIcon },
    ];
    
    const adminItem = { page: Page.ADMIN, label: 'ผู้ดูแล', icon: ShieldCheckIcon };

    const iconUrl = customIconUrl || 'https://i.postimg.cc/qvM5YXsx/244618324-6242352279139605-6354269001998500089-n.jpg';

    return (
        <header className="bg-white/80 backdrop-blur-md shadow-sm no-print sticky top-0 z-40">
            <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-3 group relative">
                    <div onClick={() => handleNavClick(Page.Home)} className="flex items-center space-x-3 cursor-pointer">
                        <img src={iconUrl} alt="App Icon" className="h-9 w-9 rounded-full object-cover" />
                        <span className="font-bold text-xl text-secondary-dark">TUNS Admission</span>
                    </div>

                    <div 
                        onClick={handleIconClick} 
                        className="absolute -top-1 -right-8 bg-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Change Icon"
                        aria-label="Change application icon"
                    >
                        <PencilIcon className="h-4 w-4 text-secondary" />
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleIconChange}
                        className="hidden"
                        accept="image/*"
                    />
                </div>
                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-1">
                    {navItems.map(item => (
                        <button
                            key={item.page}
                            onClick={() => handleNavClick(item.page)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                                currentPage === item.page
                                    ? 'bg-primary text-white shadow'
                                    : 'text-secondary-dark hover:bg-primary-light hover:text-primary-dark'
                            }`}
                        >
                            <item.icon className="h-5 w-5"/>
                            <span className="whitespace-nowrap">{item.label}</span>
                        </button>
                    ))}
                     <button
                        onClick={() => handleNavClick(adminItem.page)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                            currentPage === adminItem.page
                                ? 'bg-secondary text-white shadow'
                                : 'text-secondary-dark hover:bg-secondary-light hover:text-secondary-dark'
                        }`}
                    >
                        <adminItem.icon className="h-5 w-5"/>
                        <span className="whitespace-nowrap">{adminItem.label}</span>
                    </button>
                </div>
                 {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle menu" className="p-2 rounded-md text-secondary-dark hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary">
                        {isMobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
                    </button>
                </div>
            </nav>
            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white shadow-lg animate-fade-in-down">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                         {[...navItems, adminItem].map(item => (
                            <button
                                key={item.page}
                                onClick={() => handleNavClick(item.page)}
                                className={`flex items-center space-x-3 w-full text-left px-3 py-3 rounded-md text-base font-medium transition-colors duration-200 ${
                                    currentPage === item.page
                                        ? 'bg-primary-light text-primary-dark'
                                        : 'text-secondary-dark hover:bg-secondary-light'
                                }`}
                            >
                                <item.icon className="h-6 w-6"/>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
};


const HomePage: React.FC<{setPage: (page: Page) => void}> = ({ setPage }) => (
    <div className="relative text-center py-16 sm:py-20 px-4 sm:px-6 h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="relative bg-black/40 backdrop-blur p-6 sm:p-10 rounded-xl max-w-5xl mx-auto shadow-2xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 animate-fade-in-down">
                เปิดรับสมัครนักเรียนใหม่
            </h1>
            <h2 className="text-xl sm:text-2xl md:text-3xl text-blue-300 font-semibold mb-6 animate-fade-in-down" style={{animationDelay: '0.2s'}}>
                โรงเรียนเตรียมอุดมศึกษาน้อมเกล้า สมุทรปราการ
            </h2>
             <div className="text-base sm:text-lg text-slate-200 mb-8 max-w-3xl mx-auto animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                <p className="mb-4">ปีการศึกษา 2569 | สมัครระดับชั้นมัธยมศึกษาปีที่ 1 และ 4</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-sm font-sans">
                    <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                        <p className="font-bold text-white">รอบห้องเรียนพิเศษ</p>
                        <p className="text-slate-300">รับสมัคร: 8 - 12 ก.พ. 2569</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                        <p className="font-bold text-white">รอบความสามารถพิเศษ</p>
                        <p className="text-slate-300">รับสมัคร: 19 - 20 มี.ค. 2569</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                        <p className="font-bold text-white">รอบทั่วไป</p>
                        <p className="text-slate-300">รับสมัคร: 19 - 23 มี.ค. 2569</p>
                    </div>
                </div>
            </div>
            <div className="animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                <button
                    onClick={() => setPage(Page.Apply)}
                    className="bg-primary text-white font-bold py-3 px-10 rounded-full hover:bg-primary-hover transition-all duration-300 transform hover:scale-105 text-lg shadow-lg hover:shadow-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/50"
                >
                    สมัครเรียนตอนนี้
                </button>
            </div>
        </div>
    </div>
);


const App: React.FC = () => {
    const [page, setPage] = useState<Page>(Page.Home);

    const renderPage = () => {
        switch (page) {
            case Page.Apply:
                return <ApplicationForm />;
            case Page.Curriculum:
                return <CurriculumInfo />;
            case Page.Seating:
                return <ExamSeating />;
            case Page.AnnounceCandidates:
                return <AnnounceCandidates />;
            case Page.AnnounceResults:
                return <AnnounceResults />;
            case Page.Statistics:
                return <Statistics />;
            case Page.ADMIN:
                return <AdminDashboard />;
            case Page.Home:
            default:
                return <HomePage setPage={setPage}/>;
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans">
            <Header setPage={setPage} currentPage={page}/>
            <main className="flex-grow">
                {renderPage()}
            </main>
            <footer className="bg-secondary-dark text-slate-300 text-center p-8 no-print mt-8 border-t border-slate-700">
                <div className="flex flex-col items-center justify-center gap-6">
                    <div>
                        <p className="text-lg font-semibold">&copy; {new Date().getFullYear()} โรงเรียนเตรียมอุดมศึกษาน้อมเกล้า สมุทรปราการ</p>
                        <p className="text-sm text-slate-500 mt-1">ระบบรับสมัครนักเรียนออนไลน์</p>
                    </div>
                    
                    <div className="flex flex-col items-center gap-3 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-inner max-w-xs w-full transform hover:scale-105 transition-transform duration-300">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 rounded-full"></div>
                            <img 
                                src="https://i.postimg.cc/jjcn7W4f/phrn-pha-kha-prakxb.png" 
                                alt="คุณครูภรนิพา คำประกอบ" 
                                className="relative w-32 h-32 rounded-full object-cover border-4 border-slate-600 shadow-2xl"
                            />
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                                คุณครูภรนิพา คำประกอบ
                            </p>
                            <p className="text-slate-400 font-medium flex items-center justify-center gap-2 mt-1">
                                <ShieldCheckIcon className="w-4 h-4" />
                                Web Admin
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
            <Chatbot />
        </div>
    );
};

export default App;
