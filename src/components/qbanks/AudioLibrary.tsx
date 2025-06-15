
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, Trash2, Play, Pause, RotateCcw, Edit2, Check, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface AudioItem {
  name: string;
  data: string;
}

const AudioLibrary = () => {
  const [audioFiles, setAudioFiles] = useState<AudioItem[]>([]);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [pausedAudio, setPausedAudio] = useState<string | null>(null);
  const [completedAudio, setCompletedAudio] = useState<Set<string>>(new Set());
  const [editingAudio, setEditingAudio] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load audio files from localStorage on component mount
    try {
      const savedAudio = localStorage.getItem('audioLibrary');
      if (savedAudio) {
        const audioItems = JSON.parse(savedAudio) as AudioItem[];
        setAudioFiles(audioItems);
      }
    } catch (err) {
      console.error("Error loading audio library:", err);
    }
  }, []);

  const saveToStorage = (audioItems: AudioItem[]) => {
    try {
      localStorage.setItem('audioLibrary', JSON.stringify(audioItems));
    } catch (err) {
      console.error("Error saving audio library:", err);
      toast({
        title: "Error",
        description: "Failed to save audio files",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newAudioFiles: AudioItem[] = [];
    const audioFilesList = Array.from(files).filter(f => f.type.startsWith('audio/'));

    if (audioFilesList.length === 0) {
      toast({
        title: "Invalid File",
        description: "Please select audio files",
        variant: "destructive",
      });
      return;
    }

    let processedCount = 0;

    audioFilesList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const audioItem: AudioItem = {
          name: file.name,
          data: result,
        };

        newAudioFiles.push(audioItem);
        processedCount++;

        if (processedCount === audioFilesList.length) {
          const updatedFiles = [...audioFiles, ...newAudioFiles];
          setAudioFiles(updatedFiles);
          saveToStorage(updatedFiles);
          toast({
            title: "Success",
            description: `${newAudioFiles.length} audio file(s) uploaded`,
          });
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePlay = (audioName: string, audioData: string) => {
    // Pause all other audio
    Object.values(audioRefs.current).forEach(audio => {
      if (!audio.paused) {
        audio.pause();
      }
    });

    if (!audioRefs.current[audioName]) {
      audioRefs.current[audioName] = new Audio(audioData);
      
      audioRefs.current[audioName].addEventListener('ended', () => {
        setPlayingAudio(null);
        setPausedAudio(null);
        setCompletedAudio(prev => new Set([...prev, audioName]));
      });

      audioRefs.current[audioName].addEventListener('error', (e) => {
        console.error("Audio playback error:", e);
        toast({
          title: "Playback Error",
          description: "Unable to play audio file",
          variant: "destructive",
        });
        setPlayingAudio(null);
        setPausedAudio(null);
      });
    }

    const audio = audioRefs.current[audioName];

    if (playingAudio === audioName) {
      // Pause current audio
      audio.pause();
      setPlayingAudio(null);
      setPausedAudio(audioName);
    } else if (pausedAudio === audioName) {
      // Resume paused audio
      audio.play().catch(err => {
        console.error("Error resuming audio:", err);
        toast({
          title: "Playback Error",
          description: "Unable to resume audio playback",
          variant: "destructive",
        });
      });
      setPlayingAudio(audioName);
      setPausedAudio(null);
    } else {
      // Start new audio or replay
      audio.currentTime = 0;
      audio.play().catch(err => {
        console.error("Error playing audio:", err);
        toast({
          title: "Playback Error",
          description: "Unable to play audio file",
          variant: "destructive",
        });
      });
      setPlayingAudio(audioName);
      setPausedAudio(null);
      setCompletedAudio(prev => {
        const newSet = new Set(prev);
        newSet.delete(audioName);
        return newSet;
      });
    }
  };

  const getAudioIcon = (audioName: string) => {
    if (playingAudio === audioName) {
      return <Pause className="h-4 w-4" />;
    } else if (completedAudio.has(audioName)) {
      return <RotateCcw className="h-4 w-4" />;
    } else {
      return <Play className="h-4 w-4" />;
    }
  };

  const handleStartEdit = (audioName: string) => {
    setEditingAudio(audioName);
    setEditingName(audioName);
  };

  const handleSaveEdit = (oldName: string) => {
    if (!editingName.trim()) {
      toast({
        title: "Error",
        description: "Audio name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (editingName !== oldName && audioFiles.some(file => file.name === editingName)) {
      toast({
        title: "Error",
        description: "An audio file with this name already exists",
        variant: "destructive",
      });
      return;
    }

    const updatedFiles = audioFiles.map(file => 
      file.name === oldName ? { ...file, name: editingName } : file
    );
    
    setAudioFiles(updatedFiles);
    saveToStorage(updatedFiles);

    // Update audio refs if name changed
    if (editingName !== oldName && audioRefs.current[oldName]) {
      audioRefs.current[editingName] = audioRefs.current[oldName];
      delete audioRefs.current[oldName];
    }

    // Update state references
    if (playingAudio === oldName) setPlayingAudio(editingName);
    if (pausedAudio === oldName) setPausedAudio(editingName);
    if (completedAudio.has(oldName)) {
      setCompletedAudio(prev => {
        const newSet = new Set(prev);
        newSet.delete(oldName);
        newSet.add(editingName);
        return newSet;
      });
    }

    setEditingAudio(null);
    setEditingName("");

    toast({
      title: "Success",
      description: "Audio name updated",
    });
  };

  const handleCancelEdit = () => {
    setEditingAudio(null);
    setEditingName("");
  };

  const handleDelete = (audioName: string) => {
    const updatedFiles = audioFiles.filter(file => file.name !== audioName);
    setAudioFiles(updatedFiles);
    saveToStorage(updatedFiles);

    // Clean up audio reference
    if (audioRefs.current[audioName]) {
      audioRefs.current[audioName].pause();
      delete audioRefs.current[audioName];
    }

    // Clean up state
    if (playingAudio === audioName) setPlayingAudio(null);
    if (pausedAudio === audioName) setPausedAudio(null);
    setCompletedAudio(prev => {
      const newSet = new Set(prev);
      newSet.delete(audioName);
      return newSet;
    });

    toast({
      title: "Success",
      description: "Audio file deleted",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Audio Library</h1>
        <Button asChild>
          <label>
            <Upload className="mr-2 h-4 w-4" />
            Upload Audio
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </Button>
      </div>

      <div className="grid gap-4">
        {audioFiles.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No audio files uploaded yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Upload MP3 files to use them in your questions with /audio.mp3
            </p>
          </Card>
        ) : (
          audioFiles.map((audioFile) => (
            <Card key={audioFile.name} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePlay(audioFile.name, audioFile.data)}
                    className="text-primary hover:text-primary/80"
                  >
                    {getAudioIcon(audioFile.name)}
                  </Button>
                  <div className="flex-1">
                    {editingAudio === audioFile.name ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEdit(audioFile.name);
                            } else if (e.key === 'Escape') {
                              handleCancelEdit();
                            }
                          }}
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSaveEdit(audioFile.name)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCancelEdit}
                          className="text-gray-500 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-medium">{audioFile.name}</h3>
                        <p className="text-sm text-gray-500">
                          Reference: /{audioFile.name}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {editingAudio !== audioFile.name && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleStartEdit(audioFile.name)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(audioFile.name)}
                      className="text-destructive hover:text-destructive/90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AudioLibrary;
