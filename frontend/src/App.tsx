import { Toaster } from "./components/ui/toaster.js";
import { Toaster as Sonner } from "./components/ui/sonner.js";
import { TooltipProvider } from "./components/ui/tooltip.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index.js";
import SignUp from "./pages/Signup.js";
import SignIn from "./pages/Signin.js";
import OAuthSuccess from "./pages/OAuthSuccess.js";
import RoomActions from "./pages/RoomActions.js";
import "./index.css"
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/room-actions" element={<RoomActions />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;