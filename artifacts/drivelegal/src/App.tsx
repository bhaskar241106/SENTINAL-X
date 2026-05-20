import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, createContext, useContext, useEffect } from "react";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import ChatPage from "@/pages/ChatPage";
import ChallanPage from "@/pages/ChallanPage";
import CountryPage from "@/pages/CountryPage";
import LawsPage from "@/pages/LawsPage";
import EmergencyPage from "@/pages/EmergencyPage";
import SentinelPage from "@/pages/SentinelPage";
import GeofencePage from "@/pages/GeofencePage";
import PoliceModePageComponent from "@/pages/PoliceModePageComponent";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/not-found";
import { VoiceAssistantFAB } from "@/components/VoiceAssistantFAB";

const queryClient = new QueryClient();

interface ApiContextType {
  baseUrl: string;
  setBaseUrl: (url: string) => void;
  isOffline: boolean;
}

export const ApiContext = createContext<ApiContextType>({
  baseUrl: "",
  setBaseUrl: () => {},
  isOffline: false,
});

export function useApi() {
  return useContext(ApiContext);
}

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
        <Route path="/sentinel" component={SentinelPage} />
        <Route path="/geofence" component={GeofencePage} />
        <Route path="/police-mode" component={PoliceModePageComponent} />
        <Route path="/profile" component={ProfilePage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const [selectedCountry, setSelectedCountry] = useState(localStorage.getItem("selectedCountry") || "IN");
  const [baseUrl, setBaseUrl] = useState(localStorage.getItem("apiBaseUrl") || "");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);
    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
    };
  }, []);

  const updateSelectedCountry = (code: string) => {
    setSelectedCountry(code);
    localStorage.setItem("selectedCountry", code);
  };

  const updateBaseUrl = (url: string) => {
    setBaseUrl(url);
    localStorage.setItem("apiBaseUrl", url);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ApiContext.Provider value={{ baseUrl, setBaseUrl: updateBaseUrl, isOffline }}>
        <TooltipProvider>
          <CountryContext.Provider value={{ selectedCountry, setSelectedCountry: updateSelectedCountry }}>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </CountryContext.Provider>
          <VoiceAssistantFAB />
          <Toaster />
        </TooltipProvider>
      </ApiContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
