
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash, Edit2, Search } from "lucide-react";
import { QBank } from "@/types/quiz";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MediaLibraryProps {
  qbanks: QBank[];
}

interface MediaItem {
  id: string;
  name: string;
  url: string;
  tags: string[];
}

const MediaLibrary = ({ qbanks }: MediaLibraryProps) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [newName, setNewName] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    // Extract images mentioned in questions and their tags
    const extractedMedia = new Map<string, Set<string>>();
    
    qbanks.forEach(qbank => {
      qbank.questions.forEach(question => {
        const matches = question.question.match(/\/([^\/]+\.(?:png|jpg|jpeg|gif))/g);
        if (matches) {
          matches.forEach(match => {
            const imageName = match.slice(1); // Remove leading /
            if (!extractedMedia.has(imageName)) {
              extractedMedia.set(imageName, new Set());
            }
            question.tags.forEach(tag => {
              extractedMedia.get(imageName)?.add(tag);
            });
          });
        }
      });
    });

    // Update media items with extracted tags
    setMediaItems(prev => {
      return prev.map(item => {
        const tags = extractedMedia.get(item.name);
        return {
          ...item,
          tags: tags ? Array.from(tags) : item.tags
        };
      });
    });
  }, [qbanks]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const newMediaItems = files.map(file => ({
      id: `${Date.now()}-${file.name}`,
      name: file.name,
      url: URL.createObjectURL(file),
      tags: []
    }));

    setMediaItems(prev => [...prev, ...newMediaItems]);
    toast({
      title: "Success",
      description: `${files.length} files uploaded successfully`
    });
  };

  const handleDelete = (id: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Success",
      description: "Media deleted successfully"
    });
  };

  const handleEdit = (item: MediaItem) => {
    setEditingItem(item);
    setNewName(item.name);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;

    setMediaItems(prev =>
      prev.map(item =>
        item.id === editingItem.id
          ? { ...item, name: newName }
          : item
      )
    );

    setIsEditDialogOpen(false);
    setEditingItem(null);
    setNewName("");

    toast({
      title: "Success",
      description: "Media name updated successfully"
    });
  };

  const filteredMedia = mediaItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button asChild>
            <label>
              <Plus className="w-4 h-4 mr-2" />
              Upload Media
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Preview</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMedia.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                </TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Media Name</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter new name"
              />
            </div>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaLibrary;
