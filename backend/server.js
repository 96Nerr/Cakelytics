const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const app = express();
const PORT = process.env.PORT || 5000;

// =========================================================================
// DATABASE CONFIGURATION (PRISMA + POSTGRESQL POOL ADAPTER)
// =========================================================================
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// =========================================================================
// MIDDLEWARES
// =========================================================================
app.use(cors());
app.use(express.json());

// =========================================================================
// CORE ROUTES
// =========================================================================

// ROOT ENDPOINT: Cek status server berjalan
app.get('/', (req, res) => {
  res.send('Server Backend Cakelytics Berjalan Lancar! 🍰');
});

// =========================================================================
// PRODUK MANAGEMENT (CRUD)
// =========================================================================

// GET: Mengambil semua daftar produk (diurutkan berdasarkan ID terkecil)
app.get('/api/produk', async (req, res) => {
  try {
    const semuaProduk = await prisma.produk.findMany({ orderBy: { idProduk: 'asc' } });
    res.json(semuaProduk);
  } catch (error) {
    console.error("ERROR GET PRODUK:", error);
    res.status(500).json({ error: "Gagal mengambil data produk" });
  }
});

// POST: Menambah varian produk baru ke database
app.post('/api/produk', async (req, res) => {
  try {
    const { namaProduk, hargaModal, hargaJual, stok } = req.body;
    const produkBaru = await prisma.produk.create({
      data: {
        namaProduk: namaProduk,
        hargaModal: parseInt(hargaModal, 10),
        hargaJual: parseInt(hargaJual, 10),
        stok: parseInt(stok, 10)
      }
    });
    res.status(201).json(produkBaru);
  } catch (error) {
    console.error("ERROR CREATE PRODUK:", error);
    res.status(500).json({ error: "Gagal menambah produk" });
  }
});

// PUT: Memperbarui informasi produk berdasarkan ID produk
app.put('/api/produk/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const { namaProduk, hargaModal, hargaJual, stok } = req.body;
    const produkDiupdate = await prisma.produk.update({
      where: { idProduk: productId },
      data: {
        namaProduk: namaProduk,
        hargaModal: parseInt(hargaModal, 10),
        hargaJual: parseInt(hargaJual, 10),
        stok: parseInt(stok, 10)
      }
    });
    res.json(produkDiupdate);
  } catch (error) {
    console.error("ERROR UPDATE PRODUK:", error);
    res.status(500).json({ error: "Gagal mengupdate produk" });
  }
});

// DELETE: Menghapus produk dari database berdasarkan ID
app.delete('/api/produk/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    await prisma.produk.delete({ where: { idProduk: productId } });
    res.json({ message: "Produk berhasil dihapus 🗑️" });
  } catch (error) {
    console.error("ERROR DELETE PRODUK:", error);
    res.status(500).json({ error: "Gagal menghapus produk" });
  }
});

// =========================================================================
// TRANSAKSI PENJUALAN (ACID TRANSACTION VIA PRISMA)
// =========================================================================

