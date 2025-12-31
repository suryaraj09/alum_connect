const multer = require('multer');
const path = require('path');

// Storage for Profile Pictures
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/uploads/profiles');
    },
    filename: (req, file, cb) => {
        cb(null, `profile-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Storage for Post Media (Videos/Images)
const postStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/uploads/posts');
    },
    filename: (req, file, cb) => {
        cb(null, `post-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Storage for Workspace Files
const workspaceStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/uploads/workspace');
    },
    filename: (req, file, cb) => {
        cb(null, `file-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const uploadProfile = multer({
    storage: profileStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images Only!');
        }
    }
}).single('image');

const uploadPostMedia = multer({
    storage: postStorage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp|mp4|mov|avi|mkv/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images or Videos Only!');
        }
    }
}).single('media');

const uploadWorkspaceFile = multer({
    storage: workspaceStorage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    fileFilter: (req, file, cb) => {
        // Allow most document and media types
        return cb(null, true);
    }
}).single('file');

const uploadProfileMedia = (req, res) => {
    uploadProfile(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // Return the path for the frontend to save in the User/Profile model
        res.json({
            url: `/uploads/profiles/${req.file.filename}`
        });
    });
};

const uploadPostMediaContent = (req, res) => {
    uploadPostMedia(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        res.json({
            url: `/uploads/posts/${req.file.filename}`,
            type: req.file.mimetype.startsWith('video') ? 'video' : 'image'
        });
    });
};

const uploadWorkspaceFileContent = (req, res) => {
    uploadWorkspaceFile(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        res.json({
            url: `/uploads/workspace/${req.file.filename}`,
            filename: req.file.originalname,
            size: req.file.size
        });
    });
};

module.exports = { uploadProfileMedia, uploadPostMediaContent, uploadWorkspaceFileContent };
