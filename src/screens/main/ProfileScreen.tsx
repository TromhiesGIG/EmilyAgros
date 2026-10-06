// src/screens/main/ProfileScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FileText,
  Wallet,
  Bell,
  Bookmark, 
  Users, 
  Diamond, 
  ChevronRight,
  User,
  Settings,
  HelpCircle,
  MessageCircle,
  ShieldCheck
} from 'lucide-react-native';
import { useAuth } from '../../providers/AuthProvider';
import { useSyncData } from '../../hooks/useSyncData';
import { useIsFocused } from '@react-navigation/native';

export const ProfileScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { walletData, refresh, profileData, loading } = useSyncData();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      refresh();
    }
  }, [isFocused]);

  const ActivityCard = ({ icon: Icon, title, onPress, subtitle }: any) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.iconCircle}>
        <Icon size={24} color="#111827" />
      </View>
      <View>
        <Text style={styles.cardTitle}>{title}</Text>
        {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
      </View>
    </TouchableOpacity>
  );

  const NavItem = ({ icon: Icon, title, onPress }: any) => (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <View style={styles.navLeft}>
        <Icon size={20} color="#6B7280" />
        <Text style={styles.navTitle}>{title}</Text>
      </View>
      <ChevronRight size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerMainTitle}>Your Space</Text>
          <View style={styles.profileInfo}>

            {/* Avatar — skeleton while loading, no Google fallback */}
            {loading ? (
              <View style={[styles.avatar, styles.skeleton]} />
            ) : profileData?.avatar_url ? (
              <Image source={{ uri: profileData.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <User size={28} color="#6B7280" />
              </View>
            )}

            <View style={styles.profileTextWrap}>
              {loading ? (
                <>
                  <View style={[styles.skeleton, { width: 150, height: 18, marginBottom: 8 }]} />
                  <View style={[styles.skeleton, { width: 200, height: 14 }]} />
                </>
              ) : (
                <View>
                  <Text style={styles.userName}>
                    {profileData?.full_name || 'Agro Member'}
                  </Text>
                  <Text style={styles.userEmail}>
                    {user?.email || 'No email found'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Activity Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <View style={styles.grid}>
            <ActivityCard icon={FileText} title="My Ads" onPress={() => navigation.navigate('MyAds')} />
            <ActivityCard 
              icon={Wallet} 
              title="My Wallet" 
              subtitle={`₦${walletData.balance.toLocaleString()}`}
              onPress={() => navigation.navigate('MyWallet')} 
            />
            <ActivityCard icon={Bell} title="Notifications" onPress={() => navigation.navigate('ManageNotifications')} />
            <ActivityCard icon={Bookmark} title="Saved" onPress={() => navigation.navigate('SavedItems')} />
            <ActivityCard icon={Users} title="Follows" onPress={() => navigation.navigate('Follows')} />
            <ActivityCard icon={Diamond} title="Subscriptions" onPress={() => navigation.navigate('Subscriptions')} />
          </View>
        </View>

        {/* Personal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Personal</Text>
          <NavItem icon={User} title="Account Settings" onPress={() => navigation.navigate('AccountSettings')} />
          <NavItem icon={Settings} title="General Settings" onPress={() => navigation.navigate('GeneralSettings')} />
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Support & Information</Text>
          <NavItem icon={HelpCircle} title="Help & Support" onPress={() => navigation.navigate('HelpSupport')} />
          <NavItem icon={MessageCircle} title="FAQs" onPress={() => navigation.navigate('FAQs')} />
          <NavItem icon={ShieldCheck} title="Terms and Conditions" onPress={() => {}} />
        </View>

        <Text style={styles.versionText}>App version 1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#FFFFFF' },
  header:             { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerMainTitle:    { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  profileInfo:        { flexDirection: 'row', alignItems: 'center' },
  avatar:             { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  avatarPlaceholder:  { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  profileTextWrap:    { flex: 1 },
  skeleton:           { backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  userName:           { fontSize: 18, fontWeight: '600', color: '#111827' },
  userEmail:          { fontSize: 14, color: '#6B7280' },
  section:            { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle:       { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 16 },
  sectionLabel:       { fontSize: 14, fontWeight: '500', color: '#6B7280', marginBottom: 12, backgroundColor: '#F9FAFB', padding: 8, marginHorizontal: -20, paddingLeft: 20 },
  grid:               { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card:               { width: '48%', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center' },
  iconCircle:         { width: 40, height: 40, borderRadius: 8, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  cardTitle:          { fontSize: 13, fontWeight: '600', color: '#111827' },
  cardSubtitle:       { fontSize: 11, color: '#008102', fontWeight: '700' },
  navItem:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  navLeft:            { flexDirection: 'row', alignItems: 'center' },
  navTitle:           { marginLeft: 12, fontSize: 16, color: '#111827' },
  versionText:        { textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginTop: 40 },
});