import type { Article, Category, Author, SiteSettings, Comment, MediaItem } from '@/types';

// Helper to create dates relative to now
function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function hoursAgo(hours: number): Date {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d;
}

// ======================== CATEGORIES ========================

export const DEFAULT_CATEGORIES: Category[] = [
  // ===== WILAYAH (Geographic - Kecamatan & Kota) =====
  { id: 'cat-meranti', name: 'Meranti', slug: 'meranti', description: 'Berita seputar Kabupaten Kepulauan Meranti secara umum', order: 1, articleCount: 0, createdAt: daysAgo(90), updatedAt: daysAgo(1) },
  { id: 'cat-selatpanjang', name: 'Selatpanjang', slug: 'selatpanjang', description: 'Berita dari ibukota Kabupaten Kepulauan Meranti', order: 2, articleCount: 0, createdAt: daysAgo(90), updatedAt: daysAgo(1) },
  { id: 'cat-tebing-tinggi', name: 'Tebing Tinggi', slug: 'tebing-tinggi', description: 'Berita dari Kecamatan Tebing Tinggi', order: 3, articleCount: 0, createdAt: daysAgo(90), updatedAt: daysAgo(1) },
  { id: 'cat-tebing-tinggi-barat', name: 'Tebing Tinggi Barat', slug: 'tebing-tinggi-barat', description: 'Berita dari Kecamatan Tebing Tinggi Barat', order: 4, articleCount: 0, createdAt: daysAgo(90), updatedAt: daysAgo(1) },
  { id: 'cat-merbau', name: 'Merbau', slug: 'merbau', description: 'Berita dari Kecamatan Merbau', order: 5, articleCount: 0, createdAt: daysAgo(90), updatedAt: daysAgo(1) },
  { id: 'cat-rangsang', name: 'Rangsang', slug: 'rangsang', description: 'Berita dari Kecamatan Rangsang', order: 6, articleCount: 0, createdAt: daysAgo(90), updatedAt: daysAgo(1) },
  { id: 'cat-rangsang-barat', name: 'Rangsang Barat', slug: 'rangsang-barat', description: 'Berita dari Kecamatan Rangsang Barat', order: 7, articleCount: 0, createdAt: daysAgo(90), updatedAt: daysAgo(1) },
  { id: 'cat-bantan', name: 'Bantan', slug: 'bantan', description: 'Berita dari Kecamatan Bantan', order: 8, articleCount: 0, createdAt: daysAgo(90), updatedAt: daysAgo(1) },
  { id: 'cat-pulau-kijang', name: 'Pulau Kijang', slug: 'pulau-kijang', description: 'Berita dari wilayah Pulau Kijang dan sekitarnya', order: 9, articleCount: 0, createdAt: daysAgo(90), updatedAt: daysAgo(1) },
  // ===== TOPIK (Topical) =====
  { id: 'cat-nasional', name: 'Nasional', slug: 'nasional', description: 'Berita nasional yang relevan dengan masyarakat Meranti', order: 10, articleCount: 0, createdAt: daysAgo(90), updatedAt: daysAgo(1) },
  { id: 'cat-politik', name: 'Politik', slug: 'politik', description: 'Berita politik dan pemerintahan daerah', order: 11, articleCount: 0, createdAt: daysAgo(90), updatedAt: daysAgo(1) },
  { id: 'cat-ekonomi', name: 'Ekonomi & Bisnis', slug: 'ekonomi-bisnis', description: 'Berita ekonomi, bisnis, UMKM, dan investasi', order: 12, articleCount: 0, createdAt: daysAgo(90), updatedAt: daysAgo(1) },
  { id: 'cat-pendidikan', name: 'Pendidikan', slug: 'pendidikan', description: 'Berita pendidikan, sekolah, dan dunia akademik', order: 13, articleCount: 0, createdAt: daysAgo(90), updatedAt: daysAgo(1) },
  { id: 'cat-kesehatan', name: 'Kesehatan', slug: 'kesehatan', description: 'Berita kesehatan, layanan kesehatan masyarakat, dan tips kesehatan', order: 14, articleCount: 0, createdAt: daysAgo(90), updatedAt: daysAgo(1) },
  { id: 'cat-infrastruktur', name: 'Infrastruktur', slug: 'infrastruktur', description: 'Berita pembangunan jalan, jembatan, dan infrastruktur publik', order: 15, articleCount: 0, createdAt: daysAgo(90), updatedAt: daysAgo(1) },
  { id: 'cat-sosial', name: 'Sosial', slug: 'sosial', description: 'Berita sosial, kemasyarakatan, dan kegiatan sosial', order: 16, articleCount: 0, createdAt: daysAgo(90), updatedAt: daysAgo(1) },
  { id: 'cat-budaya', name: 'Budaya', slug: 'budaya', description: 'Berita kebudayaan Melayu, kesenian, dan tradisi', order: 17, articleCount: 0, createdAt: daysAgo(90), updatedAt: daysAgo(1) },
  { id: 'cat-ragam', name: 'Ragam', slug: 'ragam', description: 'Berita ragam, human interest, dan kehidupan sehari-hari', order: 18, articleCount: 0, createdAt: daysAgo(90), updatedAt: daysAgo(1) },
  { id: 'cat-pariwisata', name: 'Pariwisata', slug: 'pariwisata', description: 'Berita pariwisata, destinasi wisata, dan potensi daerah', order: 19, articleCount: 0, createdAt: daysAgo(90), updatedAt: daysAgo(1) },
  { id: 'cat-olahraga', name: 'Olahraga', slug: 'olahraga', description: 'Berita olahraga, prestasi atlet, dan event olahraga', order: 20, articleCount: 0, createdAt: daysAgo(90), updatedAt: daysAgo(1) },
  { id: 'cat-teknologi', name: 'Teknologi', slug: 'teknologi', description: 'Berita teknologi, digital, dan inovasi', order: 21, articleCount: 0, createdAt: daysAgo(90), updatedAt: daysAgo(1) },
  { id: 'cat-hukum', name: 'Hukum & Kriminal', slug: 'hukum-kriminal', description: 'Berita hukum, kriminalitas, dan ketertiban masyarakat', order: 22, articleCount: 0, createdAt: daysAgo(90), updatedAt: daysAgo(1) },
  { id: 'cat-lingkungan', name: 'Lingkungan', slug: 'lingkungan', description: 'Berita lingkungan hidup, kelestarian alam, dan perubahan iklim', order: 23, articleCount: 0, createdAt: daysAgo(90), updatedAt: daysAgo(1) },
  { id: 'cat-opini', name: 'Opini', slug: 'opini', description: 'Opini, kolom, dan editorial wartawan', order: 24, articleCount: 0, createdAt: daysAgo(90), updatedAt: daysAgo(1) },
];

