import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ParticleBackground from '@/components/ParticleBackground';
import CyberButton from '@/components/CyberButton';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, LogOut } from 'lucide-react';
import { getSettings, saveSettings } from '@/utils/localStorage';
import { speak } from '@/utils/speechSynthesis';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentSettings = getSettings();

  const [user, setUser] = useState<any>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(currentSettings.username);
  const [pin, setPin] = useState('');
  const [lockScreenMode, setLockScreenMode] = useState(currentSettings.lockScreenMode);
  const [soundEffects, setSoundEffects] = useState(currentSettings.soundEffects);
  const [vibration, setVibration] = useState(currentSettings.vibration);
  const [voiceStyle, setVoiceStyle] = useState(currentSettings.voiceStyle);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSave = () => {
    // Check if trying to change sensitive settings
    const changingPassword = password && password !== currentSettings.password;
    const changingUsername = username !== currentSettings.username;
    const changingPin = pin && pin !== currentSettings.pin;
    
    if ((changingPassword || changingUsername || changingPin) && !currentPassword) {
      toast({
        title: 'Authentication Required',
        description: 'Enter your current password to change sensitive settings',
        variant: 'destructive',
      });
      return;
    }

    if ((changingPassword || changingUsername || changingPin) && currentPassword !== currentSettings.password) {
      toast({
        title: 'Invalid Password',
        description: 'Current password is incorrect',
        variant: 'destructive',
      });
      return;
    }

    // Validate PIN if provided
    if (changingPin && (!/^\d{4,6}$/.test(pin))) {
      toast({
        title: 'Invalid PIN',
        description: 'PIN must be 4-6 digits',
        variant: 'destructive',
      });
      return;
    }

    const updates: any = {
      soundEffects,
      vibration,
      voiceStyle,
      lockScreenMode,
    };

    if (changingUsername) {
      updates.username = username;
    }

    if (changingPassword) {
      updates.password = password;
    }

    if (changingPin) {
      updates.pin = pin;
    }

    saveSettings(updates);
    
    speak('Settings saved successfully.', voiceStyle);
    toast({
      title: 'Success',
      description: 'Settings have been updated',
      className: 'bg-success-green border-primary cyber-glow',
    });
    
    setCurrentPassword('');
    setPassword('');
    setPin('');
    
    setTimeout(() => {
      navigate('/lock');
    }, 1500);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: 'Signed Out',
      description: 'You have been signed out successfully',
    });
    navigate('/auth');
  };

  const handleVoiceSetup = () => {
    if (!currentPassword) {
      toast({
        title: 'Authentication Required',
        description: 'Enter your current password to change voice command',
        variant: 'destructive',
      });
      return;
    }

    if (currentPassword !== currentSettings.password) {
      toast({
        title: 'Invalid Password',
        description: 'Current password is incorrect',
        variant: 'destructive',
      });
      return;
    }

    navigate('/voice-setup');
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
            <Label className="text-primary font-orbitron uppercase text-xs">
              Logged in as
            </Label>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-primary font-orbitron uppercase text-xs">
              Current Password *
            </Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Required to change sensitive settings"
              className="bg-input border-primary/50 focus:border-primary"
            />
            <p className="text-xs text-muted-foreground">* Required to change username, password, or voice</p>
          </div>

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
              New Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current"
              className="bg-input border-primary/50 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin" className="text-primary font-orbitron uppercase text-xs">
              New PIN (4-6 digits)
            </Label>
            <Input
              id="pin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder={`Current: ${currentSettings.pin}`}
              className="bg-input border-primary/50 focus:border-primary font-mono"
            />
            <p className="text-xs text-muted-foreground">Leave blank to keep current PIN</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lock-mode" className="text-primary font-orbitron uppercase text-xs">
              Lock Screen Mode
            </Label>
            <Select value={lockScreenMode} onValueChange={(value: any) => setLockScreenMode(value)}>
              <SelectTrigger className="bg-input border-primary/50 focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="password">Password Only</SelectItem>
                <SelectItem value="pin">PIN Only</SelectItem>
                <SelectItem value="both">Both (Switch)</SelectItem>
              </SelectContent>
            </Select>
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
            onClick={handleVoiceSetup}
            className="w-full"
          >
            Re-record Voice Command
          </CyberButton>
        </div>

        <CyberButton
          variant="danger"
          onClick={handleSignOut}
          className="w-full"
        >
          <LogOut className="mr-2" size={20} />
          Sign Out
        </CyberButton>

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
