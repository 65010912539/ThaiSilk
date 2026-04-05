import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardSidebar from '@/components/DashboardSidebar';
import StatCard from '@/components/StatCard';
import PatternCard from '@/components/PatternCard';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Image, CheckCircle, XCircle, Bell, User, FolderOpen, BookOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ISAN_PROVINCES } from '@/lib/provinces';
import { toast } from 'sonner';
import UserGuide from '@/pages/UserGuide';

const sidebarItems = [
  { label: 'แดชบอร์ด', path: '/dashboard/user', icon: FolderOpen },
  { label: 'อัปโหลดลาย', path: '/dashboard/user/upload', icon: Upload },
  { label: 'ลายของฉัน', path: '/dashboard/user/my-patterns', icon: Image },
  { label: 'การแจ้งเตือน', path: '/dashboard/user/notifications', icon: Bell },
  { label: 'โปรไฟล์', path: '/dashboard/user/profile', icon: User },
  { label: 'คู่มือการใช้งาน', path: '/dashboard/user/guide', icon: BookOpen },
];

const Overview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [recentPatterns, setRecentPatterns] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase.from('silk_patterns').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      const patterns = data || [];
      setRecentPatterns(patterns.slice(0, 6));
      setStats({
        total: patterns.length,
        pending: patterns.filter(p => p.status === 'pending').length,
        approved: patterns.filter(p => p.status === 'approved').length,
        rejected: patterns.filter(p => p.status === 'rejected').length,
      });
    };
    fetch();
  }, [user]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">แดชบอร์ดผู้ใช้</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="อัปโหลดทั้งหมด" value={stats.total} icon={Upload} color="navy" />
        <StatCard title="รอตรวจสอบ" value={stats.pending} icon={Image} color="gold" />
        <StatCard title="ผ่านแล้ว" value={stats.approved} icon={CheckCircle} color="green" />
        <StatCard title="ไม่ผ่าน" value={stats.rejected} icon={XCircle} color="red" />
      </div>
      {recentPatterns.length > 0 && (
        <>
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4">ลายผ้าล่าสุด</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentPatterns.map(p => <PatternCard key={p.id} {...p} linkPrefix="/dashboard/user/my-patterns" />)}
          </div>
        </>
      )}
    </div>
  );
};

