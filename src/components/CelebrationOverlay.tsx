import React from 'react';
import {
  Modal,
  Pressable,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface CelebrationOverlayProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  emoji?: string;
  isDark: boolean;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  visible,
  onClose,
  title,
  message,
  emoji = '🎉',
  isDark,
}) => {
  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1C1C1E';
  const subTextColor = isDark ? '#A0A0A5' : '#6E6E73';

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.card, { backgroundColor: cardBg }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.emojiContainer}>
            <Text style={styles.floatingEmojiLeft}>✨</Text>
            <Text style={styles.mainEmoji}>{emoji}</Text>
            <Text style={styles.floatingEmojiRight}>💖</Text>
          </View>

          <Text style={[styles.title, { color: textColor }]}>{title}</Text>
          <Text style={[styles.message, { color: subTextColor }]}>{message}</Text>

          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={onClose}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="축하 창 닫기"
          >
            <Text style={styles.confirmBtnText}>행복한 하루 보내기 💕</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '90%',
    maxWidth: 380,
    borderRadius: 26,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  emojiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  mainEmoji: {
    fontSize: 54,
    marginHorizontal: 10,
  },
  floatingEmojiLeft: {
    fontSize: 24,
    transform: [{ rotate: '-15deg' }, { translateY: -10 }],
  },
  floatingEmojiRight: {
    fontSize: 24,
    transform: [{ rotate: '15deg' }, { translateY: -10 }],
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 22,
  },
  confirmBtn: {
    backgroundColor: '#FF2D55',
    paddingVertical: 13,
    paddingHorizontal: 26,
    borderRadius: 18,
    shadowColor: '#FF2D55',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
