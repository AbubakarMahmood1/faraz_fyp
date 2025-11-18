import { useRef } from "react";
import { useDispatch } from "react-redux";
import { profileActions } from "@/store/store";
import { uploadFileToFirebase } from "@/lib/upload-image-to-firebase";
export default function ImagePicker({
  multiple,
  children,
  getImageUrl,
}: {
  multiple?: boolean;
  children?: any;

  getImageUrl: (url: any) => void;
}) {
  const dispatcher = useDispatch();
  const handleImage = async (e: any) => {
    try {
      dispatcher(profileActions.toggleImageUpload());
      const fileUrl = await uploadFileToFirebase(e.target.files[0]);
      dispatcher(profileActions.toggleImageUpload());
      getImageUrl(fileUrl);
    } catch (error) {
      console.error("Failed to upload and retrieve image URL:", error);
    }
  };
  const fileInputRef: any = useRef();
  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/png, image/jpeg"
        onChange={handleImage}
        multiple={multiple}
      />
      <div className="space-y-4">
        {children}
        <button
          type="button"
          className="text-blue-900 text-sm"
          onClick={() => fileInputRef.current?.click()}
        >
          upload image
        </button>
      </div>
    </>
  );
}
