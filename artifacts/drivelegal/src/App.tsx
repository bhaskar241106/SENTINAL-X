import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, createContext, useContext } from "react";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import ChatPage from "@/pages/ChatPage";
import ChallanPage from "@/pages/ChallanPage";
import CountryPage from "@/pages/CountryPage";
import LawsPage from "@/pages/LawsPage";
import EmergencyPage from "@/pages/EmergencyPage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

interface CountryContextType {
  selectedCountry: string;
  setSelectedCountry: (code: string) => void;
}

export const CountryContext = createContext<CountryContextType>({
  selectedCountry: "IN",
  setSelectedCountry: () => {},
});

export function useCountry() {
  return useContext(CountryContext);
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/chat" component={ChatPage} />
        <Route path="/challan" component={ChallanPage} />
        <Route path="/countries/:code" component={CountryPage} />
        <Route path="/laws" component={LawsPage} />
        <Route path="/emergency" component={EmergencyPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const [selectedCountry, setSelectedCountry] = useState("IN");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CountryContext.Provider value={{ selectedCountry, setSelectedCountry }}>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </CountryContext.Provider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
