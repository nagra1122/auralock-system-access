import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ParticleBackground from '@/components/ParticleBackground';
import DigitalClock from '@/components/DigitalClock';
import CyberButton from '@/components/CyberButton';
import { Input } from '@/components/ui/input';
import { Mic, Lock } from 'lucide-react';
import { getSettings, incrementAttempts } from '@/utils/localStorage';
import { speak } from '@/utils/speechSynthesis';
import { useToast } from '@/hooks/use-toast';
import auralockLogo from '@/assets/auralock-logo.png';

const LockScreen = () => {
  const [password, setPassword] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isDenied, setIsDenied] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const settings = getSettings();

  const handlePasswordUnlock = () => {
    if (!password.trim()) return;
    
    if (password === settings.password) {
      speak(`Welcome ${settings.username}. System Unlocked.`, settings.voiceStyle);
      toast({
        title: 'ACCESS GRANTED',
        description: 'Decrypting access...',
        className: 'bg-success-green border-primary cyber-glow',
      });
      setTimeout(() => {
        navigate('/success');
      }, 1500);
    } else {
      handleDenied();
    }
  };

  const handleDenied = () => {
    // Prevent multiple triggers
    if (isShaking || isDenied) return;
    
    incrementAttempts();
    setIsDenied(true);
    setIsShaking(true);
    
    // Single TTS call
    speak('Access denied. Wrong password.', settings.voiceStyle);
    
    if (settings.vibration && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    // Single toast
    toast({
      title: 'ACCESS DENIED',
      description: 'Invalid credentials',
      variant: 'destructive',
      className: 'alert-glow',
    });

    setTimeout(() => {
      setIsShaking(false);
      setIsDenied(false);
      setPassword('');
    }, 1000);
  };

  const handleVoiceUnlock = () => {
    navigate('/voice-setup');
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden ${isDenied ? 'bg-red-900/20' : ''}`}>
      <ParticleBackground />
      
      <div className="z-10 w-full max-w-md space-y-8 fade-in">
        <div className="text-center space-y-4">
          <img 
            src={auralockLogo} 
            alt="Auralock Logo" 
            className="w-32 h-32 mx-auto float pulse-glow"
          />
          <h1 className="text-4xl font-bold text-glow">AURALOCK</h1>
          <p className="text-sm text-muted-foreground">System Access Control</p>
        </div>

        <DigitalClock />

        <div className={`space-y-6 ${isShaking ? 'shake' : ''}`}>
          <div className="space-y-2">
            <label className="text-sm font-orbitron uppercase tracking-wider text-primary">
              Enter Access Code
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" size={20} />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordUnlock()}
                placeholder="••••••••"
                className="pl-10 bg-input border-primary/50 focus:border-primary cyber-glow-sm text-foreground font-mono"
              />
            </div>
          </div>

          <div className="space-y-3">
            <CyberButton
              variant="primary"
              onClick={handlePasswordUnlock}
              className="w-full"
            >
              Unlock with Password
            </CyberButton>

            <CyberButton
              variant="secondary"
              onClick={handleVoiceUnlock}
              className="w-full"
            >
              <Mic className="mr-2" size={20} />
              Unlock with Voice
            </CyberButton>
          </div>

          <div className="text-center space-x-4">
            <button
              onClick={() => navigate('/settings')}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Settings
            </button>
            <span className="text-muted-foreground">•</span>
            <button
              onClick={() => navigate('/')}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Back to Start
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground pt-8">
          <p>Powered by Auralock AI</p>
        </div>
      </div>
    </div>
  );
};

export default LockScreen;
