import React from 'react';
// @ts-ignore
import { Html, Head, Body, Container, Section, Img, Text, Button, Hr, Link } from "@react-email/components";
import { emailStyles as styles } from "./emailStyles.ts";

export default function IncompleteProfileEmail({
  firstName = 'Michael',
  url,  
  supportEmail = 'contact@trydigitalid.com',
  email,
}: {
  firstName?: string;
  url?: string;
  supportEmail?: string;
  email?: string;
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
                src="https://trydigitalid.com/digital-id-logo.png"
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
              <Text style={styles.h1}>Complete your Digital ID profile</Text>
              {/* {firstName && <Text style={styles.p}>{firstName},</Text>} */}
              <div style={{ paddingTop: 4 }} />
              <Text style={styles.p}>
                Your profile is almost complete! Please click the button below to finish your onboarding and activate your Digital ID.
              </Text>

              <div style={{ paddingTop: 24 }}>
                <Button href={url} style={styles.cta}>
                  Complete your profile
                </Button>
              </div>

              <div style={{ paddingTop: 24 }} />
              <Text style={styles.p}>
                If you have any questions or need help, please contact our support team at{' '}
                <Link href={`mailto:${supportEmail}`} style={styles.footerLink}>{supportEmail}</Link>.
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <div style={{ height: '24px' }} />
          <Section style={styles.footerWrap}>
            <Text style={styles.footerText}>
              Have questions or concerns? Reach out to us at{' '}
              <Link href="mailto:contact@trydigitalid.com" style={styles.footerLink}>
                xxx@email.com
              </Link>
              <br />
              If you no longer wish to receive emails from Digital ID,{' '}
              <Link  href={`https://trydigitalid.com/unsubscribe?email=${encodeURIComponent(email ?? '')}`} style={styles.footerLink}>
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
