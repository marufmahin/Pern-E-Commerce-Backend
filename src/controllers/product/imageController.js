import { prisma } from "../../database/prisma.js";
import { z } from "zod";

export const getAllImages = async (req, res) => {

    const images = await prisma.productImages.findMany();

    res.json({
        status: 'success',
        message: "Product images fetched successfully",
        data: { images }
    })

}

export const getImageById = async (req, res) => {
    const imageId = req.params.id;

    const imageSchema = z.object({
        id: z.uuid(),
    });

    const { success, data, error } = imageSchema.safeParse({
        id: imageId,
    });

    if (!success) {
        res.status(400).json({
            status: 'error',
            message: 'Bad Request invalid uuid format',
        });
    }

    const image = await prisma.productImages.findUnique({
        where: {
            id: imageId
        }
    });

    if (!image) {
        return res.status(404).json({
            status: 'error',
            message: 'Image not found',
        });
    }

    res.json({
        status: 'success',
        message: 'Image fetched successfully',
        data: { image }
    })

}

export const createImage = async (req, res) => {
  
    const { productId, imageUrl, altText, displayOrder, isPrimary} = req.body;


    const createSchema = z.object({
        productId: z.uuid(),
        imageUrl: z.url(),
        altText: z.string().max(255).optional(),
        displayOrder: z.number().int().nonnegative().optional(),
        isPrimary: z.boolean().optional(),
    });

    const { success, data, error } = createSchema.safeParse({
        productId,
        imageUrl,
        altText,
        displayOrder,
        isPrimary
    });

    if (!success) {
        return res.status(400).json({
            status: 'error',
            message: 'bad request payload must have productId and imageUrl with valid format',
    
        });
    } 
    

    //check if product exists
    const product = await prisma.product.findUnique({
        where: {
            id: data.productId
        }
    });

    if (!product) {
        return res.status(404).json({
            status: 'error',
            message: 'Product not found',
        });
    }

    const newImage = await prisma.productImages.create({
        data: {
            productId: data.productId,
            imageUrl: data.imageUrl,
            altText: data.altText,
            displayOrder: data.displayOrder ?? 0,
            isPrimary: data.isPrimary ?? false
        }
    });

    res.json({
        status: 'success',
        message: 'Image created successfully',
        data: { image: newImage }
    })
 
}

export const updateImage = async (req, res) => {
  const imageId = req.params.id;

  const imageSchema = z.object({
    id: z.uuid(),
  });

  const {
    success: paramSuccess,
    data: paramData,
    error: paramError,
  } = imageSchema.safeParse({ id: imageId });

  if (!paramSuccess) {
    return res.status(400).json({
      status: "error",
      message: "Bad request: Invalid UUID format",
    });
  }
  const updateSchema = z.object({
    imageUrl: z.url().optional(),
    altText: z.string().max(255).optional(),
    displayOrder: z.number().int().nonnegative().optional(),
    isPrimary: z.boolean().optional(),
  });
  const {
    success: bodySuccess,
    data: bodyData,
    error: bodyError,
  } = updateSchema.safeParse(req.body);
  if (!bodySuccess) {
    return res.status(400).json({
      status: "error",
      message: "Bad request payload",
    });
  }
  const updatedImage = await prisma.productImages.update({
    where: { id: imageId },
    data: bodyData,
  });
  res.json({
    status: "success",
    message: "Product image updated successfully",
    data: updatedImage,
  });
};

export const deleteImage = async (req, res) => {
  const imageId = req.params.id;
  const imageSchema = z.object({
    id: z.uuid(),
  });
  const { success, data, error } = imageSchema.safeParse({ id: imageId });

  if (!success) {
    return res.status(400).json({
      status: "error",
      message: "Bad request: Invalid UUID format",
    });
  }
  const deletedImage = await prisma.productImages.delete({
    where: { id: imageId },
  });
  res.json({
    status: "success",
    message: "Product image deleted successfully",
    data: deletedImage,
  });
};