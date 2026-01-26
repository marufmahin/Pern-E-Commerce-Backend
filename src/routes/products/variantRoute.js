import { Router } from "express";
import { getAllVariant, getVariantById, createVariant, updateVariant,deleteVariant } from "../../controllers/product/index.js";

const router = Router();

router.get('/', getAllVariant);
router.get('/:id', getVariantById);
router.post('/', createVariant);
router.put('/:id', updateVariant);
router.delete('/:id', deleteVariant);


export default router;