import { Cart, CartItem, Product, ProductImage, ProductVariation } from '../model/associations.js';

// Get user's cart
export const getUserCart = async (req, res) => {
	try {
		const cart = await Cart.findOne({
			where: { user_id: req.user.id },
			include: [
				{
					model: CartItem,
					include: [
						{
							model: Product,
							include: [{ model: ProductImage, as: 'ProductImages' }, { model: ProductVariation, as: 'ProductVariations' }]
						},
						{
							model: ProductVariation
						}
					]
				}
			]
		});

		if (!cart) {
			return res.json({
				cart: [],
				summary: { subtotal: 0, shipping: 0, discount: 0, total: 0 }
			});
		}

		let subtotal = 0;
		cart.CartItems.forEach(item => {
			subtotal += (item.price || 0) * (item.quantity || 1);
		});

		let shipping = subtotal > 0 ? 0 : 0;

		let discount = 0;
		const couponCode = req.query.coupon || req.body?.coupon || null;
		if (couponCode) {
			discount = subtotal * 0.1;
		}

		const total = Math.max(0, subtotal - discount + shipping);

		const formattedCart = cart.CartItems.map(item => {
			const product = item.Product;
			let variation = item.ProductVariation;

			if (!variation && product && product.ProductVariations && product.ProductVariations.length > 0) {
				variation = product.ProductVariations[0];
			}

			const attributes = variation && variation.attributes ? variation.attributes : {};
			const baseUrl = process.env.BASE_URL || process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;

			let image = '/placeholder.png';
			let images = [];

			if (product && product.ProductImages && product.ProductImages.length > 0) {
				const color = attributes?.color;
				if (color && Array.isArray(color) && color.length > 0) {
					const colorLower = String(color[0]).toLowerCase();
					const matchingImages = product.ProductImages.filter(
						img =>
							(img.alt_text && img.alt_text.toLowerCase().includes(colorLower)) ||
							(img.image_url && img.image_url.toLowerCase().includes(colorLower))
					);
					if (matchingImages.length > 0) {
						image = `${baseUrl}${matchingImages[0].image_url}`;
						images = matchingImages.map(img => ({
							image_url: `${baseUrl}${img.image_url}`,
							alt_text: img.alt_text
						}));
					} else {
						image = `${baseUrl}${product.ProductImages[0].image_url}`;
						images = product.ProductImages.map(img => ({
							image_url: `${baseUrl}${img.image_url}`,
							alt_text: img.alt_text
						}));
					}
				} else {
					image = `${baseUrl}${product.ProductImages[0].image_url}`;
					images = product.ProductImages.map(img => ({
						image_url: `${baseUrl}${img.image_url}`,
						alt_text: img.alt_text
					}));
				}
			}

			const price = variation ? variation.price : product ? product.price : 0;

			return {
				id: item.id,
				productId: product ? product.id : null,
				variationId: variation ? variation.id : null,
				name: product ? product.name : 'Product not found',
				image,
				images,
				price,
				quantity: item.quantity,
				size: item.selected_size || null,
				color: attributes?.color || null,
				stock: variation ? variation.stock : product ? product.stock_quantity : 0,
				weight: product ? product.weight : null,
				weightUnit: product ? product.weightUnit : null,
				dimensions: product ? product.dimensions : null,
				dimensionUnit: product ? product.dimensionUnit : null
			};
		});

		res.json({
			cart: formattedCart,
			summary: { subtotal, shipping, discount, total }
		});
	} catch (error) {
		console.error('Error fetching cart:', error);
		res.status(500).json({ message: 'Failed to fetch cart', error: error.message });
	}
};

