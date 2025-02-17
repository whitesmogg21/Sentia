
import { useState } from "react";
import { Grid, List, Eye, Pencil, Trash2, AlertCircle } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MediaUploader from "@/components/MediaUploader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  inUse?: boolean;
}

const MediaLibrary = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MediaItem | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleUploadComplete = (files: File[]) => {
    const newItems = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setMediaItems([...mediaItems, ...newItems]);
    toast({
      title: "Success",
      description: `${files.length} files uploaded successfully`,
    });
  };

  const handleDelete = (item: MediaItem) => {
    if (item.inUse) {
      toast({
        title: "Cannot Delete",
        description: "This image is currently in use by one or more questions.",
        variant: "destructive",
      });
      return;
    }
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setMediaItems(mediaItems.filter((item) => item.id !== itemToDelete.id));
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
      toast({
        title: "Success",
        description: "Media file deleted successfully",
      });
    }
  };

  const startRename = (item: MediaItem) => {
    setEditingId(item.id);
    setEditingName(item.name);
  };

  const handleRename = (id: string) => {
    if (!editingName.trim()) {
      toast({
        title: "Error",
        description: "File name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setMediaItems(
      mediaItems.map((item) =>
        item.id === id ? { ...item, name: editingName } : item
      )
    );
    setEditingId(null);
    toast({
      title: "Success",
      description: "File renamed successfully",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "bg-accent" : ""}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-accent" : ""}
          >
            <List className="h-4 w-4" />
          </Button>
          <MediaUploader onUploadComplete={handleUploadComplete} />
        </div>
      </div>

      {mediaItems.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg text-muted-foreground">
            No media uploaded. Use the 'Upload Media' button to add images.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaItems.map((item) => (
            <div
              key={item.id}
              className="relative group border rounded-lg overflow-hidden"
            >
              <img
                src={item.url}
                alt={item.name}
                className="w-full aspect-square object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => {
                    setSelectedImage(item);
                    setIsPreviewOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => startRename(item)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => handleDelete(item)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/75 p-2">
                <p className="text-white text-sm truncate">{item.name}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image Name</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mediaItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {editingId === item.id ? (
                    <div className="flex gap-2">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full"
                      />
                      <Button onClick={() => handleRename(item.id)}>Save</Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    item.name
                  )}
                </TableCell>
                <TableCell>
                  <img
                    src={item.url}
                    alt={item.name}
                    className="h-12 w-12 object-cover rounded"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        setSelectedImage(item);
                        setIsPreviewOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => startRename(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.name}</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <img
              src={selectedImage.url}
              alt={selectedImage.name}
              className="w-full h-auto max-h-[70vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemToDelete?.name}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MediaLibrary;
