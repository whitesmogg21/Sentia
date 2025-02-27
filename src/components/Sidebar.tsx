import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import QBankDropdown from "./sidebar/QBankDropdown";

const Sidebar = () => {
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-4">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Quiz App</h1>
      </div>
      <nav className="space-y-1">
        <Link
          to="/"
          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Home className="w-4 h-4 mr-2" />
          Home
        </Link>
        <QBankDropdown />
      </nav>
    </div>
  );
};

export default Sidebar; 