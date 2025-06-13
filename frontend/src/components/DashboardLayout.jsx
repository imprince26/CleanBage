import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

const DashboardLayout = () => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
    const location = useLocation();

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsDesktopSidebarOpen(false);
            } else {
                setIsDesktopSidebarOpen(true);
            }
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Header */}
            <Header
                className={cn(
                    "transition-all duration-300",
                    isDesktopSidebarOpen ? "lg:pl-[280px]" : "lg:pl-[50px]"
                )}
            />

            <div className="flex-1 flex">
                {/* Mobile Sidebar */}
                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetContent
                        side="left"
                        className="w-[280px] p-0 border-r"
                    >
                        <Sidebar onClose={() => setIsMobileOpen(false)} />
                    </SheetContent>
                </Sheet>

                {/* Desktop Sidebar */}
                <aside
                    className={cn(
                        "fixed top-0 left-0 z-30 h-screen bg-background transition-all duration-300 ease-in-out border-r",
                        isDesktopSidebarOpen ? "w-[280px]" : "w-[0px]",
                        "hidden lg:block"
                    )}
                >
                    <div className={cn(
                        "h-full transition-all duration-300 ease-in-out",
                        isDesktopSidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full",
                        "pt-16" // Header space
                    )}>
                        <Sidebar collapsed={!isDesktopSidebarOpen} />
                    </div>
                </aside>

                {/* Main Content */}
                <main className={cn(
                    "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out relative",
                    isDesktopSidebarOpen ? "lg:pl-[280px]" : "lg:pl-[0px]",
                    "pt-16" // Header space
                )}>
                    {/* Sidebar Toggle Buttons */}
                    <div className="fixed left-4 top-3.5 z-50 flex items-center gap-2">
                        {/* Mobile Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setIsMobileOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>

                        {/* Desktop Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden lg:flex"
                            onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
                        >
                            {isDesktopSidebarOpen ? (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <ChevronLeft className="h-5 w-5" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Close sidebar
                                    </TooltipContent>
                                </Tooltip>
                            ) : (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <ChevronRight className="h-5 w-5" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Open sidebar
                                    </TooltipContent>
                                </Tooltip>
                            )}
                            {/*         
              <span className="sr-only " >
                {isDesktopSidebarOpen ? "Close sidebar" : "Open sidebar"}
              </span> */}
                        </Button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        <ScrollArea className="h-[calc(100vh-5rem)]"> {/* Adjust for header and footer */}
                            <div className="container py-6 px-4 md:px-6">
                                <Outlet />
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Footer */}
                    <Footer
                        className={cn(
                            "mt-auto transition-all duration-300",
                            isDesktopSidebarOpen ? "lg:pl-[30px]" : "lg:pl-[0px]"
                        )}
                    />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;