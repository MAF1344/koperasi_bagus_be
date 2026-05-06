import Pinjaman from '../models/Pinjaman.js';
import Angsuran from '../models/Angsuran.js';
import User from '../models/User.js';

// Create new pinjaman (loan application)
export const createPinjaman = async (req, res) => {
  try {
    const {jumlah_pinjaman, tenor_bulan, keterangan} = req.body;

    const user_id = req.user.id; // Pemohon adalah user yang login

    // Validate required fields
    if (!jumlah_pinjaman || !tenor_bulan || !keterangan) {
      return res.status(400).json({
        success: false,
        message: 'Jumlah pinjaman, tenor, dan tujuan wajib diisi',
      });
    }

    // Validate amounts
    if (jumlah_pinjaman <= 0 || tenor_bulan <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Jumlah pinjaman dan tenor harus lebih dari 0',
      });
    }

    // Check if user is eligible (not pengunjung)
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan',
      });
    }

    if (user.role === 'pengunjung') {
      return res.status(403).json({
        success: false,
        message: 'Pengunjung tidak dapat mengajukan pinjaman',
      });
    }

    // Check if user has pending loan
    const pendingLoans = await Pinjaman.findByUserAndStatus(user_id, 'pending');
    if (pendingLoans.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Anda masih memiliki pengajuan pinjaman yang belum diproses',
      });
    }

    // Check if user has unpaid loan
    const approvedLoans = await Pinjaman.findByUserAndStatus(user_id, 'approved');
    if (approvedLoans.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Anda masih memiliki pinjaman yang belum lunas',
      });
    }

    // Calculate (0% interest - no bunga)
    const jumlah_bunga = 0;
    const total_pinjaman = jumlah_pinjaman;
    const angsuran_perbulan = Math.ceil(total_pinjaman / tenor_bulan);

    // Generate kode_pinjaman
    const kode_pinjaman = await Pinjaman.generateKodePinjaman();

    // Create pinjaman
    const pinjamanData = {
      kode_pinjaman,
      user_id,
      jumlah_pinjaman,
      jumlah_bunga,
      total_pinjaman,
      tenor_bulan,
      angsuran_perbulan,
      keterangan,
      status: 'pending',
    };

    const pinjamanId = await Pinjaman.create(pinjamanData);

    res.status(201).json({
      success: true,
      message: 'Pengajuan pinjaman berhasil dikirim. Menunggu persetujuan SuperAdmin.',
      data: {
        id: pinjamanId,
        ...pinjamanData,
        tanggal_pinjaman: new Date(),
      },
    });
  } catch (error) {
    console.error('Error creating pinjaman:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengajukan pinjaman',
      error: error.message,
    });
  }
};

// Get all pinjaman with filters
export const getAllPinjaman = async (req, res) => {
  try {
    const {status, user_id} = req.query;

    let pinjaman;

    // If Admin role - only show their own pinjaman
    if (req.user.role === 'admin') {
      pinjaman = await Pinjaman.findByUser(req.user.id);
    } else {
      // SuperAdmin can see all with filters
      if (status) {
        pinjaman = await Pinjaman.findByStatus(status);
      } else if (user_id) {
        pinjaman = await Pinjaman.findByUser(user_id);
      } else {
        pinjaman = await Pinjaman.findAll();
      }
    }

    res.status(200).json({
      success: true,
      data: pinjaman,
    });
  } catch (error) {
    console.error('Error getting pinjaman:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data pinjaman',
      error: error.message,
    });
  }
};

// Get pinjaman by user ID
export const getPinjamanByUser = async (req, res) => {
  try {
    const {userId} = req.params;

    // Admin can only view their own
    if (req.user.role === 'admin' && userId !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses untuk melihat pinjaman anggota lain',
      });
    }

    const pinjaman = await Pinjaman.findByUser(userId);

    res.status(200).json({
      success: true,
      data: pinjaman,
    });
  } catch (error) {
    console.error('Error getting pinjaman by user:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data pinjaman',
      error: error.message,
    });
  }
};

// Get pinjaman detail by ID
export const getPinjamanById = async (req, res) => {
  try {
    const {id} = req.params;

    const pinjaman = await Pinjaman.findById(id);

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
        message: 'Anda tidak memiliki akses untuk melihat pinjaman ini',
      });
    }

    // Get angsuran (payment schedule) if approved
    let angsuran = [];
    if (pinjaman.status === 'approved' || pinjaman.status === 'lunas') {
      angsuran = await Angsuran.findByPinjaman(id);
    }

    res.status(200).json({
      success: true,
      data: {
        ...pinjaman,
        angsuran,
      },
    });
  } catch (error) {
    console.error('Error getting pinjaman detail:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil detail pinjaman',
      error: error.message,
    });
  }
};

