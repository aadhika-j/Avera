import axios from "axios";

export const uploadToCloudinary = async (file, { onProgress } = {}) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const apiBase = import.meta.env.VITE_CLOUDINARY_API_BASE;
  const folder = import.meta.env.VITE_CLOUDINARY_UPLOAD_FOLDER;
  const resourceType = import.meta.env.VITE_CLOUDINARY_UPLOAD_RESOURCE_TYPE;

  if (!cloudName || !uploadPreset || !apiBase || !folder || !resourceType) {
    throw new Error("Cloudinary env not configured");
  }

  const url = `${apiBase}/v1_1/${cloudName}/${resourceType}/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  try {
    const resp = await axios.post(url, formData, {
      onUploadProgress: (event) => {
        if (onProgress) onProgress(event);
      },
    });

    return resp.data;
  } catch (err) {
    const cloudMessage = err?.response?.data?.error?.message;
    const message = cloudMessage || err?.message || "Cloudinary upload failed";
    const wrapped = new Error(message);
    wrapped.status = err?.response?.status;
    wrapped.details = err?.response?.data;
    throw wrapped;
  }
};