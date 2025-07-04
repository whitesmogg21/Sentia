import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SavedPath } from "@/types/savedPath";
import { Upload, X } from "lucide-react";

interface SavedPathDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (savedPath: Partial<SavedPath>) => void;
  savedPath?: SavedPath | null;
  isEditing?: boolean;
}

export const SavedPathDialog = ({
  isOpen,
  onClose,
  onSave,
  savedPath,
  isEditing = false
}: SavedPathDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<string>("");

  useEffect(() => {
    if (savedPath && isEditing) {
      setName(savedPath.name);
      setDescription(savedPath.description);
      setThumbnail(savedPath.thumbnail || "");
    } else {
      setName("");
      setDescription("");
      setThumbnail("");
    }
  }, [savedPath, isEditing, isOpen]);

  const handleSave = () => {
    if (!name.trim()) return;

    const pathData: Partial<SavedPath> = {
      name: name.trim(),
      description: description.trim(),
      thumbnail: thumbnail.trim() || undefined,
    };

    if (isEditing && savedPath) {
      pathData.id = savedPath.id;
    }

    onSave(pathData);
    onClose();
  };

  const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnail(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Saved Path" : "Create New Saved Path"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter path name..."
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description..."
              rows={3}
            />
          </div>

          <div>
            <Label>Thumbnail</Label>
            <div className="mt-2">
              {thumbnail ? (
                <div className="relative inline-block">
                  <img
                    src={thumbnail}
                    alt="Thumbnail preview"
                    className="w-20 h-20 object-cover rounded border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={() => setThumbnail("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                    id="thumbnail-upload"
                  />
                  <label
                    htmlFor="thumbnail-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload thumbnail
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {isEditing ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};