import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors, Spacing, Typography } from '@/theme';

const MAX_LINES = 200;

interface NimbusTerminalProps {
  lines: string[];
  inputEnabled: boolean;
  onSubmit: (cmd: string) => void;
}

function CursorBlink() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0, { duration: 500, easing: Easing.steps(1) }),
      -1,
      true
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.Text style={[styles.cursor, style]}>█</Animated.Text>;
}

export default function NimbusTerminal({ lines, inputEnabled, onSubmit }: NimbusTerminalProps) {
  const [inputValue, setInputValue] = useState('');
  const listRef = useRef<FlatList>(null);

  // Enforce max line cap
  const visibleLines = lines.slice(-MAX_LINES);

  const handleSubmit = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setInputValue('');
  }, [inputValue, onSubmit]);

  useEffect(() => {
    if (visibleLines.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [visibleLines.length]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        ref={listRef}
        data={visibleLines}
        keyExtractor={(_, index) => String(index)}
        renderItem={({ item }) => (
          <Text style={styles.line}>
            <Text style={styles.prompt}>&gt; </Text>
            {item}
          </Text>
        )}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        style={styles.output}
        contentContainerStyle={styles.outputContent}
      />
      {inputEnabled && (
        <View style={styles.inputRow}>
          <Text style={styles.prompt}>&gt; </Text>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            onSubmitEditing={handleSubmit}
            returnKeyType="send"
            autoCorrect={false}
            autoCapitalize="none"
            spellCheck={false}
            placeholderTextColor={Colors.textTertiary}
            selectionColor={Colors.terminalText}
          />
          <CursorBlink />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.terminalBg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  output: {
    flex: 1,
  },
  outputContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  line: {
    ...Typography.terminal,
    color: Colors.terminalText,
    marginBottom: 2,
  },
  prompt: {
    ...Typography.terminal,
    color: Colors.terminalText,
    opacity: 0.6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  input: {
    ...Typography.terminal,
    color: Colors.terminalText,
    flex: 1,
    paddingVertical: 0,
  },
  cursor: {
    ...Typography.terminal,
    color: Colors.terminalText,
  },
});