// ======================== AUTHORS ========================

export const DEMO_AUTHORS: Author[] = [
  {
    id: 'author-1',
    name: 'Ahmad Fauzi',
    slug: 'ahmad-fauzi',
    photo: 'https://placehold.co/200x200/1a2332/ffffff?text=AF',
    bio: 'Jurnalis senior Meranti Report dengan pengalaman 10 tahun di bidang pemberitaan daerah Kepulauan Meranti.',
    position: 'Pemred',
    facebook: 'https://facebook.com/ahmadfauzi',
    instagram: 'https://instagram.com/ahmadfauzi',
    twitter: 'https://twitter.com/ahmadfauzi',
    createdAt: daysAgo(365),
    updatedAt: daysAgo(30),
  },
  {
    id: 'author-2',
    name: 'Siti Nurhaliza',
    slug: 'siti-nurhaliza',
    photo: 'https://placehold.co/200x200/1a2332/ffffff?text=SN',
    bio: 'Reporter Meranti Report yang berfokus pada pemberitaan budaya, pariwisata, dan sosial kemasyarakatan di Kepulauan Meranti.',
    position: 'Reporter',
    facebook: 'https://facebook.com/sitinurhaliza',
    instagram: 'https://instagram.com/sitinurhaliza',
    createdAt: daysAgo(200),
    updatedAt: daysAgo(15),
  },
  {
    id: 'author-3',
    name: 'Rizky Pratama',
    slug: 'rizky-pratama',
    photo: 'https://placehold.co/200x200/1a2332/ffffff?text=RP',
    bio: 'Wartawan muda yang aktif meliput perkembangan ekonomi, infrastruktur, dan teknologi di wilayah Kepulauan Meranti.',
    position: 'Reporter',
    twitter: 'https://twitter.com/rizkypratama',
    createdAt: daysAgo(120),
    updatedAt: daysAgo(5),
  },
];

// ======================== ARTICLES ========================

