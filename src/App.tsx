import './App.css';

import React from 'react';

import { TopicsProvider, useTopic } from './contexts/topics-context';

function App() {
  return (
    <TopicsProvider>
      <ConsumerOne />
      <ConsumerTwo />
    </TopicsProvider>
  );
}

function ConsumerOne() {
  const [topicData, setTopicData] = useTopic<{ foo: Boolean; count: number }>(
    'one',
    { foo: true, count: 0 }
  );

  return (
    <div>
      I am consumer one.
      <button
        onClick={() =>
          setTopicData({
            ...topicData,
            count: topicData.count + 1
          })
        }
      >
        Increment
      </button>
      <pre>{JSON.stringify(topicData, null, 2)}</pre>
    </div>
  );
}

function ConsumerTwo() {
  const [topicData, setTopicData] = useTopic<{ foo: Boolean; count: number }>(
    'one',
    { bar: true, count: 0 }
  );

  return (
    <div>
      I am consumer two.
      <button
        onClick={() =>
          setTopicData({
            ...topicData,
            count: topicData.count + 1
          })
        }
      >
        Increment
      </button>
      <pre>{JSON.stringify(topicData, null, 2)}</pre>
    </div>
  );
}

export default App;
