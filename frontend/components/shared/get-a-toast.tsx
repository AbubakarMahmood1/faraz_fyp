import { Toaster } from "react-hot-toast";
export default function GetAToast(props) {
  return (
    <Toaster
      {...props}
      position="top-right"
      toastOptions={{
        className: "md:text-xl text-sm",
      }}
    />
  );
}
