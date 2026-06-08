import { format } from 'date-fns';
import { Calendar } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, radius, spacing } from '@/theme';

import { ITEM_HEIGHT, VISIBLE_ROWS, WheelPicker } from './WheelPicker';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type Props = {
  label?: string;
  /** Stored value as a date-only ISO string: `yyyy-MM-dd`. */
  value?: string;
  /** Emits a date-only ISO string (`yyyy-MM-dd`). */
  onChange: (iso: string) => void;
  error?: string;
  placeholder?: string;
  /** Oldest selectable age in years. Defaults to 120. */
  maxAgeYears?: number;
  /** Show "Age: N years" under the field when a date is set. */
  showAge?: boolean;
};

function isoToDate(iso?: string): Date | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function calcAge(dob: Date): number {
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age;
}

export function DatePicker({
  label,
  value,
  onChange,
  error,
  placeholder = 'Select Date of Birth',
  maxAgeYears = 120,
  showAge = true,
}: Props): React.ReactElement {
  const [open, setOpen] = useState(false);
  const selected = isoToDate(value);

  const currentYear = new Date().getFullYear();
  // Newest year first so "today" sits at the top of the wheel.
  const years = useMemo(
    () => Array.from({ length: maxAgeYears + 1 }, (_, i) => currentYear - i),
    [currentYear, maxAgeYears],
  );

  // Draft wheel state — only pushed to the parent on "Done".
  const initial = selected ?? new Date(currentYear - 20, 0, 1);
  const [year, setYear] = useState(initial.getFullYear());
  const [monthIndex, setMonthIndex] = useState(initial.getMonth());
  const [day, setDay] = useState(initial.getDate());

  const maxDay = daysInMonth(year, monthIndex);
  const safeDay = Math.min(day, maxDay);
  const days = useMemo(
    () => Array.from({ length: maxDay }, (_, i) => pad(i + 1)),
    [maxDay],
  );

  const openPicker = (): void => {
    const base = selected ?? new Date(currentYear - 20, 0, 1);
    setYear(base.getFullYear());
    setMonthIndex(base.getMonth());
    setDay(base.getDate());
    setOpen(true);
  };

  const confirm = (): void => {
    onChange(`${year}-${pad(monthIndex + 1)}-${pad(safeDay)}`);
    setOpen(false);
  };

  const display = selected ? format(selected, 'd MMMM yyyy') : placeholder;
  const age = showAge && selected ? calcAge(selected) : null;

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Pressable
        onPress={openPicker}
        style={[styles.field, error ? styles.fieldError : selected ? styles.fieldValid : null]}
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
        accessibilityHint="Opens a date wheel to pick a date of birth"
        accessibilityValue={selected ? { text: format(selected, 'd MMMM yyyy') } : undefined}
        hitSlop={6}
      >
        <Text style={[styles.value, !selected && styles.placeholder]}>{display}</Text>
        <Calendar size={20} color={colors.darkTeal} />
      </Pressable>

      {age !== null ? <Text style={styles.age}>{`Age: ${age} years`}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetBar}>
            <Pressable onPress={() => setOpen(false)} hitSlop={8} accessibilityRole="button">
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
            <Text style={styles.sheetTitle}>{label ?? 'Date of birth'}</Text>
            <Pressable onPress={confirm} hitSlop={8} accessibilityRole="button">
              <Text style={styles.done}>Done</Text>
            </Pressable>
          </View>

          <View style={styles.wheels}>
            {/* Centre selection band behind the wheels. */}
            <View pointerEvents="none" style={styles.selectionBand} />

            <WheelPicker
              items={days}
              selectedIndex={safeDay - 1}
              onChange={(i) => setDay(i + 1)}
              width={70}
            />
            <WheelPicker
              items={MONTHS}
              selectedIndex={monthIndex}
              onChange={setMonthIndex}
              width={150}
            />
            <WheelPicker
              items={years.map(String)}
              selectedIndex={Math.max(0, years.indexOf(year))}
              onChange={(i) => setYear(years[i] ?? currentYear)}
              width={90}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
  },
  field: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.button,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  fieldValid: { borderColor: colors.darkTeal },
  fieldError: { borderColor: colors.danger },
  value: { fontFamily: fontFamily.regular, fontSize: 14, color: colors.textPrimary },
  placeholder: { color: colors.textTertiary },
  age: {
    marginTop: spacing.xxs,
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.darkTeal,
  },
  error: {
    marginTop: spacing.xxs,
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.danger,
  },

  backdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.35)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.hero,
    borderTopRightRadius: radius.hero,
    paddingBottom: spacing.xxl,
    // Soft shadow lifting the sheet off the backdrop.
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  sheetBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sheetTitle: { fontFamily: fontFamily.medium, fontSize: 15, color: colors.textPrimary },
  cancel: { fontFamily: fontFamily.medium, fontSize: 15, color: colors.textSecondary },
  done: { fontFamily: fontFamily.medium, fontSize: 15, color: colors.darkTeal },
  wheels: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.md,
    height: ITEM_HEIGHT * VISIBLE_ROWS + spacing.md,
  },
  selectionBand: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    top: spacing.md + ITEM_HEIGHT * 2,
    height: ITEM_HEIGHT,
    borderRadius: radius.pill,
    backgroundColor: colors.greenTint,
    borderWidth: 1,
    borderColor: colors.brandTeal,
  },
});
