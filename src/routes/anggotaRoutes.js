import express from 'express';
import {verifyToken, isAdmin, isSuperAdmin} from '../middleware/auth.js';
import {getAllAnggota, getAnggotaById, createAnggota, updateAnggota, deleteAnggota} from '../controllers/anggotaController.js';

const router = express.Router();

router.use(verifyToken);
router.use(isAdmin);

router.get('/', getAllAnggota);
router.get('/:id', getAnggotaById);
router.post('/', createAnggota);
router.put('/:id', updateAnggota);
router.delete('/:id', isSuperAdmin, deleteAnggota);

export default router;
