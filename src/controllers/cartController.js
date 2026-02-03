import { z } from "zod";
import { prisma } from "../database/prisma.js";

export const getCart = async (req, res) => {
  // I have user id
  const userId = req.user.id;

  // check if cart exists for user
  const existingCart = await prisma.cart.findFirst({
    where: {
      userId: userId,
    },
     include: {
      cartItems: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });

  if (existingCart) {
    return res.json({
      status: "Success",
      message: "Cart retrieved successfully",
      data: existingCart,
    });
  }

  const cart = await prisma.cart.create({
    data: {
      userId: userId,
    },
  });

  res.json({
    status: "Success",
    message: "Cart created successfully",
    data: cart,
  });
};

export const addItemToCart = async (req, res) => {
  const userId = req.user.id;
  const { productId, variantId, quantity } = req.body;

  const cartItemSchema = z.object({
    productId: z.uuid(),
    variantId: z.uuid().optional(),
    quantity: z.number().min(1),
  });

  const { success, error } = cartItemSchema.safeParse({
    productId,
    variantId,
    quantity,
  });


  if (!success) {
    return res.status(400).json({
      status: "Error",
      message: "Invalid input data",
      error: error.errors,
    });
  }

  let cart = await prisma.cart.findFirst({
    where: {
      userId: userId,
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId: userId,
      },
    });
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    return res.status(400).json({
      status: "Error",
      message: "Product not found",
    });
  }

  if (variantId) {
    const variant = await prisma.productVariant.findUnique({
      where: {
        id: variantId,
      },
    });
    if (!variant) {
      return res.status(400).json({
        status: "Error",
        message: "Product variant not found",
      });
    }
  }

  const cartId = cart.id;
  const existingCartItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cartId,
      productId: productId,
      variantId: variantId || null,
    },
  });

  let cartItem;
  if (existingCartItem) {
    cartItem = await prisma.cartItem.update({
      where: {
        id: existingCartItem.id,
      },
      data: {
        quantity: existingCartItem.quantity + quantity,
      },
      include: {
        product: true,
        variant: true,
      },
    });
  } else {
    cartItem = await prisma.cartItem.create({
      data: {
        cartId,
        productId,
        variantId,
        quantity,
      },
      include: {
        product: true,
        variant: true,
      },
    });
  }

  res.json({
    status: "Success",
    message: "Item added to cart successfully",
    data: cartItem,
  });
};


export const updateCartItem = async (req, res) => {
  const itemId = req.params.id;
  const userId = req.user.id;
  const { quantity } = req.body;

  const updateSchema = z.object({
    itemId: z.uuid(),
    quantity: z.number().int().min(1),
  });

  const { success, error } = updateSchema.safeParse({ itemId, quantity });

  if (!success) {
    return res.status(400).json({
      status: "Error",
      message: "Invalid input data",
      error: error.errors,
    });
  }

  const cart = await prisma.cart.findFirst({
    where: {
      userId: userId,
    },
  });

  if (!cart) {
    return res.status(404).json({
      status: "Error",
      message: "Cart not found",
    });
  }

  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: itemId,
      cartId: cart.id,
    },
  });

  if (!cartItem) {
    return res.status(404).json({
      status: "Error",
      message: "Cart item not found",
    });
  }

  const updatedCartItem = await prisma.cartItem.update({
    where: {
      id: itemId,
    },
    data: {
      quantity: quantity,
    },
    include: {
      product: true,
      variant: true,
    },
  });

  res.json({
    status: "Success",
    message: "Cart item updated successfully",
    data: updatedCartItem,
  });
};

export const removeItemFromCart = async (req, res) => {
  const itemId = req.params.id;
  const userId = req.user.id;

  const itemIdSchema = z.uuid();

  const { success, error } = itemIdSchema.safeParse(itemId);

  if (!success) {
    return res.status(400).json({
      status: "Error",
      message: "Invalid item ID",
      error: error.errors,
    });
  }

  // find the cart id for the user
  const cart = await prisma.cart.findFirst({
    where: {
      userId: userId,
    },
  });

  // find the card item to be removed
  const cartId = cart.id;
  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: itemId,
      cartId: cartId,
    },
  });

  if(!cartItem) {
    return res.status(404).json({
      status: "Error",
      message: "Cart item not found",
    });
  }

  
  // finally delete the cart item
  await prisma.cartItem.delete({
    where: {
      id: itemId,
    },
  });

  res.json({
    status: "Success",
    message: "Cart item removed successfully",
  });
};

export const clearCart = async (req, res) => {
  const userId = req.user.id;

  // find user card first
  const cart = await prisma.cart.findFirst({
    where: {
      userId: userId,
    },
  });

  if (!cart) {
    return res.status(200).json({
      status: "Success",
      message: "Cart is already empty",
      data: { cart: null },
    });
  }

  // delete all cart items
  const cartId = cart.id;
  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
    },
  });

  res.json({
    status: "Success",
    message: "Cart cleared successfully",
    data: { cart: null },
  });
};