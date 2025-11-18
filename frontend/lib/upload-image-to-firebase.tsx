import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 } from "uuid";
import { fireBaseDB } from "@/lib/firebaseConfig";

export const uploadFileToFirebase = async (file: any) => {
  try {
    const imgRef = ref(fireBaseDB, `fyp profile images/${v4()}`);
    const uploadTask = uploadBytesResumable(imgRef, file);

    // Wrap upload in a Promise to allow async/await
    const fileUrl = await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% complete");
        },
        (error) => {
          console.error("Error uploading image:", error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          //   console.log("File available at", downloadURL);
          resolve(downloadURL); // Resolve with the download URL
        }
      );
    });

    return fileUrl; // Return the URL once upload is complete
  } catch (err) {
    console.log("Error occurred:", err);
    throw err;
  }
};
