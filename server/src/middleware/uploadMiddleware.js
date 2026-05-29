const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createDirectories = () => {
  const dirs = [
    path.join(__dirname, '../uploads/images'),
    path.join(__dirname, '../uploads/audio'),
    path.join(__dirname, '../uploads/documents'),
  ];
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createDirectories();

// Setup storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'image') {
      cb(null, path.join(__dirname, '../uploads/images'));
    } else if (file.fieldname === 'audio') {
      cb(null, path.join(__dirname, '../uploads/audio'));
    } else if (file.fieldname === 'document') {
      cb(null, path.join(__dirname, '../uploads/documents'));
    } else {
      cb(new Error('Invalid field name for file upload'), false);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File validation
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'image') {
    const allowedImageTypes = /jpeg|jpg|png|webp/;
    const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedImageTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    return cb(new Error('Only images (.jpg, .jpeg, .png, .webp) are allowed!'), false);
  } else if (file.fieldname === 'audio') {
    const allowedAudioTypes = /mp3|wav|ogg|webm|m4a/;
    const extname = allowedAudioTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedAudioTypes.test(file.mimetype) || file.mimetype.includes('audio');
    if (extname || mimetype) {
      return cb(null, true);
    }
    return cb(new Error('Only audio files (.mp3, .wav, .ogg, .webm, .m4a) are allowed!'), false);
  } else if (file.fieldname === 'document') {
    const allowedDocTypes = /pdf|jpeg|jpg|png/;
    const extname = allowedDocTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedDocTypes.test(file.mimetype) || file.mimetype.includes('pdf') || file.mimetype.includes('image');
    if (extname && mimetype) {
      return cb(null, true);
    }
    return cb(new Error('Only documents (.pdf, .jpg, .jpeg, .png) are allowed!'), false);
  }
  cb(new Error('Unexpected file field'), false);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limits
  },
});

module.exports = upload;
