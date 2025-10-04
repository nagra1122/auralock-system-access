import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-destructive alert-glow">404</h1>
        <p className="text-xl text-muted-foreground">ACCESS DENIED - Page not found</p>
        <a href="/" className="text-primary hover:text-primary/80 underline transition-colors">
          Return to Lock Screen
        </a>
      </div>
    </div>
  );
};

export default NotFound;
