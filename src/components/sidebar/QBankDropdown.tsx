import { ChevronDown, Database, Image } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const QBankDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Database className="w-4 h-4 mr-2" />
        <span>Question Banks</span>
        <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="pl-6 py-1 space-y-1">
          <Link
            to="/qbanks/questions"
            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Database className="w-4 h-4 mr-2" />
            Question Library
          </Link>
          <Link
            to="/qbanks/media"
            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Image className="w-4 h-4 mr-2" />
            Media Library
          </Link>
        </div>
      )}
    </div>
  );
};

export default QBankDropdown; 