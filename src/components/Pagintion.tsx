import React from 'react'

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2; // Number of neighbors to show on each side
    const range = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          pages.push(l + 1);
        } else if (i - l > 2) {
          pages.push('...');
        }
      }
      pages.push(i);
      l = i;
    }
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
          ? <span key={idx} className="px-2">...</span>
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
