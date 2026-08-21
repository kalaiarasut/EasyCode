import React from 'react';
import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
  Button,
  Container,
  Hr,
} from '@react-email/components';

interface VerificationEmailProps {
  username: string;
  otp: string;
  verifyUrl?: string;
}

export default function VerificationEmail({
  username,
  otp,
  verifyUrl = "http://localhost:3000/auth/confirm",
}: VerificationEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Confirm your EasyCode email</title>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Confirm your EasyCode account email ({otp})</Preview>
      
      <Section style={{ backgroundColor: '#FBF9F4', padding: '40px 0', fontFamily: 'Inter, sans-serif' }}>
        <Container
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #E8E4DB',
            padding: '36px',
            maxWidth: '520px',
            margin: '0 auto',
          }}
        >
          {/* Logo / Header */}
          <Section style={{ marginBottom: '24px' }}>
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#1C1B19', margin: '0' }}>
              EasyCode
            </Text>
          </Section>

          {/* Heading */}
          <Heading as="h2" style={{ fontSize: '22px', fontWeight: '600', color: '#1C1B19', margin: '0 0 16px 0' }}>
            Confirm your email address
          </Heading>

          <Text style={{ fontSize: '14px', color: '#524E48', lineHeight: '1.6', margin: '0 0 24px 0' }}>
            Hello <strong>{username}</strong>, thanks for signing up for EasyCode. Click the button below to confirm your email and log directly into your workspace.
          </Text>

          {/* 1-Click Verification Button */}
          <Section style={{ textAlign: 'center', margin: '28px 0' }}>
            <Button
              href={verifyUrl}
              style={{
                backgroundColor: '#1C1B19',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                padding: '12px 28px',
                borderRadius: '10px',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Confirm Email & Sign In
            </Button>
          </Section>

          <Text style={{ fontSize: '13px', color: '#7A756C', margin: '20px 0 8px 0', textAlign: 'center' }}>
            Or enter this 6-digit verification code manually:
          </Text>

          {/* 6-Digit OTP Box */}
          <Section style={{ textAlign: 'center', margin: '0 0 24px 0' }}>
            <Text
              style={{
                fontFamily: 'monospace',
                fontSize: '26px',
                fontWeight: '700',
                letterSpacing: '6px',
                color: '#1C1B19',
                backgroundColor: '#F5F2EB',
                padding: '12px 24px',
                borderRadius: '10px',
                display: 'inline-block',
                margin: '0',
                border: '1px solid #E8E4DB',
              }}
            >
              {otp}
            </Text>
          </Section>

          <Hr style={{ borderColor: '#E8E4DB', margin: '28px 0 20px 0' }} />

          <Text style={{ fontSize: '12px', color: '#8C877D', lineHeight: '1.5', margin: '0' }}>
            This verification link and code will expire in 15 minutes. If you did not create an account with EasyCode, please safely ignore this email.
          </Text>
        </Container>
      </Section>
    </Html>
  );
}
