import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { User, Lock, LogIn } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user && role) {
      if (role === 'admin') navigate('/dashboard/admin', { replace: true });
      else if (role === 'professor') navigate('/dashboard/professor', { replace: true });
      else navigate('/dashboard/user', { replace: true });
    }
  }, [user, role, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, status, user_id')
        .eq('username', username)
        .maybeSingle();

      if (!profile) {
        toast.error('ไม่พบชื่อผู้ใช้นี้');
        setLoading(false);
        return;
      }

      if (profile.status === 'suspended') {
        toast.error('บัญชีของคุณถูกระงับ กรุณาติดต่อผู้ดูแลระบบ');
        setLoading(false);
        return;
      }

      if (profile.status === 'pending') {
        toast.error('บัญชีของคุณอยู่ระหว่างรอการอนุมัติจากผู้ดูแลระบบ');
        setLoading(false);
        return;
      }

      if (profile.status === 'rejected') {
        toast.error('บัญชีของคุณถูกปฏิเสธ กรุณาติดต่อผู้ดูแลระบบ');
        setLoading(false);
        return;
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password,
      });

      if (authError) {
        toast.error('รหัสผ่านไม่ถูกต้อง');
        setLoading(false);
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', profile.user_id)
        .single();

      const role = roleData?.role;
      toast.success('เข้าสู่ระบบสำเร็จ!');

      if (role === 'admin') navigate('/dashboard/admin');
      else if (role === 'professor') navigate('/dashboard/professor');
      else navigate('/dashboard/user');
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
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 w-full max-w-md transition-all">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#F5C144]/10 rounded-full mb-4">
              <LogIn className="w-8 h-8 text-[#F5C144]" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-slate-900 tracking-tight">เข้าสู่ระบบ</h1>
            <p className="text-slate-500 text-sm mt-2"></p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium ml-1">ชื่อผู้ใช้ (Username)</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input 
                  required 
                  placeholder="กรอกชื่อผู้ใช้ของคุณ"
                  className="h-11 pl-10 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-all" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <Label className="text-slate-700 font-medium">รหัสผ่าน</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  className="h-11 pl-10 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-all" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg bg-[#2A4375] hover:bg-[#1A3365] text-white shadow-[#2A4375]/20 transition-all transform hover:-translate-y-1 active:translate-y-0" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <LogIn size={20} />
                  เข้าสู่ระบบ
                </div>
              )}
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <p className="text-sm text-slate-500">
              ยังไม่มีบัญชี? <Link to="/register" className="text-[#F5C144] font-bold hover:underline ml-1 transition-colors">สมัครสมาชิกที่นี่</Link>
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;