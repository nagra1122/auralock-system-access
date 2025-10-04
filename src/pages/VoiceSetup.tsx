import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ParticleBackground from '@/components/ParticleBackground';
import CyberButton from '@/components/CyberButton';
import { ArrowLeft, Mic, Play, Save } from 'lucide-react';
import { saveSettings, getSettings } from '@/utils/localStorage';
import { speak } from '@/utils/speechSynthesis';
import { useToast } from '@/hooks/use-toast';

const VoiceSetup = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const settings = getSettings();

  const startRecording = async () => {
    // Use speech recognition for better reliability
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
    speak('Speak your unlock command now.', settings.voiceStyle);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.trim();
      console.log('Voice command recorded:', transcript);
      
      setVoiceCommand(transcript);
      audioChunksRef.current = [new Blob([transcript])];
      setHasRecording(true);
      setIsRecording(false);
      
      speak(`Command recorded: ${transcript}`, settings.voiceStyle);
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
      speak('Recording stopped.', settings.voiceStyle);
    }
  };

  const playRecording = () => {
    speak('Playing your voice command.', settings.voiceStyle);
  };

  const saveVoiceCommand = () => {
    if (!hasRecording || !voiceCommand) {
      toast({
        title: 'No Recording',
        description: 'Please record your voice command first',
        variant: 'destructive',
      });
      return;
    }

    console.log('Saving voice command:', voiceCommand);
    saveSettings({ voiceCommand });
    speak('Voice command updated successfully.', settings.voiceStyle);
    toast({
      title: 'Voice Updated',
      description: `Voice command saved: "${voiceCommand}"`,
      className: 'bg-success-green border-primary cyber-glow',
    });
    setTimeout(() => {
      navigate('/settings');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <ParticleBackground />
      
      <div className="z-10 w-full max-w-md space-y-8 fade-in">
        <button
          onClick={() => navigate('/lock')}
          className="flex items-center text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Lock Screen
        </button>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-glow">Voice Command Setup</h1>
          <p className="text-muted-foreground">
            Record your unique voice command for unlock simulation
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-primary/30 rounded-lg p-6 space-y-4 cyber-glow-sm">
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
              <>
                <CyberButton
                  variant="secondary"
                  onClick={playRecording}
                  className="w-full"
                >
                  <Play className="mr-2" size={20} />
                  Play Recording
                </CyberButton>

                <CyberButton
                  variant="primary"
                  onClick={saveVoiceCommand}
                  className="w-full"
                >
                  <Save className="mr-2" size={20} />
                  Save Voice Command
                </CyberButton>
              </>
            )}
          </div>

          <div className="bg-secondary/50 border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-muted-foreground text-center">
              <span className="text-primary font-semibold">Tip:</span> Try commands like 
              "Open my phone" or "Access granted"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSetup;
