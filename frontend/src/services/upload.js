import axios from "axios";

export const uploadToCloudinary = async (file, { onProgress } = {}) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const apiBase = import.meta.env.VITE_CLOUDINARY_API_BASE;
  const folder = import.meta.env.VITE_CLOUDINARY_UPLOAD_FOLDER;

  if (!cloudName || !uploadPreset || !apiBase || !folder) {
    throw new Error("Cloudinary env not configured");
  }

  const url = `${apiBase}/v1_1/${cloudName}/auto/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const resp = await axios.post(url, formData, {
    onUploadProgress: (event) => {
      if (onProgress) onProgress(event);
    },
  });

  return resp.data;
};