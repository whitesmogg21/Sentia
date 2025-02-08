
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QBank } from "../types/quiz";

interface QBanksProps {
  qbanks: QBank[];
}

const QBanks = ({ qbanks }: QBanksProps) => {
  const [selectedQBank, setSelectedQBank] = useState<QBank | null>(null);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Question Banks</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Question Banks</h2>
          <div className="grid gap-4">
            {qbanks.map((qbank) => (
              <div
                key={qbank.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedQBank?.id === qbank.id
                    ? "border-primary"
                    : "border-gray-200 hover:border-primary/50"
                }`}
                onClick={() => setSelectedQBank(qbank)}
              >
                <h3 className="font-bold">{qbank.name}</h3>
                <p className="text-sm text-gray-600">{qbank.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {qbank.questions.length} questions
                </p>
              </div>
            ))}
          </div>
        </div>

        {selectedQBank && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Add New Question</h2>
            <div className="space-y-4">
              <Input placeholder="Question text" />
              <div className="grid gap-2">
                <Input placeholder="Option 1" />
                <Input placeholder="Option 2" />
                <Input placeholder="Option 3" />
                <Input placeholder="Option 4" />
              </div>
              <Input
                type="number"
                min={0}
                max={3}
                placeholder="Correct answer (0-3)"
              />
              <Button className="w-full">Add Question</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QBanks;
