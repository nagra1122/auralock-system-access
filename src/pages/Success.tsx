import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ParticleBackground from '@/components/ParticleBackground';
import CyberButton from '@/components/CyberButton';
import { getSettings } from '@/utils/localStorage';
import { CheckCircle } from 'lucide-react';

const Success = () => {
  const navigate = useNavigate();
  const settings = getSettings();

  useEffect(() => {
    if (settings.vibration && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  }, [settings.vibration]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <ParticleBackground />
      
      <div className="z-10 w-full max-w-md space-y-8 text-center fade-in">
        <div className="space-y-6">
          <CheckCircle 
            size={120} 
            className="mx-auto text-primary cyber-glow pulse-glow" 
          />
          
          <div className="space-y-2">
            <h1 className="text-5xl font-bold text-glow typing-effect">
              ACCESS GRANTED
            </h1>
            <p className="text-2xl text-primary">
              Welcome, {settings.username}
            </p>
          </div>

          <div className="bg-card border border-primary/30 rounded-lg p-6 cyber-glow-sm space-y-4">
            <div className="text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className="text-success-green font-semibold">UNLOCKED</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">User:</span>
                <span className="text-foreground">{settings.username}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Attempts:</span>
                <span className="text-foreground">{settings.unlockAttempts}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Security Level:</span>
                <span className="text-primary">MAXIMUM</span>
              </div>
            </div>
          </div>

          <CyberButton
            variant="primary"
            onClick={() => navigate('/')}
            className="w-full"
          >
            Lock Again
          </CyberButton>
        </div>
      </div>
    </div>
  );
};

export default Success;
