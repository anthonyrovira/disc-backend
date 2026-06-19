import { Text, Button, Section } from '@react-email/components';
import BaseEmail from './components/BaseEmail';
import DiscHeader from './components/DiscHeader';

interface InvitationAcceptedProps {
  managerName: string;
  invitedUserEmail: string;
  organizationName: string;
  teamUrl: string;
}

const cardStyle: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  padding: '24px',
  marginBottom: '20px',
};

const titleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#0f172a',
  margin: '0 0 12px',
};

const textStyle: React.CSSProperties = {
  color: '#475569',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 8px',
};

const ctaContainer: React.CSSProperties = {
  textAlign: 'center',
  margin: '24px 0 0',
};

const ctaStyle: React.CSSProperties = {
  backgroundColor: '#8b5cf6',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  padding: '12px 28px',
  textDecoration: 'none',
};

export default function InvitationAcceptedEmail({
  managerName,
  invitedUserEmail,
  organizationName,
  teamUrl,
}: InvitationAcceptedProps) {
  return (
    <BaseEmail previewText={`${invitedUserEmail} a rejoint ${organizationName}`}>
      <DiscHeader />

      <Section style={cardStyle}>
        <Text style={titleStyle}>
          Une nouvelle recrue dans l'équipe
        </Text>

        <Text style={textStyle}>
          Bonjour {managerName},
        </Text>

        <Text style={textStyle}>
          <strong>{invitedUserEmail}</strong> a accepté votre invitation
          et rejoint l'équipe <strong>{organizationName}</strong> sur{' '}
          <strong>DISC.dev</strong>.
        </Text>

        <div style={ctaContainer}>
          <Button style={ctaStyle} href={teamUrl}>
            Voir l'équipe
          </Button>
        </div>
      </Section>
    </BaseEmail>
  );
}
