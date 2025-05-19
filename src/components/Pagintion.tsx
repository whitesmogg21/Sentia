import React from 'react'

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Helper to generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const siblingCount = 1; // Number of pages to show on each side of current
    const totalNumbers = siblingCount * 2 + 3; // current, siblings, first, last
    const totalBlocks = totalNumbers + 2; // including ellipsis

    if (totalPages <= totalBlocks) {
      // Show all pages if not enough to truncate
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    const leftSibling = Math.max(currentPage - siblingCount, 2);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages - 1);

    // Always show first page
    pages.push(1);

    // Show left ellipsis if needed
    if (leftSibling > 2) {
      pages.push('...');
    }

    // Show middle pages
    for (let i = leftSibling; i <= rightSibling; i++) {
      pages.push(i);
    }

    // Show right ellipsis if needed
    if (rightSibling < totalPages - 1) {
      pages.push('...');
    }

    // Always show last page
    pages.push(totalPages);

    return pages;
  };

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      <button
        className="px-3 py-1 rounded border bg-white disabled:opacity-50"
        onClick={handlePrev}
        disabled={currentPage === 1}
      >
        Prev
      </button>
      {getPageNumbers().map((page, idx) =>
        page === '...'
          ? <span key={`ellipsis-${idx}`} className="px-2">...</span>
          : <button
              key={page as number}
              className={`px-3 py-1 rounded border ${currentPage === page ? 'bg-primary text-white' : 'bg-white'}`}
              onClick={() => onPageChange(page as number)}
              disabled={currentPage === page}
            >
              {page}
            </button>
      )}
      <button
        className="px-3 py-1 rounded border bg-white disabled:opacity-50"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
