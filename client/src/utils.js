export const formatNaira = (n) => "₦" + Number(n || 0).toLocaleString("en-NG");

export const starString = (rating) => {
  const full = Math.round(rating || 0);
  return "★".repeat(full) + "☆".repeat(5 - full);
};

export const DELIVERY_FEE = 5000;
