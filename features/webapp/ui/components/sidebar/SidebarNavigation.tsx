"use client";
/**
 * SidebarNavigation Component
 *
 * Renders the main navigation section of the sidebar with four groups:
 * - People: Prospects, Contacts, Archive
 * - Agent: Agent, Agent observability
 * - Insights: Analytics
 * - Accounts: Plans, Usage, Settings (collapsible) → Connected accounts
 *
 * References:
 * - Compound Components: https://kentcdodds.com/blog/compound-components-with-react-hooks
 * - WAI-ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
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
  ActivityZoneIcon,
  ChangeHistoryIcon,
  ChevronRightIcon,
  SettingsIcon,
  ManageAccountsIcon,
  FramePersonIcon,
  AccountBoxIcon,
  ArchiveIcon,
  BidLandscapeIcon,
  CreditCardIcon,
  DataUsageIcon,
} from "@/shared/ui/components/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@nanostores/react";
import { useActiveUseCaseLabels } from "@/shared/hooks";
import { $onboardingLock } from "@/shared/stores/onboarding";

export function SidebarNavigation() {
  const pathname = usePathname();
  const locked = useStore($onboardingLock);
  const { pageLabels, routes } = useActiveUseCaseLabels();
  const isAgentRoute = pathname === "/agent" || pathname.startsWith("/agent/");

  return (
    <>
      {/* People Group */}
      <SidebarGroup>
        <SidebarGroupLabel>افراد</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {/* Prospects */}
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={pageLabels.entities}
                isActive={pathname === "/"}
                disabled={locked}
                asChild={!locked}
              >
                {locked ? (
                  <>
                    <FramePersonIcon className="fill-sidebar-foreground" />
                    <span className="truncate">{pageLabels.entities}</span>
                  </>
                ) : (
                  <Link href="/">
                    <FramePersonIcon className="fill-sidebar-foreground" />
                    <span className="truncate">{pageLabels.entities}</span>
                  </Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Converts */}
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={pageLabels.converts}
                isActive={pathname === routes.successHref}
                disabled={locked}
                asChild={!locked}
              >
                {locked ? (
                  <>
                    <AccountBoxIcon className="fill-sidebar-foreground" />
                    <span className="truncate">{pageLabels.converts}</span>
                  </>
                ) : (
                  <Link href={routes.successHref}>
                    <AccountBoxIcon className="fill-sidebar-foreground" />
                    <span className="truncate">{pageLabels.converts}</span>
                  </Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Archives */}
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={pageLabels.archives}
                isActive={pathname === "/archives"}
                disabled={locked}
                asChild={!locked}
              >
                {locked ? (
                  <>
                    <ArchiveIcon className="fill-sidebar-foreground" />
                    <span className="truncate">{pageLabels.archives}</span>
                  </>
                ) : (
                  <Link href="/archives">
                    <ArchiveIcon className="fill-sidebar-foreground" />
                    <span className="truncate">{pageLabels.archives}</span>
                  </Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Agent Group */}
      <SidebarGroup>
        <SidebarGroupLabel>دستیار</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="دستیار"
                isActive={isAgentRoute}
                disabled={locked}
                asChild={!locked}
              >
                {locked ? (
                  <>
                    <ChangeHistoryIcon className="fill-sidebar-foreground" />
                    <span className="truncate">دستیار</span>
                  </>
                ) : (
                  <Link href="/agent">
                    <ChangeHistoryIcon className="fill-sidebar-foreground" />
                    <span className="truncate">دستیار</span>
                  </Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="وضعیت دستیار"
                isActive={pathname === "/agent-ops"}
                disabled={locked}
                asChild={!locked}
              >
                {locked ? (
                  <>
                    <ActivityZoneIcon className="fill-sidebar-foreground" />
                    <span className="truncate">وضعیت دستیار</span>
                  </>
                ) : (
                  <Link href="/agent-ops">
                    <ActivityZoneIcon className="fill-sidebar-foreground" />
                    <span className="truncate">وضعیت دستیار</span>
                  </Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Insights Group */}
      <SidebarGroup>
        <SidebarGroupLabel>بینش‌ها</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={pageLabels.analytics}
                isActive={pathname === "/analytics"}
                disabled={locked}
                asChild={!locked}
              >
                {locked ? (
                  <>
                    <BidLandscapeIcon className="fill-sidebar-foreground" />
                    <span className="truncate">{pageLabels.analytics}</span>
                  </>
                ) : (
                  <Link href="/analytics">
                    <BidLandscapeIcon className="fill-sidebar-foreground" />
                    <span className="truncate">{pageLabels.analytics}</span>
                  </Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Accounts Group */}
      <SidebarGroup>
        <SidebarGroupLabel>حساب کاربری</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="پلن‌ها"
                isActive={pathname === "/plans"}
                disabled={locked}
                asChild={!locked}
              >
                {locked ? (
                  <>
                    <CreditCardIcon className="fill-sidebar-foreground" />
                    <span className="truncate">پلن‌ها</span>
                  </>
                ) : (
                  <Link href="/plans">
                    <CreditCardIcon className="fill-sidebar-foreground" />
                    <span className="truncate">پلن‌ها</span>
                  </Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="میزان استفاده"
                isActive={pathname === "/usage"}
                disabled={locked}
                asChild={!locked}
              >
                {locked ? (
                  <>
                    <DataUsageIcon className="fill-sidebar-foreground" />
                    <span className="truncate">میزان استفاده</span>
                  </>
                ) : (
                  <Link href="/usage">
                    <DataUsageIcon className="fill-sidebar-foreground" />
                    <span className="truncate">میزان استفاده</span>
                  </Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
            {/* Settings with sub-menu */}
            <SidebarMenuItem>
              <Collapsible
                defaultOpen={pathname.startsWith("/settings")}
                className="group/collapsible [&[data-state=open]>button>svg:last-child]:rotate-90"
              >
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="تنظیمات" disabled={locked}>
                    <SettingsIcon className="fill-sidebar-foreground" />
                    <span className="truncate">تنظیمات</span>
                    <ChevronRightIcon className="fill-sidebar-foreground ms-auto rotate-180 transition-transform" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        tooltip="حساب‌های متصل"
                        isActive={pathname === "/settings/connected-accounts"}
                        disabled={locked}
                        asChild={!locked}
                      >
                        {locked ? (
                          <>
                            <ManageAccountsIcon className="fill-sidebar-foreground" />
                            <span className="truncate">حساب‌های متصل</span>
                          </>
                        ) : (
                          <Link href="/settings/connected-accounts">
                            <ManageAccountsIcon className="fill-sidebar-foreground" />
                            <span className="truncate">حساب‌های متصل</span>
                          </Link>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}
