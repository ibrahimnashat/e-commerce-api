const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cd) {
        cd(null, './uploads/');
    },
    filename: function (req, file, cd) {
        cd(null, file.originalname);
    }
});

const fileFilter = (req, file, cd) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/jpg' || file.mimetype == 'image/png') {
        cd(null, true);
    } else {
        cd(null, false);
    }
}

const uploader = multer({
    fileFilter: fileFilter,
    storage: storage,
    limits: {
        fieldSize: 1024 * 1024 * 5
    }
});





module.exports = uploader;