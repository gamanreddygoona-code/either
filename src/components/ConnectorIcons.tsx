import React from "react";

export const EitherLogo: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 9.5C5.5 8.2 8.8 8.1 11.8 9.3C13.2 9.9 14.5 10.7 15.8 11.6C18.2 8.8 21.5 7.1 24 6.5C22.6 9.4 20.3 11.8 17.5 13.2C18.5 14.2 19.8 15.1 21.2 15.7C19.2 16.3 17 16.1 15.2 15.1C13.8 14.3 12.6 13.2 11.4 12.2C9.5 13.9 6.8 14.9 4 14.9C5.8 13.8 7.3 12.2 8.3 10.3C6.3 9.8 4.3 9.5 2.5 9.5Z" />
  </svg>
);

export const GoogleGIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

export const GmailIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.272H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.548l8.073-6.055C21.691 2.279 24 3.434 24 5.457z" fill="#EA4335" />
    <path d="M0 5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.548 5.455 4.64 0 8.73V5.457z" fill="#4285F4" />
    <path d="M24 5.457c0-2.023-2.309-3.178-3.927-1.964L12 9.548l6.545-4.908L24 8.73V5.457z" fill="#34A853" />
    <path d="M12 9.548L3.927 3.493 5.455 4.64 12 9.548l6.545-4.908 1.528-1.147L12 9.548z" fill="#FBBC05" />
  </svg>
);

export const GoogleDriveIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.2 2L15.8 2L23.4 15L15.8 15L8.2 2Z" fill="#FFBA00" />
    <path d="M0.6 15L8.2 2L12 8.6L4.4 21.6L0.6 15Z" fill="#0066DA" />
    <path d="M4.4 21.6L19.6 21.6L23.4 15L8.2 15L4.4 21.6Z" fill="#00AC47" />
  </svg>
);

export const GoogleCalendarIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="20" height="19" rx="3.5" fill="#4285F4" />
    <path d="M2 8H22V19.5C22 20.88 20.88 22 19.5 22H4.5C3.12 22 2 20.88 2 19.5V8Z" fill="#FFFFFF" />
    <rect x="6" y="1" width="3" height="4" rx="1.5" fill="#EA4335" />
    <rect x="15" y="1" width="3" height="4" rx="1.5" fill="#EA4335" />
    <rect x="2" y="8" width="20" height="1" fill="#E2E8F0" />
    <text x="12" y="17.5" fill="#1E293B" fontSize="8.5" fontWeight="800" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif">31</text>
  </svg>
);

export const GitHubIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017C2 16.447 4.87 20.2 8.84 21.528C9.34 21.62 9.52 21.312 9.52 21.045C9.52 20.806 9.51 20.02 9.51 19.18C6.73 19.784 6.14 17.842 6.14 17.842C5.68 16.674 5.03 16.362 5.03 16.362C4.12 15.742 5.1 15.754 5.1 15.754C6.1 15.824 6.63 16.786 6.63 16.786C7.52 18.314 8.97 17.873 9.54 17.616C9.63 16.971 9.89 16.531 10.17 16.284C7.95 16.033 5.62 15.176 5.62 11.353C5.62 10.264 6.01 9.375 6.65 8.679C6.55 8.427 6.2 7.411 6.75 6.052C6.75 6.052 7.59 5.782 9.5 7.076C10.3 6.853 11.15 6.742 12 6.738C12.85 6.742 13.7 6.853 14.5 7.076C16.41 5.782 17.25 6.052 17.25 6.052C17.8 7.411 17.45 8.427 17.35 8.679C17.99 9.375 18.38 10.264 18.38 11.353C18.38 15.186 16.04 16.03 13.81 16.276C14.17 16.586 14.49 17.2 14.49 18.147C14.49 19.508 14.48 20.604 14.48 20.938C14.48 21.209 14.66 21.522 15.17 21.42C19.14 20.089 22 16.34 22 12.017C22 6.484 17.522 2 12 2Z" />
  </svg>
);

export const NotionIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="4.5" fill="#000000" />
    <path d="M6.5 6.5L15 6.5L17.5 8.8V17.5L15 17.5L8.5 8.8V17.5H6.5V6.5Z" fill="#FFFFFF" />
    <path d="M15 6.5V8.8H17.5" fill="#E2E8F0" />
  </svg>
);

