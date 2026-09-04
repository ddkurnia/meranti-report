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
  doc,
  query,
  orderBy,
  addDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { Upload, Trash2, ImageOff, Copy, Loader2, Image, Film, LayoutGrid, FileVideo, ImageIcon } from 'lucide-react';
import type { MediaItem } from '@/types';

type FilterTab = 'all' | 'image' | 'video';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function AdminMediaPage() {
  const { toast } = useToast();
  const { firebaseUser, fetchWithAuth } = useAuth();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteItem, setDeleteItem] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

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

  // Filtered media by tab
  const filteredMedia = activeTab === 'all'
    ? media
    : media.filter((item) => item.resourceType === activeTab);

  const imageCount = media.filter((item) => item.resourceType === 'image').length;
  const videoCount = media.filter((item) => item.resourceType === 'video').length;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, resourceType: 'image' | 'video') => {
    const files = e.target.files;
    if (!files || files.length === 0 || !db) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus(`Mempersiapkan ${files.length} file...`);

    try {
      const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'tsgloc4b';
      const UPLOAD_PRESET = 'merantireport';
      const total = files.length;
      let completed = 0;
      let failedCount = 0;

      // Cloudinary endpoint: auto/upload auto-detects resource type (image/video)
      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        const pct = Math.round((completed / total) * 100);
        setUploadProgress(pct);
        setUploadStatus(`Mengunggah ${completed + 1} dari ${total}...`);

        try {
          const res = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            const mediaItem = {
              url: data.secure_url,
              secureUrl: data.secure_url,
              publicId: data.public_id,
              format: data.format || '',
              width: data.width || 0,
              height: data.height || 0,
              size: data.bytes || 0,
              resourceType: data.resource_type || resourceType,
              folder: data.folder || '',
              uploadedBy: firebaseUser?.uid || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await addDoc(collection(db, 'media'), mediaItem);
          } else {
            failedCount++;
            console.error('Upload failed for file:', file.name);
          }
        } catch (fileErr) {
          failedCount++;
          console.error('Upload error for file:', file.name, fileErr);
        }
        completed++;
        setUploadProgress(Math.round((completed / total) * 100));
      }

      if (failedCount === 0) {
        toast({ title: 'Berhasil', description: `${total} file berhasil diunggah.` });
      } else {
        toast({
          title: 'Selesai',
          description: `${total - failedCount} berhasil, ${failedCount} gagal.`,
          variant: failedCount === total ? 'destructive' : 'default',
        });
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast({ title: 'Gagal', description: 'Terjadi kesalahan saat upload.', variant: 'destructive' });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setUploadStatus('');
      if (imageInputRef.current) imageInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      // Use server API to delete from both Cloudinary AND Firestore
      const res = await fetchWithAuth(`/api/media/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menghapus media.');
      }

      toast({ title: 'Berhasil', description: 'Media berhasil dihapus dari server dan Cloudinary.' });
      setDeleteId(null);
      setDeleteItem(null);
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

  const isVideo = (item: MediaItem) => item.resourceType === 'video';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Media</h2>
          <p className="text-muted-foreground">Kelola foto dan video yang diunggah.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Hidden file inputs */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e, 'image')}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e, 'video')}
          />
          <Button
            variant="outline"
            onClick={() => videoInputRef.current?.click()}
            disabled={uploading}
          >
            <FileVideo className="mr-2 h-4 w-4" />
            Unggah Video
          </Button>
          <Button
            onClick={() => imageInputRef.current?.click()}
            disabled={uploading}
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Unggah Foto
          </Button>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="rounded-lg border bg-background p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{uploadStatus || 'Mengunggah...'}</span>
            <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {/* Filter Tabs */}
      {!loading && media.length > 0 && (
        <div className="flex items-center gap-2 border-b pb-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Semua
            <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">{media.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'image'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Image className="h-4 w-4" />
            Foto
            <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">{imageCount}</span>
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'video'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Film className="h-4 w-4" />
            Video
            <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">{videoCount}</span>
          </button>
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
      ) : filteredMedia.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ImageOff className="h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-semibold">
            {activeTab === 'all' ? 'Tidak Ada Media' : activeTab === 'image' ? 'Tidak Ada Foto' : 'Tidak Ada Video'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">Belum ada file yang diunggah.</p>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => videoInputRef.current?.click()}>
              <FileVideo className="mr-2 h-4 w-4" />
              Unggah Video
            </Button>
            <Button onClick={() => imageInputRef.current?.click()}>
              <ImageIcon className="mr-2 h-4 w-4" />
              Unggah Foto
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-lg border bg-background overflow-hidden transition-all"
            >
              {/* Preview */}
              <div className="aspect-square overflow-hidden bg-muted relative">
                {isVideo(item) ? (
                  <>
                    <video
                      src={item.secureUrl}
                      className="h-full w-full object-cover"
                      muted
                      preload="metadata"
                    />
                    {/* Video badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-white">
                      <Film className="h-3 w-3" />
                      <span className="text-[10px] font-medium">VIDEO</span>
                    </div>
                  </>
                ) : (
                  <img
                    src={item.secureUrl}
                    alt={item.publicId}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              {/* Info */}
              <div className="p-2 space-y-1">
                <p className="text-xs font-medium truncate">{item.publicId?.split('/').pop() || 'unknown'}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {item.width && item.height ? (
                    <span>{item.width} × {item.height}</span>
                  ) : null}
                  {item.size ? (
                    <span>{formatFileSize(item.size)}</span>
                  ) : null}
                </div>
                {/* Action Buttons - always visible */}
                <div className="flex items-center gap-1 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 flex-1 text-xs gap-1"
                    title="Salin URL"
                    onClick={() => copyUrl(item.secureUrl)}
                  >
                    <Copy className="h-3 w-3" />
                    Salin
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-7 flex-1 text-xs gap-1"
                    title="Hapus"
                    onClick={() => {
                      setDeleteId(item.id);
                      setDeleteItem(item);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                    Hapus
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) { setDeleteId(null); setDeleteItem(null); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Media?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteItem && (
                <span className="block mb-2">
                  File: <strong>{deleteItem.publicId?.split('/').pop()}</strong>
                  {deleteItem.size ? ` (${formatFileSize(deleteItem.size)})` : ''}
                </span>
              )}
              File akan dihapus secara permanen dari server dan Cloudinary. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {deleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
