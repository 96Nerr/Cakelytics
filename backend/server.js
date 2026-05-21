const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Import alat-alat baru wajib Prisma 7
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const app = express();
const PORT = process.env.PORT || 5000;

// 2. Setup "Sopir" Koneksi Database (Driver Adapter)
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// 3. Masukkan adapter ke dalam Prisma Client
const prisma = new PrismaClient({ adapter });

// Middleware
app.use(cors());
app.use(express.json());

// --- ENDPOINT API ---

// Route Dasar
app.get('/', (req, res) => {
  res.send('Server Backend Cakelytics Berjalan Lancar! 🍰');
});

// Route Ambil Semua Data Produk
app.get('/api/produk', async (req, res) => {
  try {
    const semuaProduk = await prisma.produk.findMany();
    res.json(semuaProduk);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil data produk" });
  }
});

// Route Tambah Produk Baru (POST)
app.post('/api/produk', async (req, res) => {
  try {
    // 1. Menangkap data yang dikirim dari aplikasi HP
    const { namaProduk, hargaModal, hargaJual, stok } = req.body;

    // 2. Menyuruh Prisma memasukkan data tersebut ke database
    const produkBaru = await prisma.produk.create({
      data: {
        namaProduk: namaProduk,
        hargaModal: hargaModal,
        hargaJual: hargaJual,
        stok: stok
      }
    });

    // 3. Mengirimkan balasan sukses beserta data yang baru dibuat
    res.status(201).json(produkBaru);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menambah produk" });
  }
});

// Route Edit Produk (PUT)
app.put('/api/produk/:id', async (req, res) => {
  try {
    // Tangkap ID dari ujung URL (misal: /api/produk/1)
    const productId = parseInt(req.params.id); 
    const { namaProduk, hargaModal, hargaJual, stok } = req.body;

    const produkDiupdate = await prisma.produk.update({
      where: { idProduk: productId },
      data: {
        namaProduk: namaProduk,
        hargaModal: hargaModal,
        hargaJual: hargaJual,
        stok: stok
      }
    });

    res.json(produkDiupdate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengupdate produk" });
  }
});

// Route Hapus Produk (DELETE)
app.delete('/api/produk/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    await prisma.produk.delete({
      where: { idProduk: productId }
    });

    res.json({ message: "Produk berhasil dihapus 🗑️" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menghapus produk" });
  }
});

// Route Tambah Transaksi Baru (POST) & Potong Stok Otomatis
app.post('/api/transaksi', async (req, res) => {
  try {
    // metodePembayaran dihapus dari penangkapan data
    const { totalPenjualan, detailPesanan } = req.body;

    const transaksiBaru = await prisma.$transaction(async (tx) => {
      
      const transaksi = await tx.transaksiPenjualan.create({
        data: {
          totalPenjualan: totalPenjualan,
          // metodePembayaran dihapus dari sini
          detailPenjualan: {
            create: detailPesanan 
          }
        },
        include: {
          detailPenjualan: true 
        }
      });

      for (const item of detailPesanan) {
        await tx.produk.update({
          where: { idProduk: item.idProduk },
          data: {
            stok: {
              decrement: item.jumlah
            }
          }
        });
      }

      return transaksi;
    });

    res.status(201).json(transaksiBaru);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mencatat transaksi penjualan" });
  }
});

// Route Ambil Semua Data Transaksi (GET)
app.get('/api/transaksi', async (req, res) => {
  try {
    const semuaTransaksi = await prisma.transaksiPenjualan.findMany({
      // include ini penting agar rincian kuenya (detail) ikut tampil!
      include: {
        detailPenjualan: true 
      }
    });
    
    res.json(semuaTransaksi);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil data transaksi" });
  }
});


