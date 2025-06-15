
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, Trash2, Play, Pause, RotateCcw } from "lucide-react";
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
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useState(() => {
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
  });

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

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('audio/')) {
        toast({
          title: "Invalid File",
          description: `${file.name} is not an audio file`,
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const audioItem: AudioItem = {
          name: file.name,
          data: result,
        };

        newAudioFiles.push(audioItem);

        if (newAudioFiles.length === Array.from(files).filter(f => f.type.startsWith('audio/')).length) {
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
    }

    const audio = audioRefs.current[audioName];

    if (playingAudio === audioName) {
      // Pause current audio
      audio.pause();
      setPlayingAudio(null);
      setPausedAudio(audioName);
    } else if (pausedAudio === audioName) {
      // Resume paused audio
      audio.play();
      setPlayingAudio(audioName);
      setPausedAudio(null);
    } else {
      // Start new audio or replay
      audio.currentTime = 0;
      audio.play();
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
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePlay(audioFile.name, audioFile.data)}
                    className="text-primary hover:text-primary/80"
                  >
                    {getAudioIcon(audioFile.name)}
                  </Button>
                  <div>
                    <h3 className="font-medium">{audioFile.name}</h3>
                    <p className="text-sm text-gray-500">
                      Reference: /{audioFile.name}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(audioFile.name)}
                  className="text-destructive hover:text-destructive/90"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AudioLibrary;
