import { Text, Button, Section } from '@react-email/components';
import BaseEmail from './components/BaseEmail';
import DiscHeader from './components/DiscHeader';

interface TeamMemberInvitationProps {
  inviterName: string;
  organizationName: string;
  invitationUrl: string;
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
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  padding: '12px 28px',
  textDecoration: 'none',
};

export default function TeamMemberInvitationEmail({
  inviterName,
  organizationName,
  invitationUrl,
}: TeamMemberInvitationProps) {
  return (
    <BaseEmail previewText={`${inviterName} vous invite à rejoindre ${organizationName} sur DISC.dev`}>
      <DiscHeader />

      <Section style={cardStyle}>
        <Text style={titleStyle}>
          Invitation à rejoindre {organizationName}
        </Text>

        <Text style={textStyle}>
          Bonjour,
        </Text>

        <Text style={textStyle}>
          <strong>{inviterName}</strong> vous invite à rejoindre l'équipe{' '}
          <strong>{organizationName}</strong> sur{' '}
          <strong>DISC.dev</strong>.
        </Text>

        <Text style={{ ...textStyle, color: '#64748b' }}>
          DISC.dev vous permet de découvrir votre profil comportemental DISC
          et de collaborer plus efficacement avec votre équipe.
        </Text>

        <div style={ctaContainer}>
          <Button style={ctaStyle} href={invitationUrl}>
            Accepter l'invitation
          </Button>
        </div>
      </Section>
    </BaseEmail>
  );
}
