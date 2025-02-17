
import React, { useState } from "react";
import { Question } from "@/types/quiz";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Save, Upload, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import MediaUploader from "@/components/MediaUploader";

interface QuestionFormProps {
  question: Question;
  onSave: (question: Question) => void;
  onDelete: () => void;
}

const QuestionForm = ({ question, onSave, onDelete }: QuestionFormProps) => {
  const [editedQuestion, setEditedQuestion] = useState<Question>(question);
  const [isDirty, setIsDirty] = useState(false);

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedQuestion(prev => ({ ...prev, question: e.target.value }));
    setIsDirty(true);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...editedQuestion.options];
    newOptions[index] = value;
    setEditedQuestion(prev => ({ ...prev, options: newOptions }));
    setIsDirty(true);
  };

  const handleCorrectAnswerChange = (index: number) => {
    setEditedQuestion(prev => ({ ...prev, correctAnswer: index }));
    setIsDirty(true);
  };

  const handleUploadComplete = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      setEditedQuestion(prev => ({
        ...prev,
        media: {
          type: 'image',
          url,
          showWith: 'question'
        }
      }));
      setIsDirty(true);
    }
  };

  const removeImage = () => {
    setEditedQuestion(prev => ({ ...prev, media: undefined }));
    setIsDirty(true);
  };

  const validateQuestion = () => {
    if (!editedQuestion.question.trim()) {
      toast({
        title: "Validation Error",
        description: "Question text cannot be empty",
        variant: "destructive",
      });
      return false;
    }

    if (editedQuestion.options.some(opt => !opt.trim())) {
      toast({
        title: "Validation Error",
        description: "All options must be filled out",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (validateQuestion()) {
      onSave(editedQuestion);
      setIsDirty(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg space-y-4 bg-card">
      <div className="flex gap-4">
        <Input
          value={editedQuestion.question}
          onChange={handleQuestionChange}
          placeholder="Enter question text"
          className="flex-1"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {editedQuestion.options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
            />
            <Button
              variant={editedQuestion.correctAnswer === index ? "default" : "outline"}
              onClick={() => handleCorrectAnswerChange(index)}
              className="w-24"
            >
              {editedQuestion.correctAnswer === index ? "Correct" : "Set"}
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {editedQuestion.media ? (
          <div className="relative">
            <img
              src={editedQuestion.media.url}
              alt="Question media"
              className="h-20 w-20 object-cover rounded"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-2 -right-2"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <MediaUploader onUploadComplete={handleUploadComplete} />
        )}
        {isDirty && (
          <Button onClick={handleSave} className="ml-auto">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuestionForm;
