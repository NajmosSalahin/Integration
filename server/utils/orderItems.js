import Product from '../models/Product.js';

export async function resolveOrderItems(items) {
  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await Product.find({ _id: { $in: productIds }, active: true });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  let subtotal = 0;
  const resolved = [];

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw Object.assign(new Error(`Product ${item.productId} not found or inactive`), { status: 400 });
    }

    const sizeStock = product.stock.find((s) => s.size === item.size);
    if (sizeStock && !sizeStock.inStock) {
      throw Object.assign(new Error(`${product.title} size ${item.size} is out of stock`), { status: 400 });
    }

    if (!product.sizes.includes(item.size)) {
      throw Object.assign(new Error(`${product.title} does not have size ${item.size}`), { status: 400 });
    }

    subtotal += product.price * item.quantity;
    resolved.push({
      productId: product._id,
      title: product.title,
      size: item.size,
      quantity: item.quantity,
      priceAtOrder: product.price,
    });
  }

  return { items: resolved, subtotal };
}