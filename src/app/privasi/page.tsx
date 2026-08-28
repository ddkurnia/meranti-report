import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi - Meranti Report',
  description: 'Kebijakan privasi Meranti Report. Pelajari bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.',
};

export default function KebijakanPrivasiPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-10 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Kebijakan Privasi</h1>
          <p className="text-sm text-muted-foreground mb-10">
            Terakhir diperbarui: 1 Januari 2025
          </p>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8 text-[15px] leading-relaxed">
            {/* Pendahuluan */}
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Pendahuluan</h2>
              <p className="mb-3">
                Meranti Report (&quot;Kami&quot;) berkomitmen untuk melindungi privasi pengguna layanan kami. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda saat mengakses dan menggunakan situs <strong>merantireport.com</strong> serta seluruh layanan terkait yang kami sediakan.
              </p>
              <p>
                Dengan mengakses dan menggunakan situs kami, Anda menyetujui praktik pengumpulan dan penggunaan informasi yang dijelaskan dalam Kebijakan Privasi ini. Jika Anda tidak setuju dengan kebijakan ini, mohon untuk tidak menggunakan layanan kami.
              </p>
            </section>

            {/* Informasi yang Dikumpulkan */}
            <section>
              <h2 className="text-xl font-semibold mb-3">2. Informasi yang Kami Kumpulkan</h2>

              <h3 className="text-base font-semibold mb-2">2.1 Informasi yang Anda Berikan Secara Langsung</h3>
              <ul className="list-disc pl-6 space-y-1.5 mb-4">
                <li><strong>Data identitas:</strong> Nama lengkap, alamat email, dan kata sandi saat Anda mendaftar akun atau berlangganan newsletter.</li>
                <li><strong>Data komentar:</strong> Nama, alamat email, dan isi komentar yang Anda kirimkan pada artikel kami.</li>
                <li><strong>Kontak:</strong> Informasi yang Anda sampaikan melalui formulir kontak atau email langsung kepada redaksi.</li>
              </ul>

              <h3 className="text-base font-semibold mb-2">2.2 Informasi yang Dikumpulkan Secara Otomatis</h3>
              <ul className="list-disc pl-6 space-y-1.5 mb-4">
                <li><strong>Data perangkat:</strong> Jenis browser, sistem operasi, resolusi layar, dan jenis perangkat yang Anda gunakan untuk mengakses situs.</li>
                <li><strong>Data penggunaan:</strong> Halaman yang dikunjungi, waktu kunjungan, durasi membaca, artikel yang dibaca, dan pola navigasi di situs kami.</li>
                <li><strong>Data lokasi umum:</strong> Kota atau wilayah berdasarkan alamat IP, yang digunakan untuk menyajikan konten yang relevan bagi pembaca di Kepulauan Meranti dan sekitarnya.</li>
                <li><strong>Cookies dan teknologi serupa:</strong> Kami menggunakan cookies untuk meningkatkan pengalaman pengguna, mengingat preferensi Anda, dan menganalisis lalu lintas situs.</li>
              </ul>

              <h3 className="text-base font-semibold mb-2">2.3 Informasi dari Pihak Ketiga</h3>
              <p>
                Kami dapat menerima informasi dari layanan pihak ketiga yang terintegrasi dengan situs kami, seperti analitik dari penyedia layanan hosting dan analitik web. Informasi ini dikumpulkan sesuai dengan kebijakan privasi masing-masing penyedia layanan.
              </p>
            </section>

            {/* Penggunaan Informasi */}
            <section>
              <h2 className="text-xl font-semibold mb-3">3. Penggunaan Informasi</h2>
              <p className="mb-3">Kami menggunakan informasi yang dikumpulkan untuk tujuan berikut:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Menyediakan, mengoperasikan, dan memelihara layanan situs berita kami.</li>
                <li>Menyajikan konten berita yang dipersonalisasi sesuai minat dan lokasi Anda.</li>
                <li>Mengirimkan newsletter, pemberitahuan breaking news, dan update konten jika Anda berlangganan.</li>
                <li>Menganalisis penggunaan situs untuk meningkatkan kualitas konten dan pengalaman pengguna.</li>
                <li>Memoderasi komentar dan memastikan interaksi yang sehat di platform kami.</li>
                <li>Mencegah penyalahgunaan, spam, dan aktivitas yang melanggar hukum di situs kami.</li>
                <li>Memenuhi kewajiban hukum dan menanggapi permintaan dari otoritas yang berwenang.</li>
              </ul>
            </section>

            {/* Pembagian Informasi */}
            <section>
              <h2 className="text-xl font-semibold mb-3">4. Pembagian Informasi</h2>
              <p className="mb-3">Kami <strong>tidak menjual</strong> data pribadi Anda kepada pihak manapun. Informasi Anda hanya dibagikan dalam keadaan berikut:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li><strong>Penyedia layanan:</strong> Kami membagikan data dengan penyedia layanan teknis (hosting, analitik, penyimpanan cloud) yang membantu kami menjalankan situs. Mereka hanya menggunakan data sesuai instruksi kami dan memiliki kewajiban kerahasiaan.</li>
                <li><strong>Kewajiban hukum:</strong> Kami dapat mengungkapkan informasi jika diwajibkan oleh hukum, peraturan, proses hukum, atau permintaan pemerintah yang sah.</li>
                <li><strong>Perlindungan hak:</strong> Kami dapat membagikan informasi untuk melindungi hak, properti, atau keselamatan Meranti Report, pengguna kami, atau pihak lain.</li>
                <li><strong>Dengan persetujuan Anda:</strong> Dalam situasi lain, kami hanya akan membagikan informasi dengan persetujuan eksplisit dari Anda.</li>
              </ul>
            </section>

            {/* Keamanan Data */}
            <section>
              <h2 className="text-xl font-semibold mb-3">5. Keamanan Data</h2>
              <p className="mb-3">
                Kami menerapkan langkah-langkah keamanan teknis dan organisasional yang wajar untuk melindungi informasi pribadi Anda dari akses yang tidak sah, perubahan, pengungkapan, atau penghancuran. Langkah-langkah ini meliputi:
              </p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Enkripsi data menggunakan protokol HTTPS/SSL untuk semua komunikasi antara browser Anda dan server kami.</li>
                <li>Autentikasi yang aman untuk akses ke panel admin dengan kontrol berbasis peran (role-based access control).</li>
                <li>Penyimpanan data pada infrastruktur cloud yang telah bersertifikasi keamanan internasional.</li>
                <li>Pemantauan berkala terhadap akses tidak sah dan aktivitas mencurigakan.</li>
              </ul>
              <p className="mt-3">
                Meskipun kami berupaya semaksimal mungkin, tidak ada metode transmisi data melalui internet atau penyimpanan elektronik yang 100% aman. Kami tidak dapat menjamin keamanan absolut atas informasi Anda.
              </p>
            </section>

            {/* Hak Pengguna */}
            <section>
              <h2 className="text-xl font-semibold mb-3">6. Hak Pengguna</h2>
              <p className="mb-3">Anda memiliki hak-hak berikut terkait data pribadi Anda:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li><strong>Hak akses:</strong> Anda berhak mengetahui data pribadi apa saja yang kami simpan tentang Anda.</li>
                <li><strong>Hak koreksi:</strong> Anda dapat meminta perbaikan data yang tidak akurat atau tidak lengkap.</li>
                <li><strong>Hak penghapusan:</strong> Anda dapat meminta penghapusan data pribadi Anda dari sistem kami, kecuali jika penyimpanan diperlukan untuk memenuhi kewajiban hukum.</li>
                <li><strong>Hak pembatasan:</strong> Anda dapat meminta pembatasan pemrosesan data pribadi Anda dalam kondisi tertentu.</li>
                <li><strong>Hak portabilitas:</strong> Anda berhak menerima salinan data pribadi Anda dalam format yang terstruktur dan dapat dibaca mesin.</li>
                <li><strong>Hak keberatan:</strong> Anda berhak menolak pemrosesan data pribadi Anda untuk tujuan pemasaran langsung.</li>
              </ul>
              <p className="mt-3">
                Untuk mengajukan permintaan terkait hak-hak di atas, silakan hubungi kami melalui email <strong>redaksi@merantireport.com</strong>.
              </p>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-xl font-semibold mb-3">7. Penggunaan Cookies</h2>
              <p className="mb-3">Situs kami menggunakan cookies dan teknologi pelacakan serupa untuk:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li><strong>Cookies esensial:</strong> Diperlukan agar situs berfungsi dengan baik, seperti autentikasi login dan preferensi tampilan.</li>
                <li><strong>Cookies analitik:</strong> Membantu kami memahami bagaimana pengunjung berinteraksi dengan situs, yang digunakan untuk meningkatkan konten dan pengalaman pengguna.</li>
                <li><strong>Cookies fungsional:</strong> Mengingat preferensi Anda (seperti tema gelap/terang) untuk memberikan pengalaman yang lebih baik.</li>
              </ul>
              <p className="mt-3">
                Anda dapat mengatur atau menonaktifkan cookies melalui pengaturan browser Anda. Namun, menonaktifkan cookies tertentu dapat memengaruhi fungsionalitas situs.
              </p>
            </section>

            {/* Konten Pihak Ketiga */}
            <section>
              <h2 className="text-xl font-semibold mb-3">8. Konten dan Tautan Pihak Ketiga</h2>
              <p>
                Situs kami mungkin berisi tautan ke situs web pihak ketiga dan konten yang di-embed dari sumber eksternal (seperti video YouTube atau media sosial). Kami tidak bertanggung jawab atas praktik privasi atau konten dari situs pihak ketiga tersebut. Kami menyarankan Anda untuk membaca kebijakan privasi setiap situs yang Anda kunjungi.
              </p>
            </section>

            {/* Retensi Data */}
            <section>
              <h2 className="text-xl font-semibold mb-3">9. Retensi Data</h2>
              <p className="mb-3">
                Kami menyimpan data pribadi Anda selama diperlukan untuk memenuhi tujuan yang dijelaskan dalam kebijakan ini, kecuali jika periode penyimpanan yang lebih lama diwajibkan atau diizinkan oleh hukum. Secara umum:
              </p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Data akun pengguna disimpan selama akun aktif atau hingga Anda meminta penghapusan.</li>
                <li>Komentar disimpan selama artikel terbit atau hingga dihapus oleh moderator.</li>
                <li>Data analitik yang dianonimkan dapat disimpan untuk jangka panjang untuk keperluan penelitian dan pengembangan.</li>
              </ul>
            </section>

            {/* Perubahan Kebijakan */}
            <section>
              <h2 className="text-xl font-semibold mb-3">10. Perubahan Kebijakan Privasi</h2>
              <p>
                Kami berhak memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan signifikan akan diumumkan melalui pemberitahuan di situs kami. Tanggal pembaruan terakhir akan dicantumkan di bagian atas halaman ini. Kami menyarankan Anda untuk meninjau kebijakan ini secara berkala.
              </p>
            </section>

            {/* Hubungi Kami */}
            <section>
              <h2 className="text-xl font-semibold mb-3">11. Hubungi Kami</h2>
              <p className="mb-3">
                Jika Anda memiliki pertanyaan, keluhan, atau permintaan terkait Kebijakan Privasi ini atau praktik penanganan data kami, silakan hubungi:
              </p>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 not-prose">
                <p className="font-semibold">Meranti Report - Redaksi</p>
                <p className="text-sm text-muted-foreground mt-1">Email: redaksi@merantireport.com</p>
                <p className="text-sm text-muted-foreground">Alamat: Selat Panjang, Kepulauan Meranti, Riau, Indonesia</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}