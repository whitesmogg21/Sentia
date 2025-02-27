import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image, Upload, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

interface MediaSelectorProps {
  onSelect: (media: { url: string; type: 'image' | 'audio' | 'video' }) => void;
}

const MediaSelector = ({ onSelect }: MediaSelectorProps) => {
  const [localMedia, setLocalMedia] = useState<{ url: string; type: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      const type = file.type.startsWith('image/') ? 'image' 
                : file.type.startsWith('audio/') ? 'audio'
                : file.type.startsWith('video/') ? 'video'
                : null;

      if (!type) {
        toast({
          title: "Invalid file type",
          description: "Only image, audio, and video files are supported",
          variant: "destructive"
        });
        return;
      }

      const url = URL.createObjectURL(file);
      setLocalMedia(prev => [...prev, { url, type }]);
    });

    toast({
      title: "Success",
      description: "Media uploaded successfully"
    });
  };

  const handleSelect = (media: { url: string; type: string }) => {
    onSelect({ url: media.url, type: media.type as 'image' | 'audio' | 'video' });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Image className="w-4 h-4 mr-2" />
          Select Media
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Button variant="outline" onClick={() => document.getElementById('mediaInput')?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Media
            </Button>
            <input
              id="mediaInput"
              type="file"
              accept="image/*,audio/*,video/*"
              className="hidden"
              onChange={handleFileUpload}
              multiple
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {localMedia.map((media, index) => (
              <div
                key={index}
                className="relative border rounded-lg p-2 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSelect(media)}
              >
                {media.type === 'image' ? (
                  <img src={media.url} alt="" className="w-full h-32 object-cover rounded" />
                ) : (
                  <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                    {media.type}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaSelector; 