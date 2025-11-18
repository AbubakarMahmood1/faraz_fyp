import React from "react";

type FormProps = {
  children: React.ReactNode;
  style?: string;
  onSubmit: any;
};

export default function From({ children, style, onSubmit }: FormProps) {
  return (
    <form className={`w-[400px] p-4 space-y-5 ${style}`} onSubmit={onSubmit}>
      {children}
    </form>
  );
}
