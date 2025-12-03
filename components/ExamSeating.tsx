import React, { useState } from 'react';
import { getGroundedResponse } from '../services/geminiService';
import { useGeolocation } from '../hooks/useGeolocation';
import { SeatingInfo, StudentData } from '../types';
import ExamCard from './ExamCard';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PLACEHOLDER_IMAGE_URL } from '../constants';


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

const ExamSeating: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchResult, setSearchResult] = useState<{ seatingInfo: SeatingInfo; student: StudentData; } | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [directionResult, setDirectionResult] = useState<{ text: string; link?: string } | null>(null);
  const [loadingDirectionQuery, setLoadingDirectionQuery] = useState<string | null>(null);
  const { location } = useGeolocation();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSearchResult(null);
    setDirectionResult(null);
    setTimeout(() => {
      const result = findApplication(searchInput);
      if (result) {
        setSearchResult(result);
      } else {
        setError('ไม่พบข้อมูลผู้สมัคร กรุณาตรวจสอบเลขที่ใบสมัครหรือเลขบัตรประชาชน');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleGetDirections = async (query: string) => {
      if (!query || !searchResult) return;
      setLoadingDirectionQuery(query);
      setDirectionResult(null);
      const { seatingInfo } = searchResult;
      const prompt = `จากตำแหน่งปัจจุบันของฉัน จะเดินทางไปที่ ${seatingInfo.building} ห้อง ${seatingInfo.room} ของโรงเรียนเตรียมอุดมศึกษาน้อมเกล้า สมุทรปราการ เพื่อสอบที่นั่ง ${seatingInfo.seat} ได้อย่างไร? โดยฉันต้องการ ${query}`;
      try {
        const response = await getGroundedResponse(prompt, location);
        let resultText = response.text;
        let mapLink: string | undefined;
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks && groundingChunks.length > 0) {
            const sources = groundingChunks
              .map((chunk: any) => chunk.maps?.uri)
              .filter(Boolean);
            if (sources.length > 0) {
                mapLink = sources[0];
            }
        }
        setDirectionResult({ text: resultText, link: mapLink });
      } catch (err) {
          setDirectionResult({ text: 'ขออภัย, ไม่สามารถค้นหาเส้นทางได้ในขณะนี้' });
      } finally {
          setLoadingDirectionQuery(null);
      }
  }

  const handleDownloadPdf = async (appId: string) => {
    setIsDownloadingPdf(true);
    const cardElement = document.getElementById(`exam-card-${appId}`);
    if (cardElement) {
        try {
            const canvas = await html2canvas(cardElement, {
                scale: 2, // Higher scale for better resolution
                useCORS: true,
            });
            const imgData = canvas.toDataURL('image/png');
            
            // A5 paper size is 148 x 210 mm.
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a5'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const margin = 10; // 10mm margin
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
            setIsDownloadingPdf(false);
        }
    } else {
        alert("ไม่พบบัตรเข้าห้องสอบสำหรับดาวน์โหลด");
        setIsDownloadingPdf(false);
    }
  };

  const directionOptions = ['เส้นทางที่เร็วที่สุด', 'การเดินทางด้วยรถสาธารณะ', 'เส้นทางสำหรับรถยนต์ส่วนตัว'];

  return (
    <div className="container mx-auto px-4 sm:p-8 max-w-4xl">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-slate-100 my-8">ตรวจสอบที่นั่งสอบ</h1>
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
            {isLoading ? 'กำลังค้นหา...' : 'ค้นหา'}
          </button>
        </form>

        {error && <p className="text-red-500 text-center">{error}</p>}
        
        {searchResult && (
          <div className="animate-fade-in space-y-8">
            <ExamCard
              student={searchResult.student}
              applicationId={searchResult.seatingInfo.applicationId}
              examDetails={searchResult.seatingInfo}
              photoUrl={searchResult.seatingInfo.photoUrl}
            />

            <div className="text-center no-print flex justify-center gap-4">
                <button onClick={() => window.print()} className="bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-primary-hover transition-transform transform hover:scale-105 text-lg">
                    พิมพ์บัตรเข้าห้องสอบ
                </button>
                <button
                    onClick={() => searchResult && handleDownloadPdf(searchResult.seatingInfo.applicationId)}
                    disabled={isDownloadingPdf}
                    className="bg-accent text-white font-bold py-3 px-8 rounded-full hover:bg-accent-hover transition-transform transform hover:scale-105 text-lg disabled:opacity-50 disabled:cursor-wait"
                >
                    {isDownloadingPdf ? 'กำลังสร้าง...' : 'ดาวน์โหลด PDF'}
                </button>
            </div>
            
            <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">สอบถามเส้นทางไปห้องสอบ</h3>
                <div className="flex flex-wrap gap-3">
                  {directionOptions.map((query) => (
                    <button
                      key={query}
                      onClick={() => handleGetDirections(query)}
                      disabled={!!loadingDirectionQuery}
                      className="bg-secondary text-white font-medium py-2 px-4 rounded-full hover:bg-secondary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {loadingDirectionQuery === query ? 'กำลังค้นหา...' : query}
                    </button>
                  ))}
                </div>
                
                {directionResult && (
                    <div className="mt-4 bg-secondary-light p-4 rounded-lg border border-slate-200">
                        <p className="whitespace-pre-wrap text-gray-700">{directionResult.text}</p>
                        {directionResult.link && (
                          <div className="mt-2">
                            <a href={directionResult.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                              ดูเส้นทางบน Google Maps
                            </a>
                          </div>
                        )}
                    </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamSeating;