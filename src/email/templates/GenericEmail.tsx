import { Text, Button } from '@react-email/components';
import BaseEmail from './components/BaseEmail';

interface GenericEmailProps {
  title: string;
  content: string;
  ctaText?: string;
  ctaUrl?: string;
}

const titleStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#1a1a2e',
  margin: '16px 0 8px',
};

const contentStyle: React.CSSProperties = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '22px',
  whiteSpace: 'pre-wrap',
};

const buttonContainerStyle: React.CSSProperties = {
  textAlign: 'center',
  margin: '24px 0',
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#5469d4',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  padding: '12px 24px',
  textDecoration: 'none',
};

export default function GenericEmail({
  title,
  content,
  ctaText,
  ctaUrl,
}: GenericEmailProps) {
  return (
    <BaseEmail previewText={title}>
      <Text style={titleStyle}>{title}</Text>
      <Text style={contentStyle}>{content}</Text>
      {ctaText && ctaUrl && (
        <div style={buttonContainerStyle}>
          <Button style={buttonStyle} href={ctaUrl}>
            {ctaText}
          </Button>
        </div>
      )}
    </BaseEmail>
  );
}
