import { Router } from "express";
import multer from "multer";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

function getPinataJwt() {
  const jwt = process.env.PINATA_JWT;

  if (!jwt || !jwt.trim()) {
    throw new Error("PINATA_JWT is missing. Please add PINATA_JWT to .env file.");
  }

  return jwt.trim();
}

function getPinataGateway() {
  return (process.env.PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs").replace(/\/$/, "");
}

function getMimeType(filename: string) {
  const lower = filename.toLowerCase();

  if (lower.endsWith(".mp3")) return "audio/mpeg";
  if (lower.endsWith(".wav")) return "audio/wav";
  if (lower.endsWith(".flac")) return "audio/flac";
  if (lower.endsWith(".ogg")) return "audio/ogg";
  if (lower.endsWith(".m4a")) return "audio/mp4";

  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".svg")) return "image/svg+xml";

  return "application/octet-stream";
}

function makeIpfsResult(cid: string, filename?: string) {
  return {
    cid,
    ipfsUrl: `ipfs://${cid}`,
    gatewayUrl: `${getPinataGateway()}/${cid}`,
    filename,
  };
}

function fileBufferToBlob(file: Express.Multer.File, mimeType: string) {
  const arrayBuffer = file.buffer.buffer.slice(
    file.buffer.byteOffset,
    file.buffer.byteOffset + file.buffer.byteLength
  ) as ArrayBuffer;

  return new Blob([arrayBuffer], {
    type: mimeType,
  });
}

async function uploadFileToPinata(file: Express.Multer.File, customName?: string) {
  const pinataJwt = getPinataJwt();

  const filename = customName || file.originalname;
  const mimeType = file.mimetype || getMimeType(filename);

  const formData = new FormData();
  const blob = fileBufferToBlob(file, mimeType);

  formData.append("file", blob, filename);

  formData.append(
    "pinataMetadata",
    JSON.stringify({
      name: filename,
    })
  );

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pinataJwt}`,
    },
    body: formData,
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Pinata file upload failed: ${response.status} ${text}`);
  }

  const data = JSON.parse(text);
  const cid = data.IpfsHash;

  if (!cid) {
    throw new Error(`Pinata did not return IpfsHash: ${text}`);
  }

  return makeIpfsResult(cid, filename);
}

async function uploadJsonToPinata(jsonData: any, name = "metadata.json") {
  const pinataJwt = getPinataJwt();

  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pinataJwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pinataMetadata: {
        name,
      },
      pinataContent: jsonData,
    }),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Pinata JSON upload failed: ${response.status} ${text}`);
  }

  const data = JSON.parse(text);
  const cid = data.IpfsHash;

  if (!cid) {
    throw new Error(`Pinata did not return IpfsHash: ${text}`);
  }

  return makeIpfsResult(cid, name);
}

function buildMetadata(params: {
  name: string;
  description: string;
  artist: string;
  trackCid: string;
  coverCid: string;
}) {
  return {
    name: params.name,
    description: params.description,

    // NFT marketplace thường đọc trường image
    image: `ipfs://${params.coverCid}`,

    // Trường custom cho file nhạc
    music: `ipfs://${params.trackCid}`,

    // Một số marketplace đọc animation_url cho media
    animation_url: `ipfs://${params.trackCid}`,

    attributes: [
      {
        trait_type: "Artist",
        value: params.artist,
      },
      {
        trait_type: "Storage",
        value: "Pinata IPFS",
      },
      {
        trait_type: "Created At",
        value: new Date().toISOString(),
      },
    ],
  };
}

// Health nhỏ cho riêng upload router
router.get("/health", (req, res) => {
  return res.json({
    status: "ok",
    service: "Pinata IPFS Upload Router",
  });
});

// POST /upload/track
router.post("/track", upload.single("track"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No track file provided",
      });
    }

    const track = await uploadFileToPinata(req.file, req.file.originalname);

    return res.json({
      success: true,
      track,
    });
  } catch (error: any) {
    console.error("[Pinata] /upload/track error:", error);

    return res.status(500).json({
      error: "Failed to upload track",
      message: error.message || String(error),
    });
  }
});

// POST /upload/cover
router.post("/cover", upload.single("cover"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No cover file provided",
      });
    }

    const cover = await uploadFileToPinata(req.file, req.file.originalname);

    return res.json({
      success: true,
      cover,
    });
  } catch (error: any) {
    console.error("[Pinata] /upload/cover error:", error);

    return res.status(500).json({
      error: "Failed to upload cover",
      message: error.message || String(error),
    });
  }
});

