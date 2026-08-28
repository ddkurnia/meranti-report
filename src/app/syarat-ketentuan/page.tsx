import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan - Meranti Report',
  description: 'Syarat dan ketentuan penggunaan layanan Meranti Report. Baca sebelum menggunakan situs berita kami.',
};

export default function SyaratKetentuanPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-10 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Syarat &amp; Ketentuan</h1>
          <p className="text-sm text-muted-foreground mb-10">
            Terakhir diperbarui: 1 Januari 2025
          </p>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8 text-[15px] leading-relaxed">
            {/* Ketentuan Umum */}
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Ketentuan Umum</h2>
              <p className="mb-3">
                Syarat &amp; Ketentuan ini ("Ketentuan") mengatur hubungan antara Anda ("Pengguna") dan Meranti Report ("Kami", "Penyedia") dalam penggunaan situs web <strong>merantireport.com</strong> dan seluruh layanan terkait (secara bersama disebut "Layanan"). Dengan mengakses atau menggunakan Layanan kami, Anda menyatakan bahwa Anda telah membaca, memahami, dan setuju untuk terikat oleh Ketentuan ini.
              </p>
              <p>
                Jika Anda tidak menyetujui sebagian atau seluruh Ketentuan ini, Anda harus menghentikan penggunaan Layanan kami secara langsung. Kami berhak mengubah Ketentuan ini kapan saja, dan perubahan tersebut berlaku efektif segera setelah dipublikasikan di situs.
              </p>
            </section>

            {/* Definisi */}
            <section>
              <h2 className="text-xl font-semibold mb-3">2. Definisi</h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li><strong>"Konten"</strong> berarti seluruh materi yang tersedia di situs, termasuk namun tidak terbatas pada artikel berita, foto, video, grafis, komentar, dan informasi lainnya.</li>
                <li><strong>"Pengguna"</strong> berarti setiap individu yang mengakses atau menggunakan Layanan, baik sebagai pembaca umum maupun pengguna terdaftar.</li>
                <li><strong>"Redaksi"</strong> berarti tim penyunting dan jurnalis Meranti Report yang bertanggung jawab atas produksi dan penerbitan konten.</li>
                <li><strong>"Komentar"</strong> berarti tanggapan, opini, atau pendapat yang dikirimkan oleh Pengguna pada artikel di situs ini.</li>
              </ul>
            </section>

            {/* Penggunaan Layanan */}
            <section>
              <h2 className="text-xl font-semibold mb-3">3. Penggunaan Layanan</h2>
              <p className="mb-3">Anda setuju untuk menggunakan Layanan kami hanya untuk tujuan yang sah dan sesuai dengan Ketentuan ini. Secara khusus, Anda setuju untuk tidak:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Menggunakan situs dengan cara yang melanggar hukum, peraturan, atau hak pihak ketiga manapun.</li>
                <li>Mengirimkan, mempublikasikan, atau menyebarkan konten yang bersifat fitnah, hasutan, diskriminatif, pornografi, atau melanggar hukum.</li>
                <li>Melakukan tindakan yang dapat merusak, menonaktifkan, atau mengganggu fungsionalitas situs, termasuk namun tidak terbatas pada penggunaan bot, malware, atau serangan siber.</li>
                <li>Mengumpulkan atau mengambil data dari situs secara massal tanpa izin tertulis dari kami (scraping).</li>
                <li>Menggunakan Layanan untuk tujuan komersial tanpa izin tertulis, termasuk distribusi konten kami untuk keuntungan finansial.</li>
                <li>Menyamar sebagai pihak lain atau membuat akun dengan identitas palsu.</li>
                <li>Mengunggah atau menyebarkan virus, trojan, atau kode berbahaya lainnya.</li>
              </ul>
            </section>

            {/* Hak Kekayaan Intelektual */}
            <section>
              <h2 className="text-xl font-semibold mb-3">4. Hak Kekayaan Intelektual</h2>
              <p className="mb-3">
                Seluruh Konten yang dipublikasikan di situs Meranti Report, termasuk tetapi tidak terbatas pada artikel, foto, video, grafis, logo, desain, dan kode sumber situs, dilindungi oleh hukum hak cipta Indonesia (Undang-Undang Nomor 28 Tahun 2014 tentang Hak Cipta) dan peraturan terkait lainnya.
              </p>
              <p className="mb-3">Ketentuan penggunaan konten kami adalah sebagai berikut:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li><strong>Pembacaan pribadi:</strong> Anda diperkenankan membaca dan menyimpan konten untuk keperluan pribadi dan non-komersial.</li>
                <li><strong>Pembagian:</strong> Anda dapat membagikan tautan (link) ke artikel kami melalui media sosial atau platform lainnya. Namun, Anda tidak diperkenankan menyalin seluruh artikel ke platform lain tanpa izin tertulis.</li>
                <li><strong>Kutipan:</strong> Kutipan sebagian konten diperbolehkan dengan syarat menyertakan sumber yang jelas dan tautan ke artikel asli.</li>
                <li><strong>Penggunaan komersial:</strong> Segala bentuk penggunaan konten untuk tujuan komersial memerlukan izin tertulis dari Redaksi Meranti Report.</li>
              </ul>
            </section>

            {/* Komentar dan Interaksi */}
            <section>
              <h2 className="text-xl font-semibold mb-3">5. Komentar dan Interaksi Pengguna</h2>
              <p className="mb-3">Dengan mengirimkan komentar di situs kami, Anda menyetujui hal berikut:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Komentar yang Anda kirimkan menjadi tanggung jawab Anda sepenuhnya. Meranti Report tidak bertanggung jawab atas opini yang dikemukakan dalam komentar.</li>
                <li>Kami berhak memoderasi, mengedit, atau menghapus komentar yang melanggar Ketentuan ini tanpa pemberitahuan terlebih dahulu.</li>
                <li>Komentar yang mengandung ujaran kebencian, ancaman, spam, promosi produk, atau konten yang melanggar hukum akan dihapus.</li>
                <li>Dengan mengirimkan komentar, Anda memberikan lisensi non-eksklusif kepada Meranti Report untuk menampilkan komentar tersebut di situs.</li>
              </ul>
            </section>

            {/* Iklan dan Konten Sponsor */}
            <section>
              <h2 className="text-xl font-semibold mb-3">6. Iklan dan Konten Sponsor</h2>
              <p className="mb-3">
                Situs kami menampilkan iklan dan konten sponsor sebagai salah satu sumber pendanaan operasional. Ketentuan terkait iklan adalah sebagai berikut:
              </p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Iklan yang ditampilkan di situs kami berasal dari pihak ketiga dan kami tidak bertanggung jawab atas konten, keakuratan, atau praktik privasi dari situs iklan tersebut.</li>
                <li>Konten sponsor atau konten berbayar akan diberi tanda atau label yang jelas untuk membedakannya dari konten editorial.</li>
                <li>Kami berusaha memastikan bahwa iklan yang ditampilkan relevan dan tidak mengganggu pengalaman membaca pengguna.</li>
                <li>Klik pada iklan akan membawa Anda ke situs pihak ketiga yang tidak dikendalikan oleh kami.</li>
              </ul>
            </section>

            {/* Batasan Tanggung Jawab */}
            <section>
              <h2 className="text-xl font-semibold mb-3">7. Batasan Tanggung Jawab</h2>
              <p className="mb-3">Sejauh diizinkan oleh hukum yang berlaku:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Konten di situs ini disajikan "sebagaimana adanya" dan "sebagaimana tersedia" tanpa jaminan apapun, baik tersurat maupun tersirat, termasuk akurasi, kelengkapan, atau keandalan informasi.</li>
                <li>Kami tidak menjamin bahwa situs akan selalu tersedia, bebas dari kesalahan, atau bebas dari virus atau komponen berbahaya lainnya.</li>
                <li>Meranti Report tidak bertanggung jawab atas kerugian langsung, tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan atau ketidakmampuan menggunakan situs.</li>
                <li>Kami berhak mengubah, menangguhkan, atau menghentikan Layanan sebagian atau seluruhnya tanpa pemberitahuan sebelumnya.</li>
              </ul>
            </section>

            {/* Tautan Pihak Ketiga */}
            <section>
              <h2 className="text-xl font-semibold mb-3">8. Tautan ke Situs Pihak Ketiga</h2>
              <p>
                Situs kami mungkin berisi tautan ke situs web pihak ketiga. Tautan tersebut disediakan untuk kenyamanan Anda dan tidak merupakan endorsement atau rekomendasi atas konten, produk, atau layanan dari situs tersebut. Kami tidak bertanggung jawab atas konten, kebijakan privasi, atau praktik situs pihak ketiga. Kami menyarankan Anda untuk membaca syarat dan ketentuan serta kebijakan privasi setiap situs yang Anda kunjungi melalui tautan dari situs kami.
              </p>
            </section>

            {/* Hukum yang Berlaku */}
            <section>
              <h2 className="text-xl font-semibold mb-3">9. Hukum yang Berlaku</h2>
              <p>
                Ketentuan ini diatur dan ditafsirkan sesuai dengan hukum Republik Indonesia. Segala sengketa yang timbul dari atau terkait dengan Ketentuan ini akan diselesaikan melalui musyawarah untuk mufakat. Apabila musyawarah tidak mencapai kesepakatan, sengketa akan diselesaikan melalui Pengadilan Negeri yang berwenang di wilayah hukum Provinsi Riau.
              </p>
            </section>

            {/* Ketentuan Lainnya */}
            <section>
              <h2 className="text-xl font-semibold mb-3">10. Ketentuan Lainnya</h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li><strong>Keseluruhan kesepakatan:</strong> Ketentuan ini merupakan keseluruhan kesepakatan antara Anda dan Meranti Report terkait penggunaan Layanan, dan menggantikan semua kesepakatan atau komunikasi sebelumnya.</li>
                <li><strong>Keterpisahan:</strong> Jika ada ketentuan dalam dokumen ini yang dianggap tidak sah atau tidak dapat dilaksanakan, ketentuan lainnya tetap berlaku secara penuh.</li>
                <li><strong>Lepas tanggung jawab:</strong> Kegagalan kami untuk melaksanakan hak berdasarkan Ketentuan ini tidak berarti kami melepaskan hak tersebut.</li>
                <li><strong>Hukum yang berlaku:</strong> Ketentuan ini tunduk pada hukum Republik Indonesia.</li>
              </ul>
            </section>

            {/* Hubungi Kami */}
            <section>
              <h2 className="text-xl font-semibold mb-3">11. Hubungi Kami</h2>
              <p className="mb-3">
                Jika Anda memiliki pertanyaan mengenai Syarat &amp; Ketentuan ini, silakan hubungi kami:
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