export const DEMO_ARTICLES: Article[] = [
  {
    id: 'article-1',
    title: 'Pemkab Meranti Gelar Rapat Koordinasi Pembangunan 2025',
    slug: 'pemkab-meranti-gelar-rapat-koordinasi-pembangunan-2025',
    subheading: 'Fokus pada pembangunan infrastruktur dan peningkatan kesejahteraan masyarakat',
    excerpt: 'Pemerintah Kabupaten Kepulauan Meranti menggelar rapat koordinasi pembangunan tahun 2025 yang dihadiri oleh seluruh kepala dinas dan camat se-Kabupaten Kepulauan Meranti. Rapat ini membahas prioritas pembangunan untuk tahun mendatang.',
    content: `<p>Pemerintah Kabupaten Kepulauan Meranti menggelar rapat koordinasi (rakor) pembangunan tahun 2025 di Aula Kantor Bupati, Selatpanjang, pada Senin (13/1). Rapat yang dipimpin langsung oleh Bupati Kepulauan Meranti ini dihadiri oleh seluruh kepala Organisasi Perangkat Daerah (OPD) dan camat se-Kabupaten Kepulauan Meranti.</p>

<p>Dalam sambutannya, Bupati menyampaikan bahwa pembangunan tahun 2025 akan difokuskan pada empat pilar utama, yaitu peningkatan kualitas infrastruktur dasar, pemberdayaan ekonomi masyarakat, peningkatan kualitas sumber daya manusia, dan pelestarian budaya Melayu. "Kita harus bekerja lebih keras lagi untuk memajukan Kepulauan Meranti. Pembangunan harus menyentuh seluruh lapisan masyarakat, terutama di daerah-daerah terpencil," ujar Bupati.</p>

<p>Beberapa program prioritas yang dibahas dalam rakor ini antara lain pembangunan jalan penghubung antar kecamatan, peningkatan kapasitas pelabuhan, program digitalisasi UMKM, serta pembangunan fasilitas pendidikan dan kesehatan yang lebih merata. Kepala Bappeda menjelaskan bahwa total anggaran pembangunan tahun 2025 diproyeksikan meningkat 15% dibandingkan tahun sebelumnya, dengan alokasi terbesar untuk sektor infrastruktur.</p>

<p>Rapat juga membahas mekanisme pengawasan dan evaluasi berkala agar seluruh program pembangunan dapat berjalan sesuai target. Setiap OPD diminta untuk menyusun rencana kerja yang terukur dan memuat indikator kinerja yang jelas. "Kita tidak ingin ada program yang tidak berjalan. Monitoring harus dilakukan secara rutin," tegas Bupati.</p>

<p>Acara ditutup dengan penandatanganan berita acara rakor dan komitmen bersama seluruh perangkat daerah untuk mewujudkan Kepulauan Meranti yang lebih maju dan sejahtera.</p>`,
    featuredImage: 'https://placehold.co/1200x600/1a2332/ffffff?text=Rakor+Pembangunan+2025',
    imageCaption: 'Suasana Rapat Koordinasi Pembangunan 2025 di Aula Kantor Bupati Kepulauan Meranti',
    categoryId: 'cat-meranti',
    categoryName: 'Meranti',
    categorySlug: 'meranti',
    authorId: 'author-1',
    authorName: 'Ahmad Fauzi',
    authorPhoto: 'https://placehold.co/200x200/1a2332/ffffff?text=AF',
    tags: ['pembangunan', 'pemkab meranti', 'rakor', '2025'],
    status: 'published',
    featured: true,
    breaking: true,
    views: 3247,
    seoTitle: 'Pemkab Meranti Gelar Rakor Pembangunan 2025',
    seoDescription: 'Pemerintah Kabupaten Kepulauan Meranti menggelar rapat koordinasi pembangunan tahun 2025 yang membahas prioritas pembangunan untuk tahun mendatang.',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    publishedAt: hoursAgo(6),
  },
  {
    id: 'article-2',
    title: 'Jembatan Penghubung Selatpanjang-Tebing Tinggi Diresmikan',
    slug: 'jembatan-penghubung-selatpanjang-tebing-tinggi-diresmikan',
    subheading: 'Jembatan sepanjang 2,5 km ini menjadi ikon baru Kepulauan Meranti',
    excerpt: 'Jembatan penghubung antara Pulau Selatpanjang dan Pulau Tebing Tinggi resmi diresmikan oleh Gubernur Riau. Jembatan sepanjang 2,5 kilometer ini diharapkan meningkatkan konektivitas dan perekonomian antar pulau.',
    content: `<p>Jembatan penghubung antara Pulau Selatpanjang dan Pulau Tebing Tinggi yang telah lama dinantikan masyarakat Kepulauan Meranti akhirnya resmi diresmikan pada Jumat (10/1). Peresmian dilakukan oleh Gubernur Riau didampingi Bupati Kepulauan Meranti dan sejumlah pejabat tinggi daerah.</p>

<p>Jembatan dengan panjang 2,5 kilometer dan lebar 12 meter ini dibangun selama kurang lebih tiga tahun dengan total anggaran sekitar Rp 850 miliar. Konstruksi jembatan menggunakan teknologi cable-stayed yang mampu menahan beban hingga 60 ton, cukup untuk dilalui kendaraan berat dan truk pengangkut hasil bumi.</p>

<p>Bupati Kepulauan Meranti menyampaikan bahwa jembatan ini merupakan tonggak sejarah bagi masyarakat Kepulauan Meranti. "Selama ini masyarakat harus mengandalkan transportasi laut untuk menyeberang antar pulau. Dengan adanya jembatan ini, waktu tempuh menjadi lebih singkat dan biaya transportasi jauh lebih murah," jelasnya. Sebelumnya, penyeberangan menggunakan kapal membutuhkan waktu sekitar 45 menit dengan biaya Rp 25.000 per orang.</p>

<p>Jembatan ini juga dilengkapi dengan jalur pejalan kaki di kedua sisinya, lampu penerangan tenaga surya, serta area pandang (viewing deck) yang menjadi spot foto favorit pengunjung. Pada malam hari, jembatan ini dipercantik dengan lampu LED warna-warni yang menambah daya tarik wisata di malam hari.</p>

<p>Dengan beroperasinya jembatan ini, para pelaku usaha menilai akan terjadi peningkatan aktivitas ekonomi yang signifikan. Distribusi barang dari dan ke Pulau Tebing Tinggi yang sebelumnya memakan waktu seharian kini bisa diselesaikan dalam hitungan jam.</p>`,
    featuredImage: 'https://placehold.co/1200x600/1a2332/ffffff?text=Jembatan+Selatpanjang+Tebing+Tinggi',
    imageCaption: 'Jembatan penghubung Selatpanjang-Tebing Tinggi yang baru diresmikan',
    categoryId: 'cat-infrastruktur',
    categoryName: 'Infrastruktur',
    categorySlug: 'infrastruktur',
    authorId: 'author-3',
    authorName: 'Rizky Pratama',
    authorPhoto: 'https://placehold.co/200x200/1a2332/ffffff?text=RP',
    tags: ['jembatan', 'infrastruktur', 'selatpanjang', 'tebing tinggi'],
    status: 'published',
    featured: true,
    breaking: false,
    views: 4892,
    seoTitle: 'Jembatan Selatpanjang-Tebing Tinggi Diresmikan - Meranti Report',
    seoDescription: 'Jembatan penghubung Pulau Selatpanjang dan Pulau Tebing Tinggi sepanjang 2,5 km resmi diresmikan Gubernur Riau.',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(2),
    publishedAt: daysAgo(2),
  },
  {
    id: 'article-3',
    title: 'Peluang Investasi Sektor Perikanan di Kepulauan Meranti Meningkat',
    slug: 'peluang-investasi-sektor-perikanan-di-kepulauan-meranti-meningkat',
    subheading: 'Potensi perikanan seluas 1,2 juta hektar menarik minat investor nasional',
    excerpt: 'Sektor perikanan di Kepulauan Meranti menunjukkan peningkatan signifikan dengan masuknya beberapa investor nasional. Potensi perairan seluas 1,2 juta hektar menjadi daya tarik utama bagi pelaku usaha di bidang perikanan.',
    content: `<p>Potensi perikanan di Kabupaten Kepulauan Meranti kian menarik perhatian investor nasional. Dalam setahun terakhir, tercatat ada lima perusahaan perikanan berskala nasional yang menyatakan minatnya untuk berinvestasi di wilayah ini. Hal ini disampaikan oleh Kepala Dinas Perikanan dan Kelautan Kabupaten Kepulauan Meranti dalam jumpa pers, Selasa (14/1).</p>

<p>Kepulauan Meranti memiliki luas perairan mencapai 1,2 juta hektar dengan potensi ikan yang sangat melimpah. Beberapa komoditas unggulan meliputi ikan selais, ikan tongkol, udang, kepiting bakau, dan ikan kakap. Nilai produksi perikanan tahun 2024 mencapai Rp 2,3 triliun, meningkat 18% dibandingkan tahun sebelumnya.</p>

<p>Salah satu investor yang telah menjalin kerja sama adalah PT Nusantara Seafood yang akan membangun pabrik pengolahan ikan modern di Kecamatan Tebing Tinggi. Investasi senilai Rp 150 miliar ini ditargetkan mulai beroperasi pada kuartal ketiga 2025 dan akan menyerap sekitar 500 tenaga kerja lokal.</p>

<p>"Kami melihat Kepulauan Meranti memiliki potensi luar biasa di sektor perikanan. Kualitas ikan di sini sangat baik dan belum tergarap secara optimal. Dengan adanya fasilitas pengolahan modern, nilai tambah produk perikanan bisa meningkat berkali-kali lipat," ujar Direktur PT Nusantara Seafood.</p>

<p>Pemkab Meranti sendiri telah menyiapkan sejumlah insentif bagi investor, termasuk kemudahan perizinan, keringanan pajak daerah selama tiga tahun, serta ketersediaan lahan industri di kawasan pelabuhan. Dinas terkait juga membuka pelatihan-pelatihan bagi masyarakat lokal agar siap menjadi tenaga kerja terampil di industri perikanan modern.</p>`,
    featuredImage: 'https://placehold.co/1200x600/1a2332/ffffff?text=Investasi+Perikanan+Meranti',
    imageCaption: 'Nelayan Kepulauan Meranti saat melaut di perairan Selat Malaka',
    categoryId: 'cat-ekonomi',
    categoryName: 'Ekonomi & Bisnis',
    categorySlug: 'ekonomi-bisnis',
    authorId: 'author-1',
    authorName: 'Ahmad Fauzi',
    authorPhoto: 'https://placehold.co/200x200/1a2332/ffffff?text=AF',
    tags: ['investasi', 'perikanan', 'ekonomi', 'umkm'],
    status: 'published',
    featured: false,
    breaking: false,
    views: 1856,
    seoTitle: 'Peluang Investasi Perikanan Kepulauan Meranti Meningkat',
    seoDescription: 'Sektor perikanan Kepulauan Meranti menarik minat investor nasional dengan potensi perairan 1,2 juta hektar.',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    publishedAt: daysAgo(2),
  },
  {
    id: 'article-4',
    title: 'Festival Budaya Melayu Meranti Sukses Digelar',
    slug: 'festival-budaya-melayu-meranti-sukses-digelar',
    subheading: 'Ribuan wisatawan memadati acara tahunan yang menampilkan kekayaan budaya Melayu',
    excerpt: 'Festival Budaya Melayu Meranti yang diselenggarakan selama tiga hari berhasil menarik lebih dari 5.000 pengunjung. Acara ini menampilkan berbagai pertunjukan seni, pameran kerajinan, dan kuliner khas Melayu.',
    content: `<p>Festival Budaya Melayu Meranti ke-7 yang diselenggarakan di Taman Budaya Melayu, Selatpanjang, berakhir sukses pada Minggu (12/1). Acara yang berlangsung selama tiga hari ini berhasil menarik lebih dari 5.000 pengunjung, baik dari dalam maupun luar daerah Kepulauan Meranti.</p>

<p>Festival tahun ini mengusung tema "Warisan Leluhur, Inspirasi Masa Depan" dan menampilkan beragam atraksi budaya Melayu. Beberapa pertunjukan yang menjadi favorit pengunjung antara lain tari Zapin, drama lenong, pencak silat Melayu, dan pertunjukan musik gambus. Selain itu, terdapat juga lomba membuat kue jala, lomba menganyam tikar pandan, dan pameran pakaian adat Melayu.</p>

<p>Kepala Dinas Kebudayaan dan Pariwisata menyampaikan bahwa festival ini merupakan upaya pelestarian budaya Melayu yang kian tergerus modernisasi. "Kita ingin generasi muda mengenal dan mencintai budaya leluhur kita. Festival ini bukan sekadar hiburan, tapi juga sarana edukasi dan pelestarian," ujarnya.</p>

<p>Salah satu pengunjung dari Pekanbaru, Dian Permata, mengaku terkesan dengan penyelenggaraan festival ini. "Saya baru pertama kali datang ke sini dan sangat terkejut dengan kekayaan budaya Melayu di Meranti. Pertunjukan Zapin-nya luar biasa, dan makanannya sangat lezat. Pasti akan kembali lagi tahun depan," katanya antusias.</p>

<p>Panitia penyelenggara mencatat bahwa omzet yang dihasilkan selama festival mencapai Rp 750 juta, meningkat 30% dari tahun sebelumnya. Pameran kuliner menjadi kontributor terbesar dengan menu andaman seperti asam pedas patin, gulai ikan selais, dan kue bolu kemojo yang ludes diserbu pengunjung.</p>`,
    featuredImage: 'https://placehold.co/1200x600/1a2332/ffffff?text=Festival+Budaya+Melayu',
    imageCaption: 'Pertunjukan Tari Zapin dalam Festival Budaya Melayu Meranti',
    categoryId: 'cat-budaya',
    categoryName: 'Budaya',
    categorySlug: 'budaya',
    authorId: 'author-2',
    authorName: 'Siti Nurhaliza',
    authorPhoto: 'https://placehold.co/200x200/1a2332/ffffff?text=SN',
    tags: ['budaya', 'festival', 'melayu', 'pariwisata'],
    status: 'published',
    featured: true,
    breaking: false,
    views: 2734,
    seoTitle: 'Festival Budaya Melayu Meranti Sukses - Meranti Report',
    seoDescription: 'Festival Budaya Melayu Meranti ke-7 berhasil menarik lebih dari 5.000 pengunjung selama tiga hari pelaksanaan.',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(4),
    publishedAt: daysAgo(4),
  },
  {
    id: 'article-5',
    title: 'Program Pendidikan Gratis Meranti Raih Penghargaan Nasional',
    slug: 'program-pendidikan-gratis-meranti-raih-penghargaan-nasional',
    subheading: 'Pemkab Meranti terima penghargaan dari Kementerian Pendidikan RI',
    excerpt: 'Program Pendidikan Gratis Kepulauan Meranti berhasil meraih penghargaan nasional dari Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia sebagai program pendidikan daerah terbaik tahun 2024.',
    content: `<p>Kabupaten Kepulauan Meranti kembali mengharumkan nama Riau di kancah nasional. Program Pendidikan Gratis yang digagas Pemkab Meranti berhasil meraih penghargaan sebagai Program Pendidikan Daerah Terbaik 2024 dari Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi (Kemendikbudristek) RI.</p>

<p>Penghargaan diserahkan langsung oleh Menteri Pendidikan kepada Bupati Kepulauan Meranti dalam acara penganugerahan yang berlangsung di Jakarta, Kamis (9/1). Program ini dinilai berhasil meningkatkan angka partisipasi sekolah (APS) di Kepulauan Meranti dari 78% pada tahun 2022 menjadi 93% pada akhir tahun 2024.</p>

<p>Program Pendidikan Gratis Meranti mencakup pembebasan biaya SPP mulai dari SD hingga SMA/SMK, penyediaan buku pelajaran gratis, beasiswa bagi siswa berprestasi dari keluarga kurang mampu, serta program mentoring akademik. Total anggaran yang dialokasikan untuk program ini mencapai Rp 120 miliar per tahun.</p>

<p>"Pendidikan adalah kunci untuk mengubah masa depan anak-anak kita. Kami percaya bahwa setiap anak di Kepulauan Meranti berhak mendapatkan pendidikan yang layak, terlepas dari kondisi ekonomi keluarganya," kata Bupati usai menerima penghargaan. Ia juga menambahkan bahwa keberhasilan program ini tidak lepas dari kerja keras seluruh stakeholder pendidikan di Kepulauan Meranti.</p>

<p>Kepala Dinas Pendidikan menambahkan bahwa ke depan, program ini akan diperluas dengan menambahkan fasilitas internet gratis di seluruh sekolah dan program beasiswa pendidikan tinggi bagi lulusan terbaik dari Kepulauan Meranti.</p>`,
    featuredImage: 'https://placehold.co/1200x600/1a2332/ffffff?text=Pendidikan+Gratis+Meranti',
    imageCaption: 'Bupati Kepulauan Meranti menerima penghargaan pendidikan dari Kemendikbudristek RI',
    categoryId: 'cat-pendidikan',
    categoryName: 'Pendidikan',
    categorySlug: 'pendidikan',
    authorId: 'author-1',
    authorName: 'Ahmad Fauzi',
    authorPhoto: 'https://placehold.co/200x200/1a2332/ffffff?text=AF',
    tags: ['pendidikan', 'penghargaan', 'beasiswa', 'pemkab meranti'],
    status: 'published',
    featured: false,
    breaking: true,
    views: 1567,
    seoTitle: 'Program Pendidikan Gratis Meranti Raih Penghargaan Nasional',
    seoDescription: 'Program Pendidikan Gratis Kepulauan Meranti raih penghargaan nasional dari Kemendikbudristek RI.',
    createdAt: daysAgo(6),
    updatedAt: daysAgo(5),
    publishedAt: daysAgo(5),
  },
  {
    id: 'article-6',
    title: 'Kawasan Wisata Pulau Rangsang Kini Dilengkapi Fasilitas Baru',
    slug: 'kawasan-wisata-pulau-rangsang-kini-dilengkapi-fasilitas-baru',
    subheading: 'Investasi Rp 25 miliar untuk meningkatkan daya tarik wisata',
    excerpt: 'Kawasan wisata Pulau Rangsang mendapatkan penyegaran dengan pembangunan sejumlah fasilitas baru senilai Rp 25 miliar. Fasilitas ini mencakup dermaga wisata, gazebo, area camping, dan toilet umum modern.',
    content: `<p>Pulau Rangsang, salah satu destinasi wisata andalan Kabupaten Kepulauan Meranti, kini tampil lebih menarik dengan hadirnya sejumlah fasilitas baru. Pemkab Meranti melalui Dinas Pariwisata telah menyelesaikan pembangunan fasilitas pendukung wisata senilai Rp 25 miliar yang diresmikan pada Sabtu (11/1).</p>

<p>Fasilitas baru yang dibangun meliputi dermaga wisata sepanjang 150 meter yang bisa digunakan untuk berlayar ke pulau-pulau sekitar, 20 unit gazebo dengan pemandangan laut, area camping ground yang mampu menampung 100 tenda, toilet dan kamar mandi umum modern, area parkir yang luas, serta musholla untuk wisatawan muslim.</p>

<p>Selain fasilitas fisik, Pemkab juga melengkapi kawasan ini dengan akses WiFi gratis, papan informasi digital, dan titik-titik pengisian daya ponsel. Untuk keamanan pengunjung, telah dipasang CCTV di seluruh sudut kawasan dan disiagakan petugas keamanan berpatroli selama 24 jam.</p>

<p>Kepala Dinas Pariwisata mengatakan bahwa pengembangan ini merupakan bagian dari master plan pengembangan pariwisata Kepulauan Meranti 2024-2029. "Pulau Rangsang memiliki potensi alam yang luar biasa - pantai pasir putih, hutan bakau, dan terumbu karang yang masih alami. Dengan fasilitas yang memadai, kami yakin jumlah wisatawan akan meningkat signifikan," jelasnya.</p>

<p>Data dari dinas menunjukkan bahwa kunjungan wisatawan ke Pulau Rangsang pada tahun 2024 mencapai 45.000 orang, meningkat 35% dari tahun sebelumnya. Dengan adanya fasilitas baru ini, target kunjungan tahun 2025 dipatok sebesar 75.000 wisatawan.</p>`,
    featuredImage: 'https://placehold.co/1200x600/1a2332/ffffff?text=Wisata+Pulau+Rangsang',
    imageCaption: 'Dermaga wisata baru di Pulau Rangsang, Kepulauan Meranti',
    categoryId: 'cat-pariwisata',
    categoryName: 'Pariwisata',
    categorySlug: 'pariwisata',
    authorId: 'author-2',
    authorName: 'Siti Nurhaliza',
    authorPhoto: 'https://placehold.co/200x200/1a2332/ffffff?text=SN',
    tags: ['pariwisata', 'pulau rangsang', 'fasilitas', 'wisata'],
    status: 'published',
    featured: false,
    breaking: false,
    views: 987,
    seoTitle: 'Kawasan Wisata Pulau Rangsang Dilengkapi Fasilitas Baru',
    seoDescription: 'Kawasan wisata Pulau Rangsang mendapatkan fasilitas baru senilai Rp 25 miliar termasuk dermaga dan area camping.',
    createdAt: daysAgo(7),
    updatedAt: daysAgo(6),
    publishedAt: daysAgo(6),
  },
  {
    id: 'article-7',
    title: 'Bupati Meranti Lantik Pejabat Baru di Lingkungan Pemkab',
    slug: 'bupati-meranti-lantik-pejabat-baru-di-lingkungan-pemkab',
    subheading: 'Pelantikan melibatkan 45 pejabat eselon III dan IV',
    excerpt: 'Bupati Kepulauan Meranti melantik 45 pejabat baru di lingkungan Pemerintah Kabupaten Kepulauan Meranti. Pelantikan ini merupakan bagian dari program restrukturisasi birokrasi untuk meningkatkan kinerja pemerintahan.',
    content: `<p>Bupati Kepulauan Meranti melantik 45 pejabat administrator dan pengawas di lingkungan Pemerintah Kabupaten Kepulauan Meranti dalam upacara pelantikan yang berlangsung di Aula Kantor Bupati, Selatpanjang, Rabu (8/1). Pelantikan ini meliputi 12 pejabat eselon III dan 33 pejabat eselon IV.</p>

<p>Dalam sambutannya, Bupati menekankan bahwa mutasi jabatan dalam birokrasi merupakan hal yang wajar dan merupakan bagian dari dinamika organisasi pemerintahan. "Mutasi ini bukan sekadar pergantian orang, tapi lebih kepada penempatan SDM yang tepat pada posisi yang tepat. Saya berharap pejabat yang baru dilantik dapat memberikan kontribusi terbaik untuk masyarakat," tegas Bupati.</p>

<p>Beberapa posisi strategis yang mengalami pergantian antara lain Kepala Bidang Perencanaan di Bappeda, Kepala Seksi Pemberdayaan Masyarakat di Dinas Sosial, dan Kepala UPTD Puskesmas di beberapa kecamatan. Proses seleksi dilakukan secara transparan melalui assessment competency dan wawancara oleh tim independen.</p>

<p>Sekretaris Daerah menambahkan bahwa restrukturisasi ini bertujuan untuk menyelaraskan kompetensi pejabat dengan tuntutan jabatan. "Kita ingin memastikan bahwa setiap posisi diisi oleh orang yang memiliki kompetensi yang dibutuhkan. Ini bagian dari komitmen kita untuk mewujudkan birokrasi yang lebih profesional dan akuntabel," ujarnya.</p>

<p>Pejabat yang baru dilantik diminta untuk segera menyusun program kerja 100 hari dan melakukan koordinasi intensif dengan stakeholder terkait di wilayah kerja masing-masing.</p>`,
    featuredImage: 'https://placehold.co/1200x600/1a2332/ffffff?text=Pelantikan+Pejabat+Meranti',
    imageCaption: 'Prosesi pelantikan pejabat baru di lingkungan Pemkab Kepulauan Meranti',
    categoryId: 'cat-politik',
    categoryName: 'Politik',
    categorySlug: 'politik',
    authorId: 'author-3',
    authorName: 'Rizky Pratama',
    authorPhoto: 'https://placehold.co/200x200/1a2332/ffffff?text=RP',
    tags: ['politik', 'pemkab meranti', 'pelantikan', 'birokrasi'],
    status: 'published',
    featured: false,
    breaking: false,
    views: 756,
    seoTitle: 'Bupati Meranti Lantik 45 Pejabat Baru',
    seoDescription: 'Bupati Kepulauan Meranti melantik 45 pejabat baru di lingkungan Pemkab Meranti sebagai bagian dari restrukturisasi birokrasi.',
    createdAt: daysAgo(8),
    updatedAt: daysAgo(7),
    publishedAt: daysAgo(7),
  },
  {
    id: 'article-8',
    title: 'Infrastruktur Jalan di Merbau Diperbaiki, Warga Apresiasi',
    slug: 'infrastruktur-jalan-di-merbau-diperbaiki-warga-apresiasi',
    subheading: 'Peningkatan jalan sepanjang 12 km selesai dalam 3 bulan',
    excerpt: 'Pemerintah Kabupaten Kepulauan Meranti berhasil menyelesaikan perbaikan jalan sepanjang 12 kilometer di Kecamatan Merbau. Warga menyambut baik peningkatan infrastruktur yang sudah lama dinantikan ini.',
    content: `<p>Pasca-diresmikannya jembatan penghubung antar pulau, kini giliran infrastruktur jalan di daratan yang mendapat perhatian serius dari Pemkab Meranti. Peningkatan jalan sepanjang 12 kilometer yang menghubungkan beberapa desa di Kecamatan Merbau telah berhasil diselesaikan dalam waktu tiga bulan.</p>

<p>Proyek peningkatan jalan senilai Rp 45 miliar ini meliputi pengaspalan ulang, penguatan fondasi, pembangunan drainase, serta pemasangan marka jalan dan rambu-rambu lalu lintas. Jalan yang sebelumnya berupa jalan tanah dan kerikil kini telah beraspal hotmix dengan lebar 6 meter, cukup untuk dua lajur kendaraan.</p>

<p>Kepala Dinas PUPR menjelaskan bahwa pemilihan Kecamatan Merbau sebagai prioritas peningkatan jalan didasarkan pada tingkat kerusakan yang tinggi dan volume kendaraan yang terus meningkat. "Jalan ini merupakan akses utama bagi masyarakat Merbau ke pusat kecamatan dan ke ibukota kabupaten. Kondisi jalan yang buruk selama ini sangat menghambat aktivitas ekonomi masyarakat," jelasnya.</p>

<p>Warga setempat menyambut baik perbaikan ini. Haji Ismail, tokoh masyarakat Desa Tanjung Permai, mengaku sangat bersyukur. "Sudah lama kami menunggu jalan ini diperbaiki. Dulu kalau hujan, jalannya becek dan licin, banyak kendaraan yang terjebak. Sekarang sudah mulus, perjalanan ke kota jadi lebih cepat dan aman," ujarnya.</p>

<p>Pemkab Meranti menargetkan peningkatan jalan di tiga kecamatan lainnya pada tahun 2025, yaitu di Rangsang, Tebing Tinggi Barat, dan Pulau Kijang, dengan total panjang jalan yang akan diperbaiki mencapai 35 kilometer.</p>`,
    featuredImage: 'https://placehold.co/1200x600/1a2332/ffffff?text=Jalan+Merbau',
    imageCaption: 'Jalan yang telah diperbaiki di Kecamatan Merbau, Kepulauan Meranti',
    categoryId: 'cat-infrastruktur',
    categoryName: 'Infrastruktur',
    categorySlug: 'infrastruktur',
    authorId: 'author-3',
    authorName: 'Rizky Pratama',
    authorPhoto: 'https://placehold.co/200x200/1a2332/ffffff?text=RP',
    tags: ['infrastruktur', 'jalan', 'merbau', 'pembangunan'],
    status: 'published',
    featured: false,
    breaking: false,
    views: 623,
    seoTitle: 'Jalan di Merbau Diperbaiki - Warga Apresiasi',
    seoDescription: 'Pemkab Meranti selesaikan perbaikan jalan 12 km di Kecamatan Merbau, warga menyambut baik peningkatan infrastruktur ini.',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(9),
    publishedAt: daysAgo(9),
  },
  {
    id: 'article-9',
    title: 'Potensi Ekonomi Digital di Kepulauan Meranti Mulai Berkembang',
    slug: 'potensi-ekonomi-digital-di-kepulauan-meranti-mulai-berkembang',
    subheading: 'Program digitalisasi UMKM berhasil tingkatkan omzet pelaku usaha hingga 40%',
    excerpt: 'Ekonomi digital di Kepulauan Meranti mulai menunjukkan perkembangan yang menggembirakan. Program digitalisasi UMKM yang digagas Pemkab berhasil meningkatkan omzet rata-rata pelaku usaha hingga 40 persen dalam enam bulan terakhir.',
    content: `<p>Kabupaten Kepulauan Meranti mulai menunjukkan potensinya dalam ekonomi digital. Program digitalisasi UMKM yang diluncurkan Pemkab Meranti enam bulan lalu telah menunjukkan hasil yang cukup menggembirakan. Data dari Dinas Koperasi dan UMKM menunjukkan bahwa rata-rata omzet pelaku usaha yang mengikuti program ini meningkat hingga 40%.</p>

<p>Program ini mencakup pelatihan pembuatan konten media sosial, pendirian toko online di marketplace, pemanfaatan aplikasi pembayaran digital, serta pelatihan fotografi produk. Hingga kini, tercatat 350 UMKM telah mengikuti program digitalisasi ini dan berhasil menjual produknya secara online ke berbagai daerah di Indonesia.</p>

<p>Salah satu contoh sukses adalah Ibu Mariam, pengusaha kerupuk ikan selais asli Merbau. Setelah mengikuti pelatihan digitalisasi, produk kerupuknya kini terjual hingga ke Jakarta, Surabaya, dan Bali melalui marketplace. "Dulu saya hanya jual di pasar tradisional, sekarang pesanan online bisa ratusan bungkus per minggu. Omzet naik hampir tiga kali lipat," cerita Mariam dengan wajah berseri-seri.</p>

<p>Untuk mendukung ekosistem ekonomi digital, Pemkab juga telah membangun infrastruktur jaringan internet fiber optik yang menjangkau seluruh kecamatan. Kerja sama dengan beberapa perusahaan telekomunikasi memungkinkan penyediaan akses internet dengan harga terjangkau bagi masyarakat.</p>

<p>Ke depan, Pemkab Meranti berencana meluncurkan program "Meranti Digital Valley" yang akan menyediakan co-working space, inkubator startup, dan program akselerasi bagi para pengusaha muda di bidang teknologi. Program ini dijadwalkan dimulai pada pertengahan tahun 2025.</p>`,
    featuredImage: 'https://placehold.co/1200x600/1a2332/ffffff?text=Ekonomi+Digital+Meranti',
    imageCaption: 'Pelatihan digitalisasi UMKM di Kepulauan Meranti',
    categoryId: 'cat-teknologi',
    categoryName: 'Teknologi',
    categorySlug: 'teknologi',
    authorId: 'author-3',
    authorName: 'Rizky Pratama',
    authorPhoto: 'https://placehold.co/200x200/1a2332/ffffff?text=RP',
    tags: ['teknologi', 'ekonomi digital', 'umkm', 'digitalisasi'],
    status: 'published',
    featured: false,
    breaking: false,
    views: 1245,
    seoTitle: 'Ekonomi Digital di Kepulauan Meranti Berkembang',
    seoDescription: 'Program digitalisasi UMKM di Kepulauan Meranti berhasil tingkatkan omzet pelaku usaha hingga 40%.',
    createdAt: daysAgo(12),
    updatedAt: daysAgo(11),
    publishedAt: daysAgo(11),
  },
  {
    id: 'article-10',
    title: 'Tim SAR Berhasil Evakuasi Nelayan Terdampak Badai di Selat Malaka',
    slug: 'tim-sar-berhasil-evakuasi-nelayan-terdampak-badai-di-selat-malaka',
    subheading: '7 nelayan berhasil diselamatkan setelah 12 jam terapung di laut',
    excerpt: 'Tim SAR gabungan berhasil mengevakuasi tujuh nelayan asal Kepulauan Meranti yang terdampak badai di perairan Selat Malaka. Ketujuh nelayan ditemukan dalam kondisi selamat setelah 12 jam mengapung di laut.',
    content: `<p>Tim SAR gabungan dari BASARNAS, Polairud, dan BPBD Kepulauan Meranti berhasil mengevakuasi tujuh nelayan yang menjadi korban badai di perairan Selat Malaka, pada Kamis (16/1) sekitar pukul 16.00 WIB. Ketujuh nelayan ditemukan dalam kondisi selamat setelah mengapung selama 12 jam menggunakan sekoci darurat.</p>

<p>Kejadian bermula pada Kamis dini hari sekitar pukul 04.00 WIB ketika kapal nelayan yang diawaki tujuh orang mengalami kerusakan mesin diterpa gelombang tinggi dan angin kencang di sekitar perairan utara Pulau Rangsang. Cuaca buruk yang terjadi sejak Rabu malam menyebabkan ombak mencapai ketinggian 3-4 meter.</p>

<p>Koordinator Tim SAR menjelaskan bahwa operasi pencarian dimulai sejak Kamis pagi setelah menerima laporan dari keluarga nelayan yang mengaku kehilangan kontak sejak Rabu malam. "Kami mengerahkan tiga kapal SAR dan satu helikopter untuk pencarian. Pada pukul 14.00, tim berhasil menemukan sekoci yang ditumpangi ketujuh korban sekitar 15 mil dari lokasi terakhir mereka melaut," jelasnya.</p>

<p>Ketujuh nelayan yang merupakan warga Desa Tanjung Harapan, Kecamatan Rangsang, langsung dilarikan ke Puskesmas Rangsang untuk mendapatkan penanganan medis. Dari pemeriksaan awal, satu orang mengalami patah tulang ringan dan dua orang mengalami dehidrasi, sementara empat lainnya dalam kondisi sehat.</p>

<p>Bupati Kepulauan Meranti menyampaikan apresiasi dan terima kasih kepada seluruh tim SAR yang telah berusaha keras mengevakuasi warganya. Ia juga mengingatkan agar nelayan selalu memperhatikan informasi cuaca sebelum melaut dan memastikan kelengkapan keselamatan kapal dalam kondisi baik. Pemkab akan memberikan bantuan peralatan keselamatan berupa life jacket dan alat komunikasi darurat kepada nelayan.</p>`,
    featuredImage: 'https://placehold.co/1200x600/1a2332/ffffff?text=Evakuasi+SAR+Meranti',
    imageCaption: 'Proses evakuasi nelayan oleh Tim SAR gabungan di perairan Selat Malaka',
    categoryId: 'cat-sosial',
    categoryName: 'Sosial',
    categorySlug: 'sosial',
    authorId: 'author-1',
    authorName: 'Ahmad Fauzi',
    authorPhoto: 'https://placehold.co/200x200/1a2332/ffffff?text=AF',
    tags: ['sar', 'nelayan', 'badai', 'selat malaka', 'evakuasi'],
    status: 'published',
    featured: false,
    breaking: true,
    views: 3789,
    seoTitle: 'Tim SAR Evakuasi Nelayan Terdampak Badai Selat Malaka',
    seoDescription: 'Tim SAR berhasil evakuasi 7 nelayan Kepulauan Meranti yang terdampak badai di perairan Selat Malaka.',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    publishedAt: hoursAgo(3),
  },
];

