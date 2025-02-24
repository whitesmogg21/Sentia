
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { PlusCircle, Search, TestTube2, Type } from "lucide-react";
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LabValue {
  id: string;
  name: string;
  value: string;
  range: string;
  unit: string;
  category: string;
}

const categories = ['Serum', 'Cerebrospinal', 'Blood', 'Urine and BMI'];

const LabValuesTable = () => {
  const [labValues, setLabValues] = useState<LabValue[]>(() => {
    const saved = localStorage.getItem('lab-values');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState<string | null>(null);
  const [newLabValue, setNewLabValue] = useState({ 
    name: '', 
    value: '', 
    range: '',
    unit: '',
    category: 'Serum'
  });
  const [selectedCategory, setSelectedCategory] = useState('Serum');
  const [fontSize, setFontSize] = useState(14);
  const [useLatex, setUseLatex] = useState(false);

  useEffect(() => {
    localStorage.setItem('lab-values', JSON.stringify(labValues));
  }, [labValues]);

  const handleAdd = () => {
    if (newLabValue.name && newLabValue.value) {
      setLabValues(prev => [...prev, {
        id: Date.now().toString(),
        ...newLabValue
      }]);
      setNewLabValue({ name: '', value: '', range: '', unit: '', category: 'Serum' });
    }
  };

  const handleEdit = (id: string, field: keyof LabValue, value: string) => {
    setLabValues(prev => prev.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    ));
  };

  const filteredLabValues = labValues.filter(f => 
    (f.category === selectedCategory) &&
    (f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     f.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
     f.range.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderValue = (text: string) => {
    if (!useLatex) return text;
    try {
      return <div dangerouslySetInnerHTML={{ 
        __html: katex.renderToString(text, { throwOnError: false }) 
      }} />;
    } catch (e) {
      return text;
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="bg-background border"
          aria-label="Open lab values reference"
        >
          <TestTube2 className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[80vw] max-w-none">
        <SheetHeader className="mb-4">
          <SheetTitle>Lab Values Reference</SheetTitle>
        </SheetHeader>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={50}>
            <div className="h-[calc(100vh-150px)] flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search lab values..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  <Input
                    type="number"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-20"
                    min={8}
                    max={32}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => setUseLatex(!useLatex)}
                    className={useLatex ? "bg-primary text-primary-foreground" : ""}
                  >
                    LaTeX
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className="whitespace-nowrap"
                  >
                    {category}
                  </Button>
                ))}
              </div>

              <ScrollArea className="flex-1 border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Range</TableHead>
                      <TableHead>Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLabValues.map((lab) => (
                      <TableRow key={lab.id}>
                        <TableCell className="font-medium" style={{ fontSize: `${fontSize}px` }}>
                          {editMode === `${lab.id}-name` ? (
                            <Input
                              value={lab.name}
                              onChange={(e) => handleEdit(lab.id, 'name', e.target.value)}
                              onBlur={() => setEditMode(null)}
                              autoFocus
                            />
                          ) : (
                            <div onClick={() => setEditMode(`${lab.id}-name`)}>
                              {renderValue(lab.name)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell style={{ fontSize: `${fontSize}px` }}>
                          {editMode === `${lab.id}-value` ? (
                            <Input
                              value={lab.value}
                              onChange={(e) => handleEdit(lab.id, 'value', e.target.value)}
                              onBlur={() => setEditMode(null)}
                              autoFocus
                            />
                          ) : (
                            <div onClick={() => setEditMode(`${lab.id}-value`)}>
                              {renderValue(lab.value)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell style={{ fontSize: `${fontSize}px` }}>
                          {editMode === `${lab.id}-range` ? (
                            <Input
                              value={lab.range}
                              onChange={(e) => handleEdit(lab.id, 'range', e.target.value)}
                              onBlur={() => setEditMode(null)}
                              autoFocus
                            />
                          ) : (
                            <div onClick={() => setEditMode(`${lab.id}-range`)}>
                              {renderValue(lab.range)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell style={{ fontSize: `${fontSize}px` }}>
                          {editMode === `${lab.id}-unit` ? (
                            <Input
                              value={lab.unit}
                              onChange={(e) => handleEdit(lab.id, 'unit', e.target.value)}
                              onBlur={() => setEditMode(null)}
                              autoFocus
                            />
                          ) : (
                            <div onClick={() => setEditMode(`${lab.id}-unit`)}>
                              {renderValue(lab.unit)}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell>
                        <Input
                          placeholder="Name"
                          value={newLabValue.name}
                          onChange={(e) => setNewLabValue(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Value"
                          value={newLabValue.value}
                          onChange={(e) => setNewLabValue(prev => ({ ...prev, value: e.target.value }))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Range"
                          value={newLabValue.range}
                          onChange={(e) => setNewLabValue(prev => ({ ...prev, range: e.target.value }))}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Unit"
                            value={newLabValue.unit}
                            onChange={(e) => setNewLabValue(prev => ({ ...prev, unit: e.target.value }))}
                          />
                          <Button size="icon" variant="ghost" onClick={handleAdd}>
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50}>
            <div className="h-[calc(100vh-150px)] flex flex-col gap-4">
              <ScrollArea className="flex-1 border rounded-md p-4">
                <div className="prose max-w-none dark:prose-invert">
                  <h3>Selected Lab Values</h3>
                  <p>Click on any value in the table on the left to edit it.</p>
                  <p>Use the LaTeX toggle to switch between normal text and LaTeX rendering.</p>
                  <p>Adjust the font size using the input field above the table.</p>
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </SheetContent>
    </Sheet>
  );
};

export default LabValuesTable;

