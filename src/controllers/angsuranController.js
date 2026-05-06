import Angsuran from '../models/Angsuran.js';
import Pinjaman from '../models/Pinjaman.js';

// Get payment schedule by pinjaman ID
export const getAngsuranByPinjaman = async (req, res) => {
  try {
    const {pinjamanId} = req.params;

    // Check if pinjaman exists
    const pinjaman = await Pinjaman.findById(pinjamanId);
    if (!pinjaman) {
      return res.status(404).json({
        success: false,
        message: 'Pinjaman tidak ditemukan',
      });
    }

    // Admin can only view their own
    if (req.user.role === 'admin' && pinjaman.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses untuk melihat angsuran pinjaman ini',
      });
    }

    // Get all angsuran
    const angsuran = await Angsuran.findByPinjaman(pinjamanId);

    // Calculate summary
    const summary = await Angsuran.getSummaryByPinjaman(pinjamanId);

    res.status(200).json({
      success: true,
      data: {
        pinjaman: {
          id: pinjaman.id,
          kode_pinjaman: pinjaman.kode_pinjaman,
          peminjam: pinjaman.nama_lengkap,
          total_pinjaman: pinjaman.total_pinjaman,
          tenor_bulan: pinjaman.tenor_bulan,
          angsuran_per_bulan: pinjaman.angsuran_perbulan,
          status: pinjaman.status,
        },
        summary,
        angsuran,
      },
    });
  } catch (error) {
    console.error('Error getting angsuran:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil jadwal angsuran',
      error: error.message,
    });
  }
};

// Record payment for an angsuran
export const recordPayment = async (req, res) => {
  try {
    const {id} = req.params;
    const {jumlah_bayar, tanggal_bayar, keterangan, status, denda_terbayar} = req.body;

    console.log('Payment request:', {id, jumlah_bayar, tanggal_bayar, keterangan, status});

    // Validate required fields
    if (!jumlah_bayar || jumlah_bayar <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Jumlah bayar harus lebih dari 0',
      });
    }

    if (!tanggal_bayar) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal bayar wajib diisi',
      });
    }

    // Check if angsuran exists
    // Sebelum update, cek apakah angsuran dengan ID tersebut ada
    const angsuran = await Angsuran.findById(id);
    if (!angsuran) {
      return res.status(404).json({
        success: false,
        message: 'Angsuran tidak ditemukan',
      });
    }

    console.log('Processing payment for angsuran:', {
      id: angsuran.id,
      angsuran_ke: angsuran.angsuran_ke,
      current_status: angsuran.status,
      pinjaman_id: angsuran.pinjaman_id,
    });

    // Lanjutkan proses...

    // Check if already paid
    if (angsuran.status === 'sudah_bayar' || angsuran.status === 'terlambat') {
      return res.status(400).json({
        success: false,
        message: 'Angsuran ini sudah dibayar',
      });
    }

    // Get pinjaman info
    const pinjaman = await Pinjaman.findById(angsuran.pinjaman_id);
    if (!pinjaman) {
      return res.status(404).json({
        success: false,
        message: 'Data pinjaman tidak ditemukan',
      });
    }

    // Admin can only pay their own
    if (req.user.role === 'admin' && pinjaman.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak dapat membayar angsuran pinjaman orang lain',
      });
    }

    // Check if payment amount is sufficient
    const minimalBayar = angsuran.jumlah_angsuran + (angsuran.denda || 0);
    if (jumlah_bayar < minimalBayar) {
      return res.status(400).json({
        success: false,
        message: `Jumlah bayar minimal Rp ${minimalBayar.toLocaleString('id-ID')}`,
      });
    }

    // Determine status based on payment date
    const paymentDate = new Date(tanggal_bayar);
    const dueDate = new Date(angsuran.tanggal_jatuh_tempo);
    let finalStatus = status || 'sudah_bayar';

    // Jika tanggal bayar melebihi jatuh tempo, set status ke 'terlambat'
    if (paymentDate > dueDate && finalStatus !== 'terlambat') {
      finalStatus = 'terlambat';
    }

    // Update angsuran
    const paymentData = {
      tanggal_bayar: paymentDate,
      jumlah_bayar,
      status: finalStatus,
      keterangan: keterangan || null,
      created_by: req.user.id,
    };

    const updated = await Angsuran.recordPayment(id, paymentData);

    if (!updated) {
      return res.status(500).json({
        success: false,
        message: 'Gagal mencatat pembayaran',
      });
    }

    // Update sisa pinjaman
    await Angsuran.updatePinjamanSisa(angsuran.pinjaman_id);

    // Check if all angsuran are paid
    const summary = await Angsuran.getSummaryByPinjaman(angsuran.pinjaman_id);
    const isLunas = summary.sisa_angsuran === 0;

    if (isLunas) {
      // Mark pinjaman as 'lunas'
      await Pinjaman.markAsLunas(angsuran.pinjaman_id);
    }

    res.status(200).json({
      success: true,
      message: isLunas ? 'Pembayaran berhasil! Pinjaman telah lunas.' : 'Pembayaran berhasil dicatat',
      data: {
        angsuran_id: parseInt(id),
        angsuran_ke: angsuran.angsuran_ke,
        jumlah_bayar,
        status: finalStatus,
        sisa_angsuran: summary.sisa_angsuran,
        total_terbayar: summary.total_terbayar,
        pinjaman_lunas: isLunas,
      },
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mencatat pembayaran',
      error: error.message,
    });
  }
};

