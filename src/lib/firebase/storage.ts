import { storage } from "@/lib/firebase/clientApp";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export async function uploadBasePdf(file: File, name: string) {
  const storageRef = ref(storage, `basePdfs/${name}`);
  const snapshot = await uploadBytesResumable(storageRef, file);
  console.log("Uploaded a file!", snapshot);
  return snapshot;
}

export async function getBasePdf(name: string) {
  const storageRef = ref(storage, `basePdfs/${name}`);
  const url = await getDownloadURL(storageRef);
  if(!url) throw new Error("File not found");
  console.log("Download URL:", url);
  const response = await fetch(url);
  const data = await response.blob();
  console.log("Downloaded file:", data);
  return data;
}