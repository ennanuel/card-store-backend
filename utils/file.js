const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { checkValues } = require('./player');
const { checkRegisterValues } = require('./auth');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folderName = file.fieldname === 'profilePic' ? '../images/profile' : '../images/card';
        cb(null, path.join(__dirname, folderName))
    },
    filename: (req, file, cb) => {
        const filename = Date.now() + path.extname(file.originalname);
        req.body[file.fieldname] = filename;
        cb(null, filename);
    }
})

const upload = multer({
    storage,
    limits: { fileSize: 3 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const typeCheck = ['image/png', 'image/jpg', 'image/jpeg'].includes(file.mimetype);
        if (typeCheck) {
            cb(null, true);
        } else {
            cb(null, false);
            const err = new Error('File type not supported');
            err.name = 'ExtensionError';
            return cb(err);
        }
    }
});
const uploadCard = upload.single('image');
const uploadProfile = upload.single('profilePic');

async function uploadCardMiddleWare(req, res, next) {
    uploadCard(req, res, async (err) => {
        try {
            if (err) throw handleMulterError(err);
            const { failed, message } = checkValues(req.body);
            if (failed) throw new Error(message);
            next();
        } catch (error) {
            console.error(error);
            const filepath = `card/${req.body.image}`
            await deleteImage(filepath);
            return res.status(500).json({ message: error.message });
        }
    })
}

async function uploadProfileMiddleware(req, res, next) {
    uploadProfile(req, res, async (err) => {
        try {
            if (err) throw handleMulterError(err);
            const { failed, message } = checkRegisterValues(req.body);
            if (failed) throw new Error(message);
            req.body.owner = req.user.id;
            next();
        } catch (error) {
            console.error(error);
            const filepath = `card/${req.body.image}`
            await deleteImage(filepath);
            return res.status(500).json({ message: error.message });
        }
    })
}

async function deleteImage(filename) {
    try {
        const filePath = `../images/${filename}`;
        const absolutePath = path.join(__dirname, filePath);
        const exists = await fs.existsSync(absolutePath);
        if (!exists) throw new Error('File does not exist');
        await fs.unlinkSync(absolutePath);
        return { failed: false, message: '' };
    } catch (error) {
        console.error(error);
        return { failed: true, message: error.message };
    }
}

async function prepareDeleteImages(card) {
    const filePath = `card/${card._doc.image}`;
    return deleteImage(filePath);
}

function handleMulterError(err) {
    let message;
    if (err instanceof multer.MulterError) message = 'Error occured in multer';
    else message = err.message;
    return new Error(message);
};

module.exports = { uploadCardMiddleWare, uploadProfileMiddleware, deleteImage, prepareDeleteImages }