import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MessageCircle, Phone, Mail, HelpCircle } from 'lucide-react-native';

const GREEN        = '#008102';
const GRAY         = '#6B7280';
const ADMIN_PHONE  = '+2348168817063';
const ADMIN_EMAIL  = 'emilyagros@hotmail.com';
const ADMIN_WA     = 'https://wa.me/2348168817063';

export const HelpSupportScreen = ({ navigation }: any) => {

  const openWhatsApp = () => {
    const msg = encodeURIComponent('Hi EmilyAgros Support! I need help with something.');
    Linking.openURL(`${ADMIN_WA}?text=${msg}`);
  };

  const openCall = () => Linking.openURL(`tel:${ADMIN_PHONE}`);

  const openSMS = () => {
    const msg = encodeURIComponent('Hi EmilyAgros Support! I need help with something.');
    Linking.openURL(`sms:${ADMIN_PHONE}?body=${msg}`);
  };

  const openEmail = () => {
    Linking.openURL(`mailto:${ADMIN_EMAIL}?subject=Support Request&body=Hi EmilyAgros Support,`);
  };

  const ContactCard = ({ icon: Icon, title, subtitle, onPress, color = GREEN }: any) => (
    <TouchableOpacity style={styles.contactCard} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.contactIcon, { backgroundColor: color === '#DC2626' ? '#FEE2E2' : '#F0FDF4' }]}>
        <Icon size={22} color={color} />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.greeting}>How can we help you?</Text>
        <Text style={styles.greetingSubtitle}>
          Our team is available and ready to assist you. Reach us through any of the channels below and we will respond as fast as possible.
        </Text>

        <Text style={styles.sectionTitle}>Contact Us</Text>

        <ContactCard
          icon={MessageCircle}
          title="WhatsApp"
          subtitle="Chat with us instantly"
          onPress={openWhatsApp}
        />

        <ContactCard
          icon={Phone}
          title="Call Us"
          subtitle={ADMIN_PHONE}
          onPress={openCall}
        />

        <ContactCard
          icon={MessageCircle}
          title="Send SMS"
          subtitle="Text us anytime"
          onPress={openSMS}
        />

        <ContactCard
          icon={Mail}
          title="Email"
          subtitle={ADMIN_EMAIL}
          onPress={openEmail}
        />

        <Text style={styles.sectionTitle}>More Help</Text>

        <ContactCard
          icon={HelpCircle}
          title="FAQs"
          subtitle="Find answers to common questions"
          onPress={() => navigation.navigate('FAQs')}
        />

        <View style={styles.noteCard}>
          <Text style={styles.noteText}>
            Our support team is available Monday to Saturday, 8am to 8pm WAT. We typically respond within a few hours.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: '#F7F8F9' },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle:      { fontSize: 18, fontWeight: '700', color: '#111827' },
  scroll:           { padding: 20 },
  greeting:         { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 },
  greetingSubtitle: { fontSize: 14, color: GRAY, lineHeight: 22, marginBottom: 28 },
  sectionTitle:     { fontSize: 13, fontWeight: '700', color: GRAY, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, marginTop: 8 },
  contactCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  contactIcon:      { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  contactInfo:      { flex: 1 },
  contactTitle:     { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  contactSubtitle:  { fontSize: 13, color: GRAY },
  noteCard:         { backgroundColor: '#FFFBEB', borderRadius: 12, padding: 14, marginTop: 8, borderWidth: 1, borderColor: '#FDE68A' },
  noteText:         { fontSize: 13, color: '#92400E', lineHeight: 20 },
});