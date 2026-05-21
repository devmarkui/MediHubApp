import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors, fontFamily, radius } from '@/theme';
import { formatTime } from '@/utils/format';

type Props = {
  day: string;
  monthShort: string;
  doctorName: string;
  specialization: string;
  time: string;
  onPress?: () => void;
};

export function UpcomingCard({
  day,
  monthShort,
  doctorName,
  specialization,
  time,
  onPress,
}: Props): React.ReactElement {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${doctorName} on ${monthShort} ${day} at ${formatTime(time)}`}
    >
      <Card padded={false} style={styles.card}>
        <View style={styles.row}>
          <View style={styles.dateBox}>
            <Text style={styles.month}>{monthShort.toUpperCase()}</Text>
            <Text style={styles.day}>{day}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.doctor}>{doctorName}</Text>
            <Text style={styles.sub}>{`${specialization} · ${formatTime(time)}`}</Text>
          </View>
          <ChevronRight size={18} color={colors.textTertiary} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center' },
  dateBox: {
    width: 46,
    height: 46,
    borderRadius: radius.button,
    backgroundColor: colors.mintTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  month: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.darkTeal, letterSpacing: 0.4 },
  day: { marginTop: 2, fontFamily: fontFamily.medium, fontSize: 16, color: colors.darkTeal, lineHeight: 16 },
  doctor: { fontFamily: fontFamily.medium, fontSize: 13, color: colors.textPrimary },
  sub: { marginTop: 3, fontFamily: fontFamily.regular, fontSize: 11, color: colors.textSecondary },
});
