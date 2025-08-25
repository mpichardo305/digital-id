import * as React from 'react';
import {
  Html, Head, Body, Container, Section, Img, Text, Button, Hr, Link
} from '@react-email/components';
import { emailStyles as styles } from './emailStyles';

interface EmailTemplateProps {
  firstName: string;
}

  export default function WelcomeEmail({ firstName }: EmailTemplateProps) {
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