// Resolve the effective wholesale unit price for a product variation at a given
// quantity, honouring quantity-break tiers.
//
// Priority:
//   1. Highest matching priceTiers entry (minQty <= quantity)
//   2. variation.wholesalePrice
//   3. variation.price (retail fallback)

export const resolveWholesalePrice = (variation, quantity = 1) => {
    if (!variation) return 0;

    const retail = parseFloat(variation.price) || 0;
    const base = variation.wholesalePrice != null
        ? (parseFloat(variation.wholesalePrice) || retail)
        : retail;

    let tiers = variation.priceTiers;
    if (typeof tiers === 'string') {
        try { tiers = JSON.parse(tiers); } catch { tiers = null; }
    }

    if (Array.isArray(tiers) && tiers.length > 0) {
        const qty = parseInt(quantity, 10) || 1;
        const eligible = tiers
            .filter((t) => t && t.minQty != null && qty >= parseInt(t.minQty, 10))
            .sort((a, b) => parseInt(b.minQty, 10) - parseInt(a.minQty, 10));
        if (eligible.length > 0 && eligible[0].price != null) {
            return parseFloat(eligible[0].price) || base;
        }
    }

    return base;
};

export default { resolveWholesalePrice };
