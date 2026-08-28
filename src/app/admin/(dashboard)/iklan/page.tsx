'use client';

import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRealtimeAllAds } from '@/hooks/use-realtime';
import type { AdSlot } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Upload,
  Image as ImageIcon,
  ExternalLink,
  Megaphone,
  Pencil,
  Check,
  X,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';

const SLOT_META: Record<string, { label: string; description: string; typeLabel: string }> = {
  'slot-1': { label: 'Header Banner', description: 'Muncul di bawah header, sebelum konten utama', typeLabel: 'Leaderboard 728x90' },
  'slot-2': { label: 'Setelah Hero', description: 'Muncul setelah section hero berita utama', typeLabel: 'Leaderboard 728x90' },
  'slot-3': { label: 'In-Feed 1', description: 'Muncul di antara grid berita terbaru', typeLabel: 'Inline Responsif' },
  'slot-4': { label: 'Sidebar Atas', description: 'Muncul di bagian atas sidebar kanan', typeLabel: 'Sidebar 300x250' },
  'slot-5': { label: 'Sidebar Tengah', description: 'Muncul di tengah sidebar, setelah berita pilihan', typeLabel: 'Sidebar 300x250' },
  'slot-6': { label: 'Sidebar Bawah', description: 'Muncul di bawah sidebar', typeLabel: 'Sidebar 300x250' },
  'slot-7': { label: 'Tengah Halaman 1', description: 'Muncul setelah section berita populer', typeLabel: 'Leaderboard 728x90' },
  'slot-8': { label: 'Tengah Halaman 2', description: 'Muncul sebelum berita lainnya', typeLabel: 'Leaderboard 728x90' },
  'slot-9': { label: 'Sebelum Newsletter', description: 'Muncul sebelum section newsletter', typeLabel: 'Leaderboard 728x90' },
  'slot-10': { label: 'Footer Banner', description: 'Muncul sebelum footer', typeLabel: 'Banner Besar' },
};

const TYPE_COLORS: Record<string, string> = {
  leaderboard: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  sidebar: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  inline: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  banner: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
};

