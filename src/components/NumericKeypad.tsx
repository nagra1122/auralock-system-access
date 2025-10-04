import { useState } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Button } from '@/components/ui/button';
import { Delete } from 'lucide-react';

interface NumericKeypadProps {
  onComplete: (pin: string) => void;
  maxLength?: number;
}

const NumericKeypad = ({ onComplete, maxLength = 6 }: NumericKeypadProps) => {
  const [pin, setPin] = useState('');

  const handleVibrate = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.log('Haptics not available');
    }
  };

  const handleNumberPress = (num: string) => {
    handleVibrate();
    if (pin.length < maxLength) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === maxLength) {
        onComplete(newPin);
        setTimeout(() => setPin(''), 300);
      }
    }
  };

  const handleDelete = () => {
    handleVibrate();
    setPin(prev => prev.slice(0, -1));
  };

  const buttons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      {/* PIN Display */}
      <div className="flex justify-center gap-3 py-6">
        {Array.from({ length: maxLength }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all ${
              i < pin.length
                ? 'bg-primary border-primary scale-110'
                : 'border-primary/30'
            }`}
          />
        ))}
      </div>

      {/* Keypad Grid */}
      <div className="grid grid-cols-3 gap-4">
        {buttons.map((num) => (
          <Button
            key={num}
            onClick={() => handleNumberPress(num)}
            variant="outline"
            className="h-16 text-2xl font-bold bg-background/50 border-primary/50 hover:bg-primary/20 hover:border-primary cyber-glow-sm"
          >
            {num}
          </Button>
        ))}
        
        <div className="col-span-1" />
        
        <Button
          onClick={handleDelete}
          variant="outline"
          className="h-16 bg-background/50 border-primary/50 hover:bg-destructive/20 hover:border-destructive"
          disabled={pin.length === 0}
        >
          <Delete size={24} />
        </Button>
      </div>
    </div>
  );
};

export default NumericKeypad;
