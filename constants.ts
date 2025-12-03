// Fix: Add missing URL constants
export const PLACEHOLDER_IMAGE_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDEyMCAxNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2U1ZTVlNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlyeT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgc3R5bGU9ImZpbGw6I2NjYztmb250LXdlaWdodDpib2xkIj5QaG90bzwvdGV4dD48L3N2Zz4=';
export const SCHOOL_LOGO_URL = 'https://i.postimg.cc/9QKYpGJ0/527982983-1244966287427002-7739784889401369953-n.jpg';

export interface Subject {
  code: string;
  name: string;
  credits: number;
}

export interface CurriculumGroup {
  category: string;
  subjects: Subject[];
}

export interface StudyPlan {
  title: string;
  description: string;
  curriculum: CurriculumGroup[];
  type?: 'special' | 'general';
}


export const M1_STUDY_PLANS: StudyPlan[] = [
    {
        title: 'Mini English Program (MEP)',
        type: 'special',
        description: 'หลักสูตรที่จัดการเรียนการสอนโดยใช้ภาษาอังกฤษเป็นสื่อ (Bilingual) ในกลุ่มสาระการเรียนรู้คณิตศาสตร์, วิทยาศาสตร์, สุขศึกษา และคอมพิวเตอร์ เพื่อพัฒนาทักษะการสื่อสารภาษาอังกฤษอย่างเป็นธรรมชาติ',
        curriculum: [
          { category: 'รายวิชาพื้นฐาน', subjects: [
              { code: 'ท21101', name: 'ภาษาไทย', credits: 1.5 },
              { code: 'ค21101', name: 'คณิตศาสตร์พื้นฐาน', credits: 1.5 },
              { code: 'ว21101', name: 'วิทยาศาสตร์พื้นฐาน', credits: 1.5 },
              { code: 'ส21101', name: 'สังคมศึกษาฯ', credits: 1.5 },
              { code: 'พ21101', name: 'สุขศึกษาและพลศึกษา', credits: 1.0 },
              { code: 'ศ21101', name: 'ศิลปะ', credits: 1.0 },
              { code: 'ง21101', name: 'การงานอาชีพ', credits: 1.0 },
          ] },
          { category: 'รายวิชาที่สอนเป็นภาษาอังกฤษ', subjects: [
              { code: 'ค21201', name: 'Mathematics', credits: 1.5 },
              { code: 'ว21201', name: 'Science', credits: 1.5 },
              { code: 'พ21201', name: 'Health Education', credits: 1.0 },
              { code: 'ง21202', name: 'Computer', credits: 1.0 },
              { code: 'อ21201', name: 'English for Communication', credits: 1.5 }
          ] },
          { category: 'รายวิชาเพิ่มเติม', subjects: [
              { code: 'อ21203', name: 'ภาษาอังกฤษเข้มข้น', credits: 1.0 },
              { code: 'จ21201', name: 'ภาษาจีนเบื้องต้น', credits: 1.0 },
          ] }
        ]
    },
    {
        title: 'วิทยาศาสตร์ - คณิตศาสตร์',
        type: 'general',
        description: 'มุ่งเน้นการพัฒนาทักษะกระบวนการคิดวิเคราะห์ การคำนวณ และการแก้ปัญหาอย่างเป็นระบบ เสริมสร้างความรู้ความเข้าใจในเนื้อหาวิชาวิทยาศาสตร์และคณิตศาสตร์อย่างเข้มข้น เพื่อเป็นพื้นฐานในการศึกษาต่อในระดับสูง',
        curriculum: [
          { category: 'รายวิชาพื้นฐาน', subjects: [
              { code: 'ท21101', name: 'ภาษาไทย', credits: 1.5 },
              { code: 'ค21101', name: 'คณิตศาสตร์พื้นฐาน', credits: 1.5 },
              { code: 'ว21101', name: 'วิทยาศาสตร์พื้นฐาน', credits: 1.5 },
              { code: 'ส21101', name: 'สังคมศึกษาฯ', credits: 1.5 },
              { code: 'พ21101', name: 'สุขศึกษาและพลศึกษา', credits: 1.0 },
              { code: 'ศ21101', name: 'ศิลปะ', credits: 1.0 },
              { code: 'ง21101', name: 'การงานอาชีพ', credits: 1.0 },
              { code: 'อ21101', name: 'ภาษาอังกฤษ', credits: 1.5 },
          ] },
          { category: 'รายวิชาเพิ่มเติม', subjects: [
              { code: 'ค21202', name: 'คณิตศาสตร์เพิ่มเติม', credits: 1.5 },
              { code: 'ว21202', name: 'วิทยาศาสตร์เพิ่มเติม', credits: 1.5 },
              { code: 'ว21204', name: 'การออกแบบและเทคโนโลยี', credits: 1.0 },
          ] }
        ]
    },
    {
        title: 'วิทยาศาสตร์พลังสิบ',
        type: 'general',
        description: 'โครงการส่งเสริมการผลิตครูที่มีความสามารถพิเศษทางวิทยาศาสตร์และคณิตศาสตร์ (สสวท.) เน้นการเรียนรู้ผ่านโครงงาน (Project-based Learning) และการลงมือปฏิบัติจริง เพื่อสร้างนักนวัตกรในอนาคต',
        curriculum: [
            { category: 'รายวิชาพื้นฐาน', subjects: [
                { code: 'ท21101', name: 'ภาษาไทย', credits: 1.5 },
                { code: 'ค21101', name: 'คณิตศาสตร์พื้นฐาน', credits: 1.5 },
                { code: 'ว21101', name: 'วิทยาศาสตร์พื้นฐาน', credits: 1.5 },
                { code: 'ส21101', name: 'สังคมศึกษาฯ', credits: 1.5 },
                { code: 'พ21101', name: 'สุขศึกษาและพลศึกษา', credits: 1.0 },
                { code: 'ศ21101', name: 'ศิลปะ', credits: 1.0 },
                { code: 'ง21101', name: 'การงานอาชีพ', credits: 1.0 },
                { code: 'อ21101', name: 'ภาษาอังกฤษ', credits: 1.5 },
            ] },
            { category: 'รายวิชาเพิ่มเติม (เน้นโครงงาน)', subjects: [
                { code: 'ค21202', name: 'คณิตศาสตร์เพิ่มเติม', credits: 1.0 },
                { code: 'ว21202', name: 'วิทยาศาสตร์เพิ่มเติม', credits: 1.0 },
                { code: 'ว20288', name: 'โครงงานวิทยาศาสตร์พลังสิบ', credits: 2.0 },
            ] }
        ]
    },
    {
        title: 'ทั่วไป',
        type: 'general',
        description: 'หลักสูตรตามแกนกลางการศึกษาขั้นพื้นฐานที่มุ่งเน้นพัฒนาผู้เรียนอย่างรอบด้าน ครอบคลุมทั้ง 8 กลุ่มสาระการเรียนรู้ พร้อมกิจกรรมพัฒนาผู้เรียน เพื่อให้ค้นพบศักยภาพและความถนัดของตนเอง',
        curriculum: [
            { category: 'รายวิชาพื้นฐาน', subjects: [
                { code: 'ท21101', name: 'ภาษาไทย', credits: 1.5 },
                { code: 'ค21101', name: 'คณิตศาสตร์พื้นฐาน', credits: 1.5 },
                { code: 'ว21101', name: 'วิทยาศาสตร์พื้นฐาน', credits: 1.5 },
                { code: 'ส21101', name: 'สังคมศึกษาฯ', credits: 1.5 },
                { code: 'พ21101', name: 'สุขศึกษาและพลศึกษา', credits: 1.0 },
                { code: 'ศ21101', name: 'ศิลปะ', credits: 1.0 },
                { code: 'ง21101', name: 'การงานอาชีพ', credits: 1.0 },
                { code: 'อ21101', name: 'ภาษาอังกฤษ', credits: 1.5 },
            ] },
            { category: 'รายวิชาเพิ่มเติมเลือก', subjects: [
                { code: 'จ21201', name: 'ภาษาจีนเบื้องต้น', credits: 1.0 },
                { code: 'ง21202', name: 'คอมพิวเตอร์สร้างสรรค์', credits: 1.0 },
                { code: 'ศ21203', name: 'ดนตรี-นาฏศิลป์', credits: 1.0 },
            ] }
        ]
    }
];

