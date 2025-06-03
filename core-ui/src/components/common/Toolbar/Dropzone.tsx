import { FileText, Trash2 } from "lucide-react";
import { FC, useCallback } from "react";
import { useDropzone } from "react-dropzone";

import { MAX_FILE_SIZE_MB } from "@/const";

interface DropzoneProps {
  acceptedFileTypes?: string[];
  pdfs: File[];
  onChange: (newFiles: File[]) => void;
}

const Dropzone: FC<DropzoneProps> = ({
  acceptedFileTypes = ["application/pdf"],
  pdfs,
  onChange
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const largeFiles = acceptedFiles.filter(file => file.size > MAX_FILE_SIZE_MB * 1024 * 1024);
      if (largeFiles.length > 0) {
        alert(`Some files are too large. Please upload files smaller than ${MAX_FILE_SIZE_MB}MB.`);
      }

      const uniqueFiles = acceptedFiles.filter(
        newFile =>
          !pdfs.some(
            existingFile => existingFile.name === newFile.name && existingFile.size === newFile.size
          ) && newFile.size <= MAX_FILE_SIZE_MB * 1024 * 1024
      );

      onChange([...pdfs, ...uniqueFiles]);
    },
    [onChange, pdfs]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: acceptedFileTypes.reduce(
      (acc, type) => {
        acc[type] = [];
        return acc;
      },
      {} as Record<string, string[]>
    )
  });

  return (
    <div className="flex flex-col">
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-6 flex flex-col items-center justify-center gap-3 text-gray-500 hover:border-gray-400 cursor-pointer transition-all w-full max-w-md"
      >
        <FileText strokeWidth={1.3} size={40} />
        <input {...getInputProps()} data-testid="file-input" />
        <p className="mb-4">{isDragActive ? "Drop files here..." : "Drag & drop file to upload"}</p>
        <button
          type="button"
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-all"
        >
          Select files
        </button>
      </div>
      <p className="text-gray-500 mt-2">Maximum size: {MAX_FILE_SIZE_MB}MB</p>
      <div className="mt-6 w-full max-w-md">
        {pdfs.length > 0 ? (
          <ul className="space-y-2">
            {pdfs.map((file, index) => (
              <div
                key={index}
                className="flex flex-row justify-between rounded-[8px] border-2 border-[#EFF0F1] bg-[#F9F9F9] p-4"
              >
                <div className="flex flex-row gap-3 items-center">
                  <FileText strokeWidth={1.3} size={40} />
                  <div className="flex flex-col gap-2">
                    <span className="text-black text-sm">{file.name}</span>
                    <span className="text-gray-700 text-sm">
                      {(file.size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                </div>
                <Trash2
                  className="cursor-pointer"
                  strokeWidth={1.3}
                  onClick={() => onChange(pdfs.filter((_, i) => i !== index))}
                />
              </div>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
};

export default Dropzone;
