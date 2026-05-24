import multer from "multer";

export const uploadCsv = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    const isCsv =
      file.mimetype === "text/csv" || file.originalname.endsWith(".csv");
    cb(null, isCsv);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});
