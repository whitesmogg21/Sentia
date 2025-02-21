
import { BarChart, Clock, Home, Library, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import QBankDropdown from "@/components/sidebar/QBankDropdown";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Performance",
    url: "/performance",
    icon: BarChart,
  },
  {
    title: "Previous Quizzes",
    url: "/history",
    icon: Clock,
  },
];

export function AppSidebar() {
  const { toggleSidebar, state } = useSidebar();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between p-2">
            <SidebarGroupLabel>Quiz App</SidebarGroupLabel>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full hover:bg-accent transition-all",
                state === "collapsed" && "rotate-180"
              )}
              onClick={toggleSidebar}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
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
  );
}

