const multer = require('multer');
const path = require('path');

// Konfiguracija gde i kako se čuvaju fajlovi
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/profiles/'); // folder gde se čuvaju slike
    },
    filename: function (req, file, cb) {
        // Unique ime: userId-timestamp.jpg
        const uniqueName = req.session.user._id + '-' + Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

// Filter - samo slike i gifovi
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());  // Proveravamo ekstenziju fajla
    const mimetype = allowedTypes.test(file.mimetype);  // mimetype je standardizovan način da se identifikuje stvarni sadržaj fajla
    
    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Samo slike i gifovi su dozvoljeni!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
    fileFilter: fileFilter
});

module.exports = upload;
