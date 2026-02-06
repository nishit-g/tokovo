import { TimelineDemo } from "./pages/TimelineDemo";
import { StudioRuntimeProvider } from "./RuntimeContext";

export function App() {
  return (
    <StudioRuntimeProvider>
      <TimelineDemo />
    </StudioRuntimeProvider>
  );
}
