const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const Stripe = require("stripe");

admin.initializeApp();
const db = admin.firestore();

// 1. SECURE SERVER-SIDE INTENT CREATION ENDPOINT
exports.createStripePaymentIntent = onRequest({ cors: true }, async (req, res) => {
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      logger.error("System Configuration Interrupted: Missing STRIPE_SECRET_KEY variable.");
      return res.status(500).json({ error: "Downstream payment engine configurations are uninitialized." });
    }

    const stripe = new Stripe(stripeSecret);
    const { amount, currency, orderId } = req.body;

    if (!amount || !currency || !orderId) {
      return res.status(400).json({ error: "Missing required transactional payload validation parameters." });
    }

    // Convert decimal floating inputs precisely into lowest system currency denominators (cents/fils)
    const normalizedIntegerAmount = Math.round(parseFloat(amount) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: normalizedIntegerAmount,
      currency: currency.toLowerCase().replace(/[^a-z]/g, ""),
      metadata: { orderId: orderId }
    });

    logger.info(`Secure Payment Intent generated successfully for Order: ${orderId}`);
    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      intentId: paymentIntent.id
    });

  } catch (err) {
    logger.error("Payment Intent Generation Core Exception:", err);
    return res.status(500).json({ error: err.message });
  }
});

// 2. SECURE CRYPTOGRAPHIC STRIPE SIGNATURE VERIFICATION WEBHOOK
exports.stripeWebhook = onRequest({ cors: false }, async (req, res) => {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecret || !webhookSecret) {
    logger.error("System State Fault: Webhook called but runtime secrets environment properties are missing.");
    return res.status(500).send("Webhook configurations uninitialized locally.");
  }

  const stripe = new Stripe(stripeSecret);
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    // Reconstruct raw packet buffers directly using cryptographic signatures to prevent payload spoofing
    event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
  } catch (verifyErr) {
    logger.error(`Cryptographic Validation Interruption: Verification signature mismatch.`, verifyErr);
    return res.status(400).send(`Webhook Signature Authentication Failure: ${verifyErr.message}`);
  }

  const sessionDataObj = event.data.object;
  const targetOrderId =
  sessionDataObj.metadata && sessionDataObj.metadata.orderId
    ? sessionDataObj.metadata.orderId
    : null;

  if (!targetOrderId) {
    logger.warn(`Stripe event packet received type [${event.type}] but lacks a metadata orderId reference flag.`);
    return res.status(200).send("Event acknowledged, but bypassed due to empty application tracing indexes.");
  }

  const orderDocumentReference = db.collection("orders").doc(targetOrderId);

  try {
    // Run an isolated write transaction to prevent race conditions during distributed parallel webhooks
    await db.runTransaction(async (transaction) => {
      const docSnapshot = await transaction.get(orderDocumentReference);
      
      if (!docSnapshot.exists) {
        logger.error(`Database Tracking Miss: Webhook could not match order reference index ${targetOrderId}`);
        return;
      }

      const currentOrderState = docSnapshot.data();
      let updatedDataPayload = {};

      if (event.type === "payment_intent.succeeded") {
        // Prevent reprocessing overwrites if order was already modified or tracked
        if (currentOrderState.paymentStatus === "Succeeded") return;

        updatedDataPayload = {
          paymentStatus: "Succeeded",
          transactionId: sessionDataObj.latest_charge || sessionDataObj.id,
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        logger.info(`Fulfillment Complete: Payment succeeded state synced for Order: ${targetOrderId}`);
      } 
      
      else if (event.type === "payment_intent.payment_failed") {
        updatedDataPayload = {
          paymentStatus: "Failed",
          failureReason:
            (sessionDataObj.last_payment_error &&
              sessionDataObj.last_payment_error.message) ||
            "Card transaction refused by matching bank.",
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        logger.warn(`Transaction Interrupted: Card payment failed for Order: ${targetOrderId}`);
      }

      if (Object.keys(updatedDataPayload).length > 0) {
        transaction.update(orderDocumentReference, updatedDataPayload);
      }
    });

    return res.status(200).json({ received: true });

  } catch (dbTxError) {
    logger.error(`Firestore state atomic update transaction exception for Order ${targetOrderId}:`, dbTxError);
    return res.status(500).send("Internal backend firestore syncing interruption state.");
  }
});

// 3. DYNAMIC XML SITEMAP GENERATOR FOR SEO
exports.generateSitemap = onRequest({ cors: true }, async (req, res) => {
  try {
    const domain = req.headers["x-forwarded-host"]
      ? `https://${req.headers["x-forwarded-host"]}`
      : `https://${req.headers.host || "framer-327a4.web.app"}`;

    const staticPaths = [
      "",
      "/products",
      "/faq",
      "/about-us",
      "/contact",
      "/custom-frame-design",
      "/products/classic-wood",
      "/products/modern-metal",
      "/products/gallery-wrap",
      "/products/ornate-gold"
    ];

    const urls = [];
    
    // Add static paths
    staticPaths.forEach(p => {
      urls.push({
        loc: `${domain}${p}`,
        changefreq: p === "" || p === "/products" ? "daily" : "weekly",
        priority: p === "" ? "1.0" : p.startsWith("/products/") ? "0.8" : p === "/products" ? "0.9" : "0.5"
      });
    });

    // Helper to slugify product names matching frontend slugify logic
    const slugify = (text) => {
      if (!text) return "";
      return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
    };

    // Fetch dynamic products from firestore
    const productsSnapshot = await db.collection("products").get();
    productsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.name) {
        const slug = slugify(data.name);
        urls.push({
          loc: `${domain}/products/${slug}`,
          changefreq: "weekly",
          priority: "0.8"
        });
      }
    });

    // Fetch dynamic pages from firestore
    const pagesSnapshot = await db.collection("pages").get();
    pagesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.slug) {
        urls.push({
          loc: `${domain}/${data.slug}`,
          changefreq: "weekly",
          priority: "0.6"
        });
      }
    });

    // Build XML response
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    urls.forEach(item => {
      xml += `  <url>\n`;
      xml += `    <loc>${item.loc}</loc>\n`;
      xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
      xml += `    <priority>${item.priority}</priority>\n`;
      xml += `  </url>\n`;
    });
    xml += `</urlset>`;

    res.header("Content-Type", "application/xml");
    return res.status(200).send(xml);

  } catch (err) {
    logger.error("Sitemap Generation Core Exception:", err);
    return res.status(500).send("Error generating sitemap");
  }
});

// 4. DYNAMIC ROBOTS.TXT GENERATOR FOR SEO
exports.generateRobots = onRequest({ cors: true }, async (req, res) => {
  try {
    const domain = req.headers["x-forwarded-host"]
      ? `https://${req.headers["x-forwarded-host"]}`
      : `https://${req.headers.host || "framer-327a4.web.app"}`;

    const txt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard
Disallow: /checkout
Disallow: /user-profile
Disallow: /user-settings
Disallow: /orders-tracking
Disallow: /order-tracking

Sitemap: ${domain}/sitemap.xml`;

    res.header("Content-Type", "text/plain");
    return res.status(200).send(txt);
  } catch (err) {
    logger.error("Robots.txt Generation Exception:", err);
    return res.status(500).send("Error generating robots.txt");
  }
});