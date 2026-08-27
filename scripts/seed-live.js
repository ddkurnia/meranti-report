// Meranti Report - Live Database Seed Script
// Uses Firebase REST API to seed Firestore with real data

const FIREBASE_API_KEY = 'AIzaSyCjXtqqbVmyynunMzSZv4-dmQ0uiz99IXQ';
const PROJECT_ID = 'merantireport';

// These will be passed as arguments
let ADMIN_EMAIL = process.argv[2];
let ADMIN_PASSWORD = process.argv[3];

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Usage: node seed-live.js <email> <password>');
  process.exit(1);
}

async function signIn() {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, returnSecureToken: true }),
    }
  );
  const data = await res.json();
  if (!data.idToken) throw new Error('Auth failed: ' + JSON.stringify(data.error || data));
  console.log('✅ Authenticated as', ADMIN_EMAIL);
  return { token: data.idToken, uid: data.localId };
}

async function fsReq(token, method, path, body = null) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents${path}`;
  const opts = {
    method,
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${method} ${path}: ${res.status} - ${err}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function f(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') return { integerValue: val };
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(v => f(v)) } };
  if (val instanceof Date || (typeof val === 'string' && val.match(/^\d{4}-/))) return { timestampValue: typeof val === 'string' ? val : val.toISOString() };
  if (typeof val === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(val).map(([k, v]) => [k, f(v)])) } };
  return { stringValue: String(val) };
}

function makeDoc(fields) {
  return { fields: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, f(v)])) };
}

function makeNested(obj) {
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      result[k] = { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([sk, sv]) => [sk, f(sv)])) } };
    } else {
      result[k] = f(v);
    }
  }
  return { fields: result };
}

// ===== DATA =====
const NOW = new Date().toISOString();
const YESTERDAY = new Date(Date.now() - 86400000).toISOString();
const TWO_DAYS = new Date(Date.now() - 172800000).toISOString();
const THREE_DAYS = new Date(Date.now() - 259200000).toISOString();

const CATEGORIES = [
  { id: 'meranti', name: 'Meranti', slug: 'meranti', description: 'Berita seputar Kabupaten Kepulauan Meranti', order: 1, articleCount: 0, createdAt: NOW, updatedAt: NOW },
  { id: 'selatpanjang', name: 'Selatpanjang', slug: 'selatpanjang', description: 'Berita dari ibukota Kabupaten Kepulauan Meranti', order: 2, articleCount: 0, createdAt: NOW, updatedAt: NOW },
  { id: 'tebing-tinggi', name: 'Tebing Tinggi', slug: 'tebing-tinggi', description: 'Berita dari Kecamatan Tebing Tinggi', order: 3, articleCount: 0, createdAt: NOW, updatedAt: NOW },
  { id: 'tebing-tinggi-barat', name: 'Tebing Tinggi Barat', slug: 'tebing-tinggi-barat', description: 'Berita dari Kecamatan Tebing Tinggi Barat', order: 4, articleCount: 0, createdAt: NOW, updatedAt: NOW },
  { id: 'tebing-tinggi-timur', name: 'Tebing Tinggi Timur', slug: 'tebing-tinggi-timur', description: 'Berita dari Kecamatan Tebing Tinggi Timur', order: 5, articleCount: 0, createdAt: NOW, updatedAt: NOW },
  { id: 'rangsang', name: 'Rangsang', slug: 'rangsang', description: 'Berita dari Kecamatan Rangsang', order: 6, articleCount: 0, createdAt: NOW, updatedAt: NOW },
  { id: 'rangsang-pesisir', name: 'Rangsang Pesisir', slug: 'rangsang-pesisir', description: 'Berita dari Kecamatan Rangsang Pesisir', order: 7, articleCount: 0, createdAt: NOW, updatedAt: NOW },
  { id: 'merbau', name: 'Merbau', slug: 'merbau', description: 'Berita dari Kecamatan Merbau', order: 8, articleCount: 0, createdAt: NOW, updatedAt: NOW },
  { id: 'pulau-merbau', name: 'Pulau Merbau', slug: 'pulau-merbau', description: 'Berita dari Kecamatan Pulau Merbau', order: 9, articleCount: 0, createdAt: NOW, updatedAt: NOW },
  { id: 'tasik-putri-puyu', name: 'Tasik Putri Puyu', slug: 'tasik-putri-puyu', description: 'Berita dari Kecamatan Tasik Putri Puyu', order: 10, articleCount: 0, createdAt: NOW, updatedAt: NOW },
  { id: 'pemerintahan', name: 'Pemerintahan', slug: 'pemerintahan', description: 'Berita seputar pemerintahan daerah', order: 11, articleCount: 0, createdAt: NOW, updatedAt: NOW },
  { id: 'politik', name: 'Politik', slug: 'politik', description: 'Berita politik lokal dan nasional', order: 12, articleCount: 0, createdAt: NOW, updatedAt: NOW },
  { id: 'hukum', name: 'Hukum', slug: 'hukum', description: 'Berita hukum dan kriminal', order: 13, articleCount: 0, createdAt: NOW, updatedAt: NOW },
  { id: 'ekonomi', name: 'Ekonomi', slug: 'ekonomi', description: 'Berita ekonomi dan bisnis', order: 14, articleCount: 0, createdAt: NOW, updatedAt: NOW },
  { id: 'pendidikan', name: 'Pendidikan', slug: 'pendidikan', description: 'Berita pendidikan', order: 15, articleCount: 0, createdAt: NOW, updatedAt: NOW },
  { id: 'kesehatan', name: 'Kesehatan', slug: 'kesehatan', description: 'Berita kesehatan', order: 16, articleCount: 0, createdAt: NOW, updatedAt: NOW },
  { id: 'sosial', name: 'Sosial', slug: 'sosial', description: 'Berita sosial kemasyarakatan', order: 17, articleCount: 0, createdAt: NOW, updatedAt: NOW },
  { id: 'olahraga', name: 'Olahraga', slug: 'olahraga', description: 'Berita olahraga', order: 18, articleCount: 0, createdAt: NOW, updatedAt: NOW },
  { id: 'peristiwa', name: 'Peristiwa', slug: 'peristiwa', description: 'Berita peristiwa penting', order: 19, articleCount: 0, createdAt: NOW, updatedAt: NOW },
  { id: 'lingkungan', name: 'Lingkungan', slug: 'lingkungan', description: 'Berita lingkungan hidup', order: 20, articleCount: 0, createdAt: NOW, updatedAt: NOW },
  { id: 'teknologi', name: 'Teknologi', slug: 'teknologi', description: 'Berita teknologi', order: 21, articleCount: 0, createdAt: NOW, updatedAt: NOW },
  { id: 'nasional', name: 'Nasional', slug: 'nasional', description: 'Berita nasional', order: 22, articleCount: 0, createdAt: NOW, updatedAt: NOW },
];

const AUTHORS = [
  { id: 'author-1', name: 'Ahmad Fauzi', slug: 'ahmad-fauzi', position: 'Pemimpin Redaksi', bio: 'Jurnalis senior dengan pengalaman 15 tahun di bidang pemberitaan Kepulauan Meranti.', photo: 'https://placehold.co/200x200/1a2332/ffffff?text=AF', createdAt: NOW, updatedAt: NOW },
  { id: 'author-2', name: 'Siti Rahmawati', slug: 'siti-rahmawati', position: 'Wakil Pemred', bio: 'Fokus pada pemberitaan pemerintahan dan politik di Kepulauan Meranti.', photo: 'https://placehold.co/200x200/1a2332/ffffff?text=SR', createdAt: NOW, updatedAt: NOW },
  { id: 'author-3', name: 'Rizky Pratama', slug: 'rizky-pratama', position: 'Reporter', bio: 'Reporter muda yang berfokus pada isu sosial, budaya, dan olahraga.', photo: 'https://placehold.co/200x200/1a2332/ffffff?text=RP', createdAt: NOW, updatedAt: NOW },
];

const ARTICLES = [
  {
    id: 'article-1', title: 'Pemkab Meranti Gelar Rapat Koordinasi Pembangunan 2025', slug: 'pemkab-meranti-gelar-rapat-koordinasi-pembangunan-2025',
    subheading: 'Bupati Meranti memimpin rapat membahas program prioritas tahun depan',
    excerpt: 'Pemerintah Kabupaten Kepulauan Meranti menggelar rapat koordinasi pembangunan tahun 2025 yang dipimpin langsung oleh Bupati Meranti.',
    content: '<p>Pemerintah Kabupaten Kepulauan Meranti menggelar rapat koordinasi pembangunan tahun 2025 di Aula Kantor Bupati, Selatpanjang, pada Rabu (15/1). Rapat yang dipimpin langsung oleh Bupati Meranti tersebut dihadiri oleh seluruh kepala OPD, camat se-Kabupaten Kepulauan Meranti, serta tokoh masyarakat.</p><p>Dalam sambutannya, Bupati Meranti menekankan pentingnya sinergi antara pemerintah daerah dengan masyarakat dalam mewujudkan pembangunan yang merata dan berkelanjutan.</p><p>Beberapa program prioritas yang dibahas meliputi pembangunan infrastruktur jalan dan jembatan, peningkatan kualitas pendidikan, penguatan sektor perikanan, dan pengembangan pariwisata bahari.</p>',
    featuredImage: 'https://placehold.co/1200x600/1a2332/ffffff?text=Rapat+Pembangunan', imageCaption: 'Bupati Meranti memimpin rakor pembangunan 2025',
    categoryId: 'pemerintahan', categoryName: 'Pemerintahan', categorySlug: 'pemerintahan',
    authorId: 'author-1', authorName: 'Ahmad Fauzi', authorPhoto: 'https://placehold.co/200x200/1a2332/ffffff?text=AF',
    tags: ['pembangunan', 'pemkab', 'rapat', '2025'], status: 'published', featured: true, breaking: false, views: 2847,
    seoTitle: 'Pemkab Meranti Gelar Rakor Pembangunan 2025', seoDescription: 'Rapat koordinasi pembangunan tahun 2025 Kepulauan Meranti.',
    createdAt: YESTERDAY, updatedAt: YESTERDAY, publishedAt: YESTERDAY,
  },
  {
    id: 'article-2', title: 'Jembatan Penghubung Selatpanjang-Tebing Tinggi Diresmikan', slug: 'jembatan-penghubung-selatpanjang-tebing-tinggi-diresmikan',
    subheading: 'Jembatan sepanjang 1,2 km menjadi penghubung utama dua kecamatan',
    excerpt: 'Jembatan penghubung antara Kecamatan Selatpanjang dan Tebing Tinggi resmi diresmikan oleh Gubernur Riau.',
    content: '<p>Gubernur Riau meresmikan jembatan penghubung antara Kecamatan Selatpanjang dan Kecamatan Tebing Tinggi, Kabupaten Kepulauan Meranti, pada Selasa (14/1). Jembatan sepanjang 1,2 kilometer yang dibangun dengan anggaran Rp 450 miliar ini menjadi proyek strategis nasional.</p><p>Peresmian jembatan ini dihadiri oleh berbagai pejabat tinggi, termasuk Menteri PUPR, serta ribuan warga yang antusias menyaksikan momen bersejarah tersebut.</p><p>Bupati Meranti menyampaikan bahwa jembatan ini akan mempersingkat waktu tempuh dari sekitar 2 jam melalui jalur laut menjadi hanya 15 menit.</p>',
    featuredImage: 'https://placehold.co/1200x600/1a2332/ffffff?text=Jembatan+Selatpanjang', imageCaption: 'Peresmian jembatan penghubung Selatpanjang-Tebing Tinggi',
    categoryId: 'meranti', categoryName: 'Meranti', categorySlug: 'meranti',
    authorId: 'author-1', authorName: 'Ahmad Fauzi', authorPhoto: 'https://placehold.co/200x200/1a2332/ffffff?text=AF',
    tags: ['jembatan', 'infrastruktur', 'selatpanjang', 'tebing tinggi'], status: 'published', featured: true, breaking: true, views: 4521,
    seoTitle: 'Jembatan Selatpanjang-Tebing Tinggi Diresmikan', seoDescription: 'Jembatan 1,2 km penghubung Selatpanjang dan Tebing Tinggi resmi diresmikan.',
    createdAt: YESTERDAY, updatedAt: YESTERDAY, publishedAt: YESTERDAY,
  },
  {
    id: 'article-3', title: 'Peluang Investasi Sektor Perikanan di Kepulauan Meranti Meningkat', slug: 'peluang-investasi-sektor-perikanan-di-kepulauan-meranti-meningkat',
    excerpt: 'Dinas Perikanan mencatat peningkatan 25% minat investasi di sektor perikanan pada kuartal terakhir 2024.',
    content: '<p>Meningkatnya minat investor terhadap sektor perikanan di Kepulauan Meranti menjadi sinyal positif bagi perekonomian daerah. Dinas Perikanan mencatat peningkatan sebesar 25 persen dalam minat investasi pada kuartal terakhir tahun 2024.</p><p>Kepala Dinas Perikanan menjelaskan bahwa potensi perikanan di Kepulauan Meranti sangat besar, dengan luas perairan laut mencapai lebih dari 3.000 km persegi.</p><p>Beberapa area investasi yang menarik perhatian investor antara lain budidaya udang vannamei, pembudidayaan rumput laut, dan pengolahan ikan bernilai tinggi.</p>',
    featuredImage: 'https://placehold.co/1200x600/1a2332/ffffff?text=Investasi+Perikanan', imageCaption: 'Potensi perikanan Kepulauan Meranti menarik minat investor',
    categoryId: 'ekonomi', categoryName: 'Ekonomi', categorySlug: 'ekonomi',
    authorId: 'author-2', authorName: 'Siti Rahmawati', authorPhoto: 'https://placehold.co/200x200/1a2332/ffffff?text=SR',
    tags: ['investasi', 'perikanan', 'ekonomi', 'budidaya'], status: 'published', featured: false, breaking: false, views: 1893,
    createdAt: TWO_DAYS, updatedAt: TWO_DAYS, publishedAt: TWO_DAYS,
  },
  {
    id: 'article-4', title: 'Festival Budaya Melayu Meranti Sukses Digelar', slug: 'festival-budaya-melayu-meranti-sukses-digelar',
    excerpt: 'Festival Budaya Melayu Meranti ke-5 berhasil menarik lebih dari 10.000 pengunjung.',
    content: '<p>Festival Budaya Melayu Meranti yang diselenggarakan untuk kelima kalinya berhasil digelar dengan meriah di Taman Budaya Selatpanjang. Acara yang berlangsung selama tiga hari ini berhasil menarik lebih dari 10.000 pengunjung.</p><p>Festival ini menampilkan berbagai pertunjukan seni budaya Melayu, termasuk tari zapin, silat tradisional, pantun, dan pertunjukan musik gambus.</p><p>Panitia mengungkapkan bahwa festival tahun ini berhasil meningkatkan kunjungan wisatawan sebesar 30 persen dibandingkan tahun sebelumnya.</p>',
    featuredImage: 'https://placehold.co/1200x600/1a2332/ffffff?text=Festival+Melayu', imageCaption: 'Pertunjukan tari zapin pada Festival Budaya Melayu Meranti',
    categoryId: 'sosial', categoryName: 'Sosial', categorySlug: 'sosial',
    authorId: 'author-3', authorName: 'Rizky Pratama', authorPhoto: 'https://placehold.co/200x200/1a2332/ffffff?text=RP',
    tags: ['festival', 'budaya', 'melayu', 'wisata'], status: 'published', featured: true, breaking: false, views: 3156,
    createdAt: TWO_DAYS, updatedAt: TWO_DAYS, publishedAt: TWO_DAYS,
  },
  {
    id: 'article-5', title: 'Program Pendidikan Gratis Meranti Raih Penghargaan Nasional', slug: 'program-pendidikan-gratis-meranti-raih-penghargaan-nasional',
    excerpt: 'Program Pendidikan Gratis Kepulauan Meranti meraih penghargaan dari Kemendikbud sebagai program terinovatif.',
    content: '<p>Kabupaten Kepulauan Meranti kembali mengharumkan nama Riau di tingkat nasional. Program Pendidikan Gratis yang digagas oleh Pemkab Meranti berhasil meraih penghargaan dari Kementerian Pendidikan sebagai program pendidikan daerah terinovatif tahun 2024.</p><p>Program yang telah berjalan sejak tahun 2022 ini memberikan akses pendidikan gratis mulai dari PAUD hingga SMA/sederajat bagi seluruh anak di Kepulauan Meranti.</p><p>Dalam dua tahun pelaksanaannya, program ini berhasil meningkatkan angka partisipasi sekolah dari 78 persen menjadi 92 persen.</p>',
    featuredImage: 'https://placehold.co/1200x600/1a2332/ffffff?text=Pendidikan+Gratis', imageCaption: 'Penghargaan program pendidikan daerah terinovatif',
    categoryId: 'pendidikan', categoryName: 'Pendidikan', categorySlug: 'pendidikan',
    authorId: 'author-2', authorName: 'Siti Rahmawati', authorPhoto: 'https://placehold.co/200x200/1a2332/ffffff?text=SR',
    tags: ['pendidikan', 'penghargaan', 'gratis', 'prestasi'], status: 'published', featured: false, breaking: false, views: 2234,
    createdAt: THREE_DAYS, updatedAt: THREE_DAYS, publishedAt: THREE_DAYS,
  },
  {
    id: 'article-6', title: 'Kawasan Wisata Pulau Rangsang Kini Dilengkapi Fasilitas Baru', slug: 'kawasan-wisata-pulau-rangsang-kini-dilengkapi-fasilitas-baru',
    excerpt: 'Dinas Pariwisata meresmikan sejumlah fasilitas baru di kawasan wisata Pulau Rangsang.',
    content: '<p>Dinas Pariwisata Kabupaten Kepulauan Meranti meresmikan sejumlah fasilitas baru di kawasan wisata Pulau Rangsang, termasuk 10 unit gazebo, area parkir, dan toilet umum.</p><p>Kawasan wisata Pulau Rangsang menawarkan keindahan pantai pasir putih, air laut yang jernih, serta terumbu karang yang masih alami.</p><p>Tahun ini, Dinas Pariwisata juga merencanakan pembangunan penginapan berkonsep eco-tourism di kawasan tersebut.</p>',
    featuredImage: 'https://placehold.co/1200x600/1a2332/ffffff?text=Wisata+Rangsang', imageCaption: 'Fasilitas baru di kawasan wisata Pulau Rangsang',
    categoryId: 'rangsang', categoryName: 'Rangsang', categorySlug: 'rangsang',
    authorId: 'author-3', authorName: 'Rizky Pratama', authorPhoto: 'https://placehold.co/200x200/1a2332/ffffff?text=RP',
    tags: ['wisata', 'rangsang', 'fasilitas', 'pariwisata'], status: 'published', featured: false, breaking: false, views: 1456,
    createdAt: THREE_DAYS, updatedAt: THREE_DAYS, publishedAt: THREE_DAYS,
  },
  {
    id: 'article-7', title: 'Bupati Meranti Lantik Pejabat Baru di Lingkungan Pemkab', slug: 'bupati-meranti-lantik-pejabat-baru-di-lingkungan-pemkab',
    excerpt: 'Bupati melantik 25 pejabat baru dalam upaya penyegaran birokrasi.',
    content: '<p>Bupati Kepulauan Meranti melantik 25 pejabat baru di lingkungan Pemerintah Kabupaten Kepulauan Meranti. Pelantikan ini merupakan bagian dari program penyegaran birokrasi.</p><p>Beberapa posisi kunci yang diganti antara lain Kepala Dinas Pendidikan, Kepala Dinas Kesehatan, dan beberapa camat.</p><p>Seluruh pejabat yang dilantik diminta untuk menyusun program kerja 100 hari sebagai target awal.</p>',
    featuredImage: 'https://placehold.co/1200x600/1a2332/ffffff?text=Pelantikan+Pejabat', imageCaption: 'Pelantikan pejabat baru di lingkungan Pemkab Meranti',
    categoryId: 'pemerintahan', categoryName: 'Pemerintahan', categorySlug: 'pemerintahan',
    authorId: 'author-1', authorName: 'Ahmad Fauzi', authorPhoto: 'https://placehold.co/200x200/1a2332/ffffff?text=AF',
    tags: ['pelantikan', 'pejabat', 'pemkab', 'birokrasi'], status: 'published', featured: false, breaking: false, views: 1678,
    createdAt: THREE_DAYS, updatedAt: THREE_DAYS, publishedAt: THREE_DAYS,
  },
  {
    id: 'article-8', title: 'Infrastruktur Jalan di Merbau Diperbaiki, Warga Apresiasi', slug: 'infrastruktur-jalan-di-merbau-diperbaiki-warga-apresiasi',
    excerpt: 'Pemkab memperbaiki sepanjang 15 kilometer jalan di Kecamatan Merbau yang selama ini dalam kondisi rusak.',
    content: '<p>Pemerintah Kabupaten Kepulauan Meranti telah menyelesaikan perbaikan jalan sepanjang 15 kilometer di Kecamatan Merbau yang selama ini dalam kondisi rusak parah.</p><p>Perbaikan jalan yang menelan biaya Rp 28 miliar ini meliputi pengaspalan, pembuatan drainase, dan penguatan badan jalan.</p><p>Dinas PUPR menargetkan perbaikan jalan di seluruh kecamatan akan selesai dalam dua tahun ke depan.</p>',
    featuredImage: 'https://placehold.co/1200x600/1a2332/ffffff?text=Perbaikan+Jalan', imageCaption: 'Proses perbaikan jalan di Kecamatan Merbau',
    categoryId: 'merbau', categoryName: 'Merbau', categorySlug: 'merbau',
    authorId: 'author-3', authorName: 'Rizky Pratama', authorPhoto: 'https://placehold.co/200x200/1a2332/ffffff?text=RP',
    tags: ['jalan', 'infrastruktur', 'merbau'], status: 'published', featured: false, breaking: false, views: 1234,
    createdAt: THREE_DAYS, updatedAt: THREE_DAYS, publishedAt: THREE_DAYS,
  },
  {
    id: 'article-9', title: 'Potensi Ekonomi Digital di Kepulauan Meranti Mulai Berkembang', slug: 'potensi-ekonomi-digital-di-kepulauan-meranti-mulai-berkembang',
    excerpt: 'Diskominfo mencatat pertumbuhan 40% UMKM yang go digital sepanjang tahun 2024.',
    content: '<p>Dinas Komunikasi dan Informatika mencatat pertumbuhan 40 persen UMKM yang memanfaatkan platform digital di Kepulauan Meranti.</p><p>Produk-produk unggulan seperti kerupuk ikan, dodol mangga, kerajinan rotan, dan batik Melayu kini semakin dikenal melalui e-commerce.</p><p>Ke depan, Pemkab Meranti berencana membangun digital hub yang akan menjadi pusat pengembangan ekonomi digital.</p>',
    featuredImage: 'https://placehold.co/1200x600/1a2332/ffffff?text=Ekonomi+Digital', imageCaption: 'Pelatihan digital untuk UMKM di Kepulauan Meranti',
    categoryId: 'teknologi', categoryName: 'Teknologi', categorySlug: 'teknologi',
    authorId: 'author-2', authorName: 'Siti Rahmawati', authorPhoto: 'https://placehold.co/200x200/1a2332/ffffff?text=SR',
    tags: ['digital', 'umkm', 'ekonomi', 'teknologi'], status: 'published', featured: false, breaking: false, views: 987,
    createdAt: THREE_DAYS, updatedAt: THREE_DAYS, publishedAt: THREE_DAYS,
  },
  {
    id: 'article-10', title: 'Tim SAR Berhasil Evakuasi Nelayan Terdampak Badai di Selat Malaka', slug: 'tim-sar-berhasil-evakuasi-nelayan-terdampak-badai-di-selat-malaka',
    subheading: '7 nelayan berhasil diselamatkan setelah 12 jam terapung di laut',
    excerpt: 'Tim SAR gabungan berhasil mengevakuasi tujuh nelayan asal Kepulauan Meranti yang terdampak badai di Selat Malaka.',
    content: '<p>Tim SAR gabungan berhasil mengevakuasi tujuh nelayan yang menjadi korban badai di perairan Selat Malaka. Ketujuh nelayan ditemukan dalam kondisi selamat setelah mengapung selama 12 jam.</p><p>Kejadian bermula pada Kamis dini hari ketika kapal nelayan mengalami kerusakan mesin diterpa gelombang tinggi di sekitar perairan utara Pulau Rangsang.</p><p>Ketujuh nelayan yang merupakan warga Desa Tanjung Harapan langsung dilarikan ke Puskesmas Rangsang untuk penanganan medis.</p>',
    featuredImage: 'https://placehold.co/1200x600/1a2332/ffffff?text=Evakuasi+SAR', imageCaption: 'Proses evakuasi nelayan oleh Tim SAR gabungan',
    categoryId: 'sosial', categoryName: 'Sosial', categorySlug: 'sosial',
    authorId: 'author-1', authorName: 'Ahmad Fauzi', authorPhoto: 'https://placehold.co/200x200/1a2332/ffffff?text=AF',
    tags: ['sar', 'nelayan', 'badai', 'evakuasi'], status: 'published', featured: false, breaking: true, views: 3789,
    seoTitle: 'Tim SAR Evakuasi Nelayan Terdampak Badai Selat Malaka', seoDescription: 'Tim SAR gabungan menyelamatkan 7 nelayan Kepulauan Meranti.',
    createdAt: YESTERDAY, updatedAt: YESTERDAY, publishedAt: YESTERDAY,
  },
];

const SETTINGS_DOC = {
  general: { siteName: 'Meranti Report', tagline: 'Kabar Meranti, Dari Kita Untuk Kita.', description: 'Portal berita online terpercaya yang menyajikan informasi terkini seputar Kabupaten Kepulauan Meranti, Riau.', email: 'redaksi@merantireport.id', phone: '+62 812-3456-7890', address: 'Jl. Dorak No. 1, Selatpanjang, Kepulauan Meranti, Riau 28791', logo: '', favicon: '' },
  appearance: { primaryColor: '#1a2332', accentColor: '#e63946', darkMode: true, layout: 'default' },
  homepage: { latestNewsCount: 6, popularNewsCount: 5, showBreakingNews: true, showGallery: true, showVideo: false, showNewsletter: true },
  socialMedia: { facebook: 'https://facebook.com/merantireport', instagram: 'https://instagram.com/merantireport', tiktok: '', youtube: '', whatsapp: 'https://wa.me/6281234567890', twitter: 'https://twitter.com/merantireport' },
  seo: { defaultTitle: 'Meranti Report - Kabar Meranti, Dari Kita Untuk Kita', metaDescription: 'Portal berita lokal terpercaya di Kepulauan Meranti.', ogImage: '', googleVerification: '', robotsConfig: 'User-Agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/' },
  advertisement: { headerAd: { enabled: false }, homepageAd: { enabled: false }, articleAd: { enabled: false }, sidebarAd: { enabled: false } },
  comments: { enabled: true, requireApproval: true },
};

// ===== SEED =====
async function seedCollection(token, collection, items) {
  console.log(`\n📦 Seeding ${collection}...`);
  let ok = 0;
  for (const item of items) {
    try {
      await fsReq(token, 'POST', `/${collection}?documentId=${item.id}`, makeDoc(item));
      ok++;
    } catch (e) {
      if (e.message.includes('ALREADY_EXISTS')) {
        await fsReq(token, 'PATCH', `/${collection}/${item.id}`, makeDoc(item));
        ok++;
      } else {
        console.error(`  ❌ ${item.id}: ${e.message.split('\n')[0]}`);
      }
    }
  }
  console.log(`  ✅ ${ok}/${items.length} documents`);
}

async function main() {
  console.log('========================================');
  console.log('  MERANTI REPORT - LIVE DB SEED');
  console.log('========================================\n');

  console.log('🔐 Authenticating...');
  const { token, uid } = await signIn();
  console.log(`  UID: ${uid}`);

  await seedCollection(token, 'categories', CATEGORIES);
  await seedCollection(token, 'authors', AUTHORS);
  await seedCollection(token, 'articles', ARTICLES);

  // Settings (nested)
  console.log('\n⚙️  Seeding settings...');
  try {
    await fsReq(token, 'POST', '/settings?documentId=site', makeNested(SETTINGS_DOC));
    console.log('  ✅ Settings created');
  } catch (e) {
    if (e.message.includes('ALREADY_EXISTS')) {
      await fsReq(token, 'PATCH', '/settings/site', makeNested(SETTINGS_DOC));
      console.log('  ✅ Settings updated');
    } else {
      console.error('  ❌ Settings:', e.message.split('\n')[0]);
    }
  }

  // Admin user
  console.log('\n👤 Creating admin user...');
  try {
    await fsReq(token, 'POST', `/users?documentId=${uid}`, makeDoc({
      email: ADMIN_EMAIL, displayName: 'Admin Meranti', photoURL: '', role: 'super_admin', createdAt: NOW, updatedAt: NOW
    }));
    console.log('  ✅ Admin user created');
  } catch (e) {
    if (e.message.includes('ALREADY_EXISTS')) {
      await fsReq(token, 'PATCH', `/users/${uid}`, makeDoc({
        email: ADMIN_EMAIL, displayName: 'Admin Meranti', photoURL: '', role: 'super_admin', updatedAt: NOW
      }));
      console.log('  ✅ Admin user updated');
    } else {
      console.error('  ❌ User:', e.message.split('\n')[0]);
    }
  }

  console.log('\n========================================');
  console.log('  ✅ SEEDING COMPLETE!');
  console.log('========================================');
  console.log('\n⚠️  Manual steps needed:');
  console.log('  1. Firebase Console > Firestore > Rules → paste firestore.rules content');
  console.log('  2. Firebase Console > Firestore > Indexes → create indexes from firestore.indexes.json');
  console.log('');
}

main().catch(e => { console.error('\n❌ FAILED:', e.message); process.exit(1); });
