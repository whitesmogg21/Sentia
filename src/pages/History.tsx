import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QuizHistory } from "../types/quiz";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { resetMetrics } from "@/utils/metricsUtils";
import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import Pagination from "@/components/Pagintion";

interface HistoryProps {
  quizHistory: QuizHistory[];
  onClearHistory: () => void;
}

const History = ({ quizHistory, onClearHistory }: HistoryProps) => {
  const [showClearDialog, setShowClearDialog] = useState(false);

  const [sortColumn, setSortColumn] = useState<
    "date" | "qbank" | "score" | "percentage" | null
  >(null);

  const [dateFilter, setDateFilter] = useState<Date | null>(null);
const [qbankFilter, setQbankFilter] = useState("all");
const [percentageRange, setPercentageRange] = useState("all");

  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [currentPage, setCurrentPage] = useState(1);


  const handleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) {
      // Toggle direction
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // const sortedHistory = [...quizHistory].sort((a, b) => {
  //   if (!sortColumn) return 0;

  //   let aVal: string | number = "";
  //   let bVal: string | number = "";

  //   switch (sortColumn) {
  //     case "date":
  //       aVal = new Date(a.date).getTime();
  //       bVal = new Date(b.date).getTime();
  //       break;
  //     case "qbank":
  //       aVal = a.qbankId.toLowerCase();
  //       bVal = b.qbankId.toLowerCase();
  //       break;
  //     case "score":
  //       aVal = a.score;
  //       bVal = b.score;
  //       break;
  //     case "percentage":
  //       aVal = a.score / a.totalQuestions;
  //       bVal = b.score / b.totalQuestions;
  //       break;
  //   }

  //   if (typeof aVal === "string" && typeof bVal === "string") {
  //     return sortDirection === "asc"
  //       ? aVal.localeCompare(bVal)
  //       : bVal.localeCompare(aVal);
  //   } else {
  //     return sortDirection === "asc"
  //       ? (aVal as number) - (bVal as number)
  //       : (bVal as number) - (aVal as number);
  //   }
  // });
  const filteredAndSortedHistory = [...quizHistory]
  .filter((quiz) => {
    if (dateFilter) {
      const quizDate = new Date(quiz.date);
      return quizDate.toDateString() === dateFilter.toDateString();
    }
    return true;
  })
  .filter((quiz) => {
    return qbankFilter === "all" || quiz.qbankId === qbankFilter;
  })
  .filter((quiz) => {
    if (percentageRange === "all") return true;
    const pct = (quiz.score / quiz.totalQuestions) * 100;
    const [min, max] = percentageRange.split("-").map(Number);
    return pct >= min && pct <= max;
  })
  .sort((a, b) => {
    if (!sortColumn) return 0;

    let aVal: string | number = "";
    let bVal: string | number = "";

    switch (sortColumn) {
      case "date":
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
        break;
      case "qbank":
        aVal = a.qbankId.toLowerCase();
        bVal = b.qbankId.toLowerCase();
        break;
      case "score":
        aVal = a.score;
        bVal = b.score;
        break;
      case "percentage":
        aVal = a.score / a.totalQuestions;
        bVal = b.score / b.totalQuestions;
        break;
    }

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    } else {
      return sortDirection === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    }
  });

  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(filteredAndSortedHistory.length / ITEMS_PER_PAGE);
  const paginatedHistory = useMemo(() => filteredAndSortedHistory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  ), [filteredAndSortedHistory, currentPage]);

  const handleClearConfirm = () => {
    resetMetrics();
    onClearHistory();
    setShowClearDialog(false);
  };

  const formatDate = (isoDate: string) =>
    new Date(isoDate).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button
          variant="destructive"
          onClick={() => setShowClearDialog(true)}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear History
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-6">Previous Quizzes</h1>

      {quizHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-7xl mb-4 opacity-70">📜</div>
          <p className="text-lg text-muted-foreground">
            No quiz history yet. Complete a quiz to see your results here!
          </p>
        </div>
      ) : (
        <>
          <div className="filters flex justify-between">
            {/* Date Filter  */}
            <Popover>
              <PopoverTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-start text-left">
        {dateFilter ? formatDate(dateFilter.toISOString()) : "Select Date"}
      </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
      <Calendar
        mode="single"
        selected={dateFilter}
        onSelect={setDateFilter}
        initialFocus
      />
    </PopoverContent>
            </Popover>

            {/* Question bank filter  */}
            <Select value={qbankFilter} onValueChange={setQbankFilter}>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Select QBank" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Banks</SelectItem>
      {[...new Set(quizHistory.map((q) => q.qbankId))].map((id) => (
        <SelectItem key={id} value={id}>
          {id}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
            
            {/* Percentage filter  */}
            <Select value={percentageRange} onValueChange={setPercentageRange}>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Select % Range" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All</SelectItem>
      {[...Array(10)].map((_, i) => {
        const start = i * 10 + 1;
        const end = (i + 1) * 10;
        return (
          <SelectItem key={i} value={`${start}-${end}`}>
            {start}-{end}%
          </SelectItem>
        );
      })}
    </SelectContent>
  </Select>
          </div>
          <div className="bg-card rounded-2xl shadow-lg p-6">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-muted/50">
                  <TableHead
                    onClick={() => handleSort("date")}
                    className="text-foreground cursor-pointer"
                  >
                    Date <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("qbank")}
                    className="text-foreground cursor-pointer"
                  >
                    Question Bank{" "}
                    <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("score")}
                    className="text-foreground cursor-pointer"
                  >
                    Score <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("percentage")}
                    className="text-foreground cursor-pointer"
                  >
                    Percentage <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead className="text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedHistory.map((quiz) => (
                  <TableRow key={quiz.id} className="hover:bg-muted/50">
                    <TableCell className="text-foreground text-wrap w-28">
                      {formatDate(quiz.date)}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {quiz.qbankId}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {quiz.score}/{quiz.totalQuestions}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {((quiz.score / quiz.totalQuestions) * 100).toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-foreground">
                      <Link to={"/session-history"} state={{ quiz }}>
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-full"
                        >
                          View Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredAndSortedHistory.length > ITEMS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
        </>
      )}

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Quiz History</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all performance metrics and quiz history. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button onClick={handleClearConfirm}>Clear History</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default History;