export const SlackIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52-2.523 2.52 2.52 0 0 1 2.52-2.52h2.52v2.52a2.52 2.52 0 0 1-2.52 2.523zm1.264 0a2.528 2.528 0 0 1 2.523-2.523 2.52 2.52 0 0 1 2.52 2.523v6.313A2.528 2.528 0 0 1 8.829 24a2.52 2.52 0 0 1-2.523-2.522v-6.313z" fill="#E01E5A" />
    <path d="M8.829 5.042a2.528 2.528 0 0 1-2.523-2.52A2.52 2.52 0 0 1 8.829 0h2.52v2.522a2.52 2.52 0 0 1-2.52 2.52zm0 1.264a2.528 2.528 0 0 1 2.52-2.52 2.52 2.52 0 0 1 2.523 2.52v2.52H7.56a2.528 2.528 0 0 1-2.52-2.52 2.52 2.52 0 0 1 2.52-2.52h1.269z" fill="#36C5F0" />
    <path d="M18.958 8.835a2.528 2.528 0 0 1 2.522 2.52 2.52 2.52 0 0 1-2.522 2.523h-2.52V11.355a2.52 2.52 0 0 1 2.52-2.52zm-1.264 0a2.528 2.528 0 0 1-2.523 2.52 2.52 2.52 0 0 1-2.52-2.52V2.522A2.528 2.528 0 0 1 15.171 0a2.52 2.52 0 0 1 2.523 2.522v6.313z" fill="#2EB67D" />
    <path d="M15.171 18.958a2.528 2.528 0 0 1 2.523 2.522A2.52 2.52 0 0 1 15.171 24h-2.52v-2.52a2.52 2.52 0 0 1 2.52-2.522zm0-1.264a2.528 2.528 0 0 1-2.52 2.523 2.52 2.52 0 0 1-2.523-2.523v-2.52h6.312a2.528 2.528 0 0 1 2.523 2.52 2.52 2.52 0 0 1-2.523 2.52h-3.792z" fill="#ECB22E" />
  </svg>
);

export const HuggingFaceIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10.5" fill="#FFD21E" />
    <ellipse cx="8.5" cy="10" rx="1.3" ry="1.7" fill="#1E293B" />
    <ellipse cx="15.5" cy="10" rx="1.3" ry="1.7" fill="#1E293B" />
    <path d="M8 13.8C9.2 16.2 14.8 16.2 16 13.8" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
    <path d="M4.5 12C3.2 13.5 3.2 15.5 4.8 16.5" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M19.5 12C20.8 13.5 20.8 15.5 19.2 16.5" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const FirebaseIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.89 15.67L6.25 1.05a.68.68 0 0 1 1.28-.15l3.22 6.04L3.89 15.67z" fill="#FFA000" />
    <path d="M14.28 9.07l2.12-4.04a.68.68 0 0 1 1.24.1L20.1 15.67l-5.82-6.6z" fill="#FFCA28" />
    <path d="M3.89 15.67L12 22.95l8.11-7.28L14.28 9.07 3.89 15.67z" fill="#F57C00" />
  </svg>
);

export const ServerIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="20" height="7" rx="2" fill="#0F172A" stroke="#334155" />
    <rect x="2" y="14" width="20" height="7" rx="2" fill="#0F172A" stroke="#334155" />
    <circle cx="6" cy="6.5" r="1" fill="#10B981" />
    <circle cx="9" cy="6.5" r="0.75" fill="#64748B" />
    <line x1="14" y1="6.5" x2="18" y2="6.5" stroke="#475569" strokeWidth="1.5" />
    <circle cx="6" cy="17.5" r="1" fill="#10B981" />
    <circle cx="9" cy="17.5" r="0.75" fill="#64748B" />
    <line x1="14" y1="17.5" x2="18" y2="17.5" stroke="#475569" strokeWidth="1.5" />
  </svg>
);

export const TradingDeskIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 17L9 11L13 15L21 7" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 7H21V12" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="5" y="12" width="2" height="6" fill="#10B981" rx="0.5" />
    <rect x="11" y="9" width="2" height="9" fill="#10B981" rx="0.5" />
    <rect x="17" y="5" width="2" height="13" fill="#10B981" rx="0.5" />
  </svg>
);

export const DiscordIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#5865F2" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.3 4.4C18.8 3.7 17.2 3.2 15.5 3C15.3 3.4 15.1 3.8 14.9 4.3C13.1 4 11.3 4 9.5 4.3C9.3 3.8 9.1 3.4 8.9 3C7.2 3.2 5.6 3.7 4.1 4.4C1.2 8.7 0.4 12.9 0.8 17C2.7 18.4 4.5 19.3 6.3 19.8C6.7 19.2 7.1 18.6 7.4 18C6.7 17.7 6.1 17.4 5.5 17C5.7 16.9 5.8 16.7 6 16.6C9.6 18.2 13.5 18.2 17.1 16.6C17.3 16.7 17.4 16.9 17.6 17C17 17.4 16.4 17.7 15.7 18C16 18.6 16.4 19.2 16.8 19.8C18.6 19.3 20.4 18.4 22.3 17C22.8 12.2 21.6 8 20.3 4.4ZM8.5 14.5C7.4 14.5 6.5 13.5 6.5 12.3C6.5 11.1 7.4 10.1 8.5 10.1C9.6 10.1 10.5 11.1 10.5 12.3C10.5 13.5 9.6 14.5 8.5 14.5ZM15.5 14.5C14.4 14.5 13.5 13.5 13.5 12.3C13.5 11.1 14.4 10.1 15.5 10.1C16.6 10.1 17.5 11.1 17.5 12.3C17.5 13.5 16.6 14.5 15.5 14.5Z" />
  </svg>
);

export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#25D366" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

export const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5.5" fill="url(#ig-grad-new)" />
    <circle cx="12" cy="12" r="4.2" stroke="#FFFFFF" strokeWidth="2" />
    <circle cx="17.2" cy="6.8" r="1.2" fill="#FFFFFF" />
    <defs>
      <radialGradient id="ig-grad-new" cx="0.2" cy="1.0" r="1.3">
        <stop offset="0%" stopColor="#FFDC80" />
        <stop offset="30%" stopColor="#F77737" />
        <stop offset="50%" stopColor="#FD1D1D" />
        <stop offset="75%" stopColor="#E1306C" />
        <stop offset="100%" stopColor="#C13584" />
      </radialGradient>
    </defs>
  </svg>
);

export const FacebookIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="11" fill="#1877F2" />
    <path d="M14.5 12H12.5V19H9.5V12H8V9.5H9.5V7.8C9.5 6.3 10.4 5 12.8 5H15V7.5H13.6C12.9 7.5 12.5 7.8 12.5 8.4V9.5H15L14.5 12Z" fill="#FFFFFF" />
  </svg>
);

export const DropboxIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#0061FF" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2L0 6.5L6 11L12 6.5L6 2ZM18 2L12 6.5L18 11L24 6.5L18 2ZM0 15.5L6 20L12 15.5L6 11L0 15.5ZM24 15.5L18 11L12 15.5L18 20L24 15.5ZM6 21.5L12 17.5L18 21.5L12 24L6 21.5Z" />
  </svg>
);

export const LinearIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" fill="#5E6AD2" />
    <path d="M7 16L16 7M9 17L17 9M6 13L13 6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const AsanaIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="7" r="4.2" fill="#F06A6A" />
    <circle cx="6.2" cy="16.8" r="4.2" fill="#F06A6A" />
    <circle cx="17.8" cy="16.8" r="4.2" fill="#F06A6A" />
  </svg>
);

export const ZapierIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="4.5" fill="#FF4A00" />
    <path d="M12 5V19M5 12H19M7 7L17 17M17 7L7 17" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const StripeIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" fill="#635BFF" />
    <path d="M13.5 10.2C13.5 9.4 12.8 8.9 11.7 8.9C10.3 8.9 9.1 9.4 8.2 9.9L7.5 7.6C8.7 7 10.3 6.6 11.9 6.6C14.8 6.6 16.7 8.1 16.7 10.5C16.7 14.1 11.7 13.6 11.7 15.3C11.7 16.3 12.6 16.8 13.9 16.8C15.4 16.8 16.8 16.2 17.7 15.6L18.4 17.9C17.2 18.6 15.4 19.1 13.6 19.1C10.5 19.1 8.5 17.6 8.5 15.1C8.5 11.4 13.5 12 13.5 10.2Z" fill="#FFFFFF" />
  </svg>
);

export const FigmaIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" fill="#1E1E1E" />
    <path d="M8 12C8 10.9 8.9 10 10 10H12V14H10C8.9 14 8 13.1 8 12Z" fill="#0ACF83" />
    <path d="M12 6H10C8.9 6 8 6.9 8 8C8 9.1 8.9 10 10 10H12V6Z" fill="#F24E1E" />
    <path d="M12 6H14C15.1 6 16 6.9 16 8C16 9.1 15.1 10 14 10H12V6Z" fill="#FF7262" />
    <path d="M12 10H14C15.1 10 16 10.9 16 12C16 13.1 15.1 14 14 14H12V10Z" fill="#1ABCFE" />
    <path d="M8 16C8 14.9 8.9 14 10 14H12V16C12 17.1 11.1 18 10 18C8.9 18 8 17.1 8 16Z" fill="#A259FF" />
  </svg>
);

export const JiraIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" fill="#0052CC" />
    <path d="M12 4L7 9L12 14L17 9L12 4Z" fill="#FFFFFF" fillOpacity="0.8" />
    <path d="M12 10L7 15L12 20L17 15L12 10Z" fill="#FFFFFF" />
  </svg>
);

export const SupabaseIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" fill="#1C1C1C" />
    <path d="M12.9 3.5L5.5 13.2C5.1 13.7 5.5 14.5 6.1 14.5H11.5L10.8 20.5C10.7 21.1 11.4 21.5 11.9 21L18.8 11.8C19.2 11.3 18.8 10.5 18.2 10.5H13.2L13.9 4C14 3.4 13.4 3 12.9 3.5Z" fill="#3ECF8E" />
  </svg>
);

