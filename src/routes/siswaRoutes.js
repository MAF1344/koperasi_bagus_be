import express from 'express';
import {verifyToken, isAdmin, isSuperAdmin} from '../middleware/auth.js';
import {getAllSiswa, getSiswaById, createSiswa, updateSiswa, deleteSiswa} from '../controllers/siswaController.js';

const router = express.Router();

router.use(verifyToken);
router.use(isAdmin);

router.get('/', getAllSiswa);
router.get('/:id', getSiswaById);
router.post('/', createSiswa);
router.put('/:id', updateSiswa);
router.delete('/:id', isSuperAdmin, deleteSiswa);

export default router;