// POST: Mencatat transaksi baru, memvalidasi stok, dan memotong stok produk otomatis
app.post('/api/transaksi', async (req, res) => {
  try {
    const { totalPenjualan, detailPesanan } = req.body;

    if (!detailPesanan || !Array.isArray(detailPesanan) || detailPesanan.length === 0) {
      return res.status(400).json({ error: "Detail pesanan kosong" });
    }

    // Menggunakan $transaction untuk memastikan data konsisten (jika salah satu gagal, semua dibatalkan)
    const transaksiBaru = await prisma.$transaction(async (tx) => {
      
      // STEP 1: Validasi ketersediaan stok seluruh item sebelum memproses transaksi
      for (const item of detailPesanan) {
        const productId = parseInt(item.idProduk || item.idproduk, 10);
        const jumlah = parseInt(item.jumlah, 10);

        const produk = await tx.produk.findUnique({ where: { idProduk: productId } });

        if (!produk) throw new Error(`Produk ID ${productId} tidak ditemukan`);
        if (produk.stok < jumlah) throw new Error(`Stok ${produk.namaProduk} tidak cukup`);
      }

      // STEP 2: Insert data ke tabel Transaksi Penjualan beserta Detailnya (Nested Relational Insert)
      const transaksi = await tx.transaksiPenjualan.create({
        data: {
          totalPenjualan: parseInt(totalPenjualan, 10),
          detailPenjualan: {
            create: detailPesanan.map((item) => ({
              produk: { connect: { idProduk: parseInt(item.idProduk || item.idproduk, 10) } },
              jumlah: parseInt(item.jumlah, 10),
              hargaJualSaatIni: parseInt(item.hargaJualSaatIni, 10),
              hargaModalSaatIni: parseInt(item.hargaModalSaatIni, 10),
              subtotal: parseInt(item.subtotal, 10)
            }))
          }
        },
        include: { detailPenjualan: { include: { produk: true } } }
      });

      // STEP 3: Potong stok produk di gudang secara otomatis berdasarkan kuantitas pesanan
      for (const item of detailPesanan) {
        const productId = parseInt(item.idProduk || item.idproduk, 10);
        await tx.produk.update({
          where: { idProduk: productId },
          data: { stok: { decrement: parseInt(item.jumlah, 10) } }
        });
      }

      return transaksi;
    });

    res.status(201).json(transaksiBaru);
  } catch (error) {
    console.error("ERROR POST TRANSAKSI:", error);
    res.status(500).json({ error: error.message || "Gagal transaksi" });
  }
});

// GET: Mengambil riwayat transaksi penjualan yang difilter khusus 30 hari terakhir (1 Bulan)
app.get('/api/transaksi', async (req, res) => {
  try {
    const satuBulanLalu = new Date();
    satuBulanLalu.setDate(satuBulanLalu.getDate() - 30);

    const semuaTransaksi = await prisma.transaksiPenjualan.findMany({
      where: { tanggalTransaksi: { gte: satuBulanLalu } },
      include: { detailPenjualan: { include: { produk: true } } },
      orderBy: { tanggalTransaksi: 'desc' }
    });
    res.json(semuaTransaksi);
  } catch (error) {
    console.error("ERROR GET TRANSAKSI:", error);
    res.status(500).json({ error: error.message || "Gagal mengambil transaksi" });
  }
});

// =========================================================================
// PRODUKSI (PENAMBAHAN STOK MANDIRI)
// =========================================================================

// POST: Mencatat riwayat masuk barang hasil produksi dan menambah stok produk terkait
app.post('/api/produksi', async (req, res) => {
  try {
    const { idProduk, idproduk, jumlahProduksi } = req.body;
    const targetId = parseInt(idProduk || idproduk, 10);

    const produksiBaru = await prisma.$transaction(async (tx) => {
      const produksi = await tx.produksi.create({
        data: { idproduk: targetId, jumlahProduksi: parseInt(jumlahProduksi, 10) }
      });

      await tx.produk.update({
        where: { idProduk: targetId },
        data: { stok: { increment: parseInt(jumlahProduksi, 10) } }
      });

      return produksi;
    });

    res.status(201).json(produksiBaru);
  } catch (error) {
    console.error("ERROR PRODUKSI:", error);
    res.status(500).json({ error: "Gagal mencatat produksi" });
  }
});

// GET: Mengambil seluruh riwayat log aktivitas produksi barang
app.get('/api/produksi', async (req, res) => {
  try {
    const riwayatProduksi = await prisma.produksi.findMany({
      include: { produk: true },
      orderBy: { tanggalProduksi: 'desc' }
    });
    res.json(riwayatProduksi);
  } catch (error) {
    console.error("ERROR GET PRODUKSI:", error);
    res.status(500).json({ error: "Gagal mengambil data produksi" });
  }
});

// =========================================================================
// BARANG RUSAK / LOSS MANAGEMENT
// =========================================================================

