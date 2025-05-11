import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import EditorPage from "@/pages/editor";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import { Button } from "@/components/ui/button";
import { useWorkflows, Workflow } from "@/hooks/useWorkflows";
import { formatDistanceToNow } from "date-fns";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { OnboardingModal } from "@/components/OnboardingModal";

function WorkflowCard({ workflow }: { workflow: Workflow }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/editor/${workflow._id}`)}
      className="w-full p-4 text-left border rounded-lg hover:bg-accent/50 transition-colors"
    >
      <h3 className="font-medium">{workflow.name}</h3>
      <p className="text-sm text-muted-foreground">
        Updated{" "}
        {formatDistanceToNow(new Date(workflow.updatedAt), { addSuffix: true })}
      </p>
    </button>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function LandingPage() {
  const { data: workflows, isLoading } = useWorkflows();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const recentWorkflows = workflows
    ?.sort(
      (a: Workflow, b: Workflow) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 5);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <OnboardingModal />
      <div className="text-center space-y-8 max-w-md w-full px-4">
        <div className="flex justify-end">
          <Button variant="ghost" onClick={logout}>
            Sign out
          </Button>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">WorkflowViz</h1>
        <p className="text-muted-foreground text-lg">
          Visualize your workflows with AI
        </p>
        <Button
          size="lg"
          onClick={() => navigate("/editor")}
          className="w-full"
        >
          Create Workflow
        </Button>

        {isLoading ? (
          <p className="text-muted-foreground">Loading recent workflows...</p>
        ) : recentWorkflows?.length ? (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Recent Workflows</h2>
            <div className="space-y-2">
              {recentWorkflows.map((workflow) => (
                <WorkflowCard key={workflow._id} workflow={workflow} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <LandingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/editor"
        element={
          <ProtectedRoute>
            <EditorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/editor/:id"
        element={
          <ProtectedRoute>
            <EditorPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
