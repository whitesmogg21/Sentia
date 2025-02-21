import { Clock, Home, Library, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import QBankDropdown from "@/components/sidebar/QBankDropdown";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

const items = [{
  title: "Dashboard",
  url: "/",
  icon: Home
}, {
  title: "Previous Quizzes",
  url: "/history",
  icon: Clock
}];

export function AppSidebar() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  return (
    <div className="relative">
      <div className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "ml-0" : "ml-[160px]"
      )}>
        {/* Main content container */}
      </div>

      <div className={cn(
        "fixed left-0 top-0 h-full w-[160px] transition-transform duration-300",
        sidebarCollapsed && "-translate-x-[160px]"
      )}>
        <Sidebar>
          <SidebarContent className="px-0 rounded-md">
            <SidebarGroup>
              <SidebarGroupLabel>Quiz App</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map(item => <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>)}
                  <QBankDropdown />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "fixed top-4 transition-all duration-300 bg-background border",
          sidebarCollapsed ? "left-4" : "left-[150px]"
        )}
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        aria-label="Toggle sidebar"
      >
        {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
    </div>
  );
}
