import multer from 'multer';

import { MAX_FILE_SIZE } from '../consts';

// Configure multer for in-memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

export default upload;
