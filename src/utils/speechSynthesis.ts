export const speak = (text: string, voice: 'male' | 'female' | 'robotic' = 'male') => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Wait for voices to be loaded
    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
      
      if (voices.length > 0) {
        let selectedVoice = null;
        
        switch (voice) {
          case 'female':
            // Try to find female voices with various search terms
            selectedVoice = voices.find(v => 
              v.name.toLowerCase().includes('female') ||
              v.name.toLowerCase().includes('woman') ||
              v.name.toLowerCase().includes('samantha') ||
              v.name.toLowerCase().includes('karen') ||
              v.name.toLowerCase().includes('moira') ||
              v.name.toLowerCase().includes('tessa') ||
              v.name.toLowerCase().includes('victoria') ||
              v.name.toLowerCase().includes('google uk english female')
            );
            utterance.pitch = 1.1;
            console.log('Selected female voice:', selectedVoice?.name);
            break;
          case 'robotic':
            selectedVoice = voices.find(v => 
              v.name.toLowerCase().includes('alex') || 
              v.name.toLowerCase().includes('daniel')
            );
            utterance.pitch = 0.8;
            utterance.rate = 0.9;
            console.log('Selected robotic voice:', selectedVoice?.name);
            break;
          default:
            // Male voice
            selectedVoice = voices.find(v => 
              v.name.toLowerCase().includes('male') ||
              v.name.toLowerCase().includes('david') ||
              v.name.toLowerCase().includes('google uk english male')
            );
            console.log('Selected male voice:', selectedVoice?.name);
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        } else {
          console.warn(`No ${voice} voice found, using default`);
          utterance.voice = voices[0];
        }
      }
    };
    
    // Set voice immediately if available
    if (window.speechSynthesis.getVoices().length > 0) {
      setVoice();
    } else {
      // Wait for voices to load
      window.speechSynthesis.addEventListener('voiceschanged', setVoice, { once: true });
    }
    
    utterance.rate = 1;
    utterance.volume = 1;
    
    window.speechSynthesis.speak(utterance);
  }
};

export const initVoices = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
  }
};
