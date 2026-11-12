export function getActiveDiscount(hotel, now = Date.now()) {
  const discount = hotel?.discount;
  if (!discount || typeof discount.percent !== 'number') return null;

  const endsAt = new Date(discount.endsAt).getTime();
  return Number.isFinite(endsAt) && endsAt > now ? discount : null;
}

export function getFinalPrice(hotel, now = Date.now()) {
  const discount = getActiveDiscount(hotel, now);
  return Math.round(hotel.price * (1 - (discount?.percent || 0) / 100));
}
