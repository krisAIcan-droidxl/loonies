import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Pressable, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Send, MapPin, Clock, Crown } from 'lucide-react-native';
import { useSubscription } from '@/hooks/useSubscription';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: Date;
}

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
  personName: string;
  timeLeft: number;
}

export default function ChatModal({ visible, onClose, personName, timeLeft }: ChatModalProps) {
  const [message, setMessage] = useState('');
  const { plan } = useSubscription();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey! Coffee sounds great. There\'s a nice café on Main Street.',
      sender: 'them',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      id: '2',
      text: 'Perfect! I know the place. See you there in 20 minutes?',
      sender: 'me',
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
    },
  ]);

  const isUnlimitedChat = plan?.features.chat_duration_hours === -1;

  const sendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'me',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
  };

  const formatTimeLeft = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <BlurView intensity={80} style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Text style={styles.title}>Chat with {personName}</Text>
              {isUnlimitedChat ? (
                <View style={styles.unlimitedInfo}>
                  <Crown size={14} color="#F59E0B" />
                  <Text style={styles.unlimitedText}>Unlimited chat</Text>
                </View>
              ) : (
                <View style={styles.expiryInfo}>
                  <Clock size={14} color="#DC2626" />
                  <Text style={styles.expiryText}>
                    Expires in {formatTimeLeft(timeLeft)}
                  </Text>
                </View>
              )}
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </Pressable>
          </View>

          <View style={styles.safetyBanner}>
            <MapPin size={16} color="#7C3AED" />
            <Text style={styles.safetyText}>
              Meet in public places. Share location when you meet.
            </Text>
          </View>

          <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageWrapper,
                  msg.sender === 'me' ? styles.myMessageWrapper : styles.theirMessageWrapper
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    msg.sender === 'me' ? styles.myMessage : styles.theirMessage
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      msg.sender === 'me' ? styles.myMessageText : styles.theirMessageText
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
                <Text style={styles.timestamp}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder="Type a message..."
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={200}
            />
            <Pressable
              style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!message.trim()}
            >
              <Send size={16} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expiryText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  unlimitedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unlimitedText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  safetyBanner: {
    backgroundColor: '#F5F3FF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  safetyText: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '500',
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  myMessageWrapper: {
    alignItems: 'flex-end',
  },
  theirMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    marginBottom: 4,
  },
  myMessage: {
    backgroundColor: '#F97316',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  theirMessageText: {
    color: '#1F2937',
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginHorizontal: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    maxHeight: 100,
    backgroundColor: '#F9FAFB',
  },
  sendButton: {
    backgroundColor: '#F97316',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
});