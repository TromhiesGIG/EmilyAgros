// src/screens/main/ProfileScreen.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
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

export const ProfileScreen = ({ navigation }: any) => {
  
  const ActivityCard = ({ icon: Icon, title, onPress }: any) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.iconCircle}>
        <Icon size={24} color="#111827" />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
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
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1974&auto=format&fit=crop' }} 
              style={styles.avatar} 
            />
            <View>
              <Text style={styles.userName}>Bambo Temidire</Text>
              <Text style={styles.userEmail}>bambodire@gmail.com</Text>
            </View>
          </View>
        </View>

        {/* Activity Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <View style={styles.grid}>
            <ActivityCard icon={FileText} title="My Ads" onPress={() => {}} />
            <ActivityCard icon={Wallet} title="My Wallet" onPress={() => {}} />
            <ActivityCard icon={Bell} title="Notifications" onPress={() => {}} />
            <ActivityCard icon={Bookmark} title="Saved" onPress={() => {}} />
            <ActivityCard icon={Users} title="Follows" onPress={() => {}} />
            <ActivityCard icon={Diamond} title="Subscriptions" onPress={() => {}} />
          </View>
        </View>

        {/* Personal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Personal</Text>
          <NavItem icon={User} title="Account Settings" onPress={() => {}} />
          <NavItem icon={Settings} title="General Settings" onPress={() => {}} />
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Support & Information</Text>
          <NavItem icon={HelpCircle} title="Help & Support" onPress={() => {}} />
          <NavItem icon={MessageCircle} title="FAQs" onPress={() => {}} />
          <NavItem icon={ShieldCheck} title="Terms and Conditions" onPress={() => {}} />
        </View>

        {/* Version Footer */}
        <Text style={styles.versionText}>App version 1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerMainTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  profileInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  userName: { fontSize: 18, fontWeight: '600', color: '#111827' },
  userEmail: { fontSize: 14, color: '#6B7280' },
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 16 },
  sectionLabel: { fontSize: 14, fontWeight: '500', color: '#6B7280', marginBottom: 12, backgroundColor: '#F9FAFB', padding: 8, marginHorizontal: -20, paddingLeft: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardTitle: { fontSize: 14, fontWeight: '500', color: '#111827' },
  navItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  navLeft: { flexDirection: 'row', alignItems: 'center' },
  navTitle: { marginLeft: 12, fontSize: 16, color: '#111827' },
  versionText: { textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginTop: 40 }
});