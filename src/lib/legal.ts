// In-app legal text. Have these reviewed and add a real support contact before publishing.
export const SUPPORT_EMAIL = '';

export type LegalDoc = { id: 'privacy' | 'terms' | 'lock'; title: string; sections: { heading: string; body: string }[] };

export const LEGAL: LegalDoc[] = [
  {
    id: 'privacy',
    title: 'Privacy policy',
    sections: [
      { heading: 'Your data stays on your phone', body: 'FortyBible has no accounts and no server. Your answers, plan, reading history, streak and journal notes are stored only on this device. We cannot see them.' },
      { heading: 'What is stored', body: 'Your denomination, optional gender, phone-time answer, chosen apps, plan, chapters read, check-ins and notes. Denomination, gender and notes are sensitive, so they are never sent anywhere, never shared and never used for ads.' },
      { heading: 'No ads, no selling', body: 'There are no ads and no analytics in this version. We do not sell or share your data.' },
      { heading: 'Payments', body: 'Subscriptions are handled by Google Play. We never see your card details. Google tells the app whether your subscription is active.' },
      { heading: 'Permissions', body: 'Accessibility is used only to notice which app is open so the lock can ask you to read first. Display over other apps is used to show the reading prompt. Notifications are used for your daily reminder and a reminder before your trial ends. None of this information leaves your phone.' },
      { heading: 'Your control', body: 'You can export or delete everything at any time in Settings. Uninstalling the app also removes the data.' },
      { heading: 'Support', body: 'Not a replacement for care. FortyBible is not counselling, and it does not replace a pastor or professional help. If you are in crisis, please contact a local helpline or emergency service.' },
    ],
  },
  {
    id: 'terms',
    title: 'Terms of use',
    sections: [
      { heading: 'Using FortyBible', body: 'FortyBible helps you read the Bible by locking the apps you choose until you have read. You can change or remove the lock at any time, and emergency access always works.' },
      { heading: 'Subscription', body: 'FortyBible is a paid subscription with a 7-day free trial, billed weekly or yearly through Google Play. You will be billed only if you keep going after the trial. You can cancel at any time in Google Play. When a subscription ends, every lock is removed.' },
      { heading: 'Estimates', body: 'Reading times and finish dates are estimates based on average reading speed. They are a guide, not a promise.' },
      { heading: 'Scripture', body: 'The World English Bible, King James Version and Douay-Rheims (Challoner) texts in this app are in the public domain.' },
    ],
  },
  {
    id: 'lock',
    title: 'How the lock works',
    sections: [
      { heading: 'Accessibility service', body: 'FortyBible uses Android’s Accessibility Service for one purpose: to notice when one of the apps you chose comes to the front, so it can ask you to read first. It does not read, record or send what is on your screen, and it does not read passwords or messages.' },
      { heading: 'What it can see', body: 'Only the name of the app that is open. The list of apps you chose is stored on your phone.' },
      { heading: 'You are always in control', body: 'You can turn the Accessibility permission off in Android settings at any time, which removes the lock. Emergency access and Skip today are always available. Calls, messages, maps and emergency apps are never locked.' },
    ],
  },
];