export default function IklanPage() {
  const { fetchWithAuth } = useAuth();
  const { ads, loading } = useRealtimeAllAds();
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local edit state
  const [editData, setEditData] = useState<Partial<AdSlot>>({});

  const startEdit = (ad: AdSlot) => {
    setEditingSlot(ad.id);
    setEditData({
      title: ad.title,
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl || '',
      altText: ad.altText || '',
      advertiserName: ad.advertiserName || '',
      active: ad.active,
    });
  };

  const cancelEdit = () => {
    setEditingSlot(null);
    setEditData({});
  };

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      // Upload langsung ke Cloudinary dari client (seperti halaman Media)
      const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'tsgloc4b';
      const UPLOAD_PRESET = 'merantireport';
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.error?.message || 'Upload gagal');
      setEditData((prev) => ({ ...prev, imageUrl: data.secure_url }));
      toast.success('Gambar berhasil diupload');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload gagal');
    } finally {
      setUploading(false);
    }
  }, []);

  const handleSave = async (ad: AdSlot) => {
    setSaving(true);
    try {
      const res = await fetchWithAuth('/api/ads', {
        method: 'PUT',
        body: JSON.stringify({ id: ad.id, ...editData }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan');
      toast.success('Iklan berhasil disimpan');
      setEditingSlot(null);
      setEditData({});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (ad: AdSlot) => {
    try {
      const res = await fetchWithAuth('/api/ads', {
        method: 'PUT',
        body: JSON.stringify({ id: ad.id, active: !ad.active }),
      });
      if (!res.ok) throw new Error('Gagal mengubah status');
      toast.success(ad.active ? 'Iklan dinonaktifkan' : 'Iklan diaktifkan');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengubah status');
    }
  };

  const handleRemoveImage = () => {
    setEditData((prev) => ({ ...prev, imageUrl: '' }));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-red-600" />
            Manajemen Iklan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola 10 slot iklan di halaman utama. Upload gambar, atur link, dan aktifkan/nonaktifkan.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {ads.filter((a) => a.active && a.imageUrl).length} / {ads.length} aktif
        </div>
      </div>

      <Separator />

      {/* Ad Slots Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {ads.map((ad) => {
          const meta = SLOT_META[ad.slotId] || { label: ad.title, description: '', typeLabel: ad.type };
          const isEditing = editingSlot === ad.id;
          const hasImage = !!(isEditing ? editData.imageUrl : ad.imageUrl);
          const isActive = isEditing ? editData.active : ad.active;

          return (
            <Card key={ad.id} className={`overflow-hidden transition-all duration-200 ${!isActive ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{ad.slotId}</span>
                      <Badge variant="outline" className={TYPE_COLORS[ad.type] || ''}>
                        {meta.typeLabel}
                      </Badge>
                      {isActive && hasImage && (
                        <Badge className="bg-green-500 text-white hover:bg-green-500">Aktif</Badge>
                      )}
                    </div>
                    <CardTitle className="text-base">{meta.label}</CardTitle>
                    <CardDescription className="text-xs mt-0.5">{meta.description}</CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isEditing && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleToggleActive(ad)}
                        title={ad.active ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        {ad.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </Button>
                    )}
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(ad)}
                        className="h-8"
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => handleSave(ad)}
                          disabled={saving}
                          className="h-8 bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />
                          {saving ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={cancelEdit}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {isEditing ? (
                  <>
                    {/* Image Upload Area */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Gambar Iklan</Label>
                      {hasImage ? (
                        <div className="relative rounded-lg overflow-hidden border">
                          <img
                            src={editData.imageUrl}
                            alt="Preview iklan"
                            className="w-full h-40 object-contain bg-gray-50 dark:bg-gray-900"
                          />
                          {/* Overlay buttons - always visible */}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              className="h-8 text-xs bg-white text-gray-800 hover:bg-gray-100"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploading}
                            >
                              <Upload className="h-3.5 w-3.5 mr-1" />
                              {uploading ? 'Mengupload...' : 'Ganti'}
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={handleRemoveImage}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Hapus
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {uploading ? (
                            <div className="flex flex-col items-center gap-2">
                              <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
                              <span className="text-xs text-muted-foreground">Mengupload...</span>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                              <p className="text-sm text-muted-foreground mt-2">
                                Klik untuk upload gambar
                              </p>
                              <p className="text-xs text-muted-foreground">
                                JPG, PNG, WebP, GIF
                              </p>
                            </>
                          )}
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload(file);
                          e.target.value = '';
                        }}
                      />
                    </div>

                    {/* Advertiser Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor={`advertiser-${ad.id}`} className="text-xs font-medium">
                        Nama Pengiklan <span className="text-muted-foreground font-normal">(opsional)</span>
                      </Label>
                      <Input
                        id={`advertiser-${ad.id}`}
                        placeholder="Contoh: Toko ABC"
                        value={editData.advertiserName || ''}
                        onChange={(e) => setEditData((p) => ({ ...p, advertiserName: e.target.value }))}
                        className="h-8 text-sm"
                      />
                    </div>

                    {/* Link URL */}
                    <div className="space-y-1.5">
                      <Label htmlFor={`link-${ad.id}`} className="text-xs font-medium flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        Link Tujuan <span className="text-muted-foreground font-normal">(opsional)</span>
                      </Label>
                      <Input
                        id={`link-${ad.id}`}
                        type="url"
                        placeholder="https://contoh.com"
                        value={editData.linkUrl || ''}
                        onChange={(e) => setEditData((p) => ({ ...p, linkUrl: e.target.value }))}
                        className="h-8 text-sm"
                      />
                    </div>

                    {/* Alt Text */}
                    <div className="space-y-1.5">
                      <Label htmlFor={`alt-${ad.id}`} className="text-xs font-medium">
                        Alt Text <span className="text-muted-foreground font-normal">(opsional)</span>
                      </Label>
                      <Input
                        id={`alt-${ad.id}`}
                        placeholder="Deskripsi singkat gambar"
                        value={editData.altText || ''}
                        onChange={(e) => setEditData((p) => ({ ...p, altText: e.target.value }))}
                        className="h-8 text-sm"
                      />
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Label htmlFor={`active-${ad.id}`} className="text-sm font-medium">
                        Tampilkan Iklan
                      </Label>
                      <Switch
                        id={`active-${ad.id}`}
                        checked={editData.active !== false}
                        onCheckedChange={(checked) => setEditData((p) => ({ ...p, active: checked }))}
                      />
                    </div>
                  </>
                ) : (
                  /* Read-only view */
                  <>
                    {hasImage ? (
                      <div className="rounded-lg overflow-hidden border">
                        <img
                          src={ad.imageUrl}
                          alt={ad.altText || ad.title}
                          className="w-full h-40 object-contain bg-gray-50 dark:bg-gray-900"
                        />
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground/40" />
                        <p className="text-xs text-muted-foreground mt-2">
                          Belum ada gambar iklan
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      {ad.advertiserName && (
                        <div>
                          <span className="font-medium">Pengiklan:</span> {ad.advertiserName}
                        </div>
                      )}
                      {ad.linkUrl && (
                        <div className="truncate">
                          <span className="font-medium">Link:</span>{' '}
                          <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            {ad.linkUrl}
                          </a>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