app.get('/api/riwayat-penjualan', async (req, res) => {
  try {
    const data = await prisma.transaksiPenjualan.findMany({
      include: {
        detailPenjualan: {
          include: {
            produk: true
          }
        }
      },
      orderBy: {
        tanggalTransaksi: 'desc'
      }
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil riwayat penjualan" });
  }
});


app.get('/api/transaksi/filter', async (req, res) => {
  try {
    const { start, end } = req.query;

    const data = await prisma.transaksiPenjualan.findMany({
      where: {
        tanggalTransaksi: {
          gte: new Date(start),
          lt: new Date(end),
        },
      },
      include: {
        detailPenjualan: {
          include: {
            produk: true,
          },
        },
      },
      orderBy: {
        tanggalTransaksi: 'desc',
      },
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil transaksi" });
  }
});



// ==========================================
// ROUTE PRODUKSI (KUE MASUK / MATANG)
// ==========================================

// 1. Route Ambil Riwayat Produksi (GET)
app.get('/api/produksi', async (req, res) => {
  try {
    const riwayatProduksi = await prisma.produksi.findMany({
      include: {
        produk: true // Membawa data produk agar kita tahu nama kuenya
      }
    });
    res.json(riwayatProduksi);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil data produksi" });
  }
});

// 2. Route Catat Produksi Baru & Tambah Stok (POST)
app.post('/api/produksi', async (req, res) => {
  try {
    const { idProduk, jumlahProduksi } = req.body;

    // Gunakan Transaction agar pencatatan dan penambahan stok berjalan satu paket
    const produksiBaru = await prisma.$transaction(async (tx) => {
      
      // A. Catat riwayat produksi ke tabel Produksi
      const produksi = await tx.produksi.create({
        data: {
          idProduk: idProduk,
          jumlahProduksi: jumlahProduksi
        }
      });

      // B. Tambahkan stok ke tabel Produk
      await tx.produk.update({
        where: { idProduk: idProduk },
        data: {
          stok: {
            increment: jumlahProduksi // prisma otomatis menjumlahkan stok lama + stok baru
          }
        }
      });

      return produksi;
    });

    res.status(201).json(produksiBaru);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mencatat produksi" });
  }
});

// 3. Route Hapus Riwayat Produksi & Kembalikan Stok (DELETE)
app.delete('/api/produksi/:id', async (req, res) => {
  try {
    const idProduksi = parseInt(req.params.id);

    // 1. Cari data produksinya dulu untuk tahu berapa jumlah stok yang harus ditarik kembali
    const dataProduksi = await prisma.produksi.findUnique({
      where: { idProduksi: idProduksi }
    });

    if (!dataProduksi) {
      return res.status(404).json({ error: "Data produksi tidak ditemukan" });
    }

    // 2. Lakukan proses Hapus dan Tarik Stok secara bersamaan
    await prisma.$transaction(async (tx) => {
      
      // A. Tarik kembali / kurangi stok di tabel Produk
      await tx.produk.update({
        where: { idProduk: dataProduksi.idProduk },
        data: {
          stok: {
            decrement: dataProduksi.jumlahProduksi 
          }
        }
      });

      // B. Hapus riwayat produksinya dari tabel
      await tx.produksi.delete({
        where: { idProduksi: idProduksi }
      });

    });

    res.json({ message: "Data produksi dihapus dan stok berhasil dikembalikan" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menghapus data produksi" });
  }
});

// ==========================================
// ROUTE BARANG RUSAK (KUE BASI / HANCUR)
// ==========================================

// 1. Route Ambil Riwayat Barang Rusak (GET)
app.get('/api/barang-rusak', async (req, res) => {
  try {
    const riwayatRusak = await prisma.barangRusak.findMany({
      include: {
        produk: true // Membawa data produk agar tahu nama kuenya
      }
    });
    res.json(riwayatRusak);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil riwayat barang rusak" });
  }
});

// 2. Route Catat Barang Rusak & Kurangi Stok (POST)
app.post('/api/barang-rusak', async (req, res) => {
  try {
    const { idProduk, jumlahRusak, keterangan } = req.body;

    const barangRusakBaru = await prisma.$transaction(async (tx) => {
      
      // A. Cari tahu harga modal kue ini dulu untuk menghitung kerugian
      const infoProduk = await tx.produk.findUnique({
        where: { idProduk: idProduk }
      });

      if (!infoProduk) {
        throw new Error("Produk tidak ditemukan!"); // Batalkan jika kue tidak ada
      }

      // Hitung kerugian (misal: 2 kue rusak x harga modal 25.000 = 50.000)
      const hitungKerugian = jumlahRusak * infoProduk.hargaModal;

      // B. Catat datanya ke tabel Barang Rusak
      const rusak = await tx.barangRusak.create({
        data: {
          idProduk: idProduk,
          jumlahRusak: jumlahRusak,
          totalKerugian: hitungKerugian, // Masukkan hasil hitungan otomatis ke database
          keterangan: keterangan
        }
      });

      // C. Kurangi stok di tabel Produk
      await tx.produk.update({
        where: { idProduk: idProduk },
        data: {
          stok: {
            decrement: jumlahRusak 
          }
        }
      });

      return rusak;
    });

    res.status(201).json(barangRusakBaru);
  } catch (error) {
    console.error(error);
    // Mengirim pesan error yang lebih spesifik jika produk tidak ditemukan
    res.status(500).json({ error: error.message || "Gagal mencatat barang rusak" });
  }
});

// ==========================================
// ROUTE DASHBOARD (ANALITYCS)
// ==========================================

app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // 1. Hitung Total Penjualan (Omzet) Keseluruhan
    const totalOmzet = await prisma.transaksiPenjualan.aggregate({
      _sum: {
        totalPenjualan: true
      }
    });

    // 2. Hitung Total Kerugian (Barang Rusak)
    const totalRugi = await prisma.barangRusak.aggregate({
      _sum: {
        totalKerugian: true
      }
    });

    // 3. Hitung Produk Terlaris (Top 5)
    // Kita grouping berdasarkan idProduk dan jumlahkan qty yang terjual
    const produkTerlaris = await prisma.detailPenjualan.groupBy({
      by: ['idProduk'],
      _sum: {
        jumlah: true
      },
      orderBy: {
        _sum: {
          jumlah: 'desc'
        }
      },
      take: 5 // Ambil 5 teratas saja
    });

    // Ambil detail nama produk untuk produk terlaris tersebut
    const produkTerlarisDetail = await Promise.all(
      produkTerlaris.map(async (item) => {
        const produk = await prisma.produk.findUnique({
          where: { idProduk: item.idProduk },
          select: { namaProduk: true }
        });
        return {
          nama: produk.namaProduk,
          terjual: item._sum.jumlah
        };
      })
    );

    // 4. Cek Stok Tipis (Stok di bawah 10)
    const stokTipis = await prisma.produk.findMany({
      where: {
        stok: {
          lt: 10 // lt = lower than (kurang dari)
        }
      },
      select: {
        namaProduk: true,
        stok: true
      }
    });

    // Kirim semua data ke Frontend dalam satu paket JSON
    res.json({
      summary: {
        totalPendapatan: totalOmzet._sum.totalPenjualan || 0,
        totalKerugian: totalRugi._sum.totalKerugian || 0,
        keuntunganKotor: (totalOmzet._sum.totalPenjualan || 0) - (totalRugi._sum.totalKerugian || 0)
      },
      topProducts: produkTerlarisDetail,
      lowStockAlert: stokTipis
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal memuat data dashboard" });
  }
});

// --- JALANKAN SERVER ---
app.listen(PORT, () => {
  console.log(`✅ Server berhasil nyala di http://localhost:${PORT}`);
});