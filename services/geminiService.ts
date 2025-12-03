import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ChatMessage } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Information from the school's Self-Assessment Report (SAR)
const basicInfo = `
ข้อมูลพื้นฐานเกี่ยวกับโรงเรียนเตรียมอุดมศึกษาน้อมเกล้า สมุทรปราการ (TUNS) จากรายงาน SAR ปี 2567:
- ที่อยู่: 18/1 หมู่ 15 ตำบลบางหัวเสือ อำเภอพระประแดง จังหวัดสมุทรปราการ 10130
- ข้อมูลติดต่อ: โทรศัพท์ 02-383-0166, อีเมล tunsschooltuns@gmail.com, เว็บไซต์ www.tuns.ac.th
- ปรัชญา: ประพฤติชอบ กอปรความรู้ ต่อสู้งาน
- คติพจน์: ปญฺญา เว ธเนน เสยฺโย (ปัญญาประเสริฐกว่าทรัพย์)
- อัตลักษณ์: หลักสูตรเด่นล้ำ กิจกรรมเป็นเลิศ เชิดชูคุณธรรม
- เอกลักษณ์: พหุหลักสูตร
- วิสัยทัศน์: ผู้เรียนมีสุนทรียภาพ มีทักษะการเรียนรู้คู่คุณธรรม เป็นนวัตกร รู้เท่าทันสื่อ สารสนเทศ มีทักษะชีวิตและทักษะอาชีพ ครูมีสมรรถนะ C-Teacher ส่งเสริมการเรียนรู้ตลอดชีวิตอย่างเสมอภาค มีระบบการบริหารตามมาตรฐานโรงเรียนคุณภาพ สพฐ.
- ประวัติโดยย่อ: ก่อตั้งปี พ.ศ. 2524 เดิมชื่อโรงเรียนบางหัวเสือ
- จำนวนนักเรียน (ณ 10 มิ.ย. 2567): 2,672 คน
- จำนวนบุคลากร (ณ 15 มี.ค. 2567): 174 คน
`;

// Detailed curriculum information for the system instruction.
const seniorHighCurriculumInfo = `
ข้อมูลหลักสูตรระดับชั้นมัธยมศึกษาตอนปลาย (ม.4-ม.6) พ.ศ. 2568 มีรายละเอียดแผนการเรียนทั้งหมด 12 แผนการเรียนดังนี้:
1. Intensive Gifted (IGP)
2. Science Mathematics and English (SME)
3. ชีวเคมีอุตสาหกรรม
4. วิทยาศาสตร์พลังสิบ
5. วิศวกรรมอุตสาหการ
6. วิทยาศาสตร์การกีฬา
7. ภาษาศาสตร์-จีน
8. ภาษาศาสตร์-ญี่ปุ่น
9. ภาษาไทย-สังคมศึกษา
10. ศิลปกรรมศาสตร์
11. ธุรกิจอุตสาหกรรม
12. ทวิศึกษาเทคโนโลยีสารสนเทศ และ ทวิภาคี สาขาการจัดการร้านค้าปลีกสมัยใหม่

สำหรับแต่ละแผนการเรียน คุณมีข้อมูลโครงสร้างรายวิชา รหัสวิชา หน่วยกิต และจำนวนชั่วโมงเรียนตลอดหลักสูตร 3 ปี (ม.4-ม.6) ให้ใช้ข้อมูลเหล่านี้ในการตอบคำถามที่เกี่ยวข้องกับหลักสูตรโดยละเอียดและแม่นยำ`;

const juniorHighCurriculumInfo = `
ข้อมูลหลักสูตรระดับชั้นมัธยมศึกษาตอนต้น (ม.1-ม.3) พ.ศ. 2568 มี 4 แผนการเรียนหลัก ดังนี้:
1. Mini English Program (MEP): หลักสูตรที่จัดการเรียนการสอนโดยใช้ภาษาอังกฤษเป็นสื่อ (Bilingual) ในกลุ่มสาระการเรียนรู้คณิตศาสตร์, วิทยาศาสตร์, สุขศึกษา และคอมพิวเตอร์ เพื่อพัฒนาทักษะการสื่อสารภาษาอังกฤษอย่างเป็นธรรมชาติ
2. วิทยาศาสตร์ - คณิตศาสตร์: มุ่งเน้นการพัฒนาทักษะกระบวนการคิดวิเคราะห์ การคำนวณ และการแก้ปัญหาอย่างเป็นระบบ เสริมสร้างความรู้ความเข้าใจในเนื้อหาวิชาวิทยาศาสตร์และคณิตศาสตร์อย่างเข้มข้น เพื่อเป็นพื้นฐานในการศึกษาต่อในระดับสูง
3. วิทยาศาสตร์พลังสิบ: โครงการส่งเสริมการผลิตครูที่มีความสามารถพิเศษทางวิทยาศาสตร์และคณิตศาสตร์ (สสวท.) เน้นการเรียนรู้ผ่านโครงงาน (Project-based Learning) และการลงมือปฏิบัติจริง เพื่อสร้างนักนวัตกรในอนาคต
4. ทั่วไป: หลักสูตรตามแกนกลางการศึกษาขั้นพื้นฐานที่มุ่งเน้นพัฒนาผู้เรียนอย่างรอบด้าน ครอบคลุมทั้ง 8 กลุ่มสาระการเรียนรู้ พร้อมกิจกรรมพัฒนาผู้เรียน เพื่อให้ค้นพบศักยภาพและความถนัดของตนเอง
`;

const curriculumInfo = `${juniorHighCurriculumInfo}\n\n${seniorHighCurriculumInfo}`;


