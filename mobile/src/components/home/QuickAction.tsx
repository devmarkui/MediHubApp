import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, radius } from '@/theme';

type Props = {
  icon: ReactNode;
  label: string;
  background: string;
  onPress: () => void;
};

export function QuickAction({ icon, label, background, onPress }: Props): React.ReactElement {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [{ flex: 1, opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={[styles.tile, { backgroundColor: background }]}>{icon}</View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    aspectRatio: 1,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 6,
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
