import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { LeadsList } from "./pages/LeadsList";
import { LeadDetail } from "./pages/LeadDetail";
import { LeadForm } from "./pages/LeadForm";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950">
        <Navbar />
        <main className="max-w-4xl mx-auto px-6 pt-20 pb-12">
          <Routes>
            <Route path="/" element={<LeadsList />} />
            <Route path="/leads/new" element={<LeadForm />} />
            <Route path="/leads/:id" element={<LeadDetail />} />
            <Route path="/leads/:id/edit" element={<LeadForm />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
