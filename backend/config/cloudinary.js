const cloudinary = require("cloudinary").v2;

const normalizeEnvValue = (value) =>
    typeof value === "string" ? value.trim() : value;

cloudinary.config({
    cloud_name: normalizeEnvValue(process.env.CLOUDINARY_CLOUD_NAME),
    api_key: normalizeEnvValue(process.env.CLOUDINARY_API_KEY),
    api_secret: normalizeEnvValue(process.env.CLOUDINARY_API_SECRET),
});

module.exports = cloudinary;