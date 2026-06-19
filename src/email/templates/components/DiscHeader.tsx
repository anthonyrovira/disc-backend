import { Section, Column, Img, Text } from '@react-email/components';

const LOGO_BASE64 =
  'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyOCIgaGVpZ2h0PSIyOCIgdmlld0JveD0iMCAwIDI4IDI4Ij48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHJ4PSIzIiBmaWxsPSIlMjNlZjQ0NDQiLz48cmVjdCB4PSIxNiIgeT0iMCIgd2lkdGg9IjEyIiBoZWlnaHQ9IjEyIiByeD0iMyIgZmlsbD0iJTIzZjU5ZTBiIi8+PHJlY3QgeD0iMCIgeT0iMTYiIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgcng9IjMiIGZpbGw9IiUyMzNiODJmNiIvPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjEyIiBoZWlnaHQ9IjEyIiByeD0iMyIgZmlsbD0iJTIzMjJjNTVlIi8+PC9zdmc+';

const stripeStyle: React.CSSProperties = {
  height: '4px',
  borderRadius: '2px',
  background:
    'linear-gradient(90deg, #ef4444 25%, #f59e0b 25% 50%, #22c55e 50% 75%, #3b82f6 75%)',
  marginBottom: '24px',
};

const logoTextStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#0f172a',
  margin: '0',
  lineHeight: '28px',
};

export default function DiscHeader() {
  return (
    <Section>
      <div style={stripeStyle} />
      <Section style={{ marginBottom: '20px' }}>
        <Column width={28} style={{ paddingRight: '8px' }}>
          <Img
            src={`data:image/svg+xml;base64,${LOGO_BASE64}`}
            alt="DISC.dev"
            width="28"
            height="28"
            style={{ display: 'block' }}
          />
        </Column>
        <Column>
          <Text style={logoTextStyle}>DISC.dev</Text>
        </Column>
      </Section>
    </Section>
  );
}
