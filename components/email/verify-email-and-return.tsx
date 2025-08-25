import * as React from 'react';
import { Html, Head, Body, Container, Section, Img, Text, Button, Hr, Link } from '@react-email/components';
import { emailStyles as styles } from './emailStyles';

export default function VerifyEmailAndReturn({
  firstName = 'Michael',
  verifyUrl = 'https://digital-id-app.vercel.app/verify',
  supportEmail = 'support@email.com',
}: {
  firstName?: string;
  verifyUrl?: string;
  supportEmail?: string;
}) {
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
              <Text style={styles.h1}>Verify your Digital ID email</Text>

              <Text style={styles.p}>{firstName},</Text>
              <div style={{ paddingTop: 4 }} />
              <Text style={styles.p}>
                This is to confirm your identity and complete the verification process for your account.
                Please click the button below to verify your email:
              </Text>

              <div style={{ paddingTop: 24 }}>
                <Button href={verifyUrl} style={styles.cta}>
                  Verify email and return to form
                </Button>
              </div>

              <div style={{ paddingTop: 24 }} />
              <Text style={styles.p}>
                If you did not initiate this verification or have any concerns, please contact our support team
                immediately at <Link href={`mailto:${supportEmail}`} style={styles.footerLink}>{supportEmail}</Link>.
              </Text>
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