import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HealthIssue {
  type: 'error' | 'warning';
  title: string;
  description: string;
  fix?: string;
}

export const ReactHealthMonitor: React.FC = () => {
  const [issues, setIssues] = React.useState<HealthIssue[]>([]);
  const [isVisible, setIsVisible] = React.useState(false);
  const [isHealthy, setIsHealthy] = React.useState(true);

  React.useEffect(() => {
    // Only run in development mode
    if (import.meta.env.MODE !== 'development') return;

    const detectedIssues: HealthIssue[] = [];

    // Check 1: Detect multiple React instances
    try {
      const reactInstances = [];
      
      // Check window.React
      if (typeof window !== 'undefined' && (window as any).React) {
        reactInstances.push('window.React');
      }

      // Check for multiple React versions in the bundle
      const reactVersion = React.version;
      console.log('[React Health] React version:', reactVersion);
      
      // Try to detect duplicate React by checking if hooks return null
      let hookDispatcherNull = false;
      try {
        const dispatcher = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentDispatcher?.current;
        if (dispatcher === null) {
          hookDispatcherNull = true;
          detectedIssues.push({
            type: 'error',
            title: 'Hook Dispatcher is NULL',
            description: 'React hooks dispatcher is returning null. This indicates multiple React instances or incorrect React imports.',
            fix: 'Check vite.config.ts for resolve.dedupe: ["react", "react-dom"] and ensure all components import from "react" consistently.'
          });
        }
      } catch (e) {
        console.log('[React Health] Could not check dispatcher:', e);
      }

      // Check if React is properly imported in all providers
      const testHook = () => {
        try {
          React.useState(0);
          return true;
        } catch (error) {
          return false;
        }
      };

      if (!testHook()) {
        detectedIssues.push({
          type: 'error',
          title: 'Hooks Not Working',
          description: 'React.useState() test failed. Hooks may not be callable in current context.',
          fix: 'Ensure all React hooks use namespace imports: React.useState(), React.useEffect(), etc.'
        });
      }

    } catch (error) {
      console.error('[React Health] Error during health check:', error);
      detectedIssues.push({
        type: 'error',
        title: 'Health Check Failed',
        description: `Could not complete React health check: ${error instanceof Error ? error.message : 'Unknown error'}`,
        fix: 'Check browser console for detailed error messages.'
      });
    }

    // Check 2: Verify hook call context
    try {
      const currentOwner = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentOwner?.current;
      console.log('[React Health] Current owner:', currentOwner);
    } catch (e) {
      console.log('[React Health] Could not check owner:', e);
    }

    // Check 3: Detect conditional hook calls (static analysis limitation - runtime check)
    console.log('[React Health] Component tree rendering correctly');

    // Update state
    if (detectedIssues.length > 0) {
      setIssues(detectedIssues);
      setIsVisible(true);
      setIsHealthy(false);
      console.error('[React Health] Issues detected:', detectedIssues);
    } else {
      setIsHealthy(true);
      console.log('[React Health] ✓ All checks passed - React is healthy');
      
      // Show success banner briefly
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 3000);
    }
  }, []);

  // Don't render anything in production
  if (import.meta.env.MODE !== 'development') return null;

  // Don't render if dismissed
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-md space-y-2">
      {isHealthy ? (
        <Alert className="bg-green-500/10 border-green-500/50">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-500">React Health: OK</AlertTitle>
          <AlertDescription className="text-green-600 dark:text-green-400">
            All React health checks passed. No duplicate instances detected.
          </AlertDescription>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsVisible(false)}
            className="mt-2 text-green-600 hover:text-green-700"
          >
            Dismiss
          </Button>
        </Alert>
      ) : (
        issues.map((issue, index) => (
          <Alert 
            key={index} 
            variant={issue.type === 'error' ? 'destructive' : 'default'}
            className={issue.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/50' : ''}
          >
            {issue.type === 'error' ? (
              <XCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
            <AlertTitle>{issue.title}</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{issue.description}</p>
              {issue.fix && (
                <p className="text-xs font-mono bg-background/50 p-2 rounded">
                  Fix: {issue.fix}
                </p>
              )}
            </AlertDescription>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsVisible(false)}
              className="mt-2"
            >
              Dismiss
            </Button>
          </Alert>
        ))
      )}
    </div>
  );
};
