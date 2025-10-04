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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setHasRecording(true);
        setVoiceCommand('voice_command_recorded');
      };

      mediaRecorder.start();
      setIsRecording(true);
      speak('Recording started. Speak your command now.', settings.voiceStyle);
    } catch (error) {
      toast({
        title: 'Microphone Error',
        description: 'Could not access microphone',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      speak('Recording stopped.', settings.voiceStyle);
    }
  };

  const playRecording = () => {
    speak('Playing your voice command.', settings.voiceStyle);
  };

  const saveVoiceCommand = () => {
    if (hasRecording) {
      saveSettings({ voiceCommand });
      speak('Voice command saved successfully.', settings.voiceStyle);
      toast({
        title: 'Success',
        description: 'Voice command saved successfully',
        className: 'bg-success-green border-primary cyber-glow',
      });
      setTimeout(() => {
        navigate('/success');
      }, 1500);
    }
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
