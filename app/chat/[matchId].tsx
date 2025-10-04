import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Send, Clock } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Match, ChatMessage } from '@/types/ping';
import { useTheme } from '@/hooks/useTheme';
import { formatTimeRemaining, getTimeRemaining } from '@/lib/time';

export default function ChatScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  const [match, setMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!matchId) return;

    getCurrentUser();
    fetchMatch();
    fetchMessages();
    subscribeToMessages();

    const timer = setInterval(() => {
      if (match) {
        const { isExpired: expired } = getTimeRemaining(match.expires_at);
        setIsExpired(expired);
        if (!expired) {
          setTimeRemaining(formatTimeRemaining(match.expires_at));
        }
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [matchId, match?.expires_at]);

  const getCurrentUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setCurrentUserId(data.user.id);
    }
  };

  const fetchMatch = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        profile_a:profiles!matches_user_a_fkey(
          id,
          first_name,
          age,
          photo_url
        ),
        profile_b:profiles!matches_user_b_fkey(
          id,
          first_name,
          age,
          photo_url
        )
      `)
      .eq('id', matchId)
      .single();

    if (error) {
      Alert.alert('Fejl', 'Kunne ikke hente match');
      router.back();
      return;
    }

    setMatch(data as Match);
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data as ChatMessage[]);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 100);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`chat:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
          setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isExpired) return;

    const { error } = await supabase.from('chat_messages').insert({
      match_id: matchId,
      sender_id: currentUserId,
      content: newMessage.trim(),
    });

    if (error) {
      Alert.alert('Fejl', 'Kunne ikke sende besked');
      return;
    }

    setNewMessage('');
  };

  const getOtherProfile = () => {
    if (!match) return null;
    if (match.user_a === currentUserId) {
      return match.profile_b;
    }
    return match.profile_a;
  };

  const otherProfile = getOtherProfile();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>

        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {otherProfile?.first_name || 'Chat'}
          </Text>
          {!isExpired && (
            <View style={styles.timerContainer}>
              <Clock size={14} color={colors.textSecondary} />
              <Text style={[styles.timerText, { color: colors.textSecondary }]}>
                {timeRemaining}
              </Text>
            </View>
          )}
        </View>
      </View>

      {isExpired && (
        <View style={[styles.expiredBanner, { backgroundColor: colors.warningBackground }]}>
          <Text style={[styles.expiredText, { color: colors.warning }]}>
            Chatten er udløbet
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => {
            const isOwn = message.sender_id === currentUserId;
            return (
              <View
                key={message.id}
                style={[
                  styles.messageRow,
                  isOwn ? styles.messageRowOwn : styles.messageRowOther,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isOwn
                      ? styles.messageBubbleOwn
                      : { backgroundColor: colors.cardBackground },
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      { color: isOwn ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {message.content}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
            placeholder={isExpired ? 'Chat udløbet' : 'Skriv en besked...'}
            placeholderTextColor={colors.textSecondary}
            value={newMessage}
            onChangeText={setNewMessage}
            editable={!isExpired}
            multiline
            maxLength={500}
          />
          <Pressable
            style={[
              styles.sendButton,
              (!newMessage.trim() || isExpired) && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || isExpired}
          >
            <Send
              size={20}
              color={!newMessage.trim() || isExpired ? colors.textSecondary : '#FFFFFF'}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  timerText: {
    fontSize: 12,
  },
  expiredBanner: {
    padding: 12,
    alignItems: 'center',
  },
  expiredText: {
    fontSize: 14,
    fontWeight: '600',
  },
  keyboardAvoid: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  messageRowOwn: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  messageBubbleOwn: {
    backgroundColor: '#F97316',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
