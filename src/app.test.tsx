// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { StoreProvider } from './store';
import { repository } from './repository';

vi.mock('./MapView', () => ({ MapView: ({ pick }: { pick?: (point: [number, number]) => void }) => <div aria-label="Peta uji lokal">{pick && <button type="button" onClick={() => pick([-6.21, 106.83])}>Pilih titik demo</button>}</div> }));
vi.setConfig({ testTimeout: 15000 });
beforeEach(async () => { localStorage.clear(); await repository.reset(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function start(path = '/') { return render(<MemoryRouter initialEntries={[path]}><StoreProvider><App/></StoreProvider></MemoryRouter>); }
function desktopNav() { return within(screen.getByRole('navigation', { name: 'Navigasi utama' })); }
async function closeDialog(user: ReturnType<typeof userEvent.setup>) { await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Tutup' })); }

describe('Alur antarmuka tanpa browser eksternal', () => {
  it('booking user diterima mitra dan status bertahan setelah remount', async () => {
    const user = userEvent.setup({ delay: null }); const view = start('/?bengkel=w1');
    await user.click(await screen.findByRole('button', { name: 'Booking servis' }));
    await user.clear(screen.getByLabelText('Tanggal kunjungan'));
    await user.type(screen.getByLabelText('Tanggal kunjungan'), '2099-01-02');
    await user.click(screen.getByRole('button', { name: '09:00' }));
    await user.type(screen.getByLabelText('Ceritakan keluhanmu'), 'Mesin bergetar saat berhenti di lampu merah.');
    await user.click(screen.getByRole('button', { name: 'Lanjutkan' }));
    await user.click(screen.getByRole('button', { name: 'Konfirmasi booking' }));
    expect(await screen.findByText('Menunggu konfirmasi')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Mitra' }));
    await user.click(await screen.findByRole('button', { name: 'Booking servis' }));
    await user.click(screen.getByRole('button', { name: 'Terima booking' }));
    expect(await screen.findByText('Diterima', { selector: '.badge' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'User' }));
    await user.click(desktopNav().getByRole('link', { name: 'Aktivitas' }));
    expect(await screen.findByText('Diterima', { selector: '.badge' })).toBeTruthy();
    view.unmount(); start('/aktivitas');
    expect(await screen.findByText('Diterima', { selector: '.badge' })).toBeTruthy();
    expect((await repository.load()).bookings).toHaveLength(1);
  });
  it('forum mendukung pertanyaan, jawaban mitra, dan penyelesaian oleh user', async () => {
    const user = userEvent.setup({ delay: null }); start('/forum?baru=1');
    await user.type(await screen.findByLabelText('Judul pertanyaan'), 'Suara mesin baru ketika berhenti');
    await user.type(screen.getByLabelText('Merek / model'), 'Honda Vario 2022');
    await user.type(screen.getByLabelText('Detail keluhan'), 'Ada suara tidak biasa ketika motor berhenti sejak kemarin pagi.');
    await user.click(screen.getByRole('button', { name: 'Kirim pertanyaan' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await user.click(screen.getByRole('button', { name: 'Mitra' }));
    await user.click(await screen.findByRole('button', { name: 'Konsultasi' }));
    await user.click(screen.getByRole('link', { name: /Suara mesin baru ketika berhenti/ }));
    await user.type(await screen.findByLabelText('Jawab sebagai Alwi Auto Care'), 'Bisa dibawa untuk pemeriksaan awal agar penyebabnya lebih jelas.');
    await user.click(screen.getByRole('button', { name: 'Kirim tanggapan' }));
    expect(await screen.findByText('Bisa dibawa untuk pemeriksaan awal agar penyebabnya lebih jelas.')).toBeTruthy();
    await closeDialog(user);
    await user.click(screen.getByRole('button', { name: 'User' }));
    await user.click(desktopNav().getByRole('link', { name: 'Forum konsultasi' }));
    await user.click(await screen.findByRole('button', { name: /Suara mesin baru ketika berhenti/ }));
    await user.click(screen.getByRole('button', { name: 'Tandai pertanyaan selesai' }));
    expect(await screen.findByText('Diskusi telah ditandai selesai oleh pemilik pertanyaan.')).toBeTruthy();
    expect((await repository.load()).questions[0].resolved).toBe(true);
  });
  it('checkout gagal lalu sukses menampilkan pesanan dan mengurangi stok sekali', async () => {
    const user = userEvent.setup({ delay: null }); start('/?bengkel=w1');
    const initialStock = (await repository.load()).products[0].stock;
    const dialog = within(await screen.findByRole('dialog'));
    await user.click(dialog.getByRole('button', { name: /Sparepart/ }));
    await user.click(dialog.getAllByRole('button', { name: 'Tambah' })[0]);
    await closeDialog(user);
    await user.click(screen.getByRole('link', { name: 'Keranjang, 1 barang' }));
    await user.click(await screen.findByRole('button', { name: 'Lanjut ke pembayaran' }));
    await user.click(await screen.findByRole('button', { name: 'Simulasi gagal' }));
    expect(await screen.findByText('Simulasi pembayaran gagal. Kamu bisa mencoba kembali.')).toBeTruthy();
    expect((await repository.load()).products[0].stock).toBe(initialStock);
    await user.click(screen.getByRole('button', { name: 'Simulasi berhasil' }));
    expect(await screen.findByText('Sudah dibayar', { selector: '.badge' })).toBeTruthy();
    expect((await repository.load()).products[0].stock).toBe(initialStock - 1);
    await user.click(screen.getByRole('button', { name: 'Mitra' }));
    await user.click(await screen.findByRole('button', { name: 'Pesanan' }));
    await user.click(screen.getByRole('button', { name: 'Mulai siapkan' }));
    await user.click(await screen.findByRole('button', { name: 'Tandai siap diambil' }));
    expect(await screen.findByText('Siap diambil', { selector: '.badge' })).toBeTruthy();
  });
  it('mitra baru mendaftarkan bengkel dan produk yang langsung bisa dicari', async () => {
    const user = userEvent.setup({ delay: null }); start('/akun');
    await user.selectOptions(await screen.findByLabelText('Akun demo aktif'), 'm-new');
    await user.click(await screen.findByRole('button', { name: 'Buka dashboard mitra' }));
    await user.click(await screen.findByRole('button', { name: 'Daftar bengkel' }));
    await user.type(screen.getByLabelText('Nama bengkel'), 'Garasi Integrasi');
    await user.type(screen.getByLabelText('Wilayah / kecamatan'), 'Menteng');
    await user.type(screen.getByLabelText('Alamat lengkap'), 'Jalan Demo Nomor 10, Menteng');
    await user.type(screen.getByLabelText('Tentang bengkel'), 'Bengkel baru untuk pengujian demo.');
    await user.click(screen.getByRole('button', { name: 'Pilih titik demo' }));
    await user.click(screen.getByRole('button', { name: 'Simpan bengkel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(await screen.findByRole('heading', { name: 'Halo, Garasi Integrasi.' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Sparepart' }));
    await user.click(screen.getByRole('button', { name: 'Tambah produk' }));
    await user.type(screen.getByLabelText('Nama produk'), 'Busi Demo Baru');
    await user.type(screen.getByLabelText('Kompatibilitas'), 'Motor harian 125 cc');
    await user.type(screen.getByLabelText('Deskripsi'), 'Produk contoh untuk pengujian.');
    await user.click(screen.getByRole('button', { name: 'Simpan produk' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await user.click(screen.getByRole('button', { name: 'User' }));
    await user.type(await screen.findByRole('textbox', { name: 'Cari bengkel, layanan, atau sparepart' }), 'Busi Demo Baru');
    expect(screen.getByRole('heading', { name: 'Garasi Integrasi' })).toBeTruthy();
    const db = await repository.load(); expect(db.workshops).toHaveLength(16); expect(db.products).toHaveLength(41); expect(db.workshops[15].lat).toBe(-6.21);
  });
  it('penolakan izin lokasi mempertahankan daftar dan menyampaikan pesan', async () => {
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: { getCurrentPosition: (_ok: unknown, fail: () => void) => fail() } });
    const user = userEvent.setup({ delay: null }); start('/');
    await user.click(await screen.findByRole('button', { name: 'Lokasi saya' }));
    expect(await screen.findByRole('status')).toBeTruthy();
    expect(screen.getByText('Lokasi belum diizinkan atau tidak tersedia. Peta tetap dapat digunakan.')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Alwi Auto Care' })).toBeTruthy();
  });
});

describe('Repository lokal', () => {
  it('mengantrekan pembaruan agar perubahan beruntun tidak saling menimpa', async () => { await Promise.all([repository.transact(d => { d.products[0].stock += 2; }), repository.transact(d => { d.products[0].stock += 3; })]); expect((await repository.load()).products[0].stock).toBe(8); });
  it('tidak menyimpan mutasi gagal dan bisa memproses transaksi berikutnya', async () => { await expect(repository.transact(d => { d.products[0].stock = 900; throw new Error('Gagal uji'); })).rejects.toThrow('Gagal uji'); expect((await repository.load()).products[0].stock).toBe(3); await repository.transact(d => { d.products[0].stock = 5; }); expect((await repository.load()).products[0].stock).toBe(5); });
  it('menampilkan kegagalan storage tanpa mengubah data tersimpan', async () => { const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Quota'); }); await expect(repository.transact(d => { d.products[0].stock = 20; })).rejects.toThrow('Penyimpanan'); spy.mockRestore(); expect((await repository.load()).products[0].stock).toBe(3); });
});
