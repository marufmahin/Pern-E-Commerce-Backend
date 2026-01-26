import { Router } from "express";
import { getAllImages, getImageById, createImage, updateImage, deleteImage } from "../../controllers/product/index.js";

const router = Router();


router.get('/', getAllImages);
router.get('/:id', getImageById);
router.post('/', createImage);
router.put('/:id', updateImage);
router.delete('/:id', deleteImage);

export default router;