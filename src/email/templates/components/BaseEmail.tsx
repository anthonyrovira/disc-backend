import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
  Hr,
} from '@react-email/components';

interface BaseEmailProps {
  previewText: string;
  children: React.ReactNode;
}

const mainStyle: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const containerStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 24px',
  maxWidth: '600px',
  borderRadius: '8px',
};

const headerStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#1a1a2e',
  textAlign: 'center',
  margin: '0 0 8px',
};

const footerStyle: React.CSSProperties = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center',
};

export default function BaseEmail({ previewText, children }: BaseEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          <Text style={headerStyle}>DISC.dev</Text>
          <Hr />
          {children}
          <Hr />
          <Text style={footerStyle}>
            Cet email a été envoyé automatiquement depuis DISC.dev.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
