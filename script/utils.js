// Capitalize first letter of each word
export function capitalizeWords(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

// Format expiry date (e.g., from "2025-06" or "12/26" if needed)
export function formatExpiryDate(date) {
  if (!date) return "";
  if (date.includes("/")) return date; // already in MM/YY
  const [year, month] = date.split("-");
  return `${month}/${year.slice(-2)}`;
}

// Mask card number except last 4 digits
export function maskCardNumber(cardNumber) {
  return cardNumber.replace(/\d(?=\d{4})/g, "*");
}

// Optional: create DOM element from HTML string (for modals/toasts)
export function createElementFromHTML(htmlString) {
  const div = document.createElement("div");
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

// Optional: mapStatus (if used elsewhere like order or cart display)
export function mapStatus(status) {
  const statusMap = {
    delivered: { text: "Delivered", class: "bg-success" },
    processing: { text: "Processing", class: "bg-secondary" },
    cancelled: { text: "Cancelled", class: "bg-danger" },
    refunded: { text: "Refunded", class: "bg-warning text-dark" }
  };
  return statusMap[status] || { text: "Unknown", class: "bg-dark" };
}
