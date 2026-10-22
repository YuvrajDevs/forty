// Audio mode: the phone's own voice reads the passage, paragraph by paragraph, so it works offline.
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useRef, useState } from 'react';

export type AudioItem = { text: string; chapterIdx: number; paraIdx: number };

export function useAudio(items: AudioItem[], rate: number) {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const token = useRef(0);
  const itemsRef = useRef(items);
  const rateRef = useRef(rate);
  itemsRef.current = items;
  rateRef.current = rate;

  const speak = useCallback((i: number) => {
    const list = itemsRef.current;
    token.current += 1;
    const mine = token.current;
    Speech.stop();
    if (i >= list.length) {
      setPlaying(false);
      setIndex(0);
      return;
    }
    setIndex(i);
    setPlaying(true);
    Speech.speak(list[i].text, {
      language: 'en-US',
      rate: rateRef.current,
      // Only the latest request may move on, so pausing or skipping never triggers a stray advance.
      onDone: () => {
        if (token.current === mine) speak(i + 1);
      },
      onError: () => {
        if (token.current === mine) setPlaying(false);
      },
    });
  }, []);

  const pause = useCallback(() => {
    token.current += 1;
    Speech.stop();
    setPlaying(false);
  }, []);

  const close = useCallback(() => {
    pause();
    setOpen(false);
    setIndex(0);
  }, [pause]);

  const start = useCallback((from = 0) => {
    setOpen(true);
    speak(from);
  }, [speak]);

  // A new speed applies from the current paragraph.
  useEffect(() => {
    if (playing) speak(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rate]);

  useEffect(() => () => {
    token.current += 1;
    Speech.stop();
  }, []);

  return {
    open,
    playing,
    index,
    current: open ? items[index] : undefined,
    start,
    pause,
    resume: () => speak(index),
    next: () => speak(Math.min(index + 1, items.length - 1)),
    prev: () => speak(Math.max(index - 1, 0)),
    close,
  };
}