// POST: Mencatat barang rusak, menghitung nilai kerugian modal, dan memotong stok gudang
app.post('/api/barang-rusak', async (req, res) => {
  try {
    const { idProduk, jumlahRusak, keterangan } = req.body;
    const targetId = parseInt(idProduk, 10);

    const barangRusakBaru = await prisma.$transaction(async (tx) => {
      const infoProduk = await tx.produk.findUnique({ where: { idProduk: targetId } });
      if (!infoProduk) throw new Error("Produk tidak ditemukan!");

      // Nilai kerugian dihitung berdasarkan: Kuantitas Rusak x Harga Modal Awal Produk
      const hitungKerugian = parseInt(jumlahRusak, 10) * infoProduk.hargaModal;

      const rusak = await tx.barangRusak.create({
        data: {
          jumlahRusak: parseInt(jumlahRusak, 10),
          totalKerugian: hitungKerugian,
          keterangan: keterangan || "", 
          produk: { connect: { idProduk: targetId } }
        }
      });

      await tx.produk.update({
        where: { idProduk: targetId },
        data: { stok: { decrement: parseInt(jumlahRusak, 10) } }
      });

      return rusak;
    });

    res.status(201).json(barangRusakBaru);
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET: Mengambil riwayat pencatatan barang rusak beserta detail informasi produknya
app.get('/api/barang-rusak', async (req, res) => {
  try {
    const riwayatRusak = await prisma.barangRusak.findMany({
      include: { produk: true },
      orderBy: { idRusak: 'desc' }
    });
    res.json(riwayatRusak);
  } catch (error) {
    console.error("ERROR GET BARANG RUSAK:", error);
    res.status(500).json({ error: "Gagal mengambil riwayat barang rusak" });
  }
});

// DELETE: Membatalkan/menghapus log barang rusak sekaligus mengembalikan kuantitas stok ke gudang
app.delete('/api/barang-rusak/:id', async (req, res) => {
  try {
    const idRusak = parseInt(req.params.id, 10);
    const dataRusak = await prisma.barangRusak.findUnique({ where: { idRusak: idRusak } });

    if (!dataRusak) return res.status(404).json({ error: "Data tidak ditemukan" });

    await prisma.$transaction(async (tx) => {
      await tx.produk.update({
        where: { idProduk: dataRusak.idProduk }, 
        data: { stok: { increment: dataRusak.jumlahRusak } }
      });

      await tx.barangRusak.delete({ where: { idRusak: idRusak } });
    });

    res.json({ message: "Data berhasil dihapus dan stok dikembalikan" });
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ error: "Gagal menghapus data" });
  }
});

// =========================================================================
// DASHBOARD & ANALYTICS STATS
// =========================================================================

// GET: Kalkulasi metrik finansial ringkas, daftar produk terlaris, dan alert stok menipis
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // 1. Agregasi total omzet kotor dari seluruh transaksi penjualan
    const totalOmzet = await prisma.transaksiPenjualan.aggregate({ _sum: { totalPenjualan: true } });

    // 2. Agregasi total beban kerugian material dari log barang rusak
    const totalRugi = await prisma.barangRusak.aggregate({ _sum: { totalKerugian: true } });

    // 3. Mengambil top 5 ID produk yang paling banyak terjual kuantitasnya
    const produkTerlaris = await prisma.detailPenjualan.groupBy({
      by: ['idproduk'],
      _sum: { jumlah: true },
      orderBy: { _sum: { jumlah: 'desc' } },
      take: 5
    });

    // Mapping hasil query groupBy untuk mendapatkan nama asli dari produk
    const produkTerlarisDetail = await Promise.all(
      produkTerlaris.map(async (item) => {
        const cleanId = parseInt(item.idproduk, 10);
        const produk = await prisma.produk.findUnique({
          where: { idProduk: cleanId },
          select: { namaProduk: true }
        });

        return {
          nama: produk ? produk.namaProduk : `Produk ID #${cleanId}`,
          terjual: item._sum.jumlah || 0
        };
      })
    );

    // 4. Deteksi dini stok kritis (Kuantitas stok barang kurang dari 10 pcs)
    const stokTipis = await prisma.produk.findMany({
      where: { stok: { lt: 10 } },
      select: { namaProduk: true, stok: true }
    });

    // Mengirimkan objek ringkasan finansial terpadu ke frontend
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
    console.error("ERROR DASHBOARD:", error);
    res.status(500).json({ error: "Gagal memuat data dashboard" });
  }
});

// =========================================================================
// APPLICATION SERVER INITIALIZATION
// =========================================================================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server Cakelytics aktif di http://192.168.254.103:${PORT}`);
});