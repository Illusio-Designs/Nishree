const sharp = require('sharp');
const fs = require('fs').promises;  // Use promises version of fs
const fsSync = require('fs');  // Keep sync version for checks
const path = require('path');

class ImageHandler {
    constructor(uploadDir) {
        this.uploadDir = uploadDir;
        this.ensureUploadDir();
    }

    ensureUploadDir() {
        if (!fsSync.existsSync(this.uploadDir)) {
            fsSync.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async deleteFile(filePath) {
        try {
            if (filePath && fsSync.existsSync(filePath)) {
                await fs.unlink(filePath);
                console.log('File deleted successfully:', filePath);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting file:', error);
            return false;
        }
    }

    async processImage(inputFile, options = {}) {
        const {
            width = 200,
            height = 200,
            quality = 80,
            format = 'webp',
            filename = `${Date.now()}-${Math.random().toString(36).substring(7)}`
        } = options;

        try {
            const outputFilename = `${filename}.${format}`;
            const outputPath = path.join(this.uploadDir, outputFilename);
            
            // Process image with sharp
            await sharp(inputFile)
                .resize(width, height, {
                    fit: 'cover',
                    position: 'center'
                })
                .toFormat(format, { quality })
                .toFile(outputPath);

            // Add a small delay before deleting the original file
            // This ensures the sharp process has fully released the file
            await new Promise(resolve => setTimeout(resolve, 100));

            // Delete the original uploaded file
            try {
                if (fsSync.existsSync(inputFile)) {
                    await fs.unlink(inputFile);
                }
            } catch (deleteError) {
                console.warn('Warning: Could not delete original file:', deleteError.message);
                // Continue processing even if delete fails
            }

            console.log('Image processed successfully:', outputFilename);

            return {
                success: true,
                filename: outputFilename
            };
        } catch (error) {
            console.error('Error processing image:', error);
            // Clean up original file if processing fails
            try {
                if (fsSync.existsSync(inputFile)) {
                    await fs.unlink(inputFile);
                }
            } catch (deleteError) {
                console.warn('Warning: Could not delete original file:', deleteError.message);
            }
            return {
                success: false,
                error: error.message
            };
        }
    }

    async handleProfileImage(oldImagePath, newImageFile, userId) {
        try {
            // Delete old image if exists
            if (oldImagePath) {
                const oldImageFullPath = path.join(this.uploadDir, oldImagePath);
                await this.deleteFile(oldImageFullPath);
            }

            // Process new image
            const result = await this.processImage(newImageFile, {
                width: 200,
                height: 200,
                quality: 80,
                format: 'webp',
                filename: `profile-${userId}-${Date.now()}`
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            console.log('Profile image handled successfully:', result.filename);
            return result.filename;
        } catch (error) {
            console.error('Error handling profile image:', error);
            throw error;
        }
    }

    async handleCategoryImage(oldImagePath, newImageFile) {
        try {
            // Delete old image if exists
            if (oldImagePath) {
                const oldImageFullPath = path.join(this.uploadDir, oldImagePath);
                await this.deleteFile(oldImageFullPath);
            }

            // Process new image
            const result = await this.processImage(newImageFile, {
                width: 800,
                height: 600,
                quality: 80,
                format: 'webp',
                filename: `category-${Date.now()}`
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            console.log('Category image handled successfully:', result.filename);
            return result.filename;
        } catch (error) {
            console.error('Error handling category image:', error);
            throw error;
        }
    }

    async handleSliderImage(oldImagePath, newImageFile) {
        try {
            // Delete old image if exists
            if (oldImagePath) {
                const oldImageFullPath = path.join(this.uploadDir, oldImagePath);
                await this.deleteFile(oldImageFullPath);
            }

            // Process new image
            const result = await this.processImage(newImageFile, {
                width: 1920,
                height: 1080,
                quality: 80,
                format: 'webp',
                filename: `slider-${Date.now()}`
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            console.log('Slider image handled successfully:', result.filename);
            return result.filename;
        } catch (error) {
            console.error('Error handling slider image:', error);
            throw error;
        }
    }

    // Helper method to get full path for serving images
    getImagePath(filename) {
        return path.join(this.uploadDir, filename);
    }
}

module.exports = ImageHandler; 