const UploadPattern = () => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [province, setProvince] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files;
    if (!newFiles) return;
    const newFilesArr = Array.from(newFiles);
    setSelectedFiles(prev => [...prev, ...newFilesArr]);
    const newPreviews = newFilesArr.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (selectedFiles.length === 0) { toast.error('กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป'); return; }

    setLoading(true);
    try {
      const imageUrls: string[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const ext = file.name.split('.').pop();
        const path = `${user.id}/${Date.now()}_${i}.${ext}`;
        const { error } = await supabase.storage.from('silk-images').upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage.from('silk-images').getPublicUrl(path);
        imageUrls.push(data.publicUrl);
      }

      const { error } = await supabase.from('silk_patterns').insert({
        user_id: user.id,
        name,
        province: province || null,
        notes: notes || null,
        images: imageUrls,
      });
      if (error) throw error;

      // Logic แจ้งเตือนเดิมของมึง
      const { data: profRoles } = await supabase.from('user_roles').select('user_id').eq('role', 'professor');
      if (profRoles && profRoles.length > 0) {
        const notifications = profRoles.map(r => ({
          user_id: r.user_id,
          title: 'มีลายผ้าใหม่รอตรวจสอบ',
          message: `ผู้ใช้ได้อัปโหลดลาย "${name}" เข้ามาในระบบ`,
        }));
        await supabase.from('notifications').insert(notifications);
      }

      toast.success('อัปโหลดลายผ้าสำเร็จ!');
      setName(''); setProvince(''); setNotes(''); setSelectedFiles([]); setPreviews([]);
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in w-full ml-0">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground flex items-center gap-3">
          <Upload className="text-primary" />
          อัปโหลดลายผ้าใหม่
        </h1>
        <p className="text-muted-foreground mt-1">กรอกข้อมูลลายผ้าเพื่ออัปโหลด</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ฝั่งซ้าย: ส่วนอัปโหลดรูปภาพ */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="bg-card rounded-[2rem] shadow-card border border-border/50 p-8 h-full">
            <Label className="text-lg font-bold text-foreground mb-4 block flex items-center gap-2">
              <Image size={20} className="text-primary" />
              รูปภาพลายผ้า
            </Label>
            
            <div className="relative group border-2 border-dashed border-primary/20 rounded-2xl bg-muted/30 p-10 text-center transition-all hover:bg-muted/50 hover:border-primary/40">
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleFileChange} 
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
              />
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Upload size={24} />
                </div>
                <p className="text-sm font-bold text-foreground">คลิกหรือลากรูปภาพมาที่นี่</p>
                <p className="text-xs text-muted-foreground">รองรับ JPG, PNG (สูงสุดครั้งละหลายรูป)</p>
              </div>
            </div>

            {previews.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    รูปภาพที่เลือก ({selectedFiles.length})
                  </Label>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {previews.map((url, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-border">
                      <img src={url} alt="preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ฝั่งขวา: แบบฟอร์มข้อมูล */}
        <div className="lg:col-span-7 xl:col-span-6">
          <form onSubmit={handleUpload} className="bg-card rounded-[2rem] shadow-card border border-border/50 p-8 md:p-10 space-y-8 h-full">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-6 bg-primary rounded-full" />
              <h3 className="text-lg font-bold text-foreground">ข้อมูลรายละเอียดลายผ้า</h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">ชื่อลายผ้า</Label>
                <Input 
                  required 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="เช่น ลายลูกแก้ว, ลายสร้อยดอกหมาก"
                  className="rounded-xl h-12 bg-background border-border/60"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">แหล่งที่มา (จังหวัด)</Label>
                <Select value={province} onValueChange={setProvince}>
                  <SelectTrigger className="rounded-xl h-12 bg-background border-border/60">
                    <SelectValue placeholder="เลือกจังหวัดในภาคอีสาน" />
                  </SelectTrigger>
                  <SelectContent>
                    {ISAN_PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">หมายเหตุ / ประวัติความเป็นมา (ถ้ามี)</Label>
              <Textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                rows={6} 
                placeholder="ระบุรายละเอียดเพิ่มเติมเกี่ยวกับลายผ้า เช่น วิธีการทอ หรือความหมายของลาย..."
                className="resize-none rounded-2xl bg-background border-border/60 p-4 leading-relaxed"
              />
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full py-8 text-lg font-bold rounded-2xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    กำลังดำเนินการ...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle size={20} />
                    ยืนยันการส่งข้อมูลเพื่อตรวจสอบ
                  </div>
                )}
              </Button>
              <p className="text-[11px] text-center text-muted-foreground mt-4 italic">
                * ข้อมูลที่ท่านอัปโหลดจะถูกตรวจสอบโดยผู้เชี่ยวชาญก่อนนำไปแสดงในคลังลายผ้า
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const MyPatterns = () => {
  const { user } = useAuth();
  const [patterns, setPatterns] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('silk_patterns').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => setPatterns(data || []));
  }, [user]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">ลายของฉัน</h1>
      {patterns.length === 0 ? (
        <p className="text-muted-foreground">ยังไม่มีลายผ้าที่อัปโหลด</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {patterns.map(p => <PatternCard key={p.id} {...p} linkPrefix="/pattern" />)}
        </div>
      )}
    </div>
  );
};

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => setNotifications(data || []));
  }, [user]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">การแจ้งเตือน</h1>
      {notifications.length === 0 ? (
        <p className="text-muted-foreground">ไม่มีการแจ้งเตือน</p>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n.id} className={`bg-card p-4 rounded-lg shadow-card ${!n.is_read ? 'border-l-4 border-secondary' : ''}`}>
              <h3 className="font-heading font-semibold text-card-foreground">{n.title}</h3>
              <p className="text-sm text-muted-foreground">{n.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString('th-TH')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Profile = () => {
  const { profile, refreshProfile } = useAuth();
  const [bio, setBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await supabase.from('profiles').update({ bio }).eq('user_id', profile.user_id);
      await refreshProfile();
      toast.success('บันทึกโปรไฟล์สำเร็จ');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="animate-fade-in w-full ml-0">
      <h1 className="font-heading text-2xl font-bold text-foreground mb-8">โปรไฟล์</h1>
      
      {/* ปรับ Grid ให้ยืดตามคอนเทนต์ แต่ชิดซ้าย */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- ฝั่งซ้าย: Profile Card (กินพื้นที่ 4 จาก 12 ส่วน) --- */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          <div className="bg-card rounded-[2rem] shadow-card border border-border/50 p-8 text-center flex flex-col items-center justify-center space-y-5 h-full min-h-[350px]">
            <div className="relative">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary border-4 border-background shadow-sm">
                <User size={48} strokeWidth={1.5} />
              </div>
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-background rounded-full" />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">
                {profile.first_name} {profile.last_name}
              </h2>
              <p className="text-sm text-muted-foreground font-medium italic">@{profile.username}</p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-muted rounded-full">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                ผู้ใช้งานทั่วไป
              </span>
            </div>
          </div>
        </div>

        {/* --- ฝั่งขวา: ข้อมูลส่วนตัว (กินพื้นที่ 8 จาก 12 ส่วน) --- */}
        <div className="lg:col-span-8 xl:col-span-7">
          <div className="bg-card rounded-[2rem] shadow-card border border-border/50 overflow-hidden h-full">
            <div className="p-8 md:p-10 space-y-8">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                <h3 className="text-lg font-bold text-foreground">ข้อมูลรายละเอียด</h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">ชื่อผู้ใช้</Label>
                  <div className="font-semibold text-foreground p-4 bg-muted/30 rounded-2xl border border-border/40">
                    {profile.username}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">อีเมลติดต่อ</Label>
                  <div className="font-semibold text-foreground p-4 bg-muted/30 rounded-2xl border border-border/40">
                    {profile.email}
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Label className="text-sm font-bold text-foreground">คำอธิบายตัวเอง (Bio)</Label>
                <Textarea 
                  value={bio} 
                  onChange={e => setBio(e.target.value)} 
                  rows={6} 
                  placeholder="เขียนแนะนำตัวเองเพื่อให้คนอื่นรู้จักคุณ..."
                  className="resize-none rounded-2xl bg-background border-border/60 focus-visible:ring-primary/20 p-5 leading-relaxed shadow-sm"
                />
              </div>

              <div className="pt-4 flex justify-start">
                <Button 
                  onClick={handleSave} 
                  disabled={saving} 
                  className="w-full sm:w-auto px-14 py-7 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      กำลังบันทึก...
                    </div>
                  ) : (
                    'อัปเดตข้อมูลโปรไฟล์'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const { user, role, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center min-h-screen text-muted-foreground">กำลังโหลด...</div>;
  if (!user || role !== 'user') return <Navigate to="/login" />;

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar items={sidebarItems} title="User Dashboard" />
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <Routes>
          <Route index element={<Overview />} />
          <Route path="upload" element={<UploadPattern />} />
          <Route path="my-patterns" element={<MyPatterns />} />
          <Route path="my-patterns/:id" element={<MyPatterns />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="guide" element={<UserGuide />} />
        </Routes>
      </main>
    </div>
  );
};

export default UserDashboard;