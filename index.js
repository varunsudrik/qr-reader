const express = require("express");
const Jimp = require("jimp");
const jsQR = require("jsqr");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("QR Reader API");
});
app.get("/health", (req, res) => {
  res.json({ health: true });
});

app.post("/scan-qr", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const fetch = (await import("node-fetch")).default;

    const response = await fetch(url);
    const buffer = await response.buffer();

    const image = await Jimp.read(buffer);

    const imageData = {
      data: new Uint8ClampedArray(image.bitmap.data),
      width: image.bitmap.width,
      height: image.bitmap.height,
    };

    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      return res.json({ data: code.data });
    } else {
      return res.status(500).json({ error: "Failed to decode QR code" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to process the QR code image" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