// Add item to cart
export const addToCart = async (req, res) => {
	try {
		const userId = req.user.id;
		const { productId, variationId, quantity, size } = req.body;

		let cart = await Cart.findOne({ where: { user_id: userId } });
		if (!cart) {
			cart = await Cart.create({ user_id: userId });
		}

		const where = {
			cartId: cart.id,
			productId,
			variationId: variationId || null,
			selected_size: size || null
		};

		let item = await CartItem.findOne({ where });

		let stockAvailable = 0;
		if (variationId) {
			const variation = await ProductVariation.findByPk(variationId);
			stockAvailable = variation ? variation.stock : 0;
		} else {
			const variation = await ProductVariation.findOne({ where: { productId } });
			stockAvailable = variation ? variation.stock : 0;
		}

		const requestedQuantity = item ? item.quantity + quantity : quantity;
		if (typeof stockAvailable !== 'number' || stockAvailable < requestedQuantity) {
			return res.status(400).json({ message: 'Product is out of stock or insufficient quantity' });
		}

		if (item) {
			item.quantity += quantity;
			await item.save();
		} else {
			let price = 0;
			if (variationId) {
				const variation = await ProductVariation.findByPk(variationId);
				price = variation ? variation.price : 0;
			} else {
				const variation = await ProductVariation.findOne({ where: { productId } });
				price = variation ? variation.price : 0;
			}
			item = await CartItem.create({
				cartId: cart.id,
				productId,
				variationId: variationId || null,
				quantity,
				price,
				selected_size: size || null
			});
		}

		res.json({ success: true, item });
	} catch (error) {
		console.error('[Cart] Error in addToCart:', error);
		res.status(500).json({ message: 'Failed to add to cart', error: error.message });
	}
};

// Update cart item
export const updateCartItem = async (req, res) => {
	try {
		const { productId } = req.params;
		const { quantity, variationId } = req.body;
		const userId = req.user.id;

		if (quantity < 1) {
			return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
		}

		const cart = await Cart.findOne({ where: { user_id: userId } });
		if (!cart) {
			return res.status(404).json({ success: false, message: 'Cart not found.' });
		}

		const whereClause = { cartId: cart.id, productId };
		if (variationId) {
			whereClause.variationId = variationId;
		}

		let cartItem = await CartItem.findOne({ where: whereClause });
		if (!cartItem) {
			const fallbackCartItem = await CartItem.findOne({
				where: { cartId: cart.id, productId, variationId: null }
			});
			if (!fallbackCartItem) {
				return res.status(404).json({ success: false, message: 'Cart item not found.' });
			}
			cartItem = fallbackCartItem;
		}

		cartItem.quantity = quantity;
		await cartItem.save();

		res.json({ success: true, message: 'Cart item updated.', item: cartItem });
	} catch (error) {
		console.error('Error updating cart item:', error);
		res.status(500).json({ success: false, message: 'Failed to update cart item.', error: error.message });
	}
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
	try {
		const userId = req.user.id;
		const { productId, variationId } = req.params;

		const cart = await Cart.findOne({ where: { user_id: userId } });
		if (!cart) return res.status(404).json({ message: 'Cart not found' });

		const whereClause = { cartId: cart.id, productId };
		if (variationId && variationId !== 'null' && variationId !== '0' && variationId !== 0) {
			whereClause.variationId = parseInt(variationId, 10);
		} else {
			whereClause.variationId = null;
		}

		const cartItem = await CartItem.findOne({ where: whereClause });
		if (!cartItem) {
			const alternativeItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
			if (!alternativeItem) {
				return res.status(404).json({ message: 'Cart item not found' });
			}
			await alternativeItem.destroy();
		} else {
			await cartItem.destroy();
		}

		res.json({ success: true, deleted: 1 });
	} catch (error) {
		console.error('Error removing from cart:', error);
		res.status(500).json({ message: 'Failed to remove cart item', error: error.message });
	}
};

// Clear cart
export const clearCart = async (req, res) => {
	try {
		const userId = req.user.id;
		const cart = await Cart.findOne({ where: { user_id: userId } });
		if (!cart) return res.status(404).json({ message: 'Cart not found' });
		await CartItem.destroy({ where: { cartId: cart.id } });
		res.json({ success: true });
	} catch (error) {
		res.status(500).json({ message: 'Failed to clear cart', error: error.message });
	}
};


