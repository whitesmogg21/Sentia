
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PlusCircle, Calculator, Search, Trash2 } from "lucide-react";
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface Formula {
  id: string;
  name: string;
  formula: string;
}

const FormulaTable = () => {
  const [formulas, setFormulas] = useState<Formula[]>(() => {
    const saved = localStorage.getItem('formula-references');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState<string | null>(null);
  const [newFormula, setNewFormula] = useState({ name: '', formula: '' });

  useEffect(() => {
    localStorage.setItem('formula-references', JSON.stringify(formulas));
  }, [formulas]);

  const handleAdd = () => {
    if (newFormula.name && newFormula.formula) {
      setFormulas(prev => [...prev, {
        id: Date.now().toString(),
        ...newFormula
      }]);
      setNewFormula({ name: '', formula: '' });
    }
  };

  const handleEdit = (id: string, field: keyof Formula, value: string) => {
    setFormulas(prev => prev.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    ));
  };

  const handleDelete = (id: string) => {
    setFormulas(prev => prev.filter(f => f.id !== id));
  };

  const filteredFormulas = formulas.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderLatex = (formula: string) => {
    try {
      return <div dangerouslySetInnerHTML={{ 
        __html: katex.renderToString(formula, { throwOnError: false }) 
      }} />;
    } catch (e) {
      return formula;
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="bg-background border"
          aria-label="Open reference"
        >
          <Calculator className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Reference</SheetTitle>
        </SheetHeader>
        <div className="flex items-center gap-2 my-4">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search reference names..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFormulas.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">
                    {editMode === `${f.id}-name` ? (
                      <Input
                        value={f.name}
                        onChange={(e) => handleEdit(f.id, 'name', e.target.value)}
                        onBlur={() => setEditMode(null)}
                        autoFocus
                      />
                    ) : (
                      <div onClick={() => setEditMode(`${f.id}-name`)}>{f.name}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editMode === `${f.id}-formula` ? (
                      <Input
                        value={f.formula}
                        onChange={(e) => handleEdit(f.id, 'formula', e.target.value)}
                        onBlur={() => setEditMode(null)}
                        autoFocus
                      />
                    ) : (
                      <div onClick={() => setEditMode(`${f.id}-formula`)}>
                        {renderLatex(f.formula)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(f.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell>
                  <Input
                    placeholder="Name"
                    value={newFormula.name}
                    onChange={(e) => setNewFormula(prev => ({ ...prev, name: e.target.value }))}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Reference (LaTeX)"
                    value={newFormula.formula}
                    onChange={(e) => setNewFormula(prev => ({ ...prev, formula: e.target.value }))}
                  />
                </TableCell>
                <TableCell>
                  <Button size="icon" variant="ghost" onClick={handleAdd}>
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default FormulaTable;
