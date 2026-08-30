'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { db, isFirebaseClientConfigured } from '@/lib/firebase/client';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  type Unsubscribe,
} from 'firebase/firestore';
import { Plus, Pencil, Trash2, Loader2, Users } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  position: string;
  photo?: string;
  bio?: string;
  email?: string;
  phone?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function AdminRedaksiPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPosition, setFormPosition] = useState('');
  const [formPhoto, setFormPhoto] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formFacebook, setFormFacebook] = useState('');
  const [formInstagram, setFormInstagram] = useState('');
  const [formTwitter, setFormTwitter] = useState('');
  const [formOrder, setFormOrder] = useState(0);
  const [formActive, setFormActive] = useState(true);

  // Realtime listener for team members
  useEffect(() => {
    if (!isFirebaseClientConfigured || !db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'team'), orderBy('order', 'asc'));
    let unsubscribe: Unsubscribe;

    try {
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as TeamMember[];
          setMembers(items);
          setLoading(false);
        },
        (err) => {
          console.error('Realtime team error:', err);
          toast.error('Gagal memuat data redaksi: ' + err.message);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Failed to setup team listener:', err);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const resetForm = useCallback(() => {
    setFormName('');
    setFormPosition('');
    setFormPhoto('');
    setFormBio('');
    setFormEmail('');
    setFormPhone('');
    setFormFacebook('');
    setFormInstagram('');
    setFormTwitter('');
    setFormOrder(0);
    setFormActive(true);
    setEditingId(null);
  }, []);

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (member: TeamMember) => {
    setEditingId(member.id);
    setFormName(member.name);
    setFormPosition(member.position);
    setFormPhoto(member.photo || '');
    setFormBio(member.bio || '');
    setFormEmail(member.email || '');
    setFormPhone(member.phone || '');
    setFormFacebook(member.facebook || '');
    setFormInstagram(member.instagram || '');
    setFormTwitter(member.twitter || '');
    setFormOrder(member.order);
    setFormActive(member.active);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast.error('Nama anggota wajib diisi.');
      return;
    }
    if (!formPosition.trim()) {
      toast.error('Posisi / jabatan wajib diisi.');
      return;
    }

    if (!db) {
      toast.error('Firebase tidak tersedia.');
      return;
    }

    setSubmitting(true);
    try {
      const now = new Date().toISOString();

      const payload = {
        name: formName.trim(),
        position: formPosition.trim(),
        photo: formPhoto.trim() || null,
        bio: formBio.trim() || null,
        email: formEmail.trim() || null,
        phone: formPhone.trim() || null,
        facebook: formFacebook.trim() || null,
        instagram: formInstagram.trim() || null,
        twitter: formTwitter.trim() || null,
        order: formOrder,
        active: formActive,
        updatedAt: now,
      };

      if (editingId) {
        await updateDoc(doc(db, 'team', editingId), payload);
        toast.success('Anggota redaksi berhasil diperbarui.');
      } else {
        await addDoc(collection(db, 'team'), {
          ...payload,
          createdAt: now,
        });
        toast.success('Anggota redaksi berhasil ditambahkan.');
      }

      setDialogOpen(false);
    } catch (err) {
      console.error('Error saving team member:', err);
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan anggota redaksi.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (member: TeamMember) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'team', member.id), {
        active: !member.active,
        updatedAt: new Date().toISOString(),
      });
      toast.success(member.active ? 'Anggota dinonaktifkan.' : 'Anggota diaktifkan.');
    } catch (err) {
      console.error('Error toggling active:', err);
      toast.error('Gagal mengubah status.');
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !db) return;
    setSubmitting(true);
    try {
      await deleteDoc(doc(db, 'team', deleteId));
      toast.success('Anggota redaksi berhasil dihapus.');
      setDeleteId(null);
    } catch (err) {
      console.error('Error deleting team member:', err);
      const msg = err instanceof Error ? err.message : 'Gagal menghapus anggota redaksi.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Redaksi</h2>
          <p className="text-muted-foreground">Kelola tim redaksi (editorial team).</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Anggota
        </Button>
      </div>

      {/* Content */}
      <div className="rounded-lg border bg-background">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-lg font-semibold">Tidak Ada Anggota</h3>
            <p className="mt-1 text-sm text-muted-foreground">Belum ada anggota redaksi terdaftar.</p>
            <Button className="mt-4" onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Anggota
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Foto</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Posisi</TableHead>
                    <TableHead className="w-[80px]">Urutan</TableHead>
                    <TableHead className="w-[90px]">Status</TableHead>
                    <TableHead className="w-[120px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow
                      key={member.id}
                      className={cn(!member.active && 'opacity-50')}
                    >
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.photo} alt={member.name} />
                          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{member.name}</div>
                        {member.email && (
                          <div className="text-xs text-muted-foreground">{member.email}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{member.position}</TableCell>
                      <TableCell className="text-center font-mono text-sm">{member.order}</TableCell>
                      <TableCell>
                        <Badge
                          variant={member.active ? 'default' : 'secondary'}
                          className={cn(
                            member.active
                              ? 'bg-green-100 text-green-700 hover:bg-green-100'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-100'
                          )}
                        >
                          {member.active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleToggleActive(member)}
                            title={member.active ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            <Switch
                              checked={member.active}
                              className="pointer-events-none"
                              onCheckedChange={() => {}}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(member)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden p-4 space-y-3">
              {members.map((member) => (
                <Card
                  key={member.id}
                  className={cn(!member.active && 'opacity-50')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage src={member.photo} alt={member.name} />
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium truncate">{member.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{member.position}</p>
                          </div>
                          <Badge
                            variant={member.active ? 'default' : 'secondary'}
                            className={cn(
                              'shrink-0',
                              member.active
                                ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-100'
                            )}
                          >
                            {member.active ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </div>
                        {member.email && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">{member.email}</p>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <Switch
                            checked={member.active}
                            onCheckedChange={() => handleToggleActive(member)}
                          />
                          <span className="text-xs text-muted-foreground">
                            {member.active ? 'Aktif' : 'Nonaktif'}
                          </span>
                          <div className="ml-auto flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditDialog(member)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Anggota Redaksi' : 'Tambah Anggota Redaksi'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="member-name">Nama *</Label>
              <Input
                id="member-name"
                placeholder="Nama lengkap"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            {/* Position */}
            <div className="space-y-2">
              <Label htmlFor="member-position">Posisi / Jabatan *</Label>
              <Input
                id="member-position"
                placeholder="Pemimpin Redaksi"
                value={formPosition}
                onChange={(e) => setFormPosition(e.target.value)}
              />
            </div>

            {/* Photo URL */}
            <div className="space-y-2">
              <Label htmlFor="member-photo">Foto URL</Label>
              <Input
                id="member-photo"
                placeholder="https://res.cloudinary.com/..."
                value={formPhoto}
                onChange={(e) => setFormPhoto(e.target.value)}
              />
              {formPhoto && (
                <div className="mt-2">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={formPhoto} alt={formName || 'Preview'} />
                    <AvatarFallback>{getInitials(formName || '?')}</AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="member-bio">Bio</Label>
              <Textarea
                id="member-bio"
                placeholder="Bio singkat anggota redaksi..."
                value={formBio}
                onChange={(e) => setFormBio(e.target.value)}
                rows={3}
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="member-email">Email</Label>
                <Input
                  id="member-email"
                  type="email"
                  placeholder="email@contoh.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-phone">Telepon</Label>
                <Input
                  id="member-phone"
                  type="tel"
                  placeholder="+62 812 3456 7890"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Social Media */}
            <div className="pt-2">
              <p className="text-sm font-medium mb-3">Media Sosial</p>
              <div className="space-y-2">
                <Input
                  placeholder="Facebook URL"
                  value={formFacebook}
                  onChange={(e) => setFormFacebook(e.target.value)}
                />
                <Input
                  placeholder="Instagram URL"
                  value={formInstagram}
                  onChange={(e) => setFormInstagram(e.target.value)}
                />
                <Input
                  placeholder="X (Twitter) URL"
                  value={formTwitter}
                  onChange={(e) => setFormTwitter(e.target.value)}
                />
              </div>
            </div>

            {/* Order & Active */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="member-order">Urutan Tampil</Label>
                <Input
                  id="member-order"
                  type="number"
                  min={0}
                  value={formOrder}
                  onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-6">
                <Label htmlFor="member-active" className="text-sm font-medium">
                  Aktif
                </Label>
                <Switch
                  id="member-active"
                  checked={formActive}
                  onCheckedChange={setFormActive}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? 'Update' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Anggota Redaksi?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Anggota redaksi akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
