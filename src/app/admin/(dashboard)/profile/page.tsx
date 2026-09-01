'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { auth, isFirebaseClientConfigured } from '@/lib/firebase/client';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, ShieldCheck, KeyRound, User, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' };

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return { score: 25, label: 'Lemah', color: 'bg-red-500' };
  if (score <= 4) return { score: 50, label: 'Cukup', color: 'bg-yellow-500' };
  if (score <= 5) return { score: 75, label: 'Kuat', color: 'bg-blue-500' };
  return { score: 100, label: 'Sangat Kuat', color: 'bg-green-500' };
}

export default function AdminProfilePage() {
  const { user, firebaseUser } = useAuth();
  const { toast } = useToast();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);

  const initials = user?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U';

  const roleLabel = (user?.role || "unknown").replace(/_/g, " ").replace(/\w/g, (c) => c.toUpperCase());

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!oldPassword.trim()) {
      e.oldPassword = 'Password lama wajib diisi.';
    }

    if (!newPassword) {
      e.newPassword = 'Password baru wajib diisi.';
    } else if (newPassword.length < 6) {
      e.newPassword = 'Password baru minimal 6 karakter.';
    } else if (newPassword === oldPassword) {
      e.newPassword = 'Password baru harus berbeda dari password lama.';
    }

    if (!confirmPassword) {
      e.confirmPassword = 'Konfirmasi password wajib diisi.';
    } else if (newPassword !== confirmPassword) {
      e.confirmPassword = 'Konfirmasi password tidak cocok.';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validate()) return;
    if (!firebaseUser || !isFirebaseClientConfigured || !auth) {
      toast({ title: 'Error', description: 'Firebase tidak tersedia.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Step 1: Re-authenticate with old password to verify it's correct
      const email = firebaseUser.email;
      if (!email) throw new Error('Email tidak tersedia.');

      await signInWithEmailAndPassword(auth, email, oldPassword);

      // Step 2: Call API to update password via Admin SDK
      const token = await firebaseUser.getIdToken(true);
      const res = await fetch('/api/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Gagal mengubah password.');
      }

      // Step 3: Success - clear form and show toast
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});

      toast({
        title: 'Berhasil',
        description: 'Password berhasil diubah. Gunakan password baru saat login berikutnya.',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengubah password.';

      if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password') || message.includes('INVALID_LOGIN_CREDENTIALS')) {
        setErrors((prev) => ({ ...prev, oldPassword: 'Password lama salah.' }));
        toast({ title: 'Gagal', description: 'Password lama salah.', variant: 'destructive' });
      } else if (message.includes('too-many-requests') || message.includes('TOO_MANY_ATTEMPTS')) {
        toast({ title: 'Terlalu Banyak Percobaan', description: 'Akun terkunci sementara. Coba lagi nanti.', variant: 'destructive' });
      } else {
        toast({ title: 'Gagal', description: message, variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profil Akun</h2>
        <p className="text-muted-foreground">Kelola informasi akun dan keamanan password Anda.</p>
      </div>

      {/* Profile Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Akun</CardTitle>
          <CardDescription>Detail akun admin Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.photoURL} alt={user?.displayName} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{user?.displayName || 'Tanpa Nama'}</h3>
                <Badge variant="secondary" className="text-xs">
                  {roleLabel}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span>{user?.email}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Ganti Password</CardTitle>
          </div>
          <CardDescription>
            Pastikan password baru kuat dan tidak mudah ditebak. Minimal 6 karakter.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Old Password */}
          <div className="space-y-2">
            <Label htmlFor="old-password">Password Lama</Label>
            <div className="relative">
              <Input
                id="old-password"
                type={showOld ? 'text' : 'password'}
                placeholder="Masukkan password lama"
                value={oldPassword}
                onChange={(e) => {
                  setOldPassword(e.target.value);
                  if (errors.oldPassword) setErrors((prev) => { const n = { ...prev }; delete n.oldPassword; return n; });
                }}
                className={errors.oldPassword ? 'border-destructive pr-10' : 'pr-10'}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.oldPassword && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.oldPassword}
              </p>
            )}
          </div>

          <Separator />

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="new-password">Password Baru</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNew ? 'text' : 'password'}
                placeholder="Masukkan password baru"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) setErrors((prev) => { const n = { ...prev }; delete n.newPassword; return n; });
                }}
                className={errors.newPassword ? 'border-destructive pr-10' : 'pr-10'}
                autoComplete="new-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.newPassword}
              </p>
            )}

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Kekuatan password</span>
                  <span className={strength.score <= 25 ? 'text-red-500 font-medium' : strength.score <= 50 ? 'text-yellow-600 font-medium' : strength.score <= 75 ? 'text-blue-600 font-medium' : 'text-green-600 font-medium'}>
                    {strength.label}
                  </span>
                </div>
                <Progress value={strength.score} className="h-1.5" />
                {strength.score < 75 && newPassword.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Gunakan kombinasi huruf besar, kecil, angka, dan simbol untuk password lebih kuat.
                  </p>
                )}
                {strength.score >= 75 && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Password sudah cukup kuat.
                  </p>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Ulangi password baru"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => { const n = { ...prev }; delete n.confirmPassword; return n; });
                }}
                className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                autoComplete="new-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <Separator />

          {/* Security Notice */}
          <Alert>
            <ShieldCheck className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Password disimpan dengan aman menggunakan enkripsi Firebase Authentication.
              Setelah mengubah password, Anda perlu login ulang di perangkat lain.
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleChangePassword}
              disabled={loading || !oldPassword || !newPassword || !confirmPassword}
              className="min-w-[140px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Ganti Password
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
