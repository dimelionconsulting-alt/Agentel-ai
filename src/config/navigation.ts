import {
  BarChart3,
  Bot,
  CreditCard,
  Gauge,
  LayoutDashboard,
  Phone,
  PhoneOutgoing,
  Puzzle,
  Settings,
  BookOpen,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

export const mainNav: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview of call volume and outcomes",
  },
  {
    label: "Agents",
    href: "/agents",
    icon: Bot,
    description: "Create and manage AI voice agents",
  },
  {
    label: "Phone Numbers",
    href: "/phone-numbers",
    icon: Phone,
    description: "Purchase and assign telephone numbers",
  },
  {
    label: "Calls",
    href: "/calls",
    icon: PhoneOutgoing,
    description: "Inbound and outbound call history",
  },
  {
    label: "Leads",
    href: "/leads",
    icon: Users,
    description: "Captured leads and qualification",
  },
  {
    label: "Knowledge",
    href: "/knowledge",
    icon: BookOpen,
    description: "Train agents with business knowledge",
  },
  {
    label: "Integrations",
    href: "/integrations",
    icon: Puzzle,
    description: "Connect calendars, CRM, and webhooks",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Performance and conversion insights",
  },
  {
    label: "Usage",
    href: "/usage",
    icon: Gauge,
    description: "Minutes, agents, and storage usage",
  },
  {
    label: "Billing",
    href: "/billing",
    icon: CreditCard,
    description: "Plans, invoices, and payment methods",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Organization, users, and security",
  },
];

export const adminNav: NavItem[] = [
  { label: "Organizations", href: "/admin/organizations", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Usage", href: "/admin/usage", icon: Gauge },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { label: "System Health", href: "/admin/health", icon: BarChart3 },
];