// Fix: Add missing M4_STUDY_PLANS export and expanded list
export const M4_STUDY_PLANS: StudyPlan[] = [
    {
        title: 'Intensive Gifted (IGP)',
        type: 'special',
        description: 'แผนการเรียนสำหรับผู้มีความสามารถพิเศษด้านวิทยาศาสตร์ คณิตศาสตร์ และเทคโนโลยี เน้นการเรียนรู้แบบเข้มข้นและทำโครงงานวิจัย',
        curriculum: [
             { category: 'รายวิชาพื้นฐาน', subjects: [
                { code: 'ท31101', name: 'ภาษาไทย 1', credits: 1.0 },
                { code: 'ค31101', name: 'คณิตศาสตร์พื้นฐาน 1', credits: 1.0 },
                { code: 'ว31101', name: 'วิทยาศาสตร์กายภาพ 1 (ฟิสิกส์)', credits: 1.0 },
                { code: 'ว31102', name: 'วิทยาศาสตร์ชีวภาพ 1', credits: 1.0 },
                { code: 'ส31101', name: 'สังคมศึกษา 1', credits: 1.0 },
                { code: 'พ31101', name: 'สุขศึกษาและพลศึกษา 1', credits: 0.5 },
                { code: 'ศ31101', name: 'ศิลปะ 1', credits: 0.5 },
                { code: 'ง31101', name: 'การงานอาชีพฯ 1', credits: 0.5 },
                { code: 'อ31101', name: 'ภาษาอังกฤษ 1', credits: 1.0 },
             ]},
             { category: 'รายวิชาเพิ่มเติม (เน้น)', subjects: [
                { code: 'ค31201', name: 'คณิตศาสตร์เพิ่มเติม 1 (เข้มข้น)', credits: 2.0 },
                { code: 'ว31201', name: 'ฟิสิกส์เพิ่มเติม 1 (เข้มข้น)', credits: 2.0 },
                { code: 'ว31221', name: 'เคมีเพิ่มเติม 1 (เข้มข้น)', credits: 2.0 },
                { code: 'ว31241', name: 'ชีววิทยาเพิ่มเติม 1 (เข้มข้น)', credits: 2.0 },
                { code: 'ว31281', name: 'โครงงานวิทยาศาสตร์ (IS1)', credits: 1.0 },
                { code: 'อ31211', name: 'ภาษาอังกฤษเชิงวิชาการ', credits: 1.0 },
             ]}
        ]
    },
    {
        title: 'Science Mathematics and English(SME)',
        type: 'special',
        description: 'แผนการเรียนวิทยาศาสตร์-คณิตศาสตร์ ที่จัดการเรียนการสอนบางรายวิชาเป็นภาษาอังกฤษ เพื่อเตรียมความพร้อมสู่หลักสูตรนานาชาติ',
        curriculum: [
             { category: 'รายวิชาพื้นฐาน', subjects: [
                { code: 'ท31101', name: 'ภาษาไทย 1', credits: 1.0 },
                { code: 'ส31101', name: 'สังคมศึกษา 1', credits: 1.0 },
                { code: 'พ31101', name: 'Health and Physical Education 1', credits: 0.5 },
                { code: 'ศ31101', name: 'Arts 1', credits: 0.5 },
             ]},
             { category: 'รายวิชาที่สอนเป็นภาษาอังกฤษ', subjects: [
                { code: 'ค31101', name: 'Basic Mathematics 1', credits: 1.0 },
                { code: 'ค31201', name: 'Additional Mathematics 1', credits: 2.0 },
                { code: 'ว31201', name: 'Physics 1', credits: 2.0 },
                { code: 'ว31221', name: 'Chemistry 1', credits: 2.0 },
                { code: 'ว31241', name: 'Biology 1', credits: 2.0 },
                { code: 'อ31201', name: 'Academic English 1', credits: 1.5 },
                { code: 'ง31201', name: 'Computer Science 1', credits: 1.0 },
             ]}
        ]
    },
    {
        title: 'ชีวเคมีอุตสาหกรรม',
        type: 'general',
        description: 'แผนการเรียนวิทยาศาสตร์-คณิตศาสตร์ที่เน้นความรู้ด้านชีววิทยาและเคมีประยุกต์สำหรับอุตสาหกรรม',
        curriculum: [
            { category: 'รายวิชาพื้นฐาน', subjects: [
                { code: 'ท31101', name: 'ภาษาไทย 1', credits: 1.0 },
                { code: 'ค31101', name: 'คณิตศาสตร์พื้นฐาน 1', credits: 1.0 },
                { code: 'ส31101', name: 'สังคมศึกษา 1', credits: 1.0 },
                { code: 'พ31101', name: 'สุขศึกษาและพลศึกษา 1', credits: 0.5 },
                { code: 'อ31101', name: 'ภาษาอังกฤษ 1', credits: 1.0 },
             ]},
            { category: 'รายวิชาเพิ่มเติม (เน้น)', subjects: [
                { code: 'ค31201', name: 'คณิตศาสตร์เพิ่มเติม 1', credits: 1.5 },
                { code: 'ว31221', name: 'เคมีเพิ่มเติม 1', credits: 2.0 },
                { code: 'ว31241', name: 'ชีววิทยาเพิ่มเติม 1', credits: 2.0 },
                { code: 'ว30291', name: 'ชีวเคมีเบื้องต้น', credits: 1.5 },
                { code: 'ว30292', name: 'ปฏิบัติการเคมีอุตสาหกรรม', credits: 1.0 },
            ]}
        ]
    },
    {
        title: 'วิทยาศาสตร์พลังสิบ',
        type: 'general',
        description: 'โครงการความร่วมมือเพื่อส่งเสริมผู้มีความสามารถพิเศษด้านวิทยาศาสตร์และเทคโนโลยี',
        curriculum: [
            { category: 'รายวิชาพื้นฐาน', subjects: [
                { code: 'ท31101', name: 'ภาษาไทย 1', credits: 1.0 },
                { code: 'ค31101', name: 'คณิตศาสตร์พื้นฐาน 1', credits: 1.0 },
                { code: 'ส31101', name: 'สังคมศึกษา 1', credits: 1.0 },
                { code: 'พ31101', name: 'สุขศึกษาและพลศึกษา 1', credits: 0.5 },
                { code: 'อ31101', name: 'ภาษาอังกฤษ 1', credits: 1.0 },
             ]},
            { category: 'รายวิชาเพิ่มเติม (เน้น)', subjects: [
                { code: 'ค31201', name: 'คณิตศาสตร์เพิ่มเติม 1', credits: 2.0 },
                { code: 'ว31201', name: 'ฟิสิกส์เพิ่มเติม 1', credits: 2.0 },
                { code: 'ว31221', name: 'เคมีเพิ่มเติม 1', credits: 1.5 },
                { code: 'ว31241', name: 'ชีววิทยาเพิ่มเติม 1', credits: 1.5 },
                { code: 'ว30288', name: 'โครงงานวิทยาศาสตร์พลังสิบ', credits: 1.5 },
            ]}
        ]
    },
    {
        title: 'วิศวกรรมอุตสาหการ',
        type: 'general',
        description: 'แผนการเรียนที่มุ่งเน้นพื้นฐานทางด้านวิศวกรรมศาสตร์ การออกแบบ และกระบวนการผลิตในอุตสาหกรรม',
        curriculum: [
            { category: 'รายวิชาพื้นฐาน', subjects: [
                { code: 'ท31101', name: 'ภาษาไทย 1', credits: 1.0 },
                { code: 'ค31101', name: 'คณิตศาสตร์พื้นฐาน 1', credits: 1.0 },
                { code: 'ส31101', name: 'สังคมศึกษา 1', credits: 1.0 },
                { code: 'พ31101', name: 'สุขศึกษาและพลศึกษา 1', credits: 0.5 },
                { code: 'อ31101', name: 'ภาษาอังกฤษ 1', credits: 1.0 },
             ]},
            { category: 'รายวิชาเพิ่มเติม (เน้น)', subjects: [
                { code: 'ค31201', name: 'คณิตศาสตร์เพิ่มเติม 1', credits: 2.0 },
                { code: 'ว31201', name: 'ฟิสิกส์เพิ่มเติม 1', credits: 2.0 },
                { code: 'ง30281', name: 'เขียนแบบวิศวกรรม', credits: 1.5 },
                { code: 'ง30282', name: 'กลศาสตร์วิศวกรรมเบื้องต้น', credits: 1.5 },
                { code: 'ง30283', name: 'วัสดุศาสตร์อุตสาหกรรม', credits: 1.0 },
            ]}
        ]
    },
    {
        title: 'วิทยาศาสตร์การกีฬา',
        type: 'general',
        description: 'แผนการเรียนสำหรับผู้ที่สนใจศึกษาต่อในสาขาวิทยาศาสตร์สุขภาพ การจัดการกีฬา และการเป็นผู้ฝึกสอน',
        curriculum: [
            { category: 'รายวิชาพื้นฐาน', subjects: [
                { code: 'ท31101', name: 'ภาษาไทย 1', credits: 1.0 },
                { code: 'ค31101', name: 'คณิตศาสตร์พื้นฐาน 1', credits: 1.0 },
                { code: 'ว31102', name: 'วิทยาศาสตร์ชีวภาพ 1', credits: 1.5 },
                { code: 'ส31101', name: 'สังคมศึกษา 1', credits: 1.0 },
                { code: 'พ31101', name: 'สุขศึกษาและพลศึกษา 1', credits: 0.5 },
                { code: 'อ31101', name: 'ภาษาอังกฤษ 1', credits: 1.0 },
             ]},
            { category: 'รายวิชาเพิ่มเติม (เน้น)', subjects: [
                { code: 'พ30201', name: 'วิทยาศาสตร์การกีฬา', credits: 2.0 },
                { code: 'พ30202', name: 'การจัดการกีฬา', credits: 1.5 },
                { code: 'พ30203', name: 'กายวิภาคศาสตร์และสรีรวิทยา', credits: 1.5 },
                { code: 'พ30204', name: 'โภชนาการทางการกีฬา', credits: 1.0 },
                { code: 'อ30215', name: 'ภาษาอังกฤษสำหรับวิทยาศาสตร์การกีฬา', credits: 1.0 },
            ]}
        ]
    },
    {
        title: 'ภาษาศาสตร์-จีน',
        type: 'general',
        description: 'แผนการเรียนที่เน้นการพัฒนาทักษะภาษาจีนทั้งการฟัง พูด อ่าน เขียน รวมถึงเรียนรู้วัฒนธรรมและประวัติศาสตร์จีน',
        curriculum: [
             { category: 'รายวิชาพื้นฐาน', subjects: [
                { code: 'ท31101', name: 'ภาษาไทย 1', credits: 1.0 },
                { code: 'ค31101', name: 'คณิตศาสตร์พื้นฐาน 1', credits: 1.0 },
                { code: 'ว31103', name: 'วิทยาศาสตร์พื้นฐาน 1', credits: 1.0 },
                { code: 'ส31101', name: 'สังคมศึกษา 1', credits: 1.0 },
                { code: 'พ31101', name: 'สุขศึกษาและพลศึกษา 1', credits: 0.5 },
                { code: 'อ31101', name: 'ภาษาอังกฤษ 1', credits: 1.0 },
             ]},
             { category: 'รายวิชาเพิ่มเติม (เน้นภาษาจีน)', subjects: [
                { code: 'จ31201', name: 'ภาษาจีนเพื่อการสื่อสาร 1', credits: 2.0 },
                { code: 'จ31203', name: 'การฟัง-พูดภาษาจีน 1', credits: 1.5 },
                { code: 'จ31205', name: 'การอ่าน-เขียนภาษาจีน 1', credits: 1.5 },
                { code: 'จ31207', name: 'วัฒนธรรมจีน', credits: 1.0 },
                { code: 'ส30211', name: 'ประวัติศาสตร์จีนเบื้องต้น', credits: 1.0 },
             ]}
        ]
    },
    {
        title: 'ภาษาศาสตร์-ญี่ปุ่น',
        type: 'general',
        description: 'แผนการเรียนที่เน้นการพัฒนาทักษะภาษาญี่ปุ่นเพื่อการสื่อสาร การทำงาน และความเข้าใจในวัฒนธรรมญี่ปุ่น',
        curriculum: [
            { category: 'รายวิชาพื้นฐาน', subjects: [
                { code: 'ท31101', name: 'ภาษาไทย 1', credits: 1.0 },
                { code: 'ค31101', name: 'คณิตศาสตร์พื้นฐาน 1', credits: 1.0 },
                { code: 'ส31101', name: 'สังคมศึกษา 1', credits: 1.0 },
                { code: 'พ31101', name: 'สุขศึกษาและพลศึกษา 1', credits: 0.5 },
                { code: 'อ31101', name: 'ภาษาอังกฤษ 1', credits: 1.0 },
             ]},
            { category: 'รายวิชาเพิ่มเติม (เน้นภาษาญี่ปุ่น)', subjects: [
                { code: 'ญ31201', name: 'ภาษาญี่ปุ่น 1', credits: 2.0 },
                { code: 'ญ31202', name: 'อักษรญี่ปุ่น 1 (คันจิ)', credits: 1.5 },
                { code: 'ญ31203', name: 'วัฒนธรรมญี่ปุ่น', credits: 1.5 },
                { code: 'ญ30204', name: 'การสนทนาภาษาญี่ปุ่น 1', credits: 1.0 },
            ]}
        ]
    },
    {
        title: 'ภาษาไทย-สังคมศึกษา',
        type: 'general',
        description: 'แผนการเรียนที่เน้นความลุ่มลึกในภาษาไทย วรรณคดี และความเข้าใจในมิติทางสังคม ประวัติศาสตร์ และกฎหมาย',
        curriculum: [
            { category: 'รายวิชาพื้นฐาน', subjects: [
                { code: 'ท31101', name: 'ภาษาไทย 1', credits: 1.0 },
                { code: 'ค31101', name: 'คณิตศาสตร์พื้นฐาน 1', credits: 1.0 },
                { code: 'ส31101', name: 'สังคมศึกษา 1', credits: 1.0 },
                { code: 'พ31101', name: 'สุขศึกษาและพลศึกษา 1', credits: 0.5 },
                { code: 'อ31101', name: 'ภาษาอังกฤษ 1', credits: 1.0 },
             ]},
            { category: 'รายวิชาเพิ่มเติม (เน้น)', subjects: [
                { code: 'ท30201', name: 'หลักภาษาไทย', credits: 2.0 },
                { code: 'ท30202', name: 'วรรณคดีวิจักษ์', credits: 1.5 },
                { code: 'ส30201', name: 'ประวัติศาสตร์ไทย', credits: 1.5 },
                { code: 'ส30203', name: 'กฎหมายเบื้องต้น', credits: 1.5 },
                { code: 'ส30204', name: 'รัฐศาสตร์เบื้องต้น', credits: 1.0 },
            ]}
        ]
    },
    {
        title: 'ศิลปกรรมศาสตร์',
        type: 'general',
        description: 'แผนการเรียนสำหรับผู้มีความสามารถและความคิดสร้างสรรค์ด้านทัศนศิลป์ การออกแบบ และศิลปะประยุกต์',
        curriculum: [
            { category: 'รายวิชาพื้นฐาน', subjects: [
                { code: 'ท31101', name: 'ภาษาไทย 1', credits: 1.0 },
                { code: 'ค31101', name: 'คณิตศาสตร์พื้นฐาน 1', credits: 1.0 },
                { code: 'ส31101', name: 'สังคมศึกษา 1', credits: 1.0 },
                { code: 'พ31101', name: 'สุขศึกษาและพลศึกษา 1', credits: 0.5 },
                { code: 'อ31101', name: 'ภาษาอังกฤษ 1', credits: 1.0 },
             ]},
            { category: 'รายวิชาเพิ่มเติม (เน้น)', subjects: [
                { code: 'ศ30201', name: 'ทัศนศิลป์', credits: 2.0 },
                { code: 'ศ30203', name: 'การออกแบบ', credits: 2.0 },
                { code: 'ศ30205', name: 'ประวัติศาสตร์ศิลป์', credits: 1.5 },
                { code: 'ศ30207', name: 'วาดเส้นสร้างสรรค์', credits: 1.5 },
            ]}
        ]
    },
    {
        title: 'ธุรกิจอุตสาหกรรม',
        type: 'general',
        description: 'แผนการเรียนที่บูรณาการความรู้ด้านธุรกิจ การจัดการ และความเข้าใจในภาคอุตสาหกรรม',
        curriculum: [
            { category: 'รายวิชาพื้นฐาน', subjects: [
                { code: 'ท31101', name: 'ภาษาไทย 1', credits: 1.0 },
                { code: 'ค31101', name: 'คณิตศาสตร์พื้นฐาน 1', credits: 1.0 },
                { code: 'ส31101', name: 'สังคมศึกษา 1', credits: 1.0 },
                { code: 'พ31101', name: 'สุขศึกษาและพลศึกษา 1', credits: 0.5 },
                { code: 'อ31101', name: 'ภาษาอังกฤษ 1', credits: 1.0 },
             ]},
            { category: 'รายวิชาเพิ่มเติม (เน้น)', subjects: [
                { code: 'ง30221', name: 'การบัญชีเบื้องต้น', credits: 2.0 },
                { code: 'ง30222', name: 'การจัดการธุรกิจ', credits: 1.5 },
                { code: 'ง30223', name: 'การตลาดเบื้องต้น', credits: 1.5 },
                { code: 'ง30224', name: 'เศรษฐศาสตร์จุลภาค', credits: 1.0 },
                { code: 'อ30221', name: 'ภาษาอังกฤษธุรกิจ', credits: 1.0 },
            ]}
        ]
    },
    {
        title: 'ทวิศึกษา-ทวิภาคี',
        type: 'general',
        description: 'เรียนรู้ทฤษฎีควบคู่การฝึกปฏิบัติจริงในสถานประกอบการ สาขา IT หรือการจัดการร้านค้าปลีก',
        curriculum: [
            { category: 'รายวิชาพื้นฐาน', subjects: [
                { code: 'ท31101', name: 'ภาษาไทย 1', credits: 1.0 },
                { code: 'ค31101', name: 'คณิตศาสตร์พื้นฐาน 1', credits: 1.0 },
                { code: 'ส31101', name: 'สังคมศึกษา 1', credits: 1.0 },
                { code: 'อ31101', name: 'ภาษาอังกฤษ 1', credits: 1.0 },
             ]},
            { category: 'รายวิชาเพิ่มเติม (ทวิศึกษา)', subjects: [
                { code: 'ง30241', name: 'เทคโนโลยีสารสนเทศ (ตามหลักสูตร ปวช.)', credits: 2.0 },
                { code: 'ง30242', name: 'การเขียนโปรแกรมเบื้องต้น', credits: 2.0 },
                { code: 'ง30261', name: 'การจัดการร้านค้าปลีก (ตามหลักสูตร ปวช.)', credits: 2.0 },
                { code: 'ง30262', name: 'การบริการลูกค้า', credits: 1.5 },
                { code: 'ง30200', name: 'ฝึกงานในสถานประกอบการ', credits: 3.0 },
            ]}
        ]
    }
];