// ======================== COMMENTS ========================

export const DEMO_COMMENTS: Comment[] = [
  {
    id: 'comment-1',
    articleId: 'article-2',
    authorName: 'Budi Santoso',
    authorEmail: 'budi@example.com',
    content: 'Alhamdulillah, jembatan ini sudah lama ditunggu-tunggu. Semoga membawa kemajuan untuk masyarakat Meranti!',
    status: 'approved',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: 'comment-2',
    articleId: 'article-2',
    authorName: 'Rina Wati',
    authorEmail: 'rina@example.com',
    content: 'Kapan bisa dilewati kendaraan roda empat ya? Sudah tidak sabar ingin mencoba!',
    status: 'approved',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: 'comment-3',
    articleId: 'article-4',
    authorName: 'Dewi Lestari',
    content: 'Festivalnya semakin meriah setiap tahun. Bangga dengan budaya Melayu kita!',
    status: 'approved',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
  {
    id: 'comment-4',
    articleId: 'article-5',
    authorName: 'Hendra Gunawan',
    authorEmail: 'hendra@example.com',
    content: 'Semoga program ini terus berlanjut dan anak-anak Meranti semakin pintar.',
    status: 'approved',
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
  },
  {
    id: 'comment-5',
    articleId: 'article-1',
    authorName: 'Ahmad Rizal',
    content: 'Harus ada tindak lanjut yang nyata dari rakor ini, jangan hanya wacana saja.',
    status: 'pending',
    createdAt: hoursAgo(12),
    updatedAt: hoursAgo(12),
  },
];

// ======================== SITE SETTINGS ========================

export const DEFAULT_SETTINGS: SiteSettings = {
  general: {
    siteName: 'Meranti Report',
    tagline: 'Portal Berita Terpercaya Kepulauan Meranti',
    description: 'Meranti Report adalah portal berita online terpercaya yang menyajikan informasi terkini seputar Kabupaten Kepulauan Meranti, Riau. Berita politik, ekonomi, sosial, budaya, dan olahraga.',
    email: 'redaksi@merantireport.id',
    phone: '+62 812-3456-7890',
    address: 'Jl. Dorak No. 1, Selatpanjang, Kepulauan Meranti, Riau 28791',
    logo: '',
    favicon: '',
  },
  appearance: {
    primaryColor: '#1a2332',
    accentColor: '#e63946',
    darkMode: true,
    layout: 'default',
  },
  homepage: {
    latestNewsCount: 10,
    popularNewsCount: 5,
    showBreakingNews: true,
    showGallery: true,
    showVideo: false,
    showNewsletter: true,
  },
  socialMedia: {
    facebook: 'https://facebook.com/merantireport',
    instagram: 'https://instagram.com/merantireport',
    tiktok: 'https://tiktok.com/@merantireport',
    youtube: 'https://youtube.com/@merantireport',
    whatsapp: 'https://wa.me/6281234567890',
    twitter: 'https://twitter.com/merantireport',
  },
  seo: {
    defaultTitle: 'Meranti Report - Portal Berita Kepulauan Meranti',
    metaDescription: 'Portal berita terpercaya Kepulauan Meranti. Berita terkini, politik, ekonomi, sosial, budaya, dan olahraga dari Kabupaten Kepulauan Meranti, Riau.',
    ogImage: '',
    googleVerification: '',
    robotsConfig: 'index, follow',
  },
  advertisement: {
    headerAd: {
      enabled: false,
      script: '',
      image: '',
      link: '',
    },
    homepageAd: {
      enabled: false,
      script: '',
      image: '',
      link: '',
    },
    articleAd: {
      enabled: false,
      script: '',
      image: '',
      link: '',
    },
    sidebarAd: {
      enabled: false,
      script: '',
      image: '',
      link: '',
    },
  },
  comments: {
    enabled: true,
    requireApproval: true,
  },
};

// ======================== DASHBOARD STATS (for demo) ========================

export const DEMO_DASHBOARD_STATS = {
  totalArticles: 10,
  publishedArticles: 10,
  draftArticles: 0,
  todayArticles: 2,
  totalViews: 21696,
  todayViews: 847,
  weekViews: 5892,
  monthViews: 15632,
};

// ======================== MOCK MEDIA ITEMS ========================

export const DEMO_MEDIA: MediaItem[] = [
  {
    id: 'media-1',
    publicId: 'meranti-report/demo1',
    secureUrl: 'https://placehold.co/1200x600/1a2332/ffffff?text=Demo+Image+1',
    url: 'https://placehold.co/1200x600/1a2332/ffffff?text=Demo+Image+1',
    width: 1200,
    height: 600,
    format: 'jpg',
    resourceType: 'image',
    folder: 'meranti-report',
    size: 245000,
    uploadedBy: 'admin',
    createdAt: daysAgo(5),
  },
];
