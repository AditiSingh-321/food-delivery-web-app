const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const logger = require('../middleware/logger.middleware');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        });
        
        // file has been uploaded successfully
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        logger.error(`Cloudinary upload error: ${error.message}`);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
        }
        return null;
    }
};

const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return null;
        const response = await cloudinary.uploader.destroy(publicId);
        return response;
    } catch (error) {
        logger.error(`Cloudinary delete error: ${error.message}`);
        return null;
    }
};

module.exports = {
    cloudinary,
    uploadOnCloudinary,
    deleteFromCloudinary
};
