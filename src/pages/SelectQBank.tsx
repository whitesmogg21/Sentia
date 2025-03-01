
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { QBank } from "@/types/quiz";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQBankStore } from "@/store/qbank/qbankStore";

interface SelectQBankProps {
  onSelect?: (qbank: QBank) => void;
}

const SelectQBank = ({ onSelect }: SelectQBankProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { qbanks, selectQBank } = useQBankStore();

  const handleSelect = (qbank: QBank) => {
    selectQBank(qbank);
    if (onSelect) onSelect(qbank);
    navigate('/');
  };

  const filteredQBanks = qbanks.filter(qbank => 
    qbank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    qbank.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    qbank.questions.some(q => q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const getQBankStats = (qbank: QBank) => {
    const seenQuestions = qbank.questions.filter(q => q.attempts && q.attempts.length > 0).length;
    const totalQuestions = qbank.questions.length;
    const percentComplete = totalQuestions > 0 
      ? Math.round((seenQuestions / totalQuestions) * 100) 
      : 0;
    
    return { seenQuestions, totalQuestions, percentComplete };
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Select Question Bank</h1>
      
      <div className="mb-6">
        <Input
          placeholder="Search by name, description or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQBanks.map(qbank => {
              const stats = getQBankStats(qbank);
              
              return (
                <motion.div 
                  key={qbank.id}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card 
                    className="p-6 cursor-pointer hover:border-primary dark:hover:border-primary h-full"
                    onClick={() => handleSelect(qbank)}
                  >
                    <h2 className="text-xl font-bold mb-2">{qbank.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">{qbank.description}</p>
                    
                    <div className="flex justify-between mt-4">
                      <div className="text-sm">
                        {qbank.questions.length} questions
                      </div>
                      <div className="text-sm">
                        {stats.percentComplete}% complete
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="list">
          <div className="space-y-2">
            {filteredQBanks.map(qbank => {
              const stats = getQBankStats(qbank);
              
              return (
                <Card 
                  key={qbank.id}
                  className="p-4 cursor-pointer hover:border-primary dark:hover:border-primary"
                  onClick={() => handleSelect(qbank)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="font-bold">{qbank.name}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{qbank.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        {stats.seenQuestions} / {stats.totalQuestions} questions
                      </div>
                      <div className="text-sm">
                        {stats.percentComplete}% complete
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SelectQBank;
