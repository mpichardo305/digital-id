import * as React from 'react';
import {
  Html, Head, Body, Container, Section, Img, Text, Button, Hr, Link
} from '@react-email/components';

interface EmailTemplateProps {
    firstName: string;
  }

  export default function EmailTemplate({ firstName }: EmailTemplateProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Brand row */}
          <Section style={{ padding: '0 24px' }}>
            <Section style={styles.brandRow}>
                <Img
                src="https://digital-id-app.vercel.app/digital-id-logo.png"
                alt="Digital ID"
                width={36}
                height={36}
                style={{ display: 'block' }}
                />
                <div style={{ width: '16px' }} />
                <Text style={styles.brandText}>Digital ID</Text>
            </Section>
          </Section>

          {/* Card */}
          <Section style={{ padding: '0 24px' }}>
            <Section style={styles.card}>
                <Text style={styles.h1}>Welcome to Digital ID</Text>

                <Text style={styles.p}>{firstName},</Text>
                <div style={{ paddingTop: 4 }}></div>
                <Text style={styles.p}>
                🚀 We&apos;re absolutely thrilled to have you on board and introduce you to
                the exciting world of seamless Digital IDs.
                </Text>

                <Text style={styles.p}>
                We&apos;re working on collecting more information to convert your badge; we&apos;ll
                email you as soon as it&apos;s ready!
                </Text>

                <div style={{ paddingTop: 24 }}>
                <Button href="https://digital-id-app.vercel.app/share" style={styles.cta}>
                    Share Digital ID
                </Button>
                </div>
            </Section>
          </Section>

          {/* Footer */}
          <div style={{ height: '24px' }} />
          <Section style={styles.footerWrap}>
            <Text style={styles.footerText}>
              Have questions or concerns? Reach out to us at{' '}
              <Link href="mailto:xxx@email.com" style={styles.footerLink}>
                xxx@email.com
              </Link>
              <br />
              If you no longer wish to receive emails from Digital ID,{' '}
              <Link href="https://yourapp.example.com/unsubscribe" style={styles.footerLink}>
                unsubscribe
              </Link>{' '}here.
            </Text>
            <Hr style={styles.hr} />
            <Text style={styles.copy}>Copyright © 2025 Digital ID. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
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