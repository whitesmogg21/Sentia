import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Download, 
  FolderOpen,
  Image as ImageIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SavedPath } from "@/types/savedPath";
import { motion } from "framer-motion";

interface SavedPathTileProps {
  savedPath: SavedPath;
  onOpen: (savedPath: SavedPath) => void;
  onEdit: (savedPath: SavedPath) => void;
  onDelete: (savedPath: SavedPath) => void;
  onExport: (savedPath: SavedPath) => void;
}

export const SavedPathTile = ({
  savedPath,
  onOpen,
  onEdit,
  onDelete,
  onExport
}: SavedPathTileProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className="overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg border-border bg-card/50 backdrop-blur-sm">
        <div 
          onClick={() => onOpen(savedPath)}
          className="relative"
        >
          {/* Thumbnail */}
          <div className="h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative overflow-hidden">
            {savedPath.thumbnail && !imageError ? (
              <img
                src={savedPath.thumbnail}
                alt={savedPath.name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <FolderOpen className="h-8 w-8 mb-1" />
                <span className="text-xs">No Preview</span>
              </div>
            )}
            
            {/* Question count badge */}
            <Badge 
              variant="secondary" 
              className="absolute top-2 right-2 text-xs"
            >
              {savedPath.questionIds.length} questions
            </Badge>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-sm truncate flex-1 mr-2">
                {savedPath.name}
              </h3>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(savedPath)}>
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport(savedPath)}>
                    <Download className="h-3 w-3 mr-2" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(savedPath)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {savedPath.description || "No description"}
            </p>

            {/* Tags */}
            {savedPath.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {savedPath.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px] px-1 py-0">
                    {tag}
                  </Badge>
                ))}
                {savedPath.tags.length > 2 && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0">
                    +{savedPath.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}

            {/* Subfolders indicator */}
            {savedPath.subfolders.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {savedPath.subfolders.length} subfolder{savedPath.subfolders.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};