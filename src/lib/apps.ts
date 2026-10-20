// Popular distracting apps offered during onboarding. The lock module matches on package id.
// Calls, messages, maps and emergency apps are never offered (see PRD, "Never blocked").
export const LOCKABLE_APPS = [
  { id: 'com.instagram.android', name: 'Instagram' },
  { id: 'com.zhiliaoapp.musically', name: 'TikTok' },
  { id: 'com.google.android.youtube', name: 'YouTube' },
  { id: 'com.facebook.katana', name: 'Facebook' },
  { id: 'com.twitter.android', name: 'X' },
  { id: 'com.snapchat.android', name: 'Snapchat' },
  { id: 'com.reddit.frontpage', name: 'Reddit' },
  { id: 'com.instagram.barcelona', name: 'Threads' },
  { id: 'com.pinterest', name: 'Pinterest' },
  { id: 'com.netflix.mediaclient', name: 'Netflix' },
] as const;
