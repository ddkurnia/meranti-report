'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { db, isFirebaseClientConfigured } from '@/lib/firebase/client';
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  orderBy,
  addDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { Upload, Trash2, ImageOff, Copy, Loader2 } from 'lucide-react';
import type { MediaItem } from '@/types';

export default function AdminMediaPage() {
  const { toast } = useToast();
  const { firebaseUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Realtime media listener
  useEffect(() => {
    if (!isFirebaseClientConfigured || !db) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'media'), orderBy('createdAt', 'desc'));
    let unsubscribe: Unsubscribe;
    try {
      unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as MediaItem[];
        setMedia(items);
        setLoading(false);
      }, (err) => {
        console.error('Realtime media error:', err);
        setLoading(false);
      });
    } catch (err) {
      console.error('Failed to setup media listener:', err);
      setLoading(false);
    }
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !db) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'tsgloc4b';
      const UPLOAD_PRESET = 'merantireport';
      const total = files.length;
      let completed = 0;

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        const pct = Math.round((completed / total) * 100);
        setUploadProgress(pct);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          const mediaItem = {
            url: data.secure_url,
            secureUrl: data.secure_url,
            publicId: data.public_id,
            format: data.format,
            width: data.width,
            height: data.height,
            size: data.bytes,
            resourceType: data.resource_type,
            uploadedBy: firebaseUser?.uid || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await addDoc(collection(db, 'media'), mediaItem);
        }
        completed++;
        setUploadProgress(Math.round((completed / total) * 100));
      }

      toast({ title: 'Berhasil', description: `${total} file berhasil diunggah.` });
    } catch (err) {
      console.error('Upload error:', err);
      toast({ title: 'Gagal', description: 'Terjadi kesalahan saat upload.', variant: 'destructive' });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !db) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'media', deleteId));
      toast({ title: 'Berhasil', description: 'Media berhasil dihapus.' });
      setDeleteId(null);
    } catch (err) {
      console.error('Error deleting media:', err);
      const msg = err instanceof Error ? err.message : 'Gagal menghapus media.';
      toast({ title: 'Gagal', description: msg, variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(
      () => toast({ title: 'Berhasil', description: 'URL berhasil disalin.' }),
      () => toast({ title: 'Gagal', description: 'Gagal menyalin URL.', variant: 'destructive' })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Media</h2>
          <p className="text-muted-foreground">Kelola file media yang diunggah.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? 'Mengunggah...' : 'Unggah'}
          </Button>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="rounded-lg border bg-background p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Mengunggah...</span>
            <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {/* Media Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : media.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ImageOff className="h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-semibold">Tidak Ada Media</h3>
          <p className="mt-1 text-sm text-muted-foreground">Belum ada file yang diunggah.</p>
          <Button className="mt-4" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Unggah File
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {media.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-lg border bg-background overflow-hidden hover:ring-2 ring-primary transition-all cursor-pointer"
              onClick={() => copyUrl(item.secureUrl)}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={item.secureUrl}
                  alt={item.publicId}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-2 space-y-0.5">
                <p className="text-xs font-medium truncate">{item.publicId.split('/').pop()}</p>
                <p className="text-xs text-muted-foreground">
                  {item.width} × {item.height}
                </p>
              </div>
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyUrl(item.secureUrl);
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(item.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Media?</AlertDialogTitle>
            <AlertDialogDescription>
              File media akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
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
