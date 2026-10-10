"use client";
/**
 * SidebarResources Component
 *
 * Renders the resources section of the sidebar with helpful links and guides.
 * Uses collapsible patterns for better organization of content.
 *
 * References:
 * - Component Composition: https://react.dev/learn/passing-props-to-a-component
 * - Semantic HTML: https://developer.mozilla.org/en-US/docs/Learn/Accessibility/HTML
 */

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/shared/ui/components/Sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/components/Collapsible";
import {
  ChevronRightIcon,
  DeveloperGuideIcon,
} from "@/shared/ui/components/icons";

export function SidebarResources() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>منابع</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Collapsible className="group/collapsible [&[data-state=open]>button>svg:last-child]:rotate-90">
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip="شروع">
                  <DeveloperGuideIcon className="fill-sidebar-foreground" />
                  <span className="truncate">شروع</span>
                  <ChevronRightIcon className="fill-sidebar-foreground ms-auto rotate-180 transition-transform" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="گفتگو">
                      <span className="truncate">🧵 گفتگو</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