// POST /upload/both
router.post(
  "/both",
  upload.fields([
    { name: "track", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const files = req.files as {
        track?: Express.Multer.File[];
        cover?: Express.Multer.File[];
      };

      if (!files.track || !files.track[0]) {
        return res.status(400).json({
          error: "No track file provided",
        });
      }

      if (!files.cover || !files.cover[0]) {
        return res.status(400).json({
          error: "No cover file provided",
        });
      }

      const track = await uploadFileToPinata(files.track[0], files.track[0].originalname);
      const cover = await uploadFileToPinata(files.cover[0], files.cover[0].originalname);

      return res.json({
        success: true,
        track,
        cover,
      });
    } catch (error: any) {
      console.error("[Pinata] /upload/both error:", error);

      return res.status(500).json({
        error: "Failed to upload files",
        message: error.message || String(error),
      });
    }
  }
);

// POST /upload
// API chính frontend đang gọi: upload track + cover + tạo metadata NFT
router.post(
  "/",
  upload.fields([
    { name: "track", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const files = req.files as {
        track?: Express.Multer.File[];
        cover?: Express.Multer.File[];
      };

      if (!files.track || !files.track[0]) {
        return res.status(400).json({
          error: "No track file provided",
        });
      }

      if (!files.cover || !files.cover[0]) {
        return res.status(400).json({
          error: "No cover file provided",
        });
      }

      const prompt = req.body.prompt || "AI generated music";
      const username = req.body.username || "AI Composer";
      const name = req.body.name || `AI Music NFT ${Date.now()}`;

      const originalTrackName = files.track[0].originalname || "track.wav";
      const originalCoverName = files.cover[0].originalname || "cover.png";

      const track = await uploadFileToPinata(files.track[0], originalTrackName);
      const cover = await uploadFileToPinata(files.cover[0], originalCoverName);

      const metadata = buildMetadata({
        name,
        description: prompt,
        artist: username,
        trackCid: track.cid,
        coverCid: cover.cid,
      });

      const metadataResult = await uploadJsonToPinata(metadata, "metadata.json");

      return res.json({
        success: true,

        track,
        cover,
        metadata,

        trackUrl: track.ipfsUrl,
        coverUrl: cover.ipfsUrl,

        metadataUri: metadataResult.ipfsUrl,
        tokenURI: metadataResult.ipfsUrl,

        trackGatewayUrl: track.gatewayUrl,
        coverGatewayUrl: cover.gatewayUrl,
        metadataGatewayUrl: metadataResult.gatewayUrl,
        tokenURIGateway: metadataResult.gatewayUrl,

        folderCid: null,
        gatewayUrl: metadataResult.gatewayUrl,
      });
    } catch (error: any) {
      console.error("[Pinata] /upload error:", error);

      return res.status(500).json({
        error: "Failed to upload music NFT to Pinata",
        message: error.message || String(error),
      });
    }
  }
);

// POST /upload/mint/prepare
// API phụ: chuẩn bị tokenURI cho smart contract mint NFT
router.post(
  "/mint/prepare",
  upload.fields([
    { name: "track", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const files = req.files as {
        track?: Express.Multer.File[];
        cover?: Express.Multer.File[];
      };

      if (!files.track || !files.track[0]) {
        return res.status(400).json({
          error: "No track file provided",
        });
      }

      if (!files.cover || !files.cover[0]) {
        return res.status(400).json({
          error: "No cover file provided",
        });
      }

      const track = await uploadFileToPinata(
        files.track[0],
        files.track[0].originalname || "track.wav"
      );

      const cover = await uploadFileToPinata(
        files.cover[0],
        files.cover[0].originalname || "cover.png"
      );

      const metadata = buildMetadata({
        name: req.body.name || `AI Music NFT ${Date.now()}`,
        description: req.body.prompt || "AI generated music",
        artist: req.body.username || "AI Composer",
        trackCid: track.cid,
        coverCid: cover.cid,
      });

      const metadataResult = await uploadJsonToPinata(metadata, "metadata.json");

      return res.json({
        success: true,
        tokenURI: metadataResult.ipfsUrl,
        tokenURIGateway: metadataResult.gatewayUrl,
        metadata,
        track,
        cover,
      });
    } catch (error: any) {
      console.error("[Pinata] /upload/mint/prepare error:", error);

      return res.status(500).json({
        error: "Failed to prepare tokenURI",
        message: error.message || String(error),
      });
    }
  }
);

// POST /upload/folder
// Giữ endpoint này để tránh lỗi nếu code cũ gọi nhầm.
// Pinata bản đơn giản hiện tại chưa upload nguyên folder theo route này.
router.post("/folder", async (req, res) => {
  return res.status(501).json({
    success: false,
    error: "Folder upload is not implemented in Pinata replacement route.",
    message: "Use POST /upload with track and cover instead.",
  });
});

export default router;