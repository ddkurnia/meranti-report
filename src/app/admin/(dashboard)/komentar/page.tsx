'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { truncateText, formatDate } from '@/lib/utils';
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
import {
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Trash2,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';
import type { Comment, CommentStatus } from '@/types';

export default function AdminKomentarPage() {
  const { toast } = useToast();
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Realtime listener for comments
  useEffect(() => {
    if (!isFirebaseClientConfigured || !db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'));
    let unsubscribe: Unsubscribe;

    try {
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              ...data,
              createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || '',
            } as Comment;
          });
          setAllComments(items);
          setLoading(false);
        },
        (err) => {
          console.error('Realtime comments error:', err);
          toast({
            title: 'Error',
            description: 'Gagal memuat komentar: ' + err.message,
            variant: 'destructive',
          });
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Failed to setup comments listener:', err);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [toast]);

  // Client-side filtering
  const comments = useMemo(() => {
    if (statusFilter === 'all') return allComments;
    return allComments.filter((c) => c.status === statusFilter);
  }, [allComments, statusFilter]);

  const updateStatus = async (id: string, newStatus: CommentStatus) => {
    if (!db) {
      toast({ title: 'Gagal', description: 'Firebase tidak tersedia.', variant: 'destructive' });
      return;
    }
    try {
      await updateDoc(doc(db, 'comments', id), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      toast({ title: 'Berhasil', description: `Status komentar diperbarui ke ${newStatus}.` });
    } catch (err) {
      console.error('Error updating comment:', err);
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui komentar.';
      toast({ title: 'Gagal', description: msg, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!db) {
      toast({ title: 'Gagal', description: 'Firebase tidak tersedia.', variant: 'destructive' });
      return;
    }
    try {
      await deleteDoc(doc(db, 'comments', id));
      toast({ title: 'Berhasil', description: 'Komentar berhasil dihapus.' });
    } catch (err) {
      console.error('Error deleting comment:', err);
      const msg = err instanceof Error ? err.message : 'Gagal menghapus komentar.';
      toast({ title: 'Gagal', description: msg, variant: 'destructive' });
    }
  };

  const statusBadge = (status: CommentStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">Rejected</Badge>;
      case 'spam':
        return <Badge variant="outline">Spam</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Komentar</h2>
          <p className="text-muted-foreground">Moderasi komentar pengunjung.</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="spam">Spam</SelectItem>
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
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-lg font-semibold">Tidak Ada Komentar</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Belum ada komentar.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden lg:table-cell">Artikel</TableHead>
                  <TableHead>Penulis</TableHead>
                  <TableHead className="hidden md:table-cell">Komentar</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Tanggal</TableHead>
                  <TableHead className="w-[60px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-[150px] truncate">
                      {comment.articleId}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{comment.authorName}</p>
                        {comment.authorEmail && (
                          <p className="text-xs text-muted-foreground">{comment.authorEmail}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[250px]">
                      {truncateText(comment.content, 80)}
                    </TableCell>
                    <TableCell className="text-center">
                      {statusBadge(comment.status)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(comment.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => updateStatus(comment.id, 'approved')}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(comment.id, 'rejected')}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(comment.id, 'spam')}>
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Tandai Spam
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(comment.id)}
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
        )}
      </div>
    </div>
  );
}
