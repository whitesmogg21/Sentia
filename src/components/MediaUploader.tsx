
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface MediaUploaderProps {
  onUploadComplete: (files: File[]) => void;
}

const MediaUploader = ({ onUploadComplete }: MediaUploaderProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const validFiles = files.filter(file => 
      file.type.startsWith('image/'));

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid files",
        description: "Only image files are allowed",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      onUploadComplete(validFiles);
      toast({
        title: "Success",
        description: `${validFiles.length} images uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload media files",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button asChild disabled={isLoading}>
      <label className="cursor-pointer">
        <Upload className="mr-2 h-4 w-4" />
        Upload Media Files
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
    </Button>
  );
};

export default MediaUploader;
