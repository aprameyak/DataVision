"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Footer from "@/components/footer";
import Spinner from "@/components/spinner";

export default function Home() {
  const [file, setFile] = useState<File>();
  const [isLoading, setIsLoading] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dropzoneRef = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (file) {
      handleUpload();
    }
  }, [file]);

  // Set up drag and drop event listeners
  useEffect(() => {
    const dropzone = dropzoneRef.current;
    if (!dropzone) return;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragging) setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Only set isDragging to false if we're leaving the dropzone
      // and not entering a child element
      if (e.currentTarget === e.target) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
      }
    };

    dropzone.addEventListener("dragenter", handleDragEnter);
    dropzone.addEventListener("dragover", handleDragOver);
    dropzone.addEventListener("dragleave", handleDragLeave);
    dropzone.addEventListener("drop", handleDrop);

    return () => {
      dropzone.removeEventListener("dragenter", handleDragEnter);
      dropzone.removeEventListener("dragover", handleDragOver);
      dropzone.removeEventListener("dragleave", handleDragLeave);
      dropzone.removeEventListener("drop", handleDrop);
    };
  }, [isDragging]);

  const validateAndSetFile = (selectedFile: File) => {
    // Check if file is a CSV
    if (
      selectedFile.type === "text/csv" ||
      selectedFile.name.endsWith(".csv")
    ) {
      setFile(selectedFile);
      toast.success("CSV file selected", {
        description: selectedFile.name,
      });
    } else {
      // Show toast for invalid file type
      toast.error("Invalid file type", {
        description: "Please upload a CSV file",
      });
    }
  };

  const uploadFile = async () => {
    const url = "/api/upload";
    const formData = new FormData();
    formData.append("file", file as Blob);

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();

      return result.id;
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);

      // Reset the file input
      e.target.value = "";
    }
  };

  const handleUpload = async () => {
    if (file && !isLoading) {
      setIsLoading(true);

      try {
        const id = await uploadFile();
        const params = new URLSearchParams(searchParams);
        params.set("id", id);

        // Trigger fade-out animation
        setIsFadingOut(true);

        // Wait for animation to complete before navigating
        setTimeout(() => {
          router.push("/analysis?" + params.toString());
        }, 700); // Match this to your duration value

      } catch (error) {
        setIsFadingOut(false);
        toast.error("Error processing file", {
          description: "An unexpected error occurred",
        });
        console.error("Error:", error);
      } finally {
        // Note: We don't reset isLoading here since we're navigating away
      }
    } else if (!file) {
      console.log("No file selected");
      toast.error("No file selected", {
        description: "Please select a CSV file to upload",
      });
    }
  };

  return (
    <div className={`
      bg-white flex justify-center items-center w-full h-screen 
      font-[family-name:var(--font-geist-sans)] 
      transition-all duration-700 ease-out 
      ${pageLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-6'}
      ${isFadingOut ? 'opacity-0 transform -translate-y-6' : ''}
    `}>
      <div className="flex flex-col gap-6 row-start-2 items-center justify-center w-3/4">
        <div className="flex flex-col gap-2 items-center justify-center text-center text-primary/80">
          <p className="text-5xl m-auto">DataVision</p>
          <i className="text-center w-full">
            Your intelligent assistant for exploring data, testing hypotheses,
            and generating visuals.
          </i>
        </div>

        <div className="flex flex-col w-full max-w-md gap-4">
          {isLoading ? (
            <div className="flex flex-col gap-2 items-center justify-center text-center text-sm text-primary/80">
              <Spinner />
              Processing your CSV file...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Input
                type="file"
                id="fileUpload"
                className="hidden"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              <label
                ref={dropzoneRef}
                htmlFor="fileUpload"
                className={`
                  text-lg text-center flex-col gap-2 m-auto px-20 py-10 
                  border-2 border-dashed cursor-pointer flex items-center 
                  rounded-md text-primary transition-all duration-200
                  ${isDragging
                    ? 'border-primary bg-primary/10 scale-105'
                    : 'border-primary/50 hover:bg-primary/5'
                  }
                  ${isLoading ? "opacity-50 pointer-events-none" : ""}
                `}
              >
                <Upload className={`h-8 aspect-square transition-transform duration-200 ${isDragging ? 'scale-110' : ''}`} />
                {isDragging ? 'Drop CSV Here' : 'Upload CSV'}
                <p className="text-sm text-gray-500 mt-1">or drag and drop file here</p>
              </label>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
