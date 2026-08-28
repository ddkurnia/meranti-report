'use client';

import { useState, useCallback, useEffect } from 'react';
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
  DialogDescription,
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
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRealtimeCategories } from '@/hooks/use-realtime';
import { generateSlug } from '@/lib/utils';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  FolderOpen,
  GripVertical,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
} from 'lucide-react';
import type { Category } from '@/types';

export default function AdminKategoriPage() {
  const { toast } = useToast();
  const { fetchWithAuth } = useAuth();
  const { categories, loading } = useRealtimeCategories();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteArticleCount, setDeleteArticleCount] = useState<number | null>(null);
  const [checkingDelete, setCheckingDelete] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formOrder, setFormOrder] = useState(0);

  // Filter categories by search
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateDialog = () => {
    setEditingId(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormOrder(categories.length > 0 ? Math.max(...categories.map((c) => c.order || 0)) + 1 : 1);
    setDialogOpen(true);
  };

  const openEditDialog = (cat: Category) => {
    setEditingId(cat.id);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDescription(cat.description || '');
    setFormOrder(cat.order || 0);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast({ title: 'Gagal', description: 'Nama kategori wajib diisi.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const categorySlug = formSlug.trim() || generateSlug(formName);
      const payload = {
        name: formName.trim(),
        slug: categorySlug,
        description: formDescription.trim() || null,
        order: formOrder,
      };

      if (editingId) {
        const res = await fetchWithAuth(`/api/categories/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Gagal memperbarui kategori');
        }
        toast({ title: 'Berhasil', description: 'Kategori berhasil diperbarui.' });
      } else {
        const res = await fetchWithAuth('/api/categories', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Gagal menambahkan kategori');
        }
        toast({ title: 'Berhasil', description: 'Kategori berhasil ditambahkan.' });
      }

      setDialogOpen(false);
    } catch (err) {
      console.error('Error saving category:', err);
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan kategori.';
      toast({ title: 'Gagal', description: msg, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = async (cat: Category) => {
    setDeleteTarget(cat);
    setDeleteArticleCount(null);
    setCheckingDelete(true);
    try {
      // Check how many published articles use this category
      const res = await fetch(`/api/articles?categoryId=${cat.id}&limit=1`);
      if (res.ok) {
        const data = await res.json();
        setDeleteArticleCount(data.pagination?.total || 0);
      }
    } catch {
      setDeleteArticleCount(0);
    } finally {
      setCheckingDelete(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await fetchWithAuth(`/api/categories/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Gagal menghapus kategori');
      }
      toast({ title: 'Berhasil', description: 'Kategori berhasil dihapus.' });
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting category:', err);
      const msg = err instanceof Error ? err.message : 'Gagal menghapus kategori.';
      toast({ title: 'Gagal', description: msg, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  // Move category order up/down
  const handleMoveOrder = async (cat: Category, direction: 'up' | 'down') => {
    const sorted = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
    const idx = sorted.findIndex((c) => c.id === cat.id);
    if (idx === -1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const swapCat = sorted[swapIdx];
    setSubmitting(true);
    try {
      await Promise.all([
        fetchWithAuth(`/api/categories/${cat.id}`, {
          method: 'PUT',
          body: JSON.stringify({ order: swapCat.order || 0 }),
        }),
        fetchWithAuth(`/api/categories/${swapCat.id}`, {
          method: 'PUT',
          body: JSON.stringify({ order: cat.order || 0 }),
        }),
      ]);
    } catch (err) {
      console.error('Error reordering:', err);
      toast({ title: 'Gagal', description: 'Gagal mengubah urutan.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kategori</h2>
          <p className="text-muted-foreground">
            Kelola kategori berita. Total: <span className="font-medium text-foreground">{categories.length}</span> kategori
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari kategori..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-background">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-lg font-semibold">
              {searchQuery ? 'Tidak Ditemukan' : 'Tidak Ada Kategori'}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery
                ? `Tidak ada kategori yang cocok dengan "${searchQuery}"`
                : 'Belum ada kategori. Buat kategori pertama Anda.'}
            </p>
            {!searchQuery && (
              <Button className="mt-4" onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Kategori
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead className="hidden md:table-cell">Slug</TableHead>
                  <TableHead className="text-center">Artikel</TableHead>
                  <TableHead className="text-center w-[140px]">Urutan</TableHead>
                  <TableHead className="w-[120px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((cat, index) => (
                  <TableRow key={cat.id}>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{cat.name}</span>
                        {cat.description && (
                          <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5 max-w-[200px]">
                            {cat.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{cat.slug}</code>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={cat.articleCount > 0 ? 'default' : 'secondary'} className="font-mono">
                        {cat.articleCount || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleMoveOrder(cat, 'up')}
                          disabled={index === 0 || submitting}
                        >
                          <ArrowUpDown className="h-3.5 w-3.5" />
                        </Button>
                        <span className="text-sm font-mono w-6 text-center">{cat.order || 0}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleMoveOrder(cat, 'down')}
                          disabled={index === filteredCategories.length - 1 || submitting}
                        >
                          <ArrowUpDown className="h-3.5 w-3.5 rotate-180" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(cat)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(cat)}
                          title="Hapus"
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}</DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Perbarui informasi kategori berita.'
                : 'Isi detail untuk kategori berita baru.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cat-name">
                Nama Kategori <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cat-name"
                placeholder="Contoh: Politik, Olahraga, Kesehatan"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  if (!editingId) setFormSlug(generateSlug(e.target.value));
                }}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-slug">Slug URL</Label>
              <Input
                id="cat-slug"
                placeholder="slug-kategori (auto-dari nama)"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Akan otomatis dibuat dari nama jika dikosongkan.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Deskripsi</Label>
              <Textarea
                id="cat-desc"
                placeholder="Deskripsi singkat tentang kategori ini (opsional)"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-order">Urutan Tampil</Label>
              <Input
                id="cat-order"
                type="number"
                min={0}
                value={formOrder}
                onChange={(e) => setFormOrder(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Angka lebih kecil = tampil lebih dulu.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !formName.trim()}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? 'Perbarui' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Hapus Kategori &quot;{deleteTarget?.name}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Tindakan ini tidak dapat dibatalkan. Kategori akan dihapus secara permanen.</p>
                {checkingDelete ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memeriksa artikel...
                  </div>
                ) : deleteArticleCount !== null && deleteArticleCount > 0 ? (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      Peringatan: {deleteArticleCount} artikel menggunakan kategori ini
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Artikel tidak akan dihapus, tetapi akan kehilangan kategorinya.
                    </p>
                  </div>
                ) : deleteArticleCount === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    Aman dihapus — tidak ada artikel dalam kategori ini.
                  </div>
                ) : null}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting || checkingDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
