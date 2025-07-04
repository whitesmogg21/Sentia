import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Grid, List } from "lucide-react";
import { SavedPath } from "@/types/savedPath";
import { SavedPathTile } from "./SavedPathTile";
import { SavedPathDialog } from "./SavedPathDialog";
import { SavedPathDetail } from "./SavedPathDetail";
import { motion } from "framer-motion";
import JSZip from "jszip";
import { toast } from "@/components/ui/use-toast";
import { QBank } from "@/types/quiz";

interface SavedPathManagerProps {
  qbanks: QBank[];
  selectedQBank: QBank | null;
}

export const SavedPathManager = ({ qbanks, selectedQBank }: SavedPathManagerProps) => {
  const [savedPaths, setSavedPaths] = useState<SavedPath[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPath, setEditingPath] = useState<SavedPath | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPath, setSelectedPath] = useState<SavedPath | null>(null);

  // Load saved paths from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('savedPaths');
    if (stored) {
      try {
        setSavedPaths(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading saved paths:', error);
      }
    }
  }, []);

  // Save to localStorage whenever savedPaths change
  useEffect(() => {
    localStorage.setItem('savedPaths', JSON.stringify(savedPaths));
  }, [savedPaths]);

  const handleCreate = () => {
    setEditingPath(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (savedPath: SavedPath) => {
    setEditingPath(savedPath);
    setIsDialogOpen(true);
  };

  const handleSave = (pathData: Partial<SavedPath>) => {
    if (editingPath) {
      // Update existing path
      setSavedPaths(prev => prev.map(path => 
        path.id === editingPath.id 
          ? { ...path, ...pathData, updatedAt: new Date().toISOString() }
          : path
      ));
      toast({
        title: "Saved Path Updated",
        description: "Your saved path has been updated successfully."
      });
    } else {
      // Create new path
      const newPath: SavedPath = {
        id: Date.now().toString(),
        name: pathData.name!,
        description: pathData.description || "",
        thumbnail: pathData.thumbnail,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        questionIds: [],
        subfolders: [],
        tags: [],
        qbankId: selectedQBank?.id || ""
      };
      setSavedPaths(prev => [...prev, newPath]);
      toast({
        title: "Saved Path Created",
        description: "New saved path has been created successfully."
      });
    }
  };

  const handleDelete = (savedPath: SavedPath) => {
    setSavedPaths(prev => prev.filter(path => path.id !== savedPath.id));
    toast({
      title: "Saved Path Deleted",
      description: "The saved path has been deleted."
    });
  };

  const handleOpen = (savedPath: SavedPath) => {
    setSelectedPath(savedPath);
  };

  const handleBack = () => {
    setSelectedPath(null);
  };

  const handleStartQuizFromPath = (questionIds: number[]) => {
    console.log("Starting quiz from saved path with questions:", questionIds);
    // This would integrate with the main quiz system
  };

  const handleExport = async (savedPath: SavedPath) => {
    try {
      const zip = new JSZip();
      
      // Add saved path metadata
      zip.file("metadata.json", JSON.stringify({
        savedPath,
        exportedAt: new Date().toISOString()
      }, null, 2));

      // Add questions
      const questions = qbanks
        .flatMap(qbank => qbank.questions)
        .filter(q => savedPath.questionIds.includes(q.id));
      
      zip.file("questions.json", JSON.stringify(questions, null, 2));

      // Add hierarchy
      zip.file("hierarchy.json", JSON.stringify({
        mainPath: savedPath,
        subfolders: savedPath.subfolders
      }, null, 2));

      // Generate and download zip
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${savedPath.name.replace(/[^a-zA-Z0-9]/g, '_')}_export.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Saved path has been exported successfully."
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the saved path.",
        variant: "destructive"
      });
    }
  };

  const filteredPaths = selectedQBank 
    ? savedPaths.filter(path => path.qbankId === selectedQBank.id || !path.qbankId)
    : savedPaths;

  // Show detail view if a path is selected
  if (selectedPath) {
    return (
      <SavedPathDetail
        savedPath={selectedPath}
        qbanks={qbanks}
        onBack={handleBack}
        onStartQuiz={handleStartQuizFromPath}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Saved Question Paths</h3>
          <p className="text-sm text-muted-foreground">
            Organize and save custom question sets
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-7 w-7 p-0"
            >
              <Grid className="h-3 w-3" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-7 w-7 p-0"
            >
              <List className="h-3 w-3" />
            </Button>
          </div>
          
          <Button onClick={handleCreate} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Path
          </Button>
        </div>
      </div>

      {/* Saved Paths Grid */}
      {filteredPaths.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-muted-foreground/25 rounded-lg">
          <div className="text-muted-foreground mb-4">
            No saved paths yet. Create your first one!
          </div>
          <Button onClick={handleCreate} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Create Saved Path
          </Button>
        </div>
      ) : (
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {filteredPaths.map((savedPath, index) => (
            <motion.div
              key={savedPath.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <SavedPathTile
                savedPath={savedPath}
                onOpen={handleOpen}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onExport={handleExport}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <SavedPathDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        savedPath={editingPath}
        isEditing={!!editingPath}
      />
    </div>
  );
};