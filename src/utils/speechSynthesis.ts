export const speak = (text: string, voice: 'male' | 'female' | 'robotic' = 'male') => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    if (voices.length > 0) {
      switch (voice) {
        case 'female':
          utterance.voice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha')) || voices[0];
          break;
        case 'robotic':
          utterance.voice = voices.find(v => v.name.includes('Alex') || v.name.includes('Daniel')) || voices[0];
          utterance.pitch = 0.8;
          utterance.rate = 0.9;
          break;
        default:
          utterance.voice = voices.find(v => v.name.includes('Male') || v.name.includes('Google UK English Male')) || voices[0];
      }
    }
    
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    window.speechSynthesis.speak(utterance);
  }
};

export const initVoices = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
  }
};
