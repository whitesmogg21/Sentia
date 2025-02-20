
import { BarChart, Clock, Home, Library, ChevronRight } from "lucide-react";
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
  SidebarRail,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
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

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarRail />
        <SidebarGroup>
          <SidebarGroupLabel>Quiz App</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuAction asChild showOnHover>
                    <Link to={item.url}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </SidebarMenuAction>
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
