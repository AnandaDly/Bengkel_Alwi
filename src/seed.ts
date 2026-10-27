import type { Database, Workshop, Product, Question } from './types';
export const AREAS = [
  { name: 'Jakarta Pusat', lat: -6.1865, lng: 106.8341 },
  { name: 'Jakarta Selatan', lat: -6.2615, lng: 106.8106 },
  { name: 'Jakarta Barat', lat: -6.1842, lng: 106.7693 },
  { name: 'Jakarta Timur', lat: -6.225, lng: 106.9004 },
  { name: 'Jakarta Utara', lat: -6.1388, lng: 106.8635 },
];
export const JAKARTA: [number, number] = [-6.2088, 106.832];
export const CATEGORIES = ['Servis rutin', 'Mesin', 'Kelistrikan', 'Ban & kaki-kaki', 'AC mobil', 'Rem'];
const entries: [string, string, number, number, string][] = [
  ['Alwi Auto Care', 'Menteng', -6.1985, 106.8364, '#3d7580'],
  ['Roda Dua Garage', 'Cikini', -6.1911, 106.8435, '#be764b'],
  ['Prima Motorworks', 'Setiabudi', -6.2162, 106.8282, '#4d647b'],
  ['Sahabat Mesin', 'Tanah Abang', -6.1925, 106.8115, '#64774a'],
  ['Bintaro Auto Lab', 'Kebayoran Lama', -6.2488, 106.783, '#596d95'],
  ['Pitstop Kemang', 'Kemang', -6.2607, 106.8143, '#ba785e'],
  ['Garasi Senopati', 'Kebayoran Baru', -6.232, 106.812, '#547a74'],
  ['Maju Jaya Motor', 'Tebet', -6.2348, 106.8519, '#84764e'],
  ['Ceria Auto Service', 'Palmerah', -6.2079, 106.7901, '#6d7690'],
  ['Ruang Mesin', 'Grogol', -6.1636, 106.7929, '#3c777c'],
  ['Utara Garage', 'Kelapa Gading', -6.157, 106.9, '#ad6a4a'],
  ['Berkah Roda', 'Rawamangun', -6.196, 106.881, '#657447'],
  ['Orbit Autocare', 'Cawang', -6.245, 106.872, '#576a82'],
  ['Pelita Motor', 'Sunter', -6.141, 106.867, '#a77554'],
  ['Titik Servis', 'Gambir', -6.172, 106.82, '#54847b'],
];
const productNames = ['Oli mesin sintetis', 'Kampas rem depan', 'Filter udara', 'Busi iridium', 'Aki maintenance free', 'Ban tubeless', 'Cairan coolant', 'Filter oli'];
const titles = ['Mesin bergetar saat berhenti, apa penyebabnya?', 'Kapan sebaiknya ganti oli untuk pemakaian harian?', 'Rem berbunyi setelah terkena hujan', 'AC mobil kurang dingin saat macet', 'Motor sulit dinyalakan di pagi hari', 'Ban terasa licin meski alur masih tebal', 'Lampu indikator aki menyala terus', 'Ada suara berdecit di kaki-kaki mobil', 'Tarikan motor terasa berat belakangan ini', 'Bagaimana memilih oli yang cocok?', 'Setir bergetar pada kecepatan tinggi', 'Apakah filter udara perlu diganti atau dibersihkan?'];
export function createSeed(): Database {
  const workshops: Workshop[] = entries.map(([name, area, lat, lng, color], i) => ({
    id: `w${i + 1}`, ownerId: `m${i + 1}`, name, area, lat, lng, color,
    address: `Jl. ${area} Raya No. ${12 + i * 3}, Jakarta`,
    vehicles: i % 3 === 0 ? ['motor', 'mobil'] : i % 3 === 1 ? ['motor'] : ['mobil'],
    description: 'Perawatan kendaraan yang transparan, ditangani mekanik berpengalaman. Konsultasikan keluhanmu dan temukan solusi sebelum kembali melanjutkan perjalanan.',
    open: '08:00', close: i % 4 === 0 ? '22:00' : '20:00',
    slots: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'], capacity: 2,
    services: [{ id: `s${i}-0`, name: 'Servis rutin', price: i % 3 === 1 ? 75000 : 150000 }, { id: `s${i}-1`, name: CATEGORIES[1 + i % 5], price: 100000 + i * 10000 }, { id: `s${i}-2`, name: 'Ganti oli', price: 50000 }],
    rating: Number((4.6 + (i % 4) / 10).toFixed(1)), reviews: 32 + i * 17,
  }));
  const products: Product[] = Array.from({ length: 40 }, (_, i) => {
    const workshop = workshops[i % workshops.length];
    const vehicle = workshop.vehicles[i % workshop.vehicles.length];
    return { id: `p${i + 1}`, workshopId: workshop.id, name: `${productNames[i % 8]} ${vehicle === 'motor' ? 'Moto' : 'Auto'} ${i % 3 + 1}`, price: [85000, 125000, 65000, 95000, 375000, 285000, 45000, 55000][i % 8], stock: i === 7 ? 0 : 3 + i % 15, vehicle, compatibility: vehicle === 'motor' ? 'Motor 110–155 cc • cek kecocokan dengan mitra' : 'Mobil harian • cek kecocokan dengan mitra', description: 'Sparepart pilihan untuk menjaga performa kendaraan. Informasi produk dan harga merupakan contoh untuk simulasi.', category: productNames[i % 8] };
  });
  const questions: Question[] = titles.map((title, i) => ({
    id: `q${i + 1}`, userId: i % 2 ? 'u2' : 'u1', workshopId: i % 3 === 0 ? workshops[i % 15].id : undefined,
    title, body: 'Halo teman-teman, kendaraan saya dipakai setiap hari untuk perjalanan ke kantor. Belakangan saya mulai merasakan keluhan ini. Apa yang perlu diperiksa terlebih dahulu, dan apakah sebaiknya segera dibawa ke bengkel?',
    vehicle: i % 2 ? 'mobil' : 'motor', model: i % 2 ? 'Toyota Avanza 2021' : 'Honda Vario 2022', category: CATEGORIES[i % 6], resolved: i % 4 === 2,
    createdAt: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
    answers: i % 3 === 1 ? [] : [{ id: `a${i}`, authorId: workshops[i % 15].ownerId, workshopId: workshops[i % 15].id, text: 'Halo! Sebaiknya lakukan pemeriksaan langsung agar penyebabnya bisa dipastikan. Catat kapan keluhan muncul dan riwayat servis terakhir. Kami bisa membantu memeriksa kondisinya sebelum merekomendasikan penggantian komponen.', createdAt: new Date(Date.now() - i * 3600000).toISOString() }],
  }));
  return { version: 1, activeAccountId: 'u1', accounts: [{ id: 'u1', name: 'Raka Pratama', role: 'user' }, { id: 'u2', name: 'Nadia Putri', role: 'user' }, ...workshops.map(w => ({ id: w.ownerId, name: w.name, role: 'mitra' as const })), { id: 'm-new', name: 'Mitra Baru', role: 'mitra' }], vehicles: [{ id: 'v1', userId: 'u1', type: 'motor', model: 'Honda Vario 2022', plate: 'B 1234 DEM' }, { id: 'v2', userId: 'u1', type: 'mobil', model: 'Toyota Avanza 2021', plate: 'B 5678 DEM' }, { id: 'v3', userId: 'u2', type: 'mobil', model: 'Honda Brio 2023', plate: 'B 2023 DEM' }, { id: 'v4', userId: 'u2', type: 'motor', model: 'Yamaha NMAX 2023', plate: 'B 4321 DEM' }], workshops, products, questions, bookings: [], orders: [], carts: {} };
}
