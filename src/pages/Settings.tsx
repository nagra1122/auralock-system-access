import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ParticleBackground from '@/components/ParticleBackground';
import CyberButton from '@/components/CyberButton';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { getSettings, saveSettings } from '@/utils/localStorage';
import { speak } from '@/utils/speechSynthesis';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentSettings = getSettings();

  const [password, setPassword] = useState(currentSettings.password);
  const [username, setUsername] = useState(currentSettings.username);
  const [soundEffects, setSoundEffects] = useState(currentSettings.soundEffects);
  const [vibration, setVibration] = useState(currentSettings.vibration);
  const [voiceStyle, setVoiceStyle] = useState(currentSettings.voiceStyle);

  const handleSave = () => {
    saveSettings({
      password,
      username,
      soundEffects,
      vibration,
      voiceStyle,
    });
    
    speak('Settings saved successfully.', voiceStyle);
    toast({
      title: 'Success',
      description: 'Settings have been updated',
      className: 'bg-success-green border-primary cyber-glow',
    });
    
    setTimeout(() => {
      navigate('/lock');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <ParticleBackground />
      
      <div className="z-10 w-full max-w-md space-y-6 fade-in">
        <button
          onClick={() => navigate('/lock')}
          className="flex items-center text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Lock Screen
        </button>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-glow">Settings</h1>
          <p className="text-muted-foreground mt-2">Customize your Auralock experience</p>
        </div>

        <div className="bg-card border border-primary/30 rounded-lg p-6 space-y-6 cyber-glow-sm">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-primary font-orbitron uppercase text-xs">
              Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              className="bg-input border-primary/50 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-primary font-orbitron uppercase text-xs">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="bg-input border-primary/50 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="voice-style" className="text-primary font-orbitron uppercase text-xs">
              Voice Style
            </Label>
            <Select value={voiceStyle} onValueChange={(value: any) => setVoiceStyle(value)}>
              <SelectTrigger className="bg-input border-primary/50 focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="robotic">Robotic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sound-effects" className="text-primary font-orbitron uppercase text-xs">
              Sound Effects
            </Label>
            <Switch
              id="sound-effects"
              checked={soundEffects}
              onCheckedChange={setSoundEffects}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="vibration" className="text-primary font-orbitron uppercase text-xs">
              Vibration Feedback
            </Label>
            <Switch
              id="vibration"
              checked={vibration}
              onCheckedChange={setVibration}
            />
          </div>

          <CyberButton
            variant="primary"
            onClick={() => navigate('/voice-setup')}
            className="w-full"
          >
            Re-record Voice Command
          </CyberButton>
        </div>

        <CyberButton
          variant="primary"
          onClick={handleSave}
          className="w-full"
        >
          <Save className="mr-2" size={20} />
          Save Settings
        </CyberButton>

        <div className="text-center text-xs text-muted-foreground">
          <p>Total Unlock Attempts: {currentSettings.unlockAttempts}</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
