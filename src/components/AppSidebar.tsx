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

  return <div className="relative h-screen">
    <aside className={cn(
      "h-screen border-r border-border transition-all duration-300",
      sidebarCollapsed ? "w-0 opacity-0" : "w-64 opacity-100"
    )}>
      <Sidebar>
        <SidebarContent className="px-0">
          <SidebarGroup>
            <SidebarGroupLabel>Quiz App</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
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
    </aside>

    <Button 
      variant="ghost" 
      size="icon" 
      className={cn(
        "fixed top-4 z-50 transition-all duration-300 bg-background border", 
        sidebarCollapsed ? "left-4" : "left-[220px]"
      )} 
      onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
      aria-label="Toggle sidebar"
    >
      {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
    </Button>

    <main className={cn("min-h-screen transition-all duration-300 p-6", sidebarCollapsed ? "ml-0" : "ml-[220px]")}>
      {/* Main content container */}
    </main>
  </div>;
}
