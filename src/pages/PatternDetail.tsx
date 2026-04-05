import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MapPin, Calendar, User, CheckCircle, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PatternDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pattern, setPattern] = useState<any>(null);
  const [uploader, setUploader] = useState<any>(null);
  const [reviewer, setReviewer] = useState<any>(null);
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    if (!id) return;
    supabase.from('silk_patterns').select('*').eq('id', id).single().then(({ data }) => {
      setPattern(data);
      if (data?.user_id) {
        supabase.from('profiles').select('first_name, last_name, username').eq('user_id', data.user_id).single().then(({ data: u }) => setUploader(u));
      }
      if (data?.reviewer_id) {
        supabase.from('profiles').select('first_name, last_name, username').eq('user_id', data.reviewer_id).single().then(({ data: r }) => setReviewer(r));
      }
    });
  }, [id]);

  if (!pattern) return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold/20 border-t-gold rounded-full animate-spin mb-2" />
        <p className="text-muted-foreground ml-3">กำลังโหลด...</p>
      </div>
      <Footer />
    </div>
  );

  const images = pattern.images || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="flex-1 py-10 md:py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Back Button - คลีนๆ เหมือนต้นฉบับ */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-10 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>ย้อนกลับ</span>
          </button>

          {/* ปรับเป็น Grid 2 คอลัมน์เท่ากัน (50/50) เพื่อความสมมาตร */}
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
            
            {/* --- LEFT: IMAGE GALLERY (คอลัมน์ซ้าย) --- */}
            <div className="space-y-4 animate-fade-in">
              {images.length > 0 ? (
                <div className="relative group">
                  <img 
                    src={images[currentImg]} 
                    alt={`${pattern.name}`} 
                    className="w-full h-auto rounded-xl shadow-lg border border-border aspect-[4/3] object-cover" 
                  />
                  
                  {images.length > 1 && (
                    <>
                      {/* ปุ่มเลื่อนภาพแบบครึ่งวงกลม ดูสบายตาขึ้น */}
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-90 transition-opacity shadow-md bg-white/80 backdrop-blur-sm" 
                        onClick={() => setCurrentImg(p => p === 0 ? images.length - 1 : p - 1)}
                      >
                        <ChevronLeft size={24} />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-90 transition-opacity shadow-md bg-white/80 backdrop-blur-sm" 
                        onClick={() => setCurrentImg(p => p === images.length - 1 ? 0 : p + 1)}
                      >
                        <ChevronRight size={24} />
                      </Button>
                      
                      {/* Pagination Dots คลีนๆ */}
                      <div className="flex justify-center gap-2.5 mt-5">
                        {images.map((_: string, i: number) => (
                          <button 
                            key={i} 
                            onClick={() => setCurrentImg(i)} 
                            className={`w-3 h-3 rounded-full transition-all ${i === currentImg ? 'bg-secondary scale-110' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'}`} 
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="aspect-[4/3] bg-muted rounded-xl flex items-center justify-center text-muted-foreground border-2 border-dashed border-border">
                  ไม่มีรูปภาพ
                </div>
              )}
            </div>

            {/* --- RIGHT: INFORMATION (คอลัมน์ขวา) --- */}
            <div className="space-y-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div>
                <h1 className="font-heading text-4xl font-bold text-foreground mb-4 leading-tight">{pattern.name}</h1>
                <div className="h-1 w-20 bg-secondary rounded-full" />
              </div>

              {/* Data Card - ใช้ BG Card เดิม แต่จัดระเบียบใหม่ให้สมมาตร */}
              <div className="bg-card p-8 rounded-2xl shadow-sm border border-border/50 space-y-6">
                
                {/* จัดกลุ่มข้อมูลพื้นฐาน */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                  {pattern.province && (
                    <div className="flex items-center gap-3 text-foreground">
                      <MapPin size={20} className="text-secondary flex-shrink-0" />
                      <span className="font-medium">จังหวัด: <span className="font-normal text-muted-foreground">{pattern.province}</span></span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-foreground">
                    <Calendar size={20} className="text-secondary flex-shrink-0" />
                    <span className="font-medium">วันที่อัปโหลด : <span className="font-normal text-muted-foreground">{new Date(pattern.created_at).toLocaleDateString('th-TH')}</span></span>
                  </div>
                  {uploader && (
                    <div className="flex items-center gap-3 text-foreground sm:col-span-2">
                      <User size={20} className="text-secondary flex-shrink-0" />
                      <span className="font-medium">ผู้อัปโหลดลายผ้า : <span className="font-normal text-muted-foreground">{uploader.first_name} {uploader.last_name}</span></span>
                    </div>
                  )}
                </div>

                {/* ส่วนข้อมูลการตรวจสอบ - สมมตารและคลีน */}
                {pattern.status === 'approved' && reviewer && (
                  <div className="pt-6 border-t border-border/60 space-y-4">
                    <div className="flex items-center gap-3 text-emerald-700 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                      <CheckCircle size={22} className="flex-shrink-0" />
                      <span className="font-medium">ตรวจสอบโดยผู้เชี่ยวชาญ : <span className="font-normal">{reviewer.first_name} {reviewer.last_name}</span></span>
                    </div>
                    {pattern.reviewed_at && (
                       <div className="flex items-center gap-3 text-muted-foreground pl-4">
                         <Calendar size={18} />
                         <span className="text-sm">วันที่อนุมัติ : {new Date(pattern.reviewed_at).toLocaleDateString('th-TH')}</span>
                       </div>
                    )}
                  </div>
                )}

                {/* Notes Sections - จัดระเบียบใหม่ */}
                {(pattern.notes || pattern.reviewer_notes) && (
                  <div className="space-y-6 pt-6 border-t border-border/60">
                    {pattern.notes && (
                      <div className="space-y-2">
                        <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-secondary rounded-full" /> หมายเหตุจากผู้อัปโหลด
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed pl-3.5">{pattern.notes}</p>
                      </div>
                    )}
                    
                    {pattern.reviewer_notes && (
                      <div className="space-y-2 p-4 bg-muted/50 rounded-lg border border-border">
                        <h3 className="font-heading font-semibold text-navy text-sm uppercase tracking-wider">รายละเอียดจากผู้เชี่ยวชาญ</h3>
                        <p className="text-navy/80 text-sm leading-relaxed">{pattern.reviewer_notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PatternDetail;