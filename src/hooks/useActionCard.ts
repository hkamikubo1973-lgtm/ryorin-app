// src/hooks/useActionCard.ts
import { useEffect, useState } from 'react';
import { getTodayActionCard, TodayActionCard } from '../utils/getTodayActionCard';
import { DutyConfig } from '../types/dutyModel';

type ActionCardState = {
  card: TodayActionCard | null;
  status: 'idle' | 'loading' | 'ready';
};

export const useActionCard = (dutyConfig: DutyConfig) => {
  const [state, setState] = useState<ActionCardState>({
    card: null,
    status: 'idle',
  });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setState({ card: null, status: 'loading' });

      try {
        const card = await getTodayActionCard(dutyConfig);
        if (mounted) {
          setState({ card, status: 'ready' });
        }
      } catch (e) {
        console.warn('[useActionCard] failed', e);
        if (mounted) {
          setState({ card: null, status: 'idle' });
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [dutyConfig]);

  return {
    card: state.card,
    status: state.status,
  };
};