export const VercelIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" fill="#000000" />
    <path d="M12 6L18 17H6L12 6Z" fill="#FFFFFF" />
  </svg>
);

export const AirtableIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" fill="#FCB400" />
    <path d="M11.5 5.5L5 8.5L11.5 11.5L18 8.5L11.5 5.5Z" fill="#FFFFFF" />
    <path d="M5 11V16.5L11 19.5V14L5 11Z" fill="#FFFFFF" fillOpacity="0.8" />
    <path d="M18 11V16.5L12 19.5V14L18 11Z" fill="#FFFFFF" fillOpacity="0.6" />
  </svg>
);

export const HubSpotIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" fill="#FF7A59" />
    <path d="M15.5 10.5V8.2C16.4 7.8 17 6.9 17 6C17 4.9 16.1 4 15 4C13.9 4 13 4.9 13 6C13 6.9 13.6 7.8 14.5 8.2V10.5C13.8 10.8 13.2 11.4 12.8 12.1L9.7 10.3C9.8 9.9 9.8 9.6 9.8 9.2C9.8 7.8 8.7 6.7 7.3 6.7C5.9 6.7 4.8 7.8 4.8 9.2C4.8 10.6 5.9 11.7 7.3 11.7C8 11.7 8.6 11.4 9.1 11L12.1 12.8C12 13.2 12 13.6 12 14C12 15.7 13.3 17 15 17C16.7 17 18 15.7 18 14C18 12.3 16.9 11 15.5 10.5Z" fill="#FFFFFF" />
  </svg>
);

export const ShopifyIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" fill="#95BF47" />
    <path d="M15.5 6L14 6C14 5 13 4.2 12 4.2C11 4.2 10 5 10 6L8.5 6C8.2 6 8 6.2 8 6.5L6.5 17C6.5 17.5 7 18 7.5 18H16.5C17 18 17.5 17.5 17.5 17L16 6.5C16 6.2 15.8 6 15.5 6ZM12 5.5C12.5 5.5 13 5.8 13 6.2H11C11 5.8 11.5 5.5 12 5.5Z" fill="#FFFFFF" />
  </svg>
);

export const TrelloIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" fill="#0079BF" />
    <rect x="6" y="6" width="4.5" height="10" rx="1.5" fill="#FFFFFF" />
    <rect x="13.5" y="6" width="4.5" height="6.5" rx="1.5" fill="#FFFFFF" />
  </svg>
);

export const PostmanIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" fill="#FF6C37" />
    <circle cx="12" cy="12" r="6" stroke="#FFFFFF" strokeWidth="2" fill="none" />
    <path d="M12 9V12L14.5 14.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const AppIconRenderer: React.FC<{ iconName: string; className?: string }> = ({ iconName, className = "w-4 h-4" }) => {
  switch (iconName.toLowerCase()) {
    case "google":
    case "google-g": return <GoogleGIcon className={className} />;
    case "gmail": return <GmailIcon className={className} />;
    case "drive":
    case "gdrive": return <GoogleDriveIcon className={className} />;
    case "calendar":
    case "gcalendar": return <GoogleCalendarIcon className={className} />;
    case "github": return <GitHubIcon className={className} />;
    case "notion": return <NotionIcon className={className} />;
    case "slack": return <SlackIcon className={className} />;
    case "huggingface":
    case "hf": return <HuggingFaceIcon className={className} />;
    case "firebase": return <FirebaseIcon className={className} />;
    case "server":
    case "servers": return <ServerIcon className={className} />;
    case "trading":
    case "trading-desk": return <TradingDeskIcon className={className} />;
    case "whatsapp": return <WhatsAppIcon className={className} />;
    case "instagram": return <InstagramIcon className={className} />;
    case "facebook":
    case "meta": return <FacebookIcon className={className} />;
    case "discord": return <DiscordIcon className={className} />;
    case "linear": return <LinearIcon className={className} />;
    case "asana": return <AsanaIcon className={className} />;
    case "dropbox": return <DropboxIcon className={className} />;
    case "zapier": return <ZapierIcon className={className} />;
    case "stripe": return <StripeIcon className={className} />;
    case "figma": return <FigmaIcon className={className} />;
    case "jira": return <JiraIcon className={className} />;
    case "supabase": return <SupabaseIcon className={className} />;
    case "vercel": return <VercelIcon className={className} />;
    case "airtable": return <AirtableIcon className={className} />;
    case "hubspot": return <HubSpotIcon className={className} />;
    case "shopify": return <ShopifyIcon className={className} />;
    case "trello": return <TrelloIcon className={className} />;
    case "postman": return <PostmanIcon className={className} />;
    default: return <EitherLogo className={className} />;
  }
};

