import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ParticleBackground from '@/components/ParticleBackground';
import CyberButton from '@/components/CyberButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mic, Lock, Save } from 'lucide-react';
import { saveSettings } from '@/utils/localStorage';
import { speak } from '@/utils/speechSynthesis';
import { useToast } from '@/hooks/use-toast';

const Setup = () => {
  const [step, setStep] = useState<'password' | 'voice'>('password');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePasswordSetup = () => {
    if (!username.trim()) {
      toast({
        title: 'Username Required',
        description: 'Please enter your name',
        variant: 'destructive',
      });
      return;
    }

    if (!password.trim() || password.length < 4) {
      toast({
        title: 'Invalid Password',
        description: 'Password must be at least 4 characters',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    saveSettings({ password, username });
    speak('Password saved. Now set your voice command.', 'male');
    setStep('voice');
  };

  const startRecording = async () => {
    // Use speech recognition instead of audio recording for better phone compatibility
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        title: 'Not Supported',
        description: 'Speech recognition is not supported in this browser',
        variant: 'destructive',
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsRecording(true);
    speak('Speak your unlock command now.', 'male');

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.trim();
      console.log('Voice command recorded:', transcript);
      
      // Store the transcribed command temporarily
      audioChunksRef.current = [new Blob([transcript])];
      setHasRecording(true);
      setIsRecording(false);
      
      speak(`Command recorded: ${transcript}`, 'male');
      toast({
        title: 'Command Recorded',
        description: `"${transcript}"`,
        className: 'bg-success-green border-primary cyber-glow',
      });
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      toast({
        title: 'Recognition Error',
        description: 'Could not recognize speech. Please try again.',
        variant: 'destructive',
      });
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    mediaRecorderRef.current = recognition as any;
    recognition.start();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        (mediaRecorderRef.current as any).stop();
      } catch (e) {
        console.log('Recognition already stopped');
      }
      setIsRecording(false);
      speak('Recording stopped.', 'male');
    }
  };

  const handleVoiceSetup = () => {
    if (!hasRecording) {
      toast({
        title: 'No Recording',
        description: 'Please record your voice command first',
        variant: 'destructive',
      });
      return;
    }

    // Get the transcribed command from the blob
    const reader = new FileReader();
    reader.onload = () => {
      const voiceCommand = reader.result as string;
      console.log('Saving voice command:', voiceCommand);
      
      saveSettings({ voiceCommand });
      speak('Setup complete. Welcome to Auralock.', 'male');
      toast({
        title: 'Setup Complete',
        description: `Voice command saved: "${voiceCommand}"`,
        className: 'bg-success-green border-primary cyber-glow',
      });
      setTimeout(() => {
        navigate('/lock');
      }, 1500);
    };
    
    reader.readAsText(audioChunksRef.current[0]);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <ParticleBackground />
      
      <div className="z-10 w-full max-w-md space-y-8 fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-glow font-orbitron">FIRST-TIME SETUP</h1>
          <p className="text-muted-foreground">
            {step === 'password' ? 'Set your password and username' : 'Record your voice command'}
          </p>
        </div>

        {step === 'password' ? (
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
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" size={20} />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (min 4 characters)"
                  className="pl-10 bg-input border-primary/50 focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-primary font-orbitron uppercase text-xs">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" size={20} />
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="pl-10 bg-input border-primary/50 focus:border-primary"
                />
              </div>
            </div>

            <CyberButton
              variant="primary"
              onClick={handlePasswordSetup}
              className="w-full"
            >
              Next: Voice Setup
            </CyberButton>
          </div>
        ) : (
          <div className="bg-card border border-primary/30 rounded-lg p-6 space-y-6 cyber-glow-sm">
            <div className="text-center space-y-2">
              <div className={`w-24 h-24 mx-auto rounded-full border-4 flex items-center justify-center ${
                isRecording ? 'border-destructive alert-glow animate-pulse' : 'border-primary cyber-glow'
              }`}>
                <Mic size={40} className={isRecording ? 'text-destructive' : 'text-primary'} />
              </div>
              <p className="text-sm text-muted-foreground">
                {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
              </p>
            </div>

            <CyberButton
              variant={isRecording ? 'danger' : 'primary'}
              onClick={isRecording ? stopRecording : startRecording}
              className="w-full"
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </CyberButton>

            {hasRecording && (
              <CyberButton
                variant="primary"
                onClick={handleVoiceSetup}
                className="w-full"
              >
                <Save className="mr-2" size={20} />
                Complete Setup
              </CyberButton>
            )}

            <div className="bg-secondary/50 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground text-center">
                <span className="text-primary font-semibold">Tip:</span> Speak clearly. Use phrases like 
                "Open my phone", "Access granted", or "Unlock system"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Setup;
