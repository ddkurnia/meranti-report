// User roles
export type UserRole = 'super_admin' | 'editor' | 'author';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Articles
export type ArticleStatus = 'draft' | 'published' | 'archived';

export interface Article {
  id: string;
  title: string;
  slug: string;
  subheading?: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  imageCaption?: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  tags: string[];
  status: ArticleStatus;
  featured: boolean;
  breaking: boolean;
  views: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  canonicalUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

// Categories
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  order: number;
  articleCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Authors
export interface Author {
  id: string;
  name: string;
  slug: string;
  photo?: string;
  bio?: string;
  position?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Media
export interface MediaItem {
  id: string;
  publicId: string;
  secureUrl: string;
  url: string;
  width: number;
  height: number;
  format: string;
  resourceType: string;
  folder: string;
  size: number;
  uploadedBy: string;
  createdAt: Date;
}

// Comments
export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'spam';

export interface Comment {
  id: string;
  articleId: string;
  authorName: string;
  authorEmail?: string;
  content: string;
  status: CommentStatus;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Settings
export interface SiteSettings {
  general: {
    siteName: string;
    tagline: string;
    description: string;
    email: string;
    phone: string;
    address: string;
    logo?: string;
    favicon?: string;
  };
  appearance: {
    primaryColor: string;
    accentColor: string;
    darkMode: boolean;
    layout: 'default' | 'magazine' | 'classic';
  };
  homepage: {
    latestNewsCount: number;
    popularNewsCount: number;
    showBreakingNews: boolean;
    showGallery: boolean;
    showVideo: boolean;
    showNewsletter: boolean;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    whatsapp?: string;
    twitter?: string;
  };
  seo: {
    defaultTitle: string;
    metaDescription: string;
    ogImage?: string;
    googleVerification?: string;
    robotsConfig: string;
  };
  advertisement: {
    headerAd: {
      enabled: boolean;
      script?: string;
      image?: string;
      link?: string;
    };
    homepageAd: {
      enabled: boolean;
      script?: string;
      image?: string;
      link?: string;
    };
    articleAd: {
      enabled: boolean;
      script?: string;
      image?: string;
      link?: string;
    };
    sidebarAd: {
      enabled: boolean;
      script?: string;
      image?: string;
      link?: string;
    };
  };
  comments: {
    enabled: boolean;
    requireApproval: boolean;
  };
}

// View tracking
export interface ViewRecord {
  id: string;
  articleId: string;
  sessionId: string;
  createdAt: Date;
}

// API Responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Dashboard stats
export interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  todayArticles: number;
  totalViews: number;
  todayViews: number;
  weekViews: number;
  monthViews: number;
}

// Analytics
export interface AnalyticsData {
  date: string;
  views: number;
}

export interface PopularArticle {
  id: string;
  title: string;
  slug: string;
  views: number;
  categoryName: string;
  publishedAt: Date;
}

export interface PopularCategory {
  name: string;
  slug: string;
  count: number;
}

// Form types
export interface ArticleFormData {
  title: string;
  slug: string;
  subheading?: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  imageCaption?: string;
  categoryId: string;
  tags: string[];
  status: ArticleStatus;
  featured: boolean;
  breaking: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  canonicalUrl?: string;
  publishedAt?: Date;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  order: number;
}

export interface AuthorFormData {
  name: string;
  slug: string;
  photo?: string;
  bio?: string;
  position?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
}

export interface SearchParams {
  query?: string;
  category?: string;
  tag?: string;
  page?: number;
  limit?: number;
  status?: ArticleStatus;
}
