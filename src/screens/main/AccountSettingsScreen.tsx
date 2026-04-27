// src/screens/main/AccountSettingsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  AtSign,
  Lock,
  Link,
  LogOut, 
  Trash2, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react-native';

export const AccountSettingsScreen = ({ navigation }: any) => {
  
  const SettingItem = ({ icon: Icon, title, onPress, isDestructive = false }: any) => (
    <TouchableOpacity 
      style={styles.item} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        <View style={[styles.iconBox, isDestructive && styles.destructiveBox]}>
          <Icon size={22} color={isDestructive ? '#EF4444' : '#008102'} />
        </View>
        <Text style={[styles.title, isDestructive && styles.destructiveText]}>{title}</Text>
      </View>
      <ChevronRight size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", onPress: () => console.log("User logged out") }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={{ width: 24 }} /> {/* Spacer for centering */}
      </View>

      <View style={styles.container}>
        {/* Section 1: Profile & Identity */}
        <View style={styles.section}>
          <SettingItem 
            icon={User} 
            title="Personal Info" 
            onPress={() => navigation.navigate('PersonalInfo')} 
          />
          <SettingItem 
            icon={AtSign} 
            title="Email address" 
            onPress={() => navigation.navigate('EmailAddress')} 
          />
        </View>

        {/* Section 2: Security & Connections */}
        <View style={styles.section}>
          <SettingItem 
            icon={Lock} 
            title="Change password" 
            onPress={() => navigation.navigate('ChangePassword')} 
          />
          <SettingItem 
            icon={Link} 
            title="Manage connected accounts" 
            onPress={() => {}} 
          />
        </View>

        {/* Section 3: Danger Zone */}
        <View style={styles.section}>
          <SettingItem 
            icon={LogOut} 
            title="Log out" 
            onPress={handleLogout} 
          />
          <SettingItem 
            icon={Trash2} 
            title="Delete my account permanently" 
            onPress={() => {}} 
            isDestructive={true}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  container: {
    flex: 1,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  destructiveBox: {
    backgroundColor: '#FEF2F2',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  destructiveText: {
    color: '#EF4444',
  },
});