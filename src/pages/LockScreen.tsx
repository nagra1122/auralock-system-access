import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ParticleBackground from '@/components/ParticleBackground';
import DigitalClock from '@/components/DigitalClock';
import CyberButton from '@/components/CyberButton';
import NumericKeypad from '@/components/NumericKeypad';
import { Input } from '@/components/ui/input';
import { Mic, Lock, KeyRound } from 'lucide-react';
import { getSettings, incrementAttempts } from '@/utils/localStorage';
import { speak } from '@/utils/speechSynthesis';
import { useToast } from '@/hooks/use-toast';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import auralockLogo from '@/assets/auralock-logo.png';

const LockScreen = () => {
  const [password, setPassword] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isDenied, setIsDenied] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastDeniedTime, setLastDeniedTime] = useState(0);
  const [showPinPad, setShowPinPad] = useState(false);
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const settings = getSettings();

  useEffect(() => {
    // Set up for lock screen mode
    const setupLockScreen = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#000000' });
      } catch (error) {
        console.log('StatusBar not available');
      }
    };
    setupLockScreen();

    // Show PIN pad by default if lockScreenMode is 'pin'
    if (settings.lockScreenMode === 'pin') {
      setShowPinPad(true);
    }
  }, [settings.lockScreenMode]);

  const handlePasswordUnlock = async () => {
    if (!password.trim()) return;
    
    if (password === settings.password) {
      try {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } catch (error) {
        console.log('Haptics not available');
      }
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

  const handlePinUnlock = async (enteredPin: string) => {
    if (enteredPin === settings.pin) {
      try {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } catch (error) {
        console.log('Haptics not available');
      }
      speak(`Welcome ${settings.username}. System Unlocked.`, settings.voiceStyle);
      toast({
        title: 'ACCESS GRANTED',
        description: 'PIN verified...',
        className: 'bg-success-green border-primary cyber-glow',
      });
      setTimeout(() => {
        navigate('/success');
      }, 1500);
    } else {
      handleDenied('pin');
    }
  };

  const handleDenied = async (reason: 'password' | 'voice' | 'pin' = 'password') => {
    const now = Date.now();
    
    // Cooldown to prevent spam - only allow once per 2 seconds
    if (now - lastDeniedTime < 2000) {
      console.log('Cooldown active, ignoring denial');
      return;
    }
    
    // Prevent multiple triggers
    if (isShaking || isDenied) {
      console.log('Already showing denied state, preventing duplicate');
      return;
    }
    
    console.log('Access denied triggered');
    setLastDeniedTime(now);
    incrementAttempts();
    setIsDenied(true);
    setIsShaking(true);
    
    // Single TTS call
    const message = reason === 'voice' ? 'Access denied. Voice mismatch.' : 
                    reason === 'pin' ? 'Access denied. Wrong PIN.' : 
                    'Access denied. Wrong password.';
    speak(message, settings.voiceStyle);
    
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      if (settings.vibration && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }

    // Single toast
    const description = reason === 'voice' ? 'Voice did not match' : 
                       reason === 'pin' ? 'Invalid PIN' : 
                       'Invalid credentials';
    toast({
      title: 'ACCESS DENIED',
      description,
      variant: 'destructive',
      className: 'alert-glow',
    });

    // Reset states after animation
    setTimeout(() => {
      console.log('Resetting denied state');
      setIsShaking(false);
      setIsDenied(false);
      setPassword('');
    }, 1000);
  };

  const stopVoice = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onspeechend = null;
        recognitionRef.current.stop();
      }
    } catch (e) {
      console.log('Stop voice error', e);
    } finally {
      setIsListening(false);
    }
  };

  const handleVoiceUnlock = () => {
    // Prevent multiple triggers while already listening or denied
    if (isListening || isDenied || isShaking) {
      console.log('Already processing, ignoring voice unlock request');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        title: 'Not Supported',
        description: 'Voice recognition is not supported in this browser',
        variant: 'destructive',
      });
      return;
    }

    const savedCommand = settings.voiceCommand?.trim();
    if (!savedCommand) {
      toast({
        title: 'Voice Command Missing',
        description: 'Please set up your voice command first.',
        variant: 'destructive',
      });
      navigate('/voice-setup');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true; // capture full phrase(s)
    recognition.interimResults = true; // accumulate interim + final
    recognition.maxAlternatives = 3;

    // Helpers for tolerant matching (stricter to prevent premature unlock)
    const normalize = (s: string) =>
      s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();

    const isVoiceMatch = (heard: string, expected: string) => {
      const a = normalize(heard);
      const b = normalize(expected);
      if (!a || !b) return false;
      if (a === b) return true;

      // Word-level similarity (no substring shortcuts)
      const aWords = a.split(' ').filter(Boolean);
      const bWords = b.split(' ').filter(Boolean);
      const aSet = new Set(aWords);
      const bSet = new Set(bWords);

      let inter = 0;
      aSet.forEach((w) => { if (bSet.has(w)) inter++; });

      const union = new Set([...aSet, ...bSet]).size;
      const jaccard = union === 0 ? 0 : inter / union;

      // Coverage: how much of expected was heard and vice-versa
      const coverageExpected = bWords.length ? inter / bWords.length : 0;
      const coverageHeard = aWords.length ? inter / aWords.length : 0;

      // In-order word match ratio
      let matchCount = 0;
      const minLen = Math.min(aWords.length, bWords.length);
      for (let i = 0; i < minLen; i++) {
        if (aWords[i] === bWords[i]) matchCount++;
      }
      const sequenceMatch = minLen ? matchCount / minLen : 0;

      // Minimum words to avoid unlocking on a single short word
      const minWordsRequired = Math.min(bWords.length, 3); // at least 2–3 words
      const wordsOk = aWords.length >= Math.max(2, minWordsRequired);

      // Stricter acceptance criteria
      return (
        wordsOk &&
        (coverageExpected >= 0.85 || jaccard >= 0.85) &&
        coverageHeard >= 0.6 &&
        sequenceMatch >= 0.7
      );
    };

    let hasEnded = false;
    let finalTranscript = '';
    let interimTranscript = '';
    let silenceTimer: number | undefined;

    setIsListening(true);

    const resetSilenceTimer = () => {
      if (silenceTimer) clearTimeout(silenceTimer);
      // stop after ~1s of silence (lets longer phrases complete)
      silenceTimer = window.setTimeout(() => {
        try { recognition.stop(); } catch {}
      }, 1000);
    };

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const best = res[0];
        if (res.isFinal) {
          finalTranscript += `${best.transcript} `;
        } else {
          interimTranscript = best.transcript;
        }
      }
      resetSilenceTimer();

      const debugHeard = (finalTranscript || interimTranscript).toLowerCase().trim();
      console.log('Voice heard (live):', debugHeard);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      hasEnded = true;
      setIsListening(false);
      if (silenceTimer) clearTimeout(silenceTimer);
      
      if (!['not-allowed', 'no-speech', 'aborted'].includes(event.error)) {
        toast({
          title: 'Voice Error',
          description: 'Could not recognize voice. Please try again.',
          variant: 'destructive',
        });
      }
    };

    recognition.onend = () => {
      if (hasEnded) return;
      hasEnded = true;
      setIsListening(false);
      if (silenceTimer) clearTimeout(silenceTimer);

      const transcriptText = (finalTranscript || interimTranscript).toLowerCase().trim();
      const expected = savedCommand.toLowerCase();

      // Require at least near-length to expected and min words
      const words = transcriptText.split(/\s+/).filter(Boolean);
      const expectedWords = expected.split(/\s+/).filter(Boolean);
      const enoughWords = words.length >= Math.max(2, Math.min(expectedWords.length, 3));

      if (!transcriptText || !enoughWords) {
        toast({
          title: 'Too short',
          description: 'Speak the full command clearly.',
          variant: 'destructive',
        });
        handleDenied('voice');
        return;
      }

      if (isVoiceMatch(transcriptText, expected)) {
        speak(`Welcome ${settings.username}. System Unlocked.`, settings.voiceStyle);
        toast({
          title: 'ACCESS GRANTED',
          description: 'Voice authentication successful',
          className: 'bg-success-green border-primary cyber-glow',
        });
        setTimeout(() => { navigate('/success'); }, 1500);
      } else {
        handleDenied('voice');
      }
    };

    recognition.onspeechend = () => {
      // Do not force stop here; we rely on silence timer to avoid cutting early
      console.log('Speech ended');
    };

    recognitionRef.current = recognition;
    recognition.start();
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
          {showPinPad ? (
            <>
              <div className="text-center space-y-2">
                <label className="text-sm font-orbitron uppercase tracking-wider text-primary">
                  Enter PIN
                </label>
              </div>
              <NumericKeypad onComplete={handlePinUnlock} maxLength={6} />
              {settings.lockScreenMode === 'both' && (
                <div className="text-center">
                  <button
                    onClick={() => setShowPinPad(false)}
                    className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Lock size={16} />
                    Use Password Instead
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
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
                  onClick={isListening ? stopVoice : handleVoiceUnlock}
                  className="w-full"
                >
                  <Mic className={`mr-2 ${isListening ? 'animate-pulse' : ''}`} size={20} />
                  {isListening ? 'Stop Listening' : 'Unlock with Voice'}
                </CyberButton>

                {settings.lockScreenMode === 'both' && (
                  <button
                    onClick={() => setShowPinPad(true)}
                    className="w-full text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-2 justify-center"
                  >
                    <KeyRound size={16} />
                    Use PIN Instead
                  </button>
                )}
              </div>
            </>
          )}

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
