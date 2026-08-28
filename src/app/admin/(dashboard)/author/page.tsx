'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { useToast } from '@/hooks/use-toast';
import { generateSlug } from '@/lib/utils';
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
import { Plus, Pencil, Trash2, Loader2, PenTool } from 'lucide-react';
import type { Author } from '@/types';

export default function AdminAuthorPage() {
  const { toast } = useToast();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formPhoto, setFormPhoto] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formPosition, setFormPosition] = useState('');
  const [formFacebook, setFormFacebook] = useState('');
  const [formInstagram, setFormInstagram] = useState('');
  const [formTwitter, setFormTwitter] = useState('');

  // Realtime listener for authors
  useEffect(() => {
    if (!isFirebaseClientConfigured || !db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'authors'), orderBy('name', 'asc'));
    let unsubscribe: Unsubscribe;

    try {
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as Author[];
          setAuthors(items);
          setLoading(false);
        },
        (err) => {
          console.error('Realtime authors error:', err);
          toast({
            title: 'Error',
            description: 'Gagal memuat penulis: ' + err.message,
            variant: 'destructive',
          });
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Failed to setup authors listener:', err);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [toast]);

  const openCreateDialog = () => {
    setEditingId(null);
    setFormName('');
    setFormSlug('');
    setFormPhoto('');
    setFormBio('');
    setFormPosition('');
    setFormFacebook('');
    setFormInstagram('');
    setFormTwitter('');
    setDialogOpen(true);
  };

  const openEditDialog = (author: Author) => {
    setEditingId(author.id);
    setFormName(author.name);
    setFormSlug(author.slug);
    setFormPhoto(author.photo || '');
    setFormBio(author.bio || '');
    setFormPosition(author.position || '');
    setFormFacebook(author.facebook || '');
    setFormInstagram(author.instagram || '');
    setFormTwitter(author.twitter || '');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast({ title: 'Gagal', description: 'Nama penulis wajib diisi.', variant: 'destructive' });
      return;
    }

    if (!db) {
      toast({ title: 'Gagal', description: 'Firebase tidak tersedia.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const authorSlug = formSlug.trim() || generateSlug(formName);
      const now = new Date().toISOString();

      if (editingId) {
        await updateDoc(doc(db, 'authors', editingId), {
          name: formName.trim(),
          slug: authorSlug,
          photo: formPhoto.trim() || null,
          bio: formBio.trim() || null,
          position: formPosition.trim() || null,
          facebook: formFacebook.trim() || null,
          instagram: formInstagram.trim() || null,
          twitter: formTwitter.trim() || null,
          updatedAt: now,
        });
        toast({ title: 'Berhasil', description: 'Penulis berhasil diperbarui.' });
      } else {
        await addDoc(collection(db, 'authors'), {
          name: formName.trim(),
          slug: authorSlug,
          photo: formPhoto.trim() || null,
          bio: formBio.trim() || null,
          position: formPosition.trim() || null,
          facebook: formFacebook.trim() || null,
          instagram: formInstagram.trim() || null,
          twitter: formTwitter.trim() || null,
          createdAt: now,
          updatedAt: now,
        });
        toast({ title: 'Berhasil', description: 'Penulis berhasil ditambahkan.' });
      }

      setDialogOpen(false);
    } catch (err) {
      console.error('Error saving author:', err);
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan penulis.';
      toast({ title: 'Gagal', description: msg, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !db) return;
    setSubmitting(true);
    try {
      await deleteDoc(doc(db, 'authors', deleteId));
      toast({ title: 'Berhasil', description: 'Penulis berhasil dihapus.' });
      setDeleteId(null);
    } catch (err) {
      console.error('Error deleting author:', err);
      const msg = err instanceof Error ? err.message : 'Gagal menghapus penulis.';
      toast({ title: 'Gagal', description: msg, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Penulis</h2>
          <p className="text-muted-foreground">Kelola penulis berita.</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Penulis
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-background">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : authors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <PenTool className="h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-lg font-semibold">Tidak Ada Penulis</h3>
            <p className="mt-1 text-sm text-muted-foreground">Belum ada penulis terdaftar.</p>
            <Button className="mt-4" onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Penulis
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Foto</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead className="hidden sm:table-cell">Posisi</TableHead>
                  <TableHead className="w-[100px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {authors.map((author) => (
                  <TableRow key={author.id}>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={author.photo} alt={author.name} />
                        <AvatarFallback>
                          {author.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{author.name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {author.position || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(author)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(author.id)}
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
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Penulis' : 'Tambah Penulis'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="author-name">Nama *</Label>
              <Input
                id="author-name"
                placeholder="Nama penulis"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  if (!editingId) setFormSlug(generateSlug(e.target.value));
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author-slug">Slug</Label>
              <Input
                id="author-slug"
                placeholder="slug-penulis"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author-photo">Foto URL</Label>
              <Input
                id="author-photo"
                placeholder="https://..."
                value={formPhoto}
                onChange={(e) => setFormPhoto(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author-position">Posisi / Jabatan</Label>
              <Input
                id="author-position"
                placeholder="Wartawan Senior"
                value={formPosition}
                onChange={(e) => setFormPosition(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author-bio">Bio</Label>
              <Textarea
                id="author-bio"
                placeholder="Bio singkat penulis..."
                value={formBio}
                onChange={(e) => setFormBio(e.target.value)}
                rows={3}
              />
            </div>

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
            <AlertDialogTitle>Hapus Penulis?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Penulis akan dihapus secara permanen.
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
