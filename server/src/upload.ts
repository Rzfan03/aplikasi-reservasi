import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import multer from 'multer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const uploadsDir = path.resolve(__dirname, '..', 'uploads')

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    cb(null, `${randomUUID()}.pdf`)
  },
})

export const uploadPdf = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === 'application/pdf' ||
      path.extname(file.originalname).toLowerCase() === '.pdf'
    ) {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed'))
    }
  },
})
