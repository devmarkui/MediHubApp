import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily } from '@/theme';
import { initials } from '@/utils/format';

type Props = {
  name?: string | null;
  uri?: string | null;
  size?: number;
  background?: string;
  foreground?: string;
};

export function Avatar({
  name,
  uri,
  size = 38,
  background = colors.brandTeal,
  foreground = colors.deepTeal,
}: Props): React.ReactElement {
  if (uri) {
    return <Image source={{ uri }} style={[styles.image, { width: size, height: size, borderRadius: 12 }]} />;
  }
  return (
    <View style={[styles.fallback, { width: size, height: size, backgroundColor: background, borderRadius: 12 }]}>
      <Text style={[styles.text, { color: foreground }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: colors.surfaceTint },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: fontFamily.medium, fontSize: 13 },
});
