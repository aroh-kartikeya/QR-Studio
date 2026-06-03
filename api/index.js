import express from "express";
import cors from "cors";
import QRCode from "qrcode";

const app = express();

app.use(cors());
app.use(express.json());

// Main QR Generation Endpoint
app.post("/api/generate", async (req, res) => {
  const { text, colorDark = "#000000", colorLight = "#ffffff", margin = 4 } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text or URL is required to generate a QR code." });
  }

  try {
    // Generate QR code as a base64 PNG data URL
    const qrDataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: "M",
      margin,
      width: 600, // Large high-quality resolution for downloads
      color: {
        dark: colorDark,
        light: colorLight,
      },
    });

    return res.json({ qrCodeUrl: qrDataUrl });
  } catch (error) {
    console.error("QR Code Generation Error:", error);
    return res.status(500).json({ error: "Failed to generate QR code. Please try again." });
  }
});

// Root API healthcheck
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

// Run locally if not in Vercel production serverless context
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