// System instruction to keep the AI focused on school-related topics.
const systemInstruction = `คุณคือผู้ช่วย AI ของโรงเรียนเตรียมอุดมศึกษาน้อมเกล้า สมุทรปราการ (TUNS) มีหน้าที่ตอบคำถามเกี่ยวกับโรงเรียนเท่านั้น เช่น การรับสมัคร, หลักสูตร, สิ่งอำนวยความสะดวก หรือข้อมูลที่ตั้ง โดยใช้ข้อมูลต่อไปนี้เป็นหลัก: ${basicInfo} ${curriculumInfo} หากมีคำถามที่ไม่เกี่ยวกับโรงเรียน ให้ปฏิเสธอย่างสุภาพและบอกขอบเขตหน้าที่ของคุณ`;

export const getChatbotResponse = async (history: ChatMessage[], message: string): Promise<GenerateContentResponse> => {
  const model = 'gemini-2.5-flash';
  const chat = ai.chats.create({
    model,
    history: history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    })),
    config: {
      systemInstruction,
    },
  });
  const response = await chat.sendMessage({ message });
  return response;
};

export const getComplexResponse = async (prompt: string): Promise<GenerateContentResponse> => {
  const model = 'gemini-2.5-pro';
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      thinkingConfig: { thinkingBudget: 32768 },
    },
  });
  return response;
};

export const getGroundedResponse = async (prompt: string, location: GeolocationCoordinates | null): Promise<GenerateContentResponse> => {
  const model = 'gemini-2.5-flash';
  const config: any = {
      tools: [{googleMaps: {}}],
      systemInstruction,
  };

  if (location) {
      config.toolConfig = {
          retrievalConfig: {
              latLng: {
                  latitude: location.latitude,
                  longitude: location.longitude,
              },
          },
      };
  }

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config,
  });
  return response;
};

const idCardSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "คำนำหน้าชื่อ (เช่น นาย, นางสาว, เด็กชาย)" },
        firstName: { type: Type.STRING, description: "ชื่อตัว" },
        lastName: { type: Type.STRING, description: "ชื่อสกุล" },
        nationalId: { type: Type.STRING, description: "เลขประจำตัวประชาชน 13 หลัก" },
        birthDate: { type: Type.STRING, description: "วันเกิดในรูปแบบ 'วัน เดือน ปีพ.ศ.' เช่น '15 พ.ค. 2549'" },
    },
    required: ["title", "firstName", "lastName", "nationalId", "birthDate"],
};

export const extractDataFromImage = async (base64Image: string): Promise<GenerateContentResponse> => {
    const model = 'gemini-2.5-flash';
    
    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
        },
    };

    const textPart = {
        text: `จากภาพบัตรประชาชนไทยนี้ ให้ดึงข้อมูลต่อไปนี้: คำนำหน้าชื่อ, ชื่อตัว, ชื่อสกุล, เลขประจำตัวประชาชน และ วันเกิด.`,
    };

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: idCardSchema,
        },
    });

    return response;
};

const studentDataSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "คำนำหน้าชื่อ (เช่น เด็กชาย, นางสาว, นาย)" },
        firstName: { type: Type.STRING, description: "ชื่อจริง" },
        lastName: { type: Type.STRING, description: "นามสกุล" },
        nationalId: { type: Type.STRING, description: "เลขประจำตัวประชาชน 13 หลัก (เอาเฉพาะตัวเลข)" },
        birthDate: { type: Type.STRING, description: "วันเกิดในรูปแบบ YYYY-MM-DD (เช่น 2009-05-15)" },
        phone: { type: Type.STRING, description: "เบอร์โทรศัพท์ (เอาเฉพาะตัวเลข)" },
        permanentAddress: {
            type: Type.OBJECT,
            description: "ที่อยู่ตามทะเบียนบ้าน",
            properties: {
                detail: { type: Type.STRING, description: "รายละเอียดที่อยู่ เช่น บ้านเลขที่, หมู่, ซอย, ถนน" },
                subdistrict: { type: Type.STRING, description: "ตำบลหรือแขวง" },
                district: { type: Type.STRING, description: "อำเภอหรือเขต" },
                province: { type: Type.STRING, description: "จังหวัด" },
                postalCode: { type: Type.STRING, description: "รหัสไปรษณีย์ 5 หลัก" },
            }
        }
    },
};


export const extractDataFromText = async (text: string): Promise<GenerateContentResponse> => {
    const model = 'gemini-2.5-flash';

    const textPart = {
        text: `จากข้อความต่อไปนี้ ให้ดึงข้อมูลนักเรียนออกมาตามโครงสร้าง JSON ที่กำหนด หากข้อมูลส่วนไหนไม่มีในข้อความ ให้ปล่อยเป็นค่าว่างไว้: \n\n"${text}"`,
    };

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: studentDataSchema,
        },
    });

    return response;
};

const suggestionsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.STRING
    }
};

export const getAutocompleteSuggestions = async (inputText: string, fieldType: 'school' | 'occupation'): Promise<string[]> => {
    if (inputText.trim().length < 3) {
        return [];
    }

    const model = 'gemini-2.5-flash';
    const fieldDescription = fieldType === 'school' ? 'ชื่อโรงเรียนในประเทศไทย' : 'อาชีพในประเทศไทย';

    const textPart = {
        text: `จากคำที่พิมพ์มาบางส่วนคือ "${inputText}", ช่วยแนะนำ ${fieldDescription} ที่เป็นไปได้ 5 อันดับแรก โดยตอบกลับเป็น JSON array ของ string ที่มีแต่ชื่อเท่านั้น`,
    };

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: suggestionsSchema,
            },
        });
        const suggestions = JSON.parse(response.text.trim());
        return Array.isArray(suggestions) ? suggestions.slice(0, 5) : [];
    } catch (error) {
        console.error(`Failed to get autocomplete suggestions for ${fieldType}:`, error);
        return [];
    }
};
