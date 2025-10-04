import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ParticleBackground from '@/components/ParticleBackground';
import CyberButton from '@/components/CyberButton';
import { getSettings } from '@/utils/localStorage';
import auralockLogo from '@/assets/auralock-logo.png';

const StartScreen = () => {
  const navigate = useNavigate();
  const settings = getSettings();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleOpen = () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check if password and voice are set
    if (!settings.password || settings.password === 'admin123' || !settings.voiceCommand) {
      navigate('/setup');
    } else {
      navigate('/lock');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <ParticleBackground />
      
      <div className="z-10 w-full max-w-md space-y-8 fade-in text-center">
        <div className="space-y-6">
          <img 
            src={auralockLogo} 
            alt="Auralock Logo" 
            className="w-40 h-40 mx-auto float pulse-glow"
          />
          <h1 className="text-5xl font-bold text-glow font-orbitron">AURALOCK</h1>
          <p className="text-lg text-primary">Your Voice, Your Key</p>
        </div>

        <div className="pt-8 space-y-4">
          <CyberButton
            variant="primary"
            onClick={handleOpen}
            className="w-full text-xl py-6"
          >
            {user ? 'Open' : 'Sign In'}
          </CyberButton>

          {user && (
            <p className="text-center text-sm text-muted-foreground">
              Signed in as {user.email}
            </p>
          )}
        </div>

        <div className="text-center text-xs text-muted-foreground pt-12">
          <p>Powered by Auralock AI</p>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
