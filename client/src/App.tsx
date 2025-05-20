import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import ProfileSidebar from "@/components/layout/ProfileSidebar";
import CreateMenu from "@/components/layout/CreateMenu";
import Dashboard from "@/pages/Dashboard";
import Accounts from "@/pages/Accounts";
import AccountDetail from "@/pages/AccountDetail";
import AccountForm from "@/pages/AccountForm";
import Quotes from "@/pages/Quotes";
import QuoteForm from "@/pages/QuoteForm";
import QuoteDetail from "@/pages/QuoteDetail";
import Projects from "@/pages/Projects";
import ProjectForm from "@/pages/ProjectForm";
import ProjectDetail from "@/pages/ProjectDetail";
import Tasks from "@/pages/Tasks";
import TaskForm from "@/pages/TaskForm";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Help from "@/pages/Help";
import Login from "@/pages/Login";
import UserForm from "@/pages/UserForm";
import React, { useState, useEffect } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

function App() {
  const [location] = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const toggleProfile = () => setProfileOpen(!profileOpen);
  const toggleCreateMenu = () => setCreateMenuOpen(!createMenuOpen);
  
  // Yeni butonundan yakalayacağımız olayı dinle
  useEffect(() => {
    const handleOpenCreateMenu = () => setCreateMenuOpen(true);
    window.addEventListener('openCreateMenu', handleOpenCreateMenu);
    
    return () => {
      window.removeEventListener('openCreateMenu', handleOpenCreateMenu);
    };
  }, []);

  // Check if user is on login page
  const isLoginPage = location === "/login";

  if (isLoginPage) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Login />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
          <Header onProfileClick={toggleProfile} />
          
          <div className="flex flex-1 overflow-hidden">
            {!isMobile && <Sidebar />}
            
            <main className="flex-1 overflow-y-auto p-4 pb-20 md:pb-6" id="main-content">
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/accounts" component={Accounts} />
                <Route path="/accounts/new" component={AccountForm} />
                <Route path="/accounts/:id" component={AccountDetail} />
                <Route path="/accounts/:id/edit" component={AccountForm} />
                <Route path="/quotes" component={Quotes} />
                <Route path="/quotes/new" component={QuoteForm} />
                <Route path="/quotes/:id" component={QuoteDetail} />
                <Route path="/quotes/:id/edit" component={QuoteForm} />
                <Route path="/projects" component={Projects} />
                <Route path="/projects/new" component={ProjectForm} />
                <Route path="/projects/:id" component={ProjectDetail} />
                <Route path="/projects/:id/edit" component={ProjectForm} />
                <Route path="/tasks" component={Tasks} />
                <Route path="/tasks/new" component={TaskForm} />
                <Route path="/users/new" component={UserForm} />
                <Route path="/reports" component={Reports} />
                <Route path="/settings" component={Settings} />
                <Route path="/help" component={Help} />
                <Route component={NotFound} />
              </Switch>
            </main>
          </div>

          {isMobile && <MobileNav onCreateClick={toggleCreateMenu} />}
          
          <ProfileSidebar isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
          <CreateMenu isOpen={createMenuOpen} onClose={() => setCreateMenuOpen(false)} />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
