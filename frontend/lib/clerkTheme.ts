import { dark } from '@clerk/themes';

export const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: '#6366f1',
    colorBackground: '#0f172a',
    colorText: '#f8fafc',
    colorTextSecondary: '#cbd5e1',
    colorInputBackground: '#020617',
    colorInputText: '#f8fafc',
    borderRadius: '0.75rem',
  },
  elements: {
    card: 'bg-slate-900 border border-slate-800/80 shadow-2xl rounded-2xl p-6 backdrop-blur-xl',
    headerTitle: 'text-slate-100 font-extrabold text-xl tracking-tight',
    headerSubtitle: 'text-slate-300 text-xs mt-1 font-normal',
    socialButtonsBlockButton:
      'bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-100 font-semibold text-xs py-2.5 transition-all shadow-sm',
    socialButtonsBlockButtonText: 'text-slate-100 font-semibold text-xs',
    dividerLine: 'bg-slate-800',
    dividerText: 'text-slate-400 text-xs font-medium uppercase',
    formFieldLabel: 'text-slate-200 text-xs font-semibold mb-1.5 block',
    formFieldHintText: 'text-slate-400 text-xs',
    formFieldInput:
      'bg-slate-950 border border-slate-700/80 text-slate-100 text-sm rounded-xl py-2.5 px-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-500',
    formButtonPrimary:
      'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm py-3 rounded-xl shadow-lg shadow-indigo-600/25 transition-all active:scale-[0.98]',
    footer: 'bg-slate-950 border-t border-slate-800 text-slate-400 rounded-b-2xl py-3 px-4',
    footerActionText: 'text-slate-300 text-xs font-medium',
    footerActionLink: 'text-indigo-400 hover:text-indigo-300 font-bold text-xs underline-offset-4 hover:underline',
    identityPreviewText: 'text-slate-200 font-medium text-xs',
    identityPreviewEditButtonIcon: 'text-indigo-400',
    formHeaderTitle: 'text-slate-100 font-bold text-base',
    formHeaderSubtitle: 'text-slate-300 text-xs',
    userButtonPopoverCard: 'bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl text-slate-100',
    userButtonPopoverActionButton: 'hover:bg-slate-800 text-slate-200 text-xs font-medium',
    userButtonPopoverActionButtonText: 'text-slate-200 font-medium text-xs',
    userButtonPopoverFooter: 'hidden',
  },
};
