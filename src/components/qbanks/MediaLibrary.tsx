import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Trash, Image, Video, Music } from "lucide-react";
import { QBank } from "@/types/quiz";
import { toast } from "@/components/ui/use-toast";

interface MediaLibraryProps {
  qbanks: QBank[];
}

interface MediaItem {
  type: 'image' | 'audio' | 'video';
  url: string;
}

const MediaLibrary = ({ qbanks }: MediaLibraryProps) => {
  const [selectedQBank, setSelectedQBank] = useState<QBank | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [newMedia, setNewMedia] = useState<MediaItem>({
    type: 'image',
    url: ''
  });

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleSubmit = () => {
    if (!selectedQBank) {
      toast({
        title: "Error",
        description: "Please select a question bank",
        variant: "destructive"
      });
      return;
    }

    if (!newMedia.url) {
      toast({
        title: "Error",
        description: "Please enter a media URL",
        variant: "destructive"
      });
      return;
    }

    // Store media in the question bank
    // This is a simplified version - you might want to implement a more robust media management system
    selectedQBank.media = selectedQBank.media || [];
    selectedQBank.media.push(newMedia);
    
    localStorage.setItem('qbanks', JSON.stringify(qbanks));
    
    setIsOpen(false);
    setNewMedia({
      type: 'image',
      url: ''
    });

    toast({
      title: "Success",
      description: "Media added successfully"
    });
  };

  const handleDeleteMedia = (index: number) => {
    if (selectedQBank && selectedQBank.media) {
      selectedQBank.media.splice(index, 1);
      localStorage.setItem('qbanks', JSON.stringify(qbanks));
      toast({
        title: "Success",
        description: "Media deleted successfully"
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setNewMedia(prev => ({
      ...prev,
      url
    }));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <div className="flex gap-4">
          <Select value={selectedQBank?.id} onValueChange={(value) => setSelectedQBank(qbanks.find(q => q.id === value) || null)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Question Bank" />
            </SelectTrigger>
            <SelectContent>
              {qbanks.map((qbank) => (
                <SelectItem key={qbank.id} value={qbank.id}>
                  {qbank.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedQBank}>
                <Plus className="w-4 h-4 mr-2" />
                Add Media
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Media</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Media Type</Label>
                  <Select value={newMedia.type} onValueChange={(value: 'image' | 'audio' | 'video') => 
                    setNewMedia(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select media type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Upload Media</Label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept={`${newMedia.type}/*`}
                      onChange={handleFileUpload}
                      className="flex-1"
                    />
                  </div>
                  {newMedia.url && newMedia.type === 'image' && (
                    <img src={newMedia.url} alt="Preview" className="max-h-40 object-contain" />
                  )}
                </div>

                <Button onClick={handleSubmit} className="w-full">
                  Add Media
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {selectedQBank && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedQBank.media?.map((media, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {getMediaIcon(media.type)}
                  <span className="capitalize">{media.type}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteMedia(index)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
              <div className="break-all">
                <a href={media.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {media.url}
                </a>
              </div>
              {media.type === 'image' && (
                <img src={media.url} alt="Preview" className="mt-2 max-w-full h-auto rounded" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaLibrary; 