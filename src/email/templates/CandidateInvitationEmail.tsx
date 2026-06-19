import { Text, Button, Section } from '@react-email/components';
import BaseEmail from './components/BaseEmail';
import DiscHeader from './components/DiscHeader';

interface CandidateInvitationProps {
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
  backgroundColor: '#10b981',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  padding: '12px 28px',
  textDecoration: 'none',
};

export default function CandidateInvitationEmail({
  inviterName,
  organizationName,
  invitationUrl,
}: CandidateInvitationProps) {
  return (
    <BaseEmail previewText={`Test DISC — ${organizationName} vous sollicite`}>
      <DiscHeader />

      <Section style={cardStyle}>
        <Text style={titleStyle}>
          Test DISC — {organizationName} vous sollicite
        </Text>

        <Text style={textStyle}>
          Bonjour,
        </Text>

        <Text style={textStyle}>
          Dans le cadre de votre processus de recrutement,{' '}
          <strong>{organizationName}</strong> vous invite à passer le test
          de personnalité <strong>DISC</strong> sur{' '}
          <strong>DISC.dev</strong>.
        </Text>

        <Text style={{ ...textStyle, color: '#64748b' }}>
          Ce test vous aidera à mieux comprendre votre profil
          comportemental et à identifier vos forces naturelles en milieu
          professionnel.
        </Text>

        <div style={ctaContainer}>
          <Button style={ctaStyle} href={invitationUrl}>
            Commencer le test
          </Button>
        </div>
      </Section>
    </BaseEmail>
  );
}
