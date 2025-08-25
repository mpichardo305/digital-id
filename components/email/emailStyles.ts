export const emailStyles = {
    body: {
      backgroundColor: '#F3F4F6', // light gray canvas (like Figma)
      margin: 0,
      padding: 24,
      fontFamily: 'Arial, Helvetica, sans-serif' as const,
      WebkitTextSizeAdjust: '100%',
      msTextSizeAdjust: '100%'
    },
    container: {
      maxWidth: '680px',
      padding: '40px autopx'
    },
    brandRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
    },
    brandText: {
      color: '#111827', // gray-900
      fontSize: '18px',
      fontWeight: 700,
      margin: 0,
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      padding: '40px 32px',
      border: '1px solid #E5E7EB', // subtle instead of dark bar
    },
    h1: {
      color: '#111827',
      fontSize: 22,
      fontWeight: 700,
      margin: '0 0 12px 0',
    },
    p: {
      color: '#4B5563', // gray-600
      fontSize: 15,
      lineHeight: '24px',
      margin: '0 0 16px 0',
    },
    cta: {
      display: 'inline-block',
      backgroundColor: '#000000',
      color: '#FFFFFF',
      textDecoration: 'none',
      borderRadius: 9999,
      padding: '12px 20px',
      fontWeight: 600,
      fontSize: 14,
    },
    footerWrap: {
      padding: '32px 8px 0 8px',
    },
    footerText: {
      color: '#6B7280', // gray-500
      fontSize: 12,
      lineHeight: '18px',
      textAlign: 'center' as const,
      margin: '16px 0 8px 0',
    },
    footerLink: {
      color: '#2563EB', // blue-600
      textDecoration: 'underline',
    },
    hr: {
      borderColor: '#E5E7EB',
      margin: '8px 0',
    },
    copy: {
      color: '#9CA3AF', // gray-400
      fontSize: 12,
      textAlign: 'center' as const,
      margin: 0,
    },
  };