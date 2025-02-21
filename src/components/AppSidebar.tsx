
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import QBankDropdown from "@/components/sidebar/QBankDropdown";
import { BarChart, Clock, Home } from "lucide-react";

const items = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Performance", url: "/performance", icon: BarChart },
  { title: "Previous Quizzes", url: "/history", icon: Clock },
];

export function AppSidebar() {
  const { toggleSidebar } = useSidebar();

  return (
    <>
      <div className="fixed left-0 top-0 h-full w-[160px] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="p-3 border-b border-gray-200">
          <h3 className="font-semibold text-lg">Quiz App</h3>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-64px)]">
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link to={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <QBankDropdown />
          </SidebarMenu>
        </div>
      </div>
      <Button
        variant="outline"
        className="fixed z-50 top-1/2 -translate-y-1/2 left-[160px] flex h-6 w-6 items-center justify-center rounded-full border bg-background p-0 text-foreground shadow-sm transition-transform hover:scale-105 hover:bg-accent hover:text-accent-foreground"
        onClick={toggleSidebar}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
    </>
  );
}
