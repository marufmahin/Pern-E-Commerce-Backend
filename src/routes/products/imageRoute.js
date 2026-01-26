import { Router } from "express";
import { getAllImages, getImageById, createImage } from "../../controllers/product/index.js";

const router = Router();


router.get('/', getAllImages);
router.get('/:id', getImageById);
router.post('/', createImage);

export default router;