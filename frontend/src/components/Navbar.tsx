import { NavLink } from "react-router-dom";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-12 border-b border-zinc-800 bg-zinc-950">
      <div className="max-w-4xl mx-auto px-6 h-full flex items-center justify-between">
        <NavLink to="/" className="text-sm font-semibold text-zinc-100 no-underline tracking-tight">
          LeadManager
        </NavLink>

        <div className="flex items-center gap-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `text-sm font-medium no-underline px-3 py-1.5 rounded-md transition-colors duration-150 ${
                isActive ? "text-zinc-100 bg-zinc-800" : "text-zinc-500 hover:text-zinc-200"
              }`
            }
          >
            Leads
          </NavLink>
          <NavLink to="/leads/new" className="btn-primary">
            New Lead
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
