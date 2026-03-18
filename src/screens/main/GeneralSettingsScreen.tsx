// src/screens/main/GeneralSettingsScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Switch,
  ScrollView 
} from 'react-native';
import { 
  ArrowLeft, 
  MessageSquare, 
  Bell, 
  MapPin, 
  LayoutGrid, 
  Info, 
  Star,
  ChevronRight 
} from 'lucide-react-native';

export const GeneralSettingsScreen = ({ navigation }: any) => {
  const [allowMessaging, setAllowMessaging] = useState(true);
  const [allowFeedback, setAllowFeedback] = useState(true);

  const SettingRow = ({ icon: Icon, title, onPress, showSwitch = false, value, onValueChange }: any) => (
    <TouchableOpacity 
      style={styles.row} 
      onPress={showSwitch ? undefined : onPress}
      activeOpacity={showSwitch ? 1 : 0.7}
    >
      <View style={styles.leftContent}>
        <View style={styles.iconBox}><Icon size={22} color="#008102" /></View>
        <Text style={styles.title}>{title}</Text>
      </View>
      {showSwitch ? (
        <Switch 
          value={value} 
          onValueChange={onValueChange}
          trackColor={{ false: '#E5E7EB', true: '#008102' }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <ChevronRight size={20} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>General Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <SettingRow 
            icon={MessageSquare} 
            title="Allow users to message me" 
            showSwitch={true}
            value={allowMessaging}
            onValueChange={setAllowMessaging}
          />
          <SettingRow 
            icon={MessageSquare} 
            title="Allow feedback on my ads" 
            showSwitch={true}
            value={allowFeedback}
            onValueChange={setAllowFeedback}
          />
          <SettingRow 
            icon={Bell} 
            title="Manage notifications" 
            onPress={() => navigation.navigate('ManageNotifications')} 
          />
        </View>

        <View style={styles.section}>
          <SettingRow 
            icon={MapPin} 
            title="Location access" 
            onPress={() => navigation.navigate('LocationAccess')} 
          />
          <SettingRow 
            icon={LayoutGrid} 
            title="Permissions" 
            onPress={() => navigation.navigate('Permissions')} 
          />
        </View>

        <View style={styles.section}>
          <SettingRow icon={Info} title="About EmilyAgros" onPress={() => {}} />
          <SettingRow icon={Star} title="Rate us" onPress={() => {}} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  container: { flex: 1 },
  section: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  leftContent: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  title: { fontSize: 16, fontWeight: '500', color: '#111827' },
});