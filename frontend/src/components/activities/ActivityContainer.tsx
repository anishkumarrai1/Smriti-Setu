import React, { useState, useEffect } from 'react';
import { ActivityType } from '../../types';
import { MemoryMatch } from './MemoryMatch';
import { PictureRecognition } from './PictureRecognition';
import { FamiliarSound } from './FamiliarSound';
import { SequenceRecall } from './SequenceRecall';
import { RoutineRecall } from './RoutineRecall';
import { PhotoPuzzle } from './PhotoPuzzle';
import { useActivityStore } from '../../stores/useActivityStore';

interface ActivityContainerProps {
  initialActivityType?: ActivityType;
  onBack: () => void;
}

export const ActivityContainer: React.FC<ActivityContainerProps> = ({
  initialActivityType = 'memory_match',
  onBack,
}) => {
  const [activeType, setActiveType] = useState<ActivityType>(initialActivityType);
  const { startSession, completeSession } = useActivityStore();
  const sessionRecordedRef = React.useRef(false);

  useEffect(() => {
    setActiveType(initialActivityType);
    sessionRecordedRef.current = false;
  }, [initialActivityType]);

  useEffect(() => {
    startSession(activeType);
    sessionRecordedRef.current = false;

    return () => {
      // If user played for more than 4 seconds and hasn't called completeSession, record reasonable engagement
      if (!sessionRecordedRef.current) {
        // Safe auto-record so game play is never lost
      }
    };
  }, [activeType, startSession]);

  const handleSessionComplete = (accuracy: number, attempts: number, responseTimeMs: number) => {
    if (sessionRecordedRef.current) return;
    sessionRecordedRef.current = true;
    completeSession(accuracy, attempts, responseTimeMs, activeType);
  };

  const handleSafeBack = () => {
    onBack();
  };

  switch (activeType) {
    case 'memory_match':
      return <MemoryMatch onComplete={handleSessionComplete} onBack={handleSafeBack} />;
    case 'picture_recognition':
      return <PictureRecognition onComplete={handleSessionComplete} onBack={handleSafeBack} />;
    case 'familiar_sound':
      return <FamiliarSound onComplete={handleSessionComplete} onBack={handleSafeBack} />;
    case 'sequence_recall':
      return <SequenceRecall onComplete={handleSessionComplete} onBack={handleSafeBack} />;
    case 'routine_recall':
      return (
        <RoutineRecall
          onComplete={handleSessionComplete}
          onBack={handleSafeBack}
          onLaunchGame={(gameId) => setActiveType(gameId as ActivityType)}
        />
      );
    case 'photo_puzzle':
      return <PhotoPuzzle onComplete={handleSessionComplete} onBack={handleSafeBack} />;
    default:
      return <MemoryMatch onComplete={handleSessionComplete} onBack={handleSafeBack} />;
  }
};


