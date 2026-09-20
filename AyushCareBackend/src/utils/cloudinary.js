import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_COUD_NAME || 'REMOVED_CLOUDINARY_CLOUD_NAME',
    api_key: process.env.CLOUDINARY_API_KEY || 'REMOVED_CLOUDINARY_API_KEY',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'REMOVED_CLOUDINARY_API_SECRET'
});

/**
 * Upload a local file to Cloudinary and delete the local temporary file.
 * @param {string} localFilePath - Path to the file in public/temp
 * @param {string} [folder] - Target Cloudinary folder
 * @returns {Promise<object>} Cloudinary upload result object
 */
export const uploadOnCloudinary = async (localFilePath, folder = 'ayushcare/documents') => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
            folder: folder
        });

        // Clear local temporary file after successful upload
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return response;
    } catch (error) {
        // Clear local temporary file on error
        if (localFilePath && fs.existsSync(localFilePath)) {
            try {
                fs.unlinkSync(localFilePath);
            } catch (unlinkError) {
                console.warn('[Cloudinary] Failed to unlink temp file:', unlinkError?.message || unlinkError);
            }
        }
        console.error('[Cloudinary Upload Error]', error?.message || error);
        throw error;
    }
};

export default cloudinary;
