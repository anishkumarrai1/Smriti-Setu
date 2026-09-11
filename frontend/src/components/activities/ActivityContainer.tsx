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

  useEffect(() => {
    setActiveType(initialActivityType);
  }, [initialActivityType]);

  useEffect(() => {
    startSession(activeType);
  }, [activeType, startSession]);

  const handleSessionComplete = (accuracy: number, attempts: number, responseTimeMs: number) => {
    completeSession(accuracy, attempts, responseTimeMs, activeType);
  };

  switch (activeType) {
    case 'memory_match':
      return <MemoryMatch onComplete={handleSessionComplete} onBack={onBack} />;
    case 'picture_recognition':
      return <PictureRecognition onComplete={handleSessionComplete} onBack={onBack} />;
    case 'familiar_sound':
      return <FamiliarSound onComplete={handleSessionComplete} onBack={onBack} />;
    case 'sequence_recall':
      return <SequenceRecall onComplete={handleSessionComplete} onBack={onBack} />;
    case 'routine_recall':
      return (
        <RoutineRecall
          onComplete={handleSessionComplete}
          onBack={onBack}
          onLaunchGame={(gameId) => setActiveType(gameId as ActivityType)}
        />
      );
    case 'photo_puzzle':
      return <PhotoPuzzle onComplete={handleSessionComplete} onBack={onBack} />;
    default:
      return <MemoryMatch onComplete={handleSessionComplete} onBack={onBack} />;
  }
};