// Approve pinjaman (SuperAdmin only)
export const approvePinjaman = async (req, res) => {
  try {
    const {id} = req.params;
    const {keterangan_approval} = req.body;

    // Only SuperAdmin can approve
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Hanya SuperAdmin yang dapat menyetujui pinjaman',
      });
    }

    // Check if pinjaman exists
    const pinjaman = await Pinjaman.findById(id);
    if (!pinjaman) {
      return res.status(404).json({
        success: false,
        message: 'Pinjaman tidak ditemukan',
      });
    }

    // Check if already processed
    if (pinjaman.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Pinjaman sudah ${pinjaman.status}`,
      });
    }

    // Update pinjaman status
    await Pinjaman.approve(id, req.user.id, keterangan_approval);

    // Generate payment schedule (angsuran) - Hanya panggil method generateSchedule saja
    // Method generateSchedule sudah menangani pembuatan jadwal angsuran
    await Angsuran.generateSchedule(id);

    res.status(200).json({
      success: true,
      message: 'Pinjaman berhasil disetujui dan jadwal pembayaran telah dibuat',
      data: {
        pinjaman_id: id,
        kode_pinjaman: pinjaman.kode_pinjaman,
        status: 'approved',
        tenor_bulan: pinjaman.tenor_bulan,
        angsuran_perbulan: pinjaman.angsuran_perbulan,
      },
    });
  } catch (error) {
    console.error('Error approving pinjaman:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menyetujui pinjaman',
      error: error.message,
    });
  }
};

// Reject pinjaman (SuperAdmin only)
export const rejectPinjaman = async (req, res) => {
  try {
    const {id} = req.params;
    const {keterangan_approval} = req.body;

    // Only SuperAdmin can reject
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Hanya SuperAdmin yang dapat menolak pinjaman',
      });
    }

    // Check if pinjaman exists
    const pinjaman = await Pinjaman.findById(id);
    if (!pinjaman) {
      return res.status(404).json({
        success: false,
        message: 'Pinjaman tidak ditemukan',
      });
    }

    // Check if already processed
    if (pinjaman.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Pinjaman sudah ${pinjaman.status}`,
      });
    }

    // Update pinjaman status
    const rejectionData = {
      status: 'rejected',
      approved_by: req.user.id,
      tanggal_approval: new Date(),
      keterangan_approval: keterangan_approval || 'Ditolak',
    };

    await Pinjaman.reject(id, req.user.id, keterangan_approval);

    res.status(200).json({
      success: true,
      message: 'Pinjaman berhasil ditolak',
      data: {
        pinjaman_id: id,
        kode_pinjaman: pinjaman.kode_pinjaman,
        status: 'rejected',
      },
    });
  } catch (error) {
    console.error('Error rejecting pinjaman:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menolak pinjaman',
      error: error.message,
    });
  }
};

// Get pinjaman statistics
export const getPinjamanStats = async (req, res) => {
  try {
    const stats = await Pinjaman.getStats(); // semua role pakai ini dulu

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting pinjaman stats:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil statistik pinjaman',
      error: error.message,
    });
  }
};

// Get pending pinjaman (for approval page)
export const getPendingPinjaman = async (req, res) => {
  try {
    // Only SuperAdmin can access
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Hanya SuperAdmin yang dapat mengakses halaman approval',
      });
    }

    const pendingLoans = await Pinjaman.findByStatus('pending');

    res.status(200).json({
      success: true,
      data: pendingLoans,
    });
  } catch (error) {
    console.error('Error getting pending pinjaman:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data pinjaman pending',
      error: error.message,
    });
  }
};

// Delete pinjaman (SuperAdmin only, only if pending)
export const deletePinjaman = async (req, res) => {
  try {
    const {id} = req.params;

    // Only SuperAdmin can delete
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Hanya SuperAdmin yang dapat menghapus pinjaman',
      });
    }

    // Check if pinjaman exists
    const pinjaman = await Pinjaman.findById(id);
    if (!pinjaman) {
      return res.status(404).json({
        success: false,
        message: 'Pinjaman tidak ditemukan',
      });
    }

    // Can only delete pending loans
    if (pinjaman.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Hanya pinjaman dengan status pending yang dapat dihapus',
      });
    }

    await Pinjaman.delete(id);

    res.status(200).json({
      success: true,
      message: 'Pinjaman berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting pinjaman:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus pinjaman',
      error: error.message,
    });
  }
};
