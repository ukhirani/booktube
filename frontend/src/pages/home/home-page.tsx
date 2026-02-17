import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { AppSidebar } from "./sidebar";

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-base bg-background/50 border-2 border-border" />
            <div className="aspect-video rounded-base bg-background/50 border-2 border-border" />
            <div className="aspect-video rounded-base bg-background/50 border-2 border-border" />
          </div>
          <div className="min-h-screen flex-1 rounded-base bg-background/50 border-2 border-border md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