// Get overdue angsuran
export const getOverdueAngsuran = async (req, res) => {
  try {
    let overdueList;

    // If Admin - only their own overdue
    if (req.user.role === 'admin') {
      overdueList = await Angsuran.findOverdueByUser(req.user.id);
    } else {
      // SuperAdmin - all overdue
      overdueList = await Angsuran.findOverdue();
    }

    res.status(200).json({
      success: true,
      data: overdueList,
    });
  } catch (error) {
    console.error('Error getting overdue angsuran:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data angsuran terlambat',
      error: error.message,
    });
  }
};

// Get angsuran statistics
export const getAngsuranStats = async (req, res) => {
  try {
    let stats;

    // If Admin - only their own stats
    if (req.user.role === 'admin') {
      stats = await Angsuran.getStatsByUser(req.user.id);
    } else {
      // SuperAdmin - all stats
      stats = await Angsuran.getStats();
    }

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting angsuran stats:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil statistik angsuran',
      error: error.message,
    });
  }
};

// Get upcoming payments (next 7 days)
export const getUpcomingPayments = async (req, res) => {
  try {
    let upcomingPayments;

    // If Admin - only their own upcoming
    if (req.user.role === 'admin') {
      upcomingPayments = await Angsuran.findUpcomingByUser(req.user.id, 7);
    } else {
      // SuperAdmin - all upcoming
      upcomingPayments = await Angsuran.findUpcoming(7);
    }

    res.status(200).json({
      success: true,
      data: upcomingPayments,
    });
  } catch (error) {
    console.error('Error getting upcoming payments:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data pembayaran mendatang',
      error: error.message,
    });
  }
};

// Update angsuran keterangan (for corrections/notes)
export const updateKeterangan = async (req, res) => {
  try {
    const {id} = req.params;
    const {keterangan} = req.body;

    // Only SuperAdmin can update keterangan
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Hanya SuperAdmin yang dapat mengubah keterangan',
      });
    }

    // Check if angsuran exists
    const angsuran = await Angsuran.findById(id);
    if (!angsuran) {
      return res.status(404).json({
        success: false,
        message: 'Angsuran tidak ditemukan',
      });
    }

    await Angsuran.updateKeterangan(id, keterangan);

    res.status(200).json({
      success: true,
      message: 'Keterangan berhasil diperbarui',
    });
  } catch (error) {
    console.error('Error updating keterangan:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui keterangan',
      error: error.message,
    });
  }
};
