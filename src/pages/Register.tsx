import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { Eye, EyeOff, User, GraduationCap, Mail, Lock, UserCircle, Briefcase, FileText, Link as LinkIcon } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', username: '', password: '', rePassword: '', email: '', role: 'user' as 'user' | 'professor',
    experience: '', portfolioLink: '',
  });
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const passwordValid = form.password.length >= 8 && /[a-zA-Z]/.test(form.password) && /[0-9]/.test(form.password);

  // --- LOGIC เดิมจากไฟล์ที่ใช้งานได้จริง ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid) { toast.error('รหัสผ่านต้องมีอย่างน้อย 8 ตัว ประกอบด้วยตัวอักษรและตัวเลข'); return; }
    if (form.password !== form.rePassword) { toast.error('รหัสผ่านไม่ตรงกัน'); return; }
    if (form.role === 'professor' && !form.experience) { toast.error('กรุณากรอกประสบการณ์'); return; }

    setLoading(true);
    try {
      const { data: existing } = await supabase.from('profiles').select('id').eq('username', form.username).maybeSingle();
      if (existing) { toast.error('ชื่อผู้ใช้นี้ถูกใช้แล้ว'); setLoading(false); return; }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error('ไม่สามารถสร้างบัญชีได้');

      const userId = authData.user.id;

      let verificationUrl = '';
      if (form.role === 'professor' && verificationFile) {
        const ext = verificationFile.name.split('.').pop();
        const path = `${userId}/verification.${ext}`;
        const { error: uploadError } = await supabase.storage.from('verification-images').upload(path, verificationFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('verification-images').getPublicUrl(path);
        verificationUrl = urlData.publicUrl;
      }

      let resumeUrl = '';
      if (form.role === 'professor' && resumeFile) {
        const path = `${userId}/resume.pdf`;
        const { error: uploadError } = await supabase.storage.from('resume-documents').upload(path, resumeFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('resume-documents').getPublicUrl(path);
        resumeUrl = urlData.publicUrl;
      }

      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: userId,
        first_name: form.firstName,
        last_name: form.lastName,
        username: form.username,
        email: form.email,
        experience: form.experience,
        verification_image_url: verificationUrl,
        resume_url: resumeUrl,
        portfolio_link: form.portfolioLink,
        status: form.role === 'professor' ? 'pending' : 'active',
      });
      if (profileError) throw profileError;

      const { error: roleError } = await supabase.from('user_roles').insert({
        user_id: userId,
        role: form.role,
      });
      if (roleError) throw roleError;

      await supabase.from('notifications').insert({
        user_id: userId,
        title: 'ยินดีต้อนรับ',
        message: form.role === 'professor'
          ? 'ยินดีต้อนรับสู่ ThaiSilk! บัญชีของคุณอยู่ระหว่างรอการอนุมัติจากผู้ดูแลระบบ'
          : 'ยินดีต้อนรับสู่ ThaiSilk! คุณสามารถเริ่มอัปโหลดลายผ้าได้เลย',
      });

      const { data: adminRoles } = await supabase.from('user_roles').select('user_id').eq('role', 'admin');
      if (adminRoles && adminRoles.length > 0) {
        const adminNotifs = adminRoles.map(r => ({
          user_id: r.user_id,
          title: form.role === 'professor' ? 'มีผู้สมัครผู้เชี่ยวชาญใหม่' : 'มีผู้สมัครสมาชิกใหม่',
          message: `${form.firstName} ${form.lastName} (${form.username}) ได้สมัครเข้ามาในระบบ`,
        }));
        await supabase.from('notifications').insert(adminNotifs);
      }

      if (form.role === 'professor') {
        await supabase.auth.signOut();
        toast.success('สมัครสำเร็จ! กรุณารอการอนุมัติจากผู้ดูแลระบบ');
        navigate('/login');
      } else {
        toast.success('สมัครสมาชิกสำเร็จ!');
        navigate('/dashboard/user');
      }
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFD]">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 p-8 md:p-12 w-full max-w-2xl transition-all">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#F5C144]/10 rounded-full mb-4">
              <UserCircle className="w-8 h-8 text-[#F5C144]" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-slate-900 tracking-tight">สมัครสมาชิก</h1>
            <p className="text-slate-500 text-sm mt-2">เข้าร่วมเป็นส่วนหนึ่งในการอนุรักษ์ลายผ้าไหมไทย</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ชื่อ-นามสกุล */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 text-left">
                <Label className="text-slate-700 font-bold ml-1">ชื่อจริง</Label>
                <Input required placeholder="สมชาย" className="h-11 rounded-xl bg-slate-50/50 border-slate-200" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div className="space-y-2 text-left">
                <Label className="text-slate-700 font-bold ml-1">นามสกุล</Label>
                <Input required placeholder="ใจดี" className="h-11 rounded-xl bg-slate-50/50 border-slate-200" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
              </div>
            </div>

            {/* Username & Email */}
            <div className="space-y-2 text-left">
              <Label className="text-slate-700 font-bold ml-1">ชื่อผู้ใช้ (Username)</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input required placeholder="username" className="h-11 pl-10 rounded-xl bg-slate-50/50 border-slate-200" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2 text-left">
              <Label className="text-slate-700 font-bold ml-1">อีเมล</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input type="email" required placeholder="example@mail.com" className="h-11 pl-10 rounded-xl bg-slate-50/50 border-slate-200" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2 text-left">
                <Label className="text-slate-700 font-bold ml-1">รหัสผ่าน</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input type={showPw ? 'text' : 'password'} required className="h-11 pl-10 pr-10 rounded-xl bg-slate-50/50 border-slate-200" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-left">
                <Label className="text-slate-700 font-bold ml-1">ยืนยันรหัสผ่าน</Label>
                <Input type="password" required className="h-11 rounded-xl bg-slate-50/50 border-slate-200" value={form.rePassword} onChange={e => setForm({ ...form, rePassword: e.target.value })} />
              </div>
            </div>
            {form.password && !passwordValid && (
              <p className="text-xs text-red-500 font-medium text-left">รหัสผ่านต้องมี 8 ตัวขึ้นไป และประกอบด้วยตัวอักษรและตัวเลข</p>
            )}

            {/* Role Selection */}
            <div className="space-y-3 pt-2">
              <Label className="text-slate-800 font-bold block text-center mb-4">เลือกประเภทบัญชี</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'user' })}
                  className={`flex flex-col items-center gap-3 py-5 rounded-2xl border-2 transition-all ${
                    form.role === 'user' ? 'border-[#F5C144] bg-[#F5C144]/5 ring-4 ring-[#F5C144]/10' : 'border-slate-100 bg-white text-slate-400'
                  }`}
                >
                  <div className={`p-3 rounded-full ${form.role === 'user' ? 'bg-[#F5C144] text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <User size={20} />
                  </div>
                  <span className={`text-sm font-bold ${form.role === 'user' ? 'text-[#F5C144]' : 'text-slate-500'}`}>ผู้ใช้งานทั่วไป</span>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'professor' })}
                  className={`flex flex-col items-center gap-3 py-5 rounded-2xl border-2 transition-all ${
                    form.role === 'professor' ? 'border-[#F5C144] bg-[#F5C144]/5 ring-4 ring-[#F5C144]/10' : 'border-slate-100 bg-white text-slate-400'
                  }`}
                >
                  <div className={`p-3 rounded-full ${form.role === 'professor' ? 'bg-[#F5C144] text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <GraduationCap size={20} />
                  </div>
                  <span className={`text-sm font-bold ${form.role === 'professor' ? 'text-[#F5C144]' : 'text-slate-500'}`}>ผู้เชี่ยวชาญ</span>
                </button>
              </div>
            </div>

            {/* Professor Fields */}
            {form.role === 'professor' && (
              <div className="space-y-5 p-6 bg-[#F5C144]/5 rounded-2xl border border-[#F5C144]/20 animate-in fade-in zoom-in-95 duration-300">
                <div className="space-y-2 text-left">
                  <Label className="flex items-center gap-2 text-slate-800 font-semibold italic"><Briefcase size={16} /> ประสบการณ์เกี่ยวกับผ้าไหม</Label>
                  <Textarea required placeholder="อธิบายประสบการณ์ของคุณ..." className="bg-white border-slate-200 min-h-[100px] rounded-xl" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} />
                </div>
                
                <div className="space-y-4 text-left">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-widest"><FileText size={14} /> อัปโหลดรูปยืนยัน</Label>
                    <Input type="file" accept="image/*" className="rounded-xl bg-white text-xs file:bg-[#2A4375] file:text-white file:border-0 file:px-3 file:py-1 cursor-pointer" onChange={e => setVerificationFile(e.target.files?.[0] || null)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-widest"><FileText size={14} /> ประวัติการทำงาน (PDF)</Label>
                    <Input type="file" accept=".pdf,application/pdf" className="rounded-xl bg-white text-xs file:bg-[#2A4375] file:text-white file:border-0 file:px-3 file:py-1 cursor-pointer" onChange={e => setResumeFile(e.target.files?.[0] || null)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider"><LinkIcon size={14} /> ลิงก์ผลงานอื่นๆ </Label>
                    <Input type="url" placeholder="https://..." className="rounded-xl border-slate-200 bg-white" value={form.portfolioLink} onChange={e => setForm({ ...form, portfolioLink: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full h-14 text-lg font-bold rounded-2xl bg-[#2A4375] hover:bg-[#1A3365] text-white shadow-lg transition-all transform active:scale-95" disabled={loading}>
              {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
             <p className="text-sm text-slate-500">
               มีบัญชีอยู่แล้ว? <Link to="/login" className="text-[#F5C144] font-bold hover:underline ml-1">เข้าสู่ระบบที่นี่</Link>
             </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Register;