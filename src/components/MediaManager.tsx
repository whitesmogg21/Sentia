
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Edit2, Upload } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { QBank } from "@/types/quiz";

interface MediaManagerProps {
  qbank: QBank;
  onMediaUpdate: () => void;
}

const MediaManager = ({ qbank, onMediaUpdate }: MediaManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<{ name: string; url: string }[]>(() => {
    const items = new Set<{ name: string; url: string }>();
    qbank.questions.forEach(q => {
      if (q.media?.url) {
        const name = q.media.url.split('/').pop() || '';
        items.add({ name, url: q.media.url });
      }
    });
    return Array.from(items);
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid files",
        description: "Only image files are allowed",
        variant: "destructive"
      });
      return;
    }

    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setMediaItems(prev => [...prev, { name: file.name, url }]);
    });

    toast({
      title: "Success",
      description: `${validFiles.length} files uploaded successfully`,
    });
  };

  const handleDelete = (mediaItem: { name: string; url: string }) => {
    setMediaItems(prev => prev.filter(item => item.url !== mediaItem.url));
    
    // Update questions that use this media
    qbank.questions.forEach(q => {
      if (q.media?.url === mediaItem.url) {
        q.media = undefined;
      }
    });

    onMediaUpdate();
    toast({
      title: "Success",
      description: "Media file deleted successfully",
    });
  };

  const handleRename = (oldItem: { name: string; url: string }, newName: string) => {
    if (!newName.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    setMediaItems(prev => 
      prev.map(item => 
        item.url === oldItem.url ? { ...item, name: newName } : item
      )
    );

    toast({
      title: "Success",
      description: "Media file renamed successfully",
    });
  };

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        Manage Media
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Media Manager</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Button asChild>
              <label className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Upload Media Files
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </Button>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {mediaItems.map((item) => (
                <div key={item.url} className="relative group">
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    <div className="absolute bottom-2 right-2 flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newName = prompt("Enter new name:", item.name);
                          if (newName) handleRename(item, newName);
                        }}
                      >
                        <Edit2 className="h-4 w-4 text-white" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MediaManager;
