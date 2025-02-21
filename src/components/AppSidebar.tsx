
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
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <div className="flex items-center px-2">
              <SidebarGroupLabel>Quiz App</SidebarGroupLabel>
            </div>
            <SidebarGroupContent>
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
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <Button
        variant="outline"
        size="icon"
        className="fixed left-[160px] top-1/2 z-50 -translate-y-1/2 h-8 w-4 rounded-l-none border-l-0 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={toggleSidebar}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
    </>
  );
}
