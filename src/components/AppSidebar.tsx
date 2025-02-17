
import { BarChart, Clock, Home, Library, Image, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";

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
  }
];

export function AppSidebar() {
  const [isQBankExpanded, setIsQBankExpanded] = useState(true);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Quiz App</SidebarGroupLabel>
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

              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setIsQBankExpanded(!isQBankExpanded)}
                >
                  <Library />
                  <span>Edit QBanks</span>
                  <ChevronRight 
                    className={`ml-auto h-4 w-4 transition-transform ${
                      isQBankExpanded ? "rotate-90" : ""
                    }`}
                  />
                </SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuItem>
                    <SidebarMenuSubButton asChild>
                      <Link to="/qbanks">Question Banks</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuSubButton asChild>
                      <Link to="/qbanks/media">Media Library</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
