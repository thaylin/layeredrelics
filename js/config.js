/*
 * Layered Relics — site settings.
 * This is the one file to edit for contact details and the inquiry form.
 */
window.LR_CONFIG = {
  // Product collection section. Off until real product photos are ready.
  // Set to true to show "The Collection" (built from data/products.json), its nav link
  // and the "Browse the Collection" button. See README > "Showing the collection".
  showCollection: false,

  // Where inquiries and "Ask about this" emails go.
  email: "thaylin@gmail.com",

  // Inquiry form endpoint (optional).
  // Leave "" to have the form open the visitor's email app with their message pre-filled.
  // To receive submissions without email apps, create a free form at https://formspree.io
  // and paste its endpoint here, e.g. "https://formspree.io/f/abcdwxyz". See README > "Inquiry form".
  formEndpoint: "",

  // Label for product buttons that link to an external store (Etsy, Shopify, ...).
  buyLabel: "Buy Now"
};
