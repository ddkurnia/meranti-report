'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Save } from 'lucide-react';
import type { SiteSettings } from '@/types';

const defaultSettings: SiteSettings = {
  general: {
    siteName: 'Meranti Report',
    tagline: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    logo: '',
    favicon: '',
  },
  appearance: {
    primaryColor: '#000000',
    accentColor: '#f59e0b',
    darkMode: false,
    layout: 'default',
  },
  homepage: {
    latestNewsCount: 10,
    popularNewsCount: 5,
    showBreakingNews: true,
    showGallery: false,
    showVideo: false,
    showNewsletter: true,
  },
  socialMedia: {
    facebook: '',
    instagram: '',
    tiktok: '',
    youtube: '',
    whatsapp: '',
    twitter: '',
  },
  seo: {
    defaultTitle: '',
    metaDescription: '',
    ogImage: '',
    googleVerification: '',
    robotsConfig: 'User-agent: *\nAllow: /',
  },
  advertisement: {
    headerAd: { enabled: false, script: '', image: '', link: '' },
    homepageAd: { enabled: false, script: '', image: '', link: '' },
    articleAd: { enabled: false, script: '', image: '', link: '' },
    sidebarAd: { enabled: false, script: '', image: '', link: '' },
  },
  comments: {
    enabled: true,
    requireApproval: true,
  },
};

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const { fetchWithAuth } = useAuth();
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.data) {
            setSettings(data.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const saveSection = async (section: string) => {
    setSaving(section);
    try {
      const res = await fetchWithAuth('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast({ title: 'Berhasil', description: 'Pengaturan berhasil disimpan.' });
      } else {
        toast({ title: 'Gagal', description: 'Gagal menyimpan pengaturan.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Gagal', description: 'Terjadi kesalahan.', variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  const updateGeneral = (key: keyof SiteSettings['general'], value: string) => {
    setSettings((prev) => ({ ...prev, general: { ...prev.general, [key]: value } }));
  };

  const updateAppearance = (key: keyof SiteSettings['appearance'], value: string | boolean) => {
    setSettings((prev) => ({ ...prev, appearance: { ...prev.appearance, [key]: value } }));
  };

  const updateHomepage = (key: keyof SiteSettings['homepage'], value: number | boolean) => {
    setSettings((prev) => ({ ...prev, homepage: { ...prev.homepage, [key]: value } }));
  };

  const updateSocial = (key: keyof SiteSettings['socialMedia'], value: string) => {
    setSettings((prev) => ({ ...prev, socialMedia: { ...prev.socialMedia, [key]: value } }));
  };

  const updateSeo = (key: keyof SiteSettings['seo'], value: string) => {
    setSettings((prev) => ({ ...prev, seo: { ...prev.seo, [key]: value } }));
  };

  const updateAd = (adKey: keyof SiteSettings['advertisement'], field: string, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      advertisement: {
        ...prev.advertisement,
        [adKey]: { ...prev.advertisement[adKey], [field]: value },
      },
    }));
  };

  const updateComments = (key: keyof SiteSettings['comments'], value: boolean) => {
    setSettings((prev) => ({ ...prev, comments: { ...prev.comments, [key]: value } }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  const SaveButton = ({ section }: { section: string }) => (
    <Button
      onClick={() => saveSection(section)}
      disabled={saving === section}
      className="ml-auto"
    >
      {saving === section ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Save className="mr-2 h-4 w-4" />
      )}
      Simpan
    </Button>
  );

  const AdSection = ({
    label,
    adKey,
  }: {
    label: string;
    adKey: keyof SiteSettings['advertisement'];
  }) => {
    const ad = settings.advertisement[adKey];
    return (
      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{label}</h4>
          <Switch
            checked={ad.enabled}
            onCheckedChange={(v) => updateAd(adKey, 'enabled', v)}
          />
        </div>
        {ad.enabled && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Script</Label>
              <Textarea
                placeholder="Script iklan..."
                value={ad.script || ''}
                onChange={(e) => updateAd(adKey, 'script', e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                placeholder="https://..."
                value={ad.image || ''}
                onChange={(e) => updateAd(adKey, 'image', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Link</Label>
              <Input
                placeholder="https://..."
                value={ad.link || ''}
                onChange={(e) => updateAd(adKey, 'link', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Pengaturan</h2>
        <p className="text-muted-foreground">Konfigurasi portal berita.</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="umum">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="umum">Umum</TabsTrigger>
          <TabsTrigger value="tampilan">Tampilan</TabsTrigger>
          <TabsTrigger value="beranda">Beranda</TabsTrigger>
          <TabsTrigger value="medsos">Media Sosial</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="iklan">Iklan</TabsTrigger>
          <TabsTrigger value="komentar">Komentar</TabsTrigger>
        </TabsList>

        {/* Tab: Umum */}
        <TabsContent value="umum" className="space-y-6 mt-6">
          <div className="flex justify-end">
            <SaveButton section="umum" />
          </div>
          <div className="rounded-lg border bg-background p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="site-name">Nama Situs</Label>
                <Input
                  id="site-name"
                  value={settings.general.siteName}
                  onChange={(e) => updateGeneral('siteName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={settings.general.tagline}
                  onChange={(e) => updateGeneral('tagline', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-desc">Deskripsi</Label>
              <Textarea
                id="site-desc"
                value={settings.general.description}
                onChange={(e) => updateGeneral('description', e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.general.email}
                  onChange={(e) => updateGeneral('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telepon</Label>
                <Input
                  id="phone"
                  value={settings.general.phone}
                  onChange={(e) => updateGeneral('phone', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <Textarea
                id="address"
                value={settings.general.address}
                onChange={(e) => updateGeneral('address', e.target.value)}
                rows={2}
              />
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  value={settings.general.logo || ''}
                  onChange={(e) => updateGeneral('logo', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="favicon">Favicon URL</Label>
                <Input
                  id="favicon"
                  value={settings.general.favicon || ''}
                  onChange={(e) => updateGeneral('favicon', e.target.value)}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Tampilan */}
        <TabsContent value="tampilan" className="space-y-6 mt-6">
          <div className="flex justify-end">
            <SaveButton section="tampilan" />
          </div>
          <div className="rounded-lg border bg-background p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Warna Utama</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.appearance.primaryColor}
                    onChange={(e) => updateAppearance('primaryColor', e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded border"
                  />
                  <Input
                    id="primary-color"
                    value={settings.appearance.primaryColor}
                    onChange={(e) => updateAppearance('primaryColor', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accent-color">Warna Aksen</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.appearance.accentColor}
                    onChange={(e) => updateAppearance('accentColor', e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded border"
                  />
                  <Input
                    id="accent-color"
                    value={settings.appearance.accentColor}
                    onChange={(e) => updateAppearance('accentColor', e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Aktifkan mode gelap.</p>
              </div>
              <Switch
                checked={settings.appearance.darkMode}
                onCheckedChange={(v) => updateAppearance('darkMode', v)}
              />
            </div>
            <div className="space-y-2">
              <Label>Layout</Label>
              <Select
                value={settings.appearance.layout}
                onValueChange={(v) => updateAppearance('layout', v)}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="magazine">Magazine</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Beranda */}
        <TabsContent value="beranda" className="space-y-6 mt-6">
          <div className="flex justify-end">
            <SaveButton section="beranda" />
          </div>
          <div className="rounded-lg border bg-background p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="latest-count">Jumlah Berita Terbaru</Label>
                <Input
                  id="latest-count"
                  type="number"
                  min={1}
                  max={50}
                  value={settings.homepage.latestNewsCount}
                  onChange={(e) => updateHomepage('latestNewsCount', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="popular-count">Jumlah Berita Populer</Label>
                <Input
                  id="popular-count"
                  type="number"
                  min={1}
                  max={20}
                  value={settings.homepage.popularNewsCount}
                  onChange={(e) => updateHomepage('popularNewsCount', Number(e.target.value))}
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium">Visibilitas Seksi</h4>
              <div className="flex items-center justify-between">
                <Label>Breaking News</Label>
                <Switch
                  checked={settings.homepage.showBreakingNews}
                  onCheckedChange={(v) => updateHomepage('showBreakingNews', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Galeri</Label>
                <Switch
                  checked={settings.homepage.showGallery}
                  onCheckedChange={(v) => updateHomepage('showGallery', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Video</Label>
                <Switch
                  checked={settings.homepage.showVideo}
                  onCheckedChange={(v) => updateHomepage('showVideo', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Newsletter</Label>
                <Switch
                  checked={settings.homepage.showNewsletter}
                  onCheckedChange={(v) => updateHomepage('showNewsletter', v)}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Media Sosial */}
        <TabsContent value="medsos" className="space-y-6 mt-6">
          <div className="flex justify-end">
            <SaveButton section="medsos" />
          </div>
          <div className="rounded-lg border bg-background p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  placeholder="https://facebook.com/..."
                  value={settings.socialMedia.facebook || ''}
                  onChange={(e) => updateSocial('facebook', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  placeholder="https://instagram.com/..."
                  value={settings.socialMedia.instagram || ''}
                  onChange={(e) => updateSocial('instagram', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tiktok">TikTok</Label>
                <Input
                  id="tiktok"
                  placeholder="https://tiktok.com/..."
                  value={settings.socialMedia.tiktok || ''}
                  onChange={(e) => updateSocial('tiktok', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  placeholder="https://youtube.com/..."
                  value={settings.socialMedia.youtube || ''}
                  onChange={(e) => updateSocial('youtube', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  placeholder="https://wa.me/..."
                  value={settings.socialMedia.whatsapp || ''}
                  onChange={(e) => updateSocial('whatsapp', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">X (Twitter)</Label>
                <Input
                  id="twitter"
                  placeholder="https://x.com/..."
                  value={settings.socialMedia.twitter || ''}
                  onChange={(e) => updateSocial('twitter', e.target.value)}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab: SEO */}
        <TabsContent value="seo" className="space-y-6 mt-6">
          <div className="flex justify-end">
            <SaveButton section="seo" />
          </div>
          <div className="rounded-lg border bg-background p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-title">Default Title</Label>
              <Input
                id="default-title"
                placeholder="Judul default situs"
                value={settings.seo.defaultTitle}
                onChange={(e) => updateSeo('defaultTitle', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta-desc">Meta Description</Label>
              <Textarea
                id="meta-desc"
                placeholder="Deskripsi meta default..."
                value={settings.seo.metaDescription}
                onChange={(e) => updateSeo('metaDescription', e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="og-image">OG Image</Label>
              <Input
                id="og-image"
                placeholder="https://..."
                value={settings.seo.ogImage || ''}
                onChange={(e) => updateSeo('ogImage', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="google-verify">Google Verification</Label>
              <Input
                id="google-verify"
                placeholder="Kode verifikasi Google"
                value={settings.seo.googleVerification || ''}
                onChange={(e) => updateSeo('googleVerification', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="robots-config">Robots Config</Label>
              <Textarea
                id="robots-config"
                value={settings.seo.robotsConfig}
                onChange={(e) => updateSeo('robotsConfig', e.target.value)}
                rows={5}
                className="font-mono text-sm"
              />
            </div>
          </div>
        </TabsContent>

        {/* Tab: Iklan */}
        <TabsContent value="iklan" className="space-y-6 mt-6">
          <div className="flex justify-end">
            <SaveButton section="iklan" />
          </div>
          <div className="space-y-4">
            <AdSection label="Header Ad" adKey="headerAd" />
            <AdSection label="Homepage Ad" adKey="homepageAd" />
            <AdSection label="Article Ad" adKey="articleAd" />
            <AdSection label="Sidebar Ad" adKey="sidebarAd" />
          </div>
        </TabsContent>

        {/* Tab: Komentar */}
        <TabsContent value="komentar" className="space-y-6 mt-6">
          <div className="flex justify-end">
            <SaveButton section="komentar" />
          </div>
          <div className="rounded-lg border bg-background p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Aktifkan Komentar</Label>
                <p className="text-sm text-muted-foreground">
                  Izinkan pengunjung memberikan komentar pada berita.
                </p>
              </div>
              <Switch
                checked={settings.comments.enabled}
                onCheckedChange={(v) => updateComments('enabled', v)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Butuh Persetujuan</Label>
                <p className="text-sm text-muted-foreground">
                  Komentar harus disetujui sebelum ditampilkan.
                </p>
              </div>
              <Switch
                checked={settings.comments.requireApproval}
                onCheckedChange={(v) => updateComments('requireApproval', v)}
                disabled={!settings.comments.enabled}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
