"use client";
import { useRef, useState } from "react";
import JoditEditor from "jodit-react";
export default function TextEditor({
  content,
  setContent,
}: {
  content: any;
  setContent: any;
}) {
  const editor = useRef(null);

  const config = {
    readonly: false,
    placeholder: "Write your content here",
    removeButtons: [
      "hr",
      "source",
      "speechRecognize",
      "file",
      "video",
      "dots",
      "fullsize",
    ],
  };
  return (
    <JoditEditor
      ref={editor}
      value={content}
      config={config}
      tabIndex={1} // tabIndex of textarea
      onBlur={(newContent) => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
      onChange={(newContent) => {}}
    />
  );
}
