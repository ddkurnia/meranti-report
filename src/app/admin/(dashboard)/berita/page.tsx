'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Newspaper,
} from 'lucide-react';
import { formatNumber, formatDateShort } from '@/lib/utils';
import { db, isFirebaseClientConfigured } from '@/lib/firebase/client';
import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  type Unsubscribe,
} from 'firebase/firestore';
import type { Article, Category, ArticleStatus } from '@/types';

export default function AdminBeritaPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Realtime articles listener
  useEffect(() => {
    if (!isFirebaseClientConfigured || !db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'articles'), orderBy('updatedAt', 'desc'));
    let unsubscribe: Unsubscribe;

    try {
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as Article[];
          setAllArticles(items);
          setLoading(false);
        },
        (err) => {
          console.error('Realtime articles error:', err);
          toast({
            title: 'Error',
            description: 'Gagal memuat berita: ' + err.message,
            variant: 'destructive',
          });
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Failed to setup articles listener:', err);
      setLoading(false);
    }

    return () => { if (unsubscribe) unsubscribe(); };
  }, [toast]);

  // Realtime categories listener
  useEffect(() => {
    if (!isFirebaseClientConfigured || !db) return;

    const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
    let unsubscribe: Unsubscribe;

    try {
      unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Category[];
        setCategories(items);
      });
    } catch (err) {
      console.error('Failed to setup categories listener:', err);
    }

    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  // Client-side filtering and pagination
  const filteredArticles = useMemo(() => {
    let result = allArticles;

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((a) => a.categoryId === categoryFilter);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((a) =>
        (a.title || '').toLowerCase().includes(q) ||
        (a.excerpt || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [allArticles, statusFilter, categoryFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / limit));
  const articles = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredArticles.slice(start, start + limit);
  }, [filteredArticles, page]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [statusFilter, categoryFilter, search]);

  const handleDelete = async () => {
    if (!deleteId || !db) return;
    setDeleting(deleteId);
    try {
      await deleteDoc(doc(db, 'articles', deleteId));
      toast({ title: 'Berhasil', description: 'Berita berhasil dihapus.' });
    } catch (err) {
      console.error('Error deleting article:', err);
      const msg = err instanceof Error ? err.message : 'Gagal menghapus berita.';
      toast({ title: 'Gagal', description: msg, variant: 'destructive' });
    } finally {
      setDeleting(null);
      setDeleteId(null);
    }
  };

  const handleTogglePublish = async (article: Article) => {
    if (!db) return;
    const newStatus: ArticleStatus = article.status === 'published' ? 'draft' : 'published';
    const now = new Date().toISOString();
    try {
      const updateData: Record<string, unknown> = {
        status: newStatus,
        updatedAt: now,
      };
      if (newStatus === 'published') {
        updateData.publishedAt = now;
      }
      await updateDoc(doc(db, 'articles', article.id), updateData);
      toast({
        title: 'Berhasil',
        description: `Berita diubah ke ${newStatus === 'published' ? 'Published' : 'Draft'}.`,
      });
    } catch (err) {
      console.error('Error toggling publish:', err);
      const msg = err instanceof Error ? err.message : 'Gagal mengubah status berita.';
      toast({ title: 'Gagal', description: msg, variant: 'destructive' });
    }
  };

  const statusBadge = (status: ArticleStatus) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Published</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Berita</h2>
          <p className="text-muted-foreground">Kelola semua berita portal.</p>
        </div>
        <Button asChild>
          <Link href="/admin/berita/new">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Berita
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari berita..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-background">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Newspaper className="h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-lg font-semibold">Tidak Ada Berita</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Belum ada berita yang ditemukan.
            </p>
            <Button asChild className="mt-4">
              <Link href="/admin/berita/new">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Berita
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Judul</TableHead>
                    <TableHead className="hidden md:table-cell">Kategori</TableHead>
                    <TableHead className="hidden lg:table-cell">Author</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="hidden sm:table-cell text-right">Views</TableHead>
                    <TableHead className="hidden sm:table-cell">Tanggal</TableHead>
                    <TableHead className="w-[60px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        <Link
                          href={`/admin/berita/edit?id=${article.id}`}
                          className="font-medium hover:underline line-clamp-1 max-w-[250px] block"
                        >
                          {article.title}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{article.categoryName}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {article.authorName}
                      </TableCell>
                      <TableCell className="text-center">
                        {statusBadge(article.status)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right text-sm">
                        {formatNumber(article.views)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground whitespace-nowrap">
                        {formatDateShort(article.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Aksi</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/berita/edit?id=${article.id}`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTogglePublish(article)}>
                              {article.status === 'published' ? (
                                <>
                                  <EyeOff className="mr-2 h-4 w-4" />
                                  Unpublish
                                </>
                              ) : (
                                <>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Publish
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteId(article.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Halaman {page} dari {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Berita?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Berita akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={!!deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
