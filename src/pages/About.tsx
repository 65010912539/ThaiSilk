import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { GraduationCap, BookOpen, BrainCircuit, Target, MapPin, School, Book, Quote } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFD]">
      <Navbar />
      
      <div className="flex-1 py-16 md:py-24 px-4 overflow-hidden">
        <div className="container mx-auto max-w-7xl">

          <div className="flex flex-col items-center justify-center text-center mb-20 relative">
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#F5C144]/10 rounded-full blur-3xl -ml-16 -mt-16" />
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-4 z-10">
               <span className="text-[#2A4375]">ThaiSilk</span> 
            </h1>
            <p className="max-w-2xl text-slate-600 text-base md:text-lg leading-relaxed z-10 font-medium">
              แพลตฟอร์มอนุรักษ์ลวดลายผ้าไหมไทยภูมิปัญญาแห่งอีสานในรูปแบบดิจิทัล <br className="hidden md:block" />
              (Digital Conservation of Northeastern Thai Silk Patterns)
            </p>
            <div className="w-24 h-1.5 bg-[#F5C144] mt-8 rounded-full z-10" />
          </div>

          <section className="bg-white rounded-[2.5rem] shadow-[0_15px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-8 md:p-12 mb-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Quote size={120} className="text-[#2A4375]" />
            </div>
            <div className="relative z-10">
              <h2 className="font-heading text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <span className="w-2 h-8 bg-[#F5C144] rounded-full" />
                ที่มาและความสำคัญของเว็บไซต์นี้
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6 text-slate-600 text-lg leading-relaxed">
                <p>
                  เว็บไซต์นี้ถูกพัฒนาขึ้นเพื่อเป็นแหล่งรวบรวมและอนุรักษ์ลวดลายผ้าไหมไทยในรูปแบบดิจิทัล โดยมีแนวคิดเสมือน <span className="font-bold text-[#2A4375]">“พิพิธภัณฑ์ออนไลน์”</span> ที่เปิดโอกาสให้บุคคลทั่วไปสามารถเข้าถึงข้อมูลลายผ้าได้อย่างสะดวก ทุกที่ ทุกเวลา
                </p>
                <p>
                  ในปัจจุบัน ลวดลายผ้าไหมหลายชนิดมีความเสี่ยงที่จะสูญหายไปตามกาลเวลา เนื่องจากขาดการบันทึกข้อมูลอย่างเป็นระบบ เว็บไซต์นี้จึงมีบทบาทสำคัญในการจัดเก็บข้อมูลลายผ้าอย่างเป็นระบบ พร้อมทั้งเปิดโอกาสให้ผู้ใช้งานสามารถมีส่วนร่วมในการอนุรักษ์ โดยการอัปโหลดลวดลายผ้าที่ตนเองมีอยู่
                </p>
                <p>
                  นอกจากนี้ ระบบยังมีผู้เชี่ยวชาญในการตรวจสอบและยืนยันความถูกต้องของข้อมูล เพื่อให้ข้อมูลที่เผยแพร่มีความน่าเชื่อถือ และสามารถนำไปใช้เป็นแหล่งอ้างอิงได้
                </p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch mb-24">
            <section className="bg-white rounded-3xl shadow-[0_15px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-10 relative overflow-hidden group">
              <div className="flex flex-col gap-6">
                <div className="bg-[#2A4375] w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center self-start">
                  <BookOpen size={28} className="text-white" />
                </div>
                <h2 className="font-heading text-2xl font-bold text-slate-900">วิสัยทัศน์และการอนุรักษ์</h2>
                <p className="text-slate-600 leading-relaxed text-lg">
                  เรามุ่งเน้นการใช้เทคโนโลยีสมัยใหม่ในการบันทึกและอนุรักษ์ลวดลายผ้าไหมไทยในภูมิภาคอีสาน รวบรวมภูมิปัญญาจากท้องถิ่นให้เข้าถึงได้ง่าย เพื่อส่งต่อคุณค่าอันประเมินค่าไม่ได้นี้สู่คนรุ่นหลังอย่างยั่งยืน
                </p>
              </div>
            </section>

            <section className="bg-white rounded-3xl shadow-[0_15px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-10 relative overflow-hidden group">
              <div className="flex flex-col gap-6">
                <div className="bg-[#F5C144] w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center self-start">
                  <Target size={28} className="text-white" />
                </div>
                <h2 className="font-heading text-2xl font-bold text-slate-900">พันธกิจและผลลัพธ์</h2>
                <p className="text-slate-600 leading-relaxed text-lg">
                  สร้างความร่วมมือกับชุมชนในการแบ่งปันลวดลายผ้าที่หาชมได้ยาก เพื่อสร้างคลังความรู้ที่สมบูรณ์ที่สุด และสามารถนำไปใช้เป็นแหล่งอ้างอิงสำหรับการศึกษาและการวิจัยในระดับสากล
                </p>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <h2 className="font-heading text-3xl font-bold text-slate-900 text-center mb-12">ผู้จัดทำโครงงาน</h2>
            
            <section className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 p-8 md:p-12 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5C144]/5 rounded-full blur-3xl -mr-20 -mt-20" />
              
              <div className="relative flex flex-col md:flex-row items-center gap-12">
                <div className="relative">
                  <div className="relative w-48 h-48 rounded-full bg-slate-50 border-8 border-white shadow-2xl flex items-center justify-center overflow-hidden">
                    <GraduationCap size={80} className="text-[#2A4375]" />
                  </div>
                </div>

                <div className="flex-1 space-y-6 text-center md:text-left">
                  <div>
                    <span className="text-[#F5C144] font-bold text-sm tracking-widest uppercase mb-2 block">Developer Profile</span>
                    <h3 className="font-heading text-4xl font-extrabold text-slate-900 mb-2">นายเกียรติศักดิ์ มูลบัวภา</h3>
                    <p className="text-2xl text-[#2A4375] font-bold">รหัสนิสิต: 65010912539</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <div className="bg-white p-3 rounded-xl shadow-sm"><Book size={24} className="text-[#2A4375]" /></div>
                      <div>
                        <p className="text-sm text-slate-400 uppercase font-bold tracking-wider mb-1">สาขาวิชา</p>
                        <p className="text-xl text-slate-700 font-bold">คอมพิวเตอร์ธุรกิจ</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <div className="bg-white p-3 rounded-xl shadow-sm"><School size={24} className="text-[#2A4375]" /></div>
                      <div>
                        <p className="text-sm text-slate-400 uppercase font-bold tracking-wider mb-1">คณะ</p>
                        <p className="text-xl text-slate-700 font-bold">การบัญชีและการจัดการ</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 sm:col-span-2">
                      <div className="bg-white p-3 rounded-xl shadow-sm"><MapPin size={24} className="text-[#2A4375]" /></div>
                      <div>
                        <p className="text-sm text-slate-400 uppercase font-bold tracking-wider mb-1">สถาบัน</p>
                        <p className="text-xl text-slate-700 font-bold">มหาวิทยาลัยมหาสารคาม</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-[#2A4375] rounded-[2.5rem] p-10 text-white relative overflow-hidden group transition-all hover:bg-[#1A3365] flex flex-col items-center text-center border border-white/5">
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#F5C144]/10 rounded-full blur-3xl" />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-[#F5C144] rounded-[1.5rem] flex items-center justify-center shadow-2xl mb-6 transform group-hover:scale-110 transition-transform duration-500">
                  <BrainCircuit size={40} className="text-[#2A4375]" />
                </div>
                
                <span className="text-[#F5C144] font-bold text-xs tracking-[0.3em] uppercase mb-3">Project Advisor</span>
                <h3 className="font-heading text-3xl font-bold mb-3 tracking-tight">อาจารย์ ปวรปรัชญ์ หงสากล</h3>
                <div className="w-12 h-1 bg-white/20 rounded-full mb-4" />
                <p className="text-slate-200 font-medium text-xl">คณะการบัญชีและการจัดการ มหาวิทยาลัยมหาสารคาม</p>
              </div>
            </section>
          </div>

        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default About;