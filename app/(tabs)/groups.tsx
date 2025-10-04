import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Users, MapPin, Coffee } from 'lucide-react-native';

interface Group {
  id: string;
  name: string;
  size: number;
  distance: number;
  eta: string;
  activities: string[];
  members: { name: string; photo: string }[];
  isPublic: boolean;
}

export default function GroupsScreen() {
  const [nearbyGroups] = useState<Group[]>([
    {
      id: '1',
      name: 'Coffee Lovers',
      size: 3,
      distance: 0.5,
      eta: '6 min walk',
      activities: ['coffee', 'reading'],
      members: [
        { name: 'Emma', photo: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400' },
        { name: 'Jake', photo: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=400' },
        { name: 'Lily', photo: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=400' },
      ],
      isPublic: true,
    },
    {
      id: '2',
      name: 'Board Game Night',
      size: 4,
      distance: 1.8,
      eta: '22 min walk',
      activities: ['gaming', 'coffee'],
      members: [
        { name: 'Tom', photo: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400' },
        { name: 'Anna', photo: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400' },
        { name: 'Mike', photo: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400' },
        { name: 'Zoe', photo: 'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=400' },
      ],
      isPublic: true,
    },
  ]);

  const sendGroupPing = (group: Group, activity: string) => {
    console.log(`Pinging group ${group.name} for ${activity}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Groups nearby</Text>
        <Pressable style={styles.createButton}>
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Create</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Groups match with groups</Text>
          <Text style={styles.infoText}>
            Find other small groups (3-6 people) for activities like board games, 
            group cooking, or exploring local events together.
          </Text>
        </View>

        {nearbyGroups.map((group) => (
          <View key={group.id} style={styles.groupCard}>
            <View style={styles.groupHeader}>
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{group.name}</Text>
                <View style={styles.groupMeta}>
                  <Users size={14} color="#6B7280" />
                  <Text style={styles.groupSize}>{group.size} people</Text>
                  <Text style={styles.separator}>•</Text>
                  <MapPin size={14} color="#6B7280" />
                  <Text style={styles.distance}>{group.distance}km • {group.eta}</Text>
                </View>
              </View>
              {group.isPublic && (
                <View style={styles.publicBadge}>
                  <Text style={styles.publicBadgeText}>Public</Text>
                </View>
              )}
            </View>

            <View style={styles.members}>
              <View style={styles.memberPhotos}>
                {group.members.slice(0, 3).map((member, index) => (
                  <Image
                    key={member.name}
                    source={{ uri: member.photo }}
                    style={[styles.memberPhoto, { marginLeft: index > 0 ? -8 : 0 }]}
                  />
                ))}
                {group.members.length > 3 && (
                  <View style={[styles.memberPhoto, styles.moreMembers, { marginLeft: -8 }]}>
                    <Text style={styles.moreMembersText}>+{group.members.length - 3}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.activities}>
              {group.activities.map((activity) => (
                <View key={activity} style={styles.activityTag}>
                  <Text style={styles.activityText}>{activity}</Text>
                </View>
              ))}
            </View>

            <View style={styles.groupActions}>
              <Pressable
                style={styles.pingButton}
                onPress={() => sendGroupPing(group, 'coffee')}
              >
                <Coffee size={16} color="#FFFFFF" />
                <Text style={styles.pingButtonText}>Ping for meetup</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  createButton: {
    backgroundColor: '#F97316',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  groupSize: {
    fontSize: 14,
    color: '#6B7280',
  },
  separator: {
    fontSize: 14,
    color: '#6B7280',
  },
  distance: {
    fontSize: 14,
    color: '#6B7280',
  },
  publicBadge: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  publicBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  members: {
    marginBottom: 12,
  },
  memberPhotos: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberPhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  moreMembers: {
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreMembersText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  activities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  activityTag: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  activityText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  groupActions: {
    flexDirection: 'row',
  },
  pingButton: {
    flex: 1,
    backgroundColor: '#F97316',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pingButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});