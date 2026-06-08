import { useEffect, useRef } from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, fontFamily } from '@/theme';

export const ITEM_HEIGHT = 44;
export const VISIBLE_ROWS = 5; // odd so one row sits centred
const PAD_ROWS = Math.floor(VISIBLE_ROWS / 2);

type Props = {
  items: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  width?: number;
  /** Right-aligned (e.g. the day column) vs centred text. */
  align?: 'center' | 'right' | 'left';
};

/**
 * A single iOS-style scroll wheel: snaps to {@link ITEM_HEIGHT}, fades and
 * shrinks rows by their distance from the centred selection. Animations run on
 * the native driver for smooth deceleration.
 */
export function WheelPicker({
  items,
  selectedIndex,
  onChange,
  width = 90,
  align = 'center',
}: Props): React.ReactElement {
  const scrollRef = useRef<Animated.FlatList<string>>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Keep the wheel aligned when the selection changes from outside (e.g. the day
  // column re-clamping after the month changes).
  useEffect(() => {
    const id = setTimeout(() => {
      scrollRef.current?.scrollToOffset({ offset: selectedIndex * ITEM_HEIGHT, animated: false });
    }, 0);
    return () => clearTimeout(id);
  }, [selectedIndex, items.length]);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    if (clamped !== selectedIndex) onChange(clamped);
  };

  return (
    <View style={[styles.column, { width, height: ITEM_HEIGHT * VISIBLE_ROWS }]}>
      <Animated.FlatList
        ref={scrollRef}
        data={items}
        keyExtractor={(_, i) => String(i)}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * PAD_ROWS }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        onMomentumScrollEnd={onMomentumEnd}
        renderItem={({ item, index }) => {
          const center = index * ITEM_HEIGHT;
          const inputRange = [
            center - 2 * ITEM_HEIGHT,
            center - ITEM_HEIGHT,
            center,
            center + ITEM_HEIGHT,
            center + 2 * ITEM_HEIGHT,
          ];
          const opacity = scrollY.interpolate({
            inputRange,
            outputRange: [0.18, 0.45, 1, 0.45, 0.18],
            extrapolate: 'clamp',
          });
          const scale = scrollY.interpolate({
            inputRange,
            outputRange: [0.78, 0.88, 1, 0.88, 0.78],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View style={[styles.item, { opacity, transform: [{ scale }] }]}>
              <Text
                style={[
                  styles.itemText,
                  align === 'right' && styles.right,
                  align === 'left' && styles.left,
                ]}
                numberOfLines={1}
              >
                {item}
              </Text>
            </Animated.View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  column: { overflow: 'hidden' },
  item: { height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  itemText: {
    fontFamily: fontFamily.medium,
    fontSize: 20,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  right: { width: '100%', textAlign: 'right', paddingRight: 6 },
  left: { width: '100%', textAlign: 'left', paddingLeft: 6 },
});
