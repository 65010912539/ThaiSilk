import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PatternCard from '@/components/PatternCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ISAN_PROVINCES } from '@/lib/provinces';
import { Search, Filter, LayoutGrid } from 'lucide-react';

const Library = () => {
  const [patterns, setPatterns] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatterns = async () => {
      setLoading(true);
      let query = supabase
        .from('silk_patterns')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (search) query = query.ilike('name', `%${search}%`);
      if (province && province !== 'all') query = query.eq('province', province);

      const { data } = await query;
      setPatterns(data || []);
      setLoading(false);
    };
    fetchPatterns();
  }, [search, province]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCFB]">
      <Navbar />
      
      {/* --- HEADER SECTION --- */}
      <div className="relative bg-navy py-20 md:py-28 overflow-hidden">
        {/* Background Texture จางๆ ให้ดูแพง */}
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        
        {/* Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          {/* แก้ไขเป็นสีทอง (text-gold) ตามคำขอ */}
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-gold mb-4 tracking-tight drop-shadow-md animate-fade-up">
            คลังลายผ้า
          </h1>
          <p className="text-white/70 text-sm md:text-base font-light tracking-[0.3em] uppercase animate-fade-up" style={{ animationDelay: '0.2s' }}>
            ลายผ้าที่ผ่านการอนุมัติทั้งหมดในระบบ
          </p>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 -mt-10 pb-24 relative z-20">
        <div className="container mx-auto px-4">
          
          {/* Floating Search & Filter Box */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl shadow-navy/10 border border-border/40 mb-12 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="flex items-center gap-3 text-navy font-bold min-w-fit">
                
              </div>
              
              <div className="hidden lg:block w-px h-10 bg-border/60" />

              <div className="relative flex-1 w-full group">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-gold transition-colors" />
                <Input 
                  placeholder="ค้นหาชื่อลายผ้าที่คุณต้องการ..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  className="pl-12 h-14 bg-muted/40 border-none focus-visible:ring-2 focus-visible:ring-gold/20 transition-all rounded-2xl text-base" 
                />
              </div>

              <div className="w-full lg:w-80">
                <Select value={province} onValueChange={setProvince}>
                  <SelectTrigger className="h-14 bg-muted/40 border-none focus:ring-2 focus:ring-gold/20 rounded-2xl text-base px-6">
                    <SelectValue placeholder="เลือกจังหวัด" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/40 shadow-2xl">
                    <SelectItem value="all">ทุกจังหวัดในภาคอีสาน</SelectItem>
                    {ISAN_PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex justify-between items-center mb-8 px-4">
            <div className="flex items-center gap-2 text-muted-foreground font-medium">
              <LayoutGrid size={18} className="text-gold" />
              <span>แสดงผลทั้งหมด <span className="text-navy font-bold">{patterns.length}</span> รายการ</span>
            </div>
          </div>

          {/* Patterns Display Logic */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-6">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-gold/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-gold rounded-full animate-spin" />
              </div>
              <p className="text-muted-foreground text-lg font-light tracking-wide animate-pulse">กำลังสืบค้นจดหมายเหตุ...</p>
            </div>
          ) : patterns.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-[2.5rem] border border-dashed border-border/80 shadow-sm">
              <div className="bg-muted/30 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                <Search size={40} className="text-muted-foreground/30" />
              </div>
              <h3 className="text-navy text-2xl font-bold mb-3">ไม่พบข้อมูลที่ค้นหา</h3>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-lg">
                ลองปรับเปลี่ยนคำค้นหา หรือเลือกดูจังหวัดอื่นเพื่อให้พบผลลัพธ์ที่มากขึ้น
              </p>
              <button 
                onClick={() => { setSearch(''); setProvince('all'); }}
                className="px-8 py-3 bg-gold/10 text-gold font-bold rounded-full hover:bg-gold hover:text-white transition-all shadow-sm"
              >
                ล้างการตั้งค่าทั้งหมด
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {patterns.map((p, index) => (
                <div 
                  key={p.id} 
                  className="animate-fade-up fill-mode-both"
                  style={{ 
                    animationDelay: `${index * 80}ms`,
                    animationFillMode: 'both' 
                  }}
                >
                  <div className="hover:-translate-y-3 transition-all duration-500 hover:shadow-2xl hover:shadow-gold/5">
                    <PatternCard {...p} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* --- INLINE STYLES FOR ANIMATION --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fadeUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          opacity: 0;
        }
        .fill-mode-both {
          animation-fill-mode: both;
        }
      `}} />
    </div>
  );
};

export default Library;