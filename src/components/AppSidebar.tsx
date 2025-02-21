
import { BarChart, Clock, Home, PanelLeftClose } from "lucide-react";
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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import QBankDropdown from "@/components/sidebar/QBankDropdown";

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

type AppSidebarProps = {
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
};

export function AppSidebar({ 
  variant = "sidebar", 
  collapsible = "offcanvas" 
}: AppSidebarProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <>
      <Sidebar variant={variant} collapsible={collapsible}>
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
        variant="ghost"
        size="icon"
        className="fixed left-[256px] top-2 z-50 h-8 w-8 rounded-r-none border bg-background px-0 hover:bg-accent hover:text-accent-foreground"
        onClick={toggleSidebar}
      >
        <PanelLeftClose className="h-4 w-4" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
    </>
  );
}
