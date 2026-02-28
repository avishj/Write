import { ThemeProvider } from "@app/providers/ThemeProvider";
import { ToastContainer } from "@app/components/common/Toast";

export default function App() {
  return (
    <ThemeProvider>
      <div className="flex h-screen flex-col font-ui">
        {/* AppShell — filled in by later PRs */}
        <main className="flex flex-1 items-center justify-center">
          <h1 className="font-display text-2xl font-semibold">Write</h1>
        </main>
        <ToastContainer />
      </div>
    </ThemeProvider>
  );
}
