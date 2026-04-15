import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Pointer, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { QuickHailButton } from './QuickHailButton';
import VoiceHailButton from './VoiceHailButton';
import { cn } from '@/lib/utils';

const HIDDEN_PATHS = [
  '/',
  '/auth',
  '/safe',
  '/unauthorized',
  '/register-complete',
  '/privacy-policy',
  '/terms-of-service',
  '/owner-pitch',
  '/why-join',
  '/dot-presentation',
  '/investor',
  '/investor-r2m',
  '/investor-hardware',
  '/investor-scale',
  '/investor-hybrid',
  '/investor-eswatini',
  '/legal-nda',
  '/legal-revenue-share',
];

export const FloatingHailFAB = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Hide on certain pages and for unauthenticated users
  const shouldHide =
    !user ||
    HIDDEN_PATHS.some(
      (p) => location.pathname === p || location.pathname.startsWith('/auth/')
    ) ||
    location.pathname.startsWith('/track/');

  if (shouldHide) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-center gap-3">
      {/* Expanded panel */}
      {isExpanded && (
        <div className="mb-2 flex flex-col items-center gap-4 rounded-2xl bg-card/95 backdrop-blur-md p-5 shadow-2xl border border-border animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className="flex items-center gap-6">
            <QuickHailButton userId={user.id} onHailSuccess={() => setIsExpanded(false)} />
            <VoiceHailButton onDestinationDetected={() => {}} />
          </div>
          <p className="text-xs text-muted-foreground">Tap to hail • Speak destination</p>
        </div>
      )}

      {/* FAB trigger */}
      <Button
        onClick={() => setIsExpanded((v) => !v)}
        className={cn(
          'h-14 w-14 rounded-full shadow-lg transition-all duration-200 hover:scale-110',
          isExpanded
            ? 'bg-muted text-muted-foreground hover:bg-muted/80'
            : 'bg-gradient-to-br from-green-500 via-green-400 to-emerald-500 text-white hover:from-green-400 hover:to-emerald-400'
        )}
      >
        {isExpanded ? (
          <X className="h-6 w-6" />
        ) : (
          <Pointer className="h-6 w-6 animate-tap-bounce" />
        )}
      </Button>
    </div>
  );
};
