'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { generateSlug } from '@/lib/utils';
import type { Category, Article, ArticleStatus } from '@/types';
import {
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  ImageIcon,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';

function EditArticleForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get('id');
  const { toast } = useToast();
  const { fetchWithAuth } = useAuth();
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [subheading, setSubheading] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<ArticleStatus>('draft');
  const [featured, setFeatured] = useState(false);
  const [breaking, setBreaking] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [publishedAt, setPublishedAt] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [seoOpen, setSeoOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);

  // TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({
        HTMLAttributes: { class: 'rounded-lg max-w-full' },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline hover:text-primary/80' },
      }),
      Placeholder.configure({
        placeholder: 'Mulai menulis konten berita di sini...',
      }),
    ],
    content: '',
    onUpdate: () => {
      triggerAutoSave();
    },
  });

  // Fetch article and categories
  useEffect(() => {
    async function fetchData() {
      if (!articleId) {
        router.push('/admin/berita');
        return;
      }

      try {
        const [articleRes, catRes] = await Promise.all([
          fetch(`/api/articles/${articleId}`),
          fetch('/api/categories'),
        ]);

        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.data || []);
        }

        if (articleRes.ok) {
          const articleData = await articleRes.json();
          const article: Article = articleData.data;
          setTitle(article.title || '');
          setSlug(article.slug || '');
          setSubheading(article.subheading || '');
          setExcerpt(article.excerpt || '');
          setFeaturedImage(article.featuredImage || '');
          setImageCaption(article.imageCaption || '');
          setCategoryId(article.categoryId || '');
          setTags(article.tags || []);
          setTagsInput((article.tags || []).join(', '));
          setStatus(article.status || 'draft');
          setFeatured(article.featured || false);
          setBreaking(article.breaking || false);
          setSeoTitle(article.seoTitle || '');
          setSeoDescription(article.seoDescription || '');
          setSeoKeywords((article.seoKeywords || []).join(', '));
          setCanonicalUrl(article.canonicalUrl || '');
          if (article.publishedAt) {
            const d = new Date(article.publishedAt);
            const offset = d.getTimezoneOffset() * 60000;
            setPublishedAt(new Date(d.getTime() - offset).toISOString().slice(0, 16));
          }

          // Set editor content after load
          if (editor && article.content) {
            editor.commands.setContent(article.content);
          }
        } else {
          toast({ title: 'Gagal', description: 'Berita tidak ditemukan.', variant: 'destructive' });
          router.push('/admin/berita');
        }
      } catch (err) {
        console.error('Failed to fetch article:', err);
        toast({ title: 'Gagal', description: 'Terjadi kesalahan.', variant: 'destructive' });
        router.push('/admin/berita');
      } finally {
        setLoading(false);
        setLoadingCategories(false);
      }
    }
    fetchData();
  }, [articleId, router, toast, editor]);

  // Auto-save indicator
  const triggerAutoSave = useCallback(() => {
    setSaveStatus('saving');
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      setSaveStatus('saved');
    }, 1500);
  }, []);

  // Tags handling
  useEffect(() => {
    const t = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    setTags(t);
  }, [tagsInput]);

  // Validation
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Judul wajib diisi.';
    if (!slug.trim()) e.slug = 'Slug wajib diisi.';
    if (!categoryId) e.categoryId = 'Kategori wajib dipilih.';
    if (!editor?.getText().trim()) e.content = 'Konten wajib diisi.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Submit
  const handleSubmit = async (submitStatus: ArticleStatus) => {
    if (!validate() || !articleId) return;
    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        subheading: subheading.trim() || undefined,
        excerpt: excerpt.trim(),
        content: editor?.getHTML() || '',
        featuredImage: featuredImage.trim() || undefined,
        imageCaption: imageCaption.trim() || undefined,
        categoryId,
        tags,
        status: submitStatus,
        featured,
        breaking,
        seoTitle: seoTitle.trim() || undefined,
        seoDescription: seoDescription.trim() || undefined,
        seoKeywords: seoKeywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean) || undefined,
        canonicalUrl: canonicalUrl.trim() || undefined,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
      };

      const res = await fetchWithAuth(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast({ title: 'Berhasil', description: 'Berita berhasil diperbarui.' });
        router.push('/admin/berita');
      } else {
        const data = await res.json().catch(() => ({}));
        toast({ title: 'Gagal', description: data.error || 'Gagal memperbarui berita.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Gagal', description: 'Terjadi kesalahan jaringan.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  // Toolbar actions
  const handleAddLink = () => {
    if (linkUrl && editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const handleAddImage = () => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageInput(false);
    }
  };

  const removeTag = (tag: string) => {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    setTagsInput(newTags.join(', '));
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-[500px] w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/berita">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Edit Berita</h2>
            <p className="text-muted-foreground">Perbarui berita yang ada.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Menyimpan...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1 text-sm text-emerald-600">
              <Check className="h-3 w-3" /> Tersimpan
            </span>
          )}
          <Button variant="outline" onClick={() => handleSubmit('draft')} disabled={submitting}>
            Simpan Draft
          </Button>
          <Button onClick={() => handleSubmit('published')} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update
          </Button>
        </div>
      </div>

      {/* Title & Slug */}
      <div className="space-y-4 rounded-lg border bg-background p-6">
        <div className="space-y-2">
          <Label htmlFor="title">Judul *</Label>
          <Input
            id="title"
            placeholder="Judul berita..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold"
          />
          {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            placeholder="slug-berita"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="subheading">Subheading</Label>
          <Input
            id="subheading"
            placeholder="Subheading berita (opsional)"
            value={subheading}
            onChange={(e) => setSubheading(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Ringkasan</Label>
          <Textarea
            id="excerpt"
            placeholder="Ringkasan singkat berita..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      {/* Content Editor */}
      <div className="space-y-2 rounded-lg border bg-background">
        <div className="border-b p-3">
          <Label>Konten *</Label>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 border-b p-2">
          <Button type="button" variant={editor?.isActive('bold') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => editor?.chain().focus().toggleBold().run()} title="Bold">
            <Bold className="h-4 w-4" />
          </Button>
          <Button type="button" variant={editor?.isActive('italic') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => editor?.chain().focus().toggleItalic().run()} title="Italic">
            <Italic className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor?.chain().focus().toggleUnderline().run()} title="Underline">
            <Underline className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <Button type="button" variant={editor?.isActive('heading', { level: 1 }) ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button type="button" variant={editor?.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button type="button" variant={editor?.isActive('heading', { level: 3 }) ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">
            <Heading3 className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <Button type="button" variant={editor?.isActive('bulletList') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => editor?.chain().focus().toggleBulletList().run()} title="Bullet List">
            <List className="h-4 w-4" />
          </Button>
          <Button type="button" variant={editor?.isActive('orderedList') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="Numbered List">
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button type="button" variant={editor?.isActive('blockquote') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => editor?.chain().focus().toggleBlockquote().run()} title="Blockquote">
            <Quote className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <div className="relative">
            <Button type="button" variant={editor?.isActive('link') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => {
              if (editor?.isActive('link')) { editor?.chain().focus().unsetLink().run(); }
              else { setShowLinkInput(!showLinkInput); setShowImageInput(false); }
            }} title="Link">
              <LinkIcon className="h-4 w-4" />
            </Button>
            {showLinkInput && (
              <div className="absolute top-full left-0 mt-1 flex gap-1 rounded-md border bg-background p-2 shadow-md z-50">
                <Input type="url" placeholder="https://..." value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="h-8 w-48" onKeyDown={(e) => e.key === 'Enter' && handleAddLink()} />
                <Button type="button" size="sm" className="h-8" onClick={handleAddLink}>OK</Button>
              </div>
            )}
          </div>
          <div className="relative">
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setShowImageInput(!showImageInput); setShowLinkInput(false); }} title="Image">
              <ImageIcon className="h-4 w-4" />
            </Button>
            {showImageInput && (
              <div className="absolute top-full left-0 mt-1 flex gap-1 rounded-md border bg-background p-2 shadow-md z-50">
                <Input type="url" placeholder="URL gambar..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="h-8 w-48" onKeyDown={(e) => e.key === 'Enter' && handleAddImage()} />
                <Button type="button" size="sm" className="h-8" onClick={handleAddImage}>OK</Button>
              </div>
            )}
          </div>
        </div>

        {/* Editor Content */}
        <div className="min-h-[400px]">
          <EditorContent
            editor={editor}
            className="prose prose-sm sm:prose max-w-none p-4 min-h-[400px] focus:outline-none [&_.tiptap]:min-h-[400px] [&_.tiptap]:outline-none [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:h-0 [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap_img]:rounded-lg [&_.tiptap_img]:max-w-full [&_.tiptap_a]:text-primary [&_.tiptap_a]:underline"
          />
        </div>
        {errors.content && <p className="text-sm text-destructive px-4 pb-4">{errors.content}</p>}
      </div>

      {/* Featured Image & Meta */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-lg border bg-background p-6">
          <Label>Gambar Utama</Label>
          {featuredImage ? (
            <div className="relative rounded-lg overflow-hidden border">
              <img src={featuredImage} alt="Featured" className="w-full h-48 object-cover" />
              <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => setFeaturedImage('')}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
          <Input placeholder="URL gambar utama" value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} />
          <div className="space-y-2">
            <Label htmlFor="imageCaption">Caption Gambar</Label>
            <Input id="imageCaption" placeholder="Caption gambar" value={imageCaption} onChange={(e) => setImageCaption(e.target.value)} />
          </div>
        </div>

        <div className="space-y-4 rounded-lg border bg-background p-6">
          <div className="space-y-2">
            <Label>Kategori *</Label>
            {loadingCategories ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId}</p>}
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <Input placeholder="Tag1, Tag2, Tag3" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ArticleStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tanggal Publish</Label>
            <Input type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox id="featured" checked={featured} onCheckedChange={(v) => setFeatured(!!v)} />
              <Label htmlFor="featured" className="text-sm">Featured</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="breaking" checked={breaking} onCheckedChange={(v) => setBreaking(!!v)} />
              <Label htmlFor="breaking" className="text-sm">Breaking News</Label>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Section */}
      <div className="rounded-lg border bg-background">
        <button type="button" className="flex w-full items-center justify-between p-6 text-left" onClick={() => setSeoOpen(!seoOpen)}>
          <div>
            <h3 className="font-semibold">SEO</h3>
            <p className="text-sm text-muted-foreground">Pengaturan SEO untuk berita ini.</p>
          </div>
          {seoOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
        </button>
        {seoOpen && (
          <>
            <Separator />
            <div className="space-y-4 p-6">
              <div className="space-y-2">
                <Label>SEO Title</Label>
                <Input placeholder="Judul SEO (opsional)" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>SEO Description</Label>
                <Textarea placeholder="Deskripsi meta..." value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>SEO Keywords</Label>
                <Input placeholder="keyword1, keyword2, keyword3" value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Canonical URL</Label>
                <Input placeholder="https://..." value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-end gap-3 pb-6">
        <Button variant="outline" asChild>
          <Link href="/admin/berita">Batal</Link>
        </Button>
        <Button variant="outline" onClick={() => handleSubmit('draft')} disabled={submitting}>
          Simpan Draft
        </Button>
        <Button onClick={() => handleSubmit('published')} disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update
        </Button>
      </div>
    </div>
  );
}

export default function EditArticlePage() {
  return (
    <Suspense fallback={
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="h-10 w-64 animate-pulse rounded bg-muted" />
        <div className="h-48 w-full animate-pulse rounded bg-muted" />
        <div className="h-[500px] w-full animate-pulse rounded bg-muted" />
      </div>
    }>
      <EditArticleForm />
    </Suspense>
  );
}
