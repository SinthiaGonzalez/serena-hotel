import axios from "axios";

const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD;
const PRESET = import.meta.env.VITE_CLOUDINARY_PRESET;

// Sube la imagen directo a Cloudinary (preset sin firma) y devuelve su URL https
export const subirImagen = async (file) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", PRESET);
  const response = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, data);
  return response.data.secure_url;
};

// Formato (WebP/AVIF) y calidad automáticos; con ancho, además la redimensiona.
// Las URLs que no son de Cloudinary se devuelven tal cual.
export const optimizar = (url, ancho) => {
  if (typeof url !== "string" || !url.includes("res.cloudinary.com")) return url;
  const t = ancho ? `f_auto,q_auto,w_${ancho}` : "f_auto,q_auto";
  return url.replace("/image/upload/", `/image/upload/${t}/`);
};
