import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  History,
  FileAudio,
  Image,
  FolderOpen,
  Folder,
  Plus,
  ChevronRight,
  Settings,
  User,
  Clock,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const mainNavItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Q-Banks", url: "/qbanks", icon: BookOpen },
  { title: "History", url: "/history", icon: History },
  { title: "Audio Library", url: "/qbanks/audio", icon: FileAudio },
  { title: "Media Library", url: "/qbanks/media", icon: Image },
];

interface SavedFolder {
  id: string;
  name: string;
  filters: any;
  children?: SavedFolder[];
}

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";
  
  const [savedFolders, setSavedFolders] = useState<SavedFolder[]>([
    {
      id: "1",
      name: "Medical Specialties",
      filters: {},
      children: [
        { id: "1-1", name: "Cardiology", filters: { tags: ["cardiology"] } },
        { id: "1-2", name: "Neurology", filters: { tags: ["neurology"] } },
        { id: "1-3", name: "Radiology", filters: { tags: ["radiology"] } },
      ]
    },
    {
      id: "2", 
      name: "Difficulty Levels",
      filters: {},
      children: [
        { id: "2-1", name: "Easy Questions", filters: { difficulty: "easy" } },
        { id: "2-2", name: "Medium Questions", filters: { difficulty: "medium" } },
        { id: "2-3", name: "Hard Questions", filters: { difficulty: "hard" } },
      ]
    },
    {
      id: "3",
      name: "Review Status", 
      filters: {},
      children: [
        { id: "3-1", name: "Incorrect Answers", filters: { status: "incorrect" } },
        { id: "3-2", name: "Flagged Questions", filters: { status: "flagged" } },
        { id: "3-3", name: "Unused Questions", filters: { status: "unused" } },
      ]
    }
  ]);
  
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["1", "2", "3"]));
  const [newFolderName, setNewFolderName] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" : "hover:bg-muted/50 transition-colors";

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFolderClick = (folder: SavedFolder) => {
    // Apply filters from folder - this would integrate with your filtering system
    console.log("Applying filters:", folder.filters);
    // You could emit an event or use a context to apply these filters
  };

  const addNewFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: SavedFolder = {
        id: Date.now().toString(),
        name: newFolderName,
        filters: {},
        children: []
      };
      setSavedFolders(prev => [...prev, newFolder]);
      setNewFolderName("");
      setShowAddDialog(false);
    }
  };

  const renderFolder = (folder: SavedFolder, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const hasChildren = folder.children && folder.children.length > 0;

    return (
      <div key={folder.id} className="space-y-1">
        <SidebarMenuItem>
          <SidebarMenuButton
            className={`group w-full justify-between hover:bg-accent/50 rounded-lg transition-colors ${
              level > 0 ? `ml-${level * 3} text-sm` : ""
            }`}
            onClick={() => hasChildren ? toggleFolder(folder.id) : handleFolderClick(folder)}
          >
            <div className="flex items-center gap-2">
              {hasChildren ? (
                isExpanded ? (
                  <FolderOpen className="h-4 w-4 text-primary" />
                ) : (
                  <Folder className="h-4 w-4 text-muted-foreground" />
                )
              ) : (
                <div className="h-4 w-4 rounded bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20" />
              )}
              {!isCollapsed && <span className="truncate">{folder.name}</span>}
            </div>
            {hasChildren && !isCollapsed && (
              <ChevronRight 
                className={`h-3 w-3 transition-transform text-muted-foreground ${
                  isExpanded ? 'rotate-90' : ''
                }`} 
              />
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
        
        {hasChildren && isExpanded && folder.children && !isCollapsed && (
          <div className="space-y-1">
            {folder.children.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Sidebar 
      className={`${isCollapsed ? "w-16" : "w-64"} border-r border-border/50 bg-card/30 backdrop-blur-sm`}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-lg">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-sm">Sentia</h2>
              <p className="text-xs text-muted-foreground">Quiz Platform</p>
            </div>
          )}
        </div>
      </div>

      <SidebarContent className="px-3 py-4">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Saved Paths */}
        <SidebarGroup className="mt-6">
          <div className="flex items-center justify-between px-2 mb-3">
            <SidebarGroupLabel className={isCollapsed ? "sr-only" : "text-xs font-medium"}>
              Saved Paths
            </SidebarGroupLabel>
            {!isCollapsed && (
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-primary/10 rounded-full"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Folder</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="folder-name">Folder Name</Label>
                      <Input
                        id="folder-name"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Enter folder name..."
                        onKeyDown={(e) => e.key === 'Enter' && addNewFolder()}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={addNewFolder}>Add Folder</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {savedFolders.map(folder => renderFolder(folder))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-3 border-t border-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:bg-accent/50 rounded-lg">
              <User className="h-4 w-4" />
              {!isCollapsed && <span>Profile</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:bg-accent/50 rounded-lg">
              <Settings className="h-4 w-4" />
              {!isCollapsed && <span>Settings</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {!isCollapsed && (
          <div className="mt-3 pt-2 border-t border-border/50">
            <SidebarTrigger className="w-full justify-start hover:bg-accent/50 rounded-lg" />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
