import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://merantireport.com';

export const metadata: Metadata = {
  title: 'Pedoman Media',
  description: 'Pedoman media dan jurnalistik Meranti Report. Standar yang kami pegang dalam produksi berita yang akurat dan berintegritas.',
  alternates: { canonical: `${SITE_URL}/pedoman-media` },
  openGraph: {
    title: 'Pedoman Media - Meranti Report',
    description: 'Pedoman media dan jurnalistik Meranti Report.',
    url: `${SITE_URL}/pedoman-media`,
    siteName: 'Meranti Report',
    type: 'website',
  },
};

export default function PedomanMediaPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-10 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Pedoman Media</h1>
          <p className="text-sm text-muted-foreground mb-10">
            Pedoman Jurnalistik Meranti Report &mdash; Terakhir diperbarui: 1 Januari 2025
          </p>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8 text-[15px] leading-relaxed">
            {/* Pendahuluan */}
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Pendahuluan</h2>
              <p className="mb-3">
                Meranti Report berkomitmen untuk menyajikan berita yang akurat, berimbang, dan berkualitas tinggi kepada masyarakat Kepulauan Meranti dan sekitarnya. Pedoman Media ini berfungsi sebagai acuan utama bagi seluruh jurnalis, editor, dan kontributor Meranti Report dalam melaksanakan tugas jurnalistik sehari-hari.
              </p>
              <p>
                Pedoman ini disusun berdasarkan prinsip-prinsip jurnalistik yang diakui secara universal, serta disesuaikan dengan konteks media lokal di Indonesia. Setiap individu yang terlibat dalam proses editorial wajib memahami dan mematuhi pedoman ini sepenuhnya.
              </p>
            </section>

            {/* Visi dan Misi */}
            <section>
              <h2 className="text-xl font-semibold mb-3">2. Visi dan Misi Jurnalistik</h2>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 not-prose space-y-3">
                <div>
                  <p className="font-semibold">Visi</p>
                  <p className="text-sm text-muted-foreground">Menjadi portal berita utama yang paling dipercaya di Kabupaten Kepulauan Meranti, menjadi jembatan informasi antara pemerintah dan masyarakat, serta menjadi corong suara warga Meranti.</p>
                </div>
                <div>
                  <p className="font-semibold">Misi</p>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1 mt-1">
                    <li>Menyajikan berita faktual, akurat, dan terverifikasi secara independen.</li>
                    <li>Mengangkat isu-isu yang relevan bagi masyarakat Kepulauan Meranti.</li>
                    <li>Menjunjung tinggi kebebasan pers dengan tetap bertanggung jawab.</li>
                    <li>Memberikan ruang bagi suara masyarakat melalui komentar dan partisipasi warga.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Kekuasaan Publik */}
            <section>
              <h2 className="text-xl font-semibold mb-3">3. Kekuasaan Publik</h2>
              <p className="mb-3">Kekuasaan publik adalah hak masyarakat untuk mengetahui (right to know). Meranti Report menjalankan fungsi ini dengan prinsip-prinsip berikut:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li><strong>Transparansi:</strong> Kami berkomitmen untuk membuka informasi yang berkaitan dengan kepentingan publik, termasuk kinerja pemerintah daerah, penggunaan anggaran, dan kebijakan publik.</li>
                <li><strong>Akuntabilitas:</strong> Kami menjadi alat kontrol sosial yang mengawasi jalannya pemerintahan dan pelayanan publik di Kepulauan Meranti.</li>
                <li><strong>Keadilan:</strong> Kami memberikan ruang yang proporsional kepada berbagai pihak, termasuk kelompok yang sering terpinggirkan.</li>
                <li><strong>Kemandirian:</strong> Kami menjaga independensi dari kepentingan politik, bisnis, atau tekanan pihak manapun.</li>
              </ul>
            </section>

            {/* Verifikasi Fakta */}
            <section>
              <h2 className="text-xl font-semibold mb-3">4. Verifikasi Fakta</h2>
              <p className="mb-3">Setiap berita yang dipublikasikan wajib melewati proses verifikasi yang ketat. Standar verifikasi kami meliputi:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li><strong>Minimal dua sumber independen:</strong> Setiap fakta dalam berita harus dikonfirmasi oleh minimal dua sumber yang independen dan dapat dipercaya sebelum dipublikasikan.</li>
                <li><strong>Konfirmasi silang:</strong> Informasi yang diperoleh dari satu sumber harus dikonfirmasi melalui sumber lain atau dokumen pendukung.</li>
                <li><strong>Pemeriksaan dokumen:</strong> Dokumen, data resmi, dan bukti fisik harus diverifikasi keasliannya sebelum dijadikan dasar pemberitaan.</li>
                <li><strong>Pemeriksaan visual:</strong> Foto dan video yang diterima dari masyarakat atau sumber lain harus diverifikasi keasliannya sebelum digunakan dalam pemberitaan.</li>
                <li><strong>Tolak hoaks:</strong> Meranti Report berkomitmen untuk tidak mempublikasikan informasi yang belum terverifikasi, informasi yang menyesatkan, atau hoaks dalam bentuk apapun.</li>
              </ul>
            </section>

            {/* Keberimbangan dan Keadilan */}
            <section>
              <h2 className="text-xl font-semibold mb-3">5. Keberimbangan dan Keadilan</h2>
              <p className="mb-3">Dalam setiap pemberitaan, kami memastikan:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li><strong>Hak jawab (right of reply):</strong> Setiap pihak yang disebutkan secara negatif dalam berita wajib diberi kesempatan untuk memberikan tanggapan atau klarifikasi sebelum berita dipublikasikan.</li>
                <li><strong>Coverage kedua belah pihak:</strong> Dalam pemberitaan sengketa atau konflik, kedua belah pihak harus diberi porsi yang proporsional.</li>
                <li><strong>Pemisahan fakta dan opini:</strong> Berita faktual dan opini harus dipisahkan dengan jelas. Opini wajib diberi label yang menunjukkan bahwa itu merupakan pandangan penulis, bukan fakta.</li>
                <li><strong>Konteks yang utuh:</strong> Informasi tidak boleh dipotong atau disajikan secara tendensius yang mengubah makna atau konteks aslinya.</li>
              </ul>
            </section>

            {/* Sumber Berita */}
            <section>
              <h2 className="text-xl font-semibold mb-3">6. Perlindungan Sumber Berita</h2>
              <p className="mb-3">
                Perlindungan sumber berita adalah prinsip fundamental dalam jurnalistik. Meranti Report memiliki kebijakan berikut terkait perlindungan sumber:
              </p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li><strong>Anonimitas:</strong> Identitas sumber berita yang meminta anonimitas akan dilindungi sepanjang alasan permintaan tersebut valid dan berkaitan dengan kepentingan publik.</li>
                <li><strong>Kerahasiaan:</strong> Jurnalis kami tidak akan mengungkapkan identitas sumber rahasia kepada pihak manapun, termasuk aparat penegak hukum, kecuali diwajibkan oleh putusan pengadilan yang berkekuatan hukum tetap.</li>
                <li><strong>Validasi sumber anonim:</strong> Informasi dari sumber anonim tetap harus diverifikasi melalui sumber atau dokumen independen sebelum dipublikasikan.</li>
              </ul>
            </section>

            {/* Etika Pelaporan */}
            <section>
              <h2 className="text-xl font-semibold mb-3">7. Etika Pelaporan</h2>
              <p className="mb-3">Jurnalis Meranti Report wajib mematuhi kode etik berikut:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li><strong>Independensi:</strong> Tidak menerima imbalan, hadiah, atau fasilitas yang dapat memengaruhi independensi jurnalistik.</li>
                <li><strong>Konflik kepentingan:</strong> Wajib mengungkapkan setiap konflik kepentingan yang potensial kepada editor. Jurnalis tidak boleh meliput topik yang memiliki kepentingan pribadi langsung.</li>
                <li><strong>Pengumpulan informasi:</strong> Informasi harus dikumpulkan dengan cara yang sah, jujur, dan etis. Tidak menggunakan penipuan, penyamaran, atau rekaman tersembunyi kecuali untuk investigasi serius yang berkaitan dengan kepentingan publik yang sangat besar dan dengan persetujuan pimpinan redaksi.</li>
                <li><strong>Respek terhadap korban:</strong> Dalam pelaporan tragedi atau kejahatan, jurnalis harus menunjukkan empati dan menghindari sensasionalisme yang tidak perlu terhadap korban dan keluarganya.</li>
                <li><strong>Kekerasan dan grafis:</strong> Konten yang mengandung kekerasan eksplisit atau gambar grafis harus diberi peringatan dan hanya ditampilkan jika memiliki justifikasi jurnalistik yang kuat.</li>
              </ul>
            </section>

            {/* Koreksi dan Retraksi */}
            <section>
              <h2 className="text-xl font-semibold mb-3">8. Koreksi dan Retraksi</h2>
              <p className="mb-3">Meranti Report berkomitmen untuk memperbaiki kesalahan secara transparan:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li><strong>Koreksi segera:</strong> Jika ditemukan ketidakakuratan dalam berita yang telah dipublikasikan, koreksi akan dilakukan segera setelah diketahui.</li>
                <li><strong>Transparansi:</strong> Koreksi akan dicantumkan secara jelas pada artikel yang bersangkutan dengan menampilkan tanggal koreksi dan penjelasan atas perubahan yang dilakukan.</li>
                <li><strong>Retraksi:</strong> Jika kesalahan bersifat fundamental dan berdampak signifikan, artikel dapat diretrak secara penuh dengan penjelasan alasan retraksi.</li>
                <li><strong>Kan koreksi:</strong> Pembaca dapat melaporkan potensi kesalahan berita melalui email redaksi@merantireport.com, dan laporan tersebut akan ditindaklanjuti dalam waktu maksimal 1x24 jam.</li>
              </ul>
            </section>

            {/* Perlindungan Anak */}
            <section>
              <h2 className="text-xl font-semibold mb-3">9. Perlindungan Anak</h2>
              <p className="mb-3">Dalam pemberitaan yang melibatkan anak-anak, kami mematuhi prinsip-prinsip berikut:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Identitas anak (nama, foto, alamat, atau informasi yang dapat mengidentifikasi) tidak boleh ditampilkan dalam konteks negatif, termasuk sebagai korban kekerasan, eksploitasi, atau konflik hukum.</li>
                <li>Wawancara dengan anak memerlukan persetujuan dari orang tua atau wali, dan harus dilakukan dengan pengawasan orang dewasa.</li>
                <li>Konten yang berbahaya bagi anak-anak tidak akan dipublikasikan atau akan diberi peringatan yang jelas.</li>
              </ul>
            </section>

            {/* Penggunaan Foto dan Multimedia */}
            <section>
              <h2 className="text-xl font-semibold mb-3">10. Penggunaan Foto dan Multimedia</h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li><strong>Foto jurnalistik:</strong> Foto yang digunakan dalam pemberitaan harus otentik dan tidak dimanipulasi secara digital dengan cara yang mengubah makna atau konteks.</li>
                <li><strong>Kredit foto:</strong> Foto dari pihak ketiga atau kontributor wajib disertai kredit yang sesuai.</li>
                <li><strong>Ilustrasi:</strong> Jika gambar yang digunakan bersifat ilustrasi (bukan dokumentasi peristiwa nyata), hal ini harus diberi label yang jelas.</li>
                <li><strong>Hak cipta:</strong> Meranti Report menghormati hak cipta karya visual. Penggunaan foto tanpa izin dari pemegang hak cipta adalah pelanggaran yang serius.</li>
              </ul>
            </section>

            {/* Disclaimer Iklan */}
            <section>
              <h2 className="text-xl font-semibold mb-3">11. Pemisahan Konten Editorial dan Iklan</h2>
              <p className="mb-3">
                Meranti Report menjaga pemisahan yang tegas antara konten editorial dan konten komersial:
              </p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li><strong>Label iklan:</strong> Seluruh konten berbayar atau sponsor wajib diberi label yang jelas dan tidak dapat disalahartikan sebagai konten editorial.</li>
                <li><strong>Independensi editorial:</strong> Pemasang iklan tidak memiliki hak untuk mengintervensi atau memengaruhi isi pemberitaan kami.</li>
                <li><strong>Penolakan advertorial semu:</strong> Kami tidak mempublikasikan konten yang menyamar sebagai berita tetapi sebenarnya merupakan promosi atau advertorial tanpa label yang jelas.</li>
              </ul>
            </section>

            {/* Hubungi Kami */}
            <section>
              <h2 className="text-xl font-semibold mb-3">12. Hubungi Redaksi</h2>
              <p className="mb-3">
                Jika Anda ingin menyampaikan keluhan, koreksi, saran, atau pertanyaan terkait penerapan Pedoman Media ini, silakan hubungi:
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
