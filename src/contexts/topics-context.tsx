import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import type { ReactNode } from 'react';

interface ITopicProviderProps {
  index: number;
  children: ReactNode;
}

const MAX_PARALLEL_TOPICS = 10;

type Api = [any, ReturnType<typeof useState>[1]];

const metas = Array.from({ length: MAX_PARALLEL_TOPICS }, () => ({
  currentTopicId: '',
  refCount: 0,
  context: createContext<Api | undefined>(undefined)
}));

interface ITopicsProviderProps {
  children: ReactNode;
}
export function TopicsProvider(props: ITopicsProviderProps) {
  return <TopicProvider index={0}>{props.children}</TopicProvider>;
}

function TopicProvider(props: ITopicProviderProps) {
  const topicContext = metas[props.index]?.context;
  if (!topicContext) {
    console.log({ index: props.index });
    throw new Error('No meta found at index, this should not happen.');
  }

  const [state, setState] = useState<any>();

  const api: Api = useMemo(
    () => [
      // return initialStateUponClaim if has not yet done setState yet
      state,
      setState
    ],
    [state, setState]
  );

  return (
    <topicContext.Provider value={api}>
      {props.index < MAX_PARALLEL_TOPICS - 1 ? (
        <TopicProvider index={props.index + 1}>{props.children}</TopicProvider>
      ) : (
        props.children
      )}
    </topicContext.Provider>
  );
}

export function useTopic<T extends any>(topicId: string, initialState?: T) {
  let didJustClaim = false;
  let meta = metas.find(meta => meta.currentTopicId === topicId);
  if (!meta) {
    meta = metas.find(meta => meta.refCount === 0);
    if (!meta) {
      throw new Error(
        'More  parallel topics than iniitally thought. Increase MAX_PARALLEL_TOPICS.'
      );
    }
    didJustClaim = true;
    meta.refCount++;
    meta.currentTopicId = topicId;
  }

  const context = useContext(meta.context);
  if (context === undefined) {
    throw new Error('useTopic must be used within a TopicsProvider');
  }

  if (didJustClaim) {
    context[0] = initialState;
  }

  useEffect(function trackAndReuseTopicContext() {
    return () => {
      if (!meta) {
        throw new Error('how on earth does meta not exist here?');
      }

      meta.refCount--;
      if (meta.refCount === 0) {
        meta.currentTopicId = '';
      }
    };
  }, []);

  return context;
}
