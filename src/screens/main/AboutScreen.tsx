// src/screens/main/AboutScreen.tsx
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Linking, ScrollView, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ExternalLink } from 'lucide-react-native';
import { FontAwesome, Feather } from '@expo/vector-icons';

const GREEN     = '#008102';
const GRAY      = '#6B7280';
const VERSION   = '1.0.0';
const INSTAGRAM = 'https://www.instagram.com/emily.agros?stkn=MThkbHdhMW1lcmRnbg==';
const FACEBOOK  = 'https://www.facebook.com/share/1BwXBPb3gX/?mibextid=wwXIfr';
const WEBSITE   = 'https://www.emilyagros.com';

export const AboutScreen = ({ navigation }: any) => {

  const LinkCard = ({ label, subtitle, url, bgColor, icon }: any) => (
    <TouchableOpacity
      style={styles.linkCard}
      onPress={() => Linking.openURL(url)}
      activeOpacity={0.8}
    >
      <View style={[styles.linkIconBox, { backgroundColor: bgColor }]}>
        {icon}
      </View>
      <View style={styles.linkInfo}>
        <Text style={styles.linkName}>{label}</Text>
        <Text style={styles.linkSubtitle}>{subtitle}</Text>
      </View>
      <ExternalLink size={16} color={GRAY} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About EmilyAgros</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Logo + name + version */}
        <View style={styles.logoSection}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>EmilyAgros</Text>
          <Text style={styles.version}>Version {VERSION}</Text>
        </View>

        {/* Mission */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Our Mission</Text>
          <Text style={styles.cardText}>
            EmilyAgros is Nigeria's trusted agricultural marketplace — connecting farmers, agro dealers and buyers in one seamless platform. We are committed to making agro commerce faster, simpler and more profitable for everyone in the value chain.
          </Text>
        </View>

        {/* What we do */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What We Do</Text>
          <Text style={styles.cardText}>
            We help agro sellers reach more buyers by providing powerful promotion tools including carousel ads, trending placements and search sponsorships. Buyers get access to verified listings across livestock, crops, equipment and agro inputs — all in one place.
          </Text>
        </View>

        {/* Links */}
        <Text style={styles.sectionTitle}>Find Us Online</Text>

        <LinkCard
          label="Website"
          subtitle="www.emilyagros.com"
          url={WEBSITE}
          bgColor="#F0FDF4"
          icon={<Feather name="globe" size={22} color={GREEN} />}
        />

        <LinkCard
          label="Instagram"
          subtitle="@emily.agros"
          url={INSTAGRAM}
          bgColor="#FDF2F8"
          icon={<FontAwesome name="instagram" size={22} color="#C2185B" />}
        />

        <LinkCard
          label="Facebook"
          subtitle="EmilyAgros"
          url={FACEBOOK}
          bgColor="#EFF6FF"
          icon={<FontAwesome name="facebook" size={22} color="#1565C0" />}
        />

        <Text style={styles.legal}>
          &copy; {new Date().getFullYear()} EmilyAgros. All rights reserved.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#F7F8F9' },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle:   { fontSize: 18, fontWeight: '700', color: '#111827' },
  scroll:        { padding: 20 },
  logoSection:   { alignItems: 'center', paddingVertical: 32 },
  logo:          { width: 90, height: 90, marginBottom: 12 },
  appName:       { fontSize: 24, fontWeight: '800', color: GREEN, marginBottom: 4 },
  version:       { fontSize: 13, color: GRAY },
  card:          { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  cardTitle:     { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 8 },
  cardText:      { fontSize: 14, color: GRAY, lineHeight: 22 },
  sectionTitle:  { fontSize: 13, fontWeight: '700', color: GRAY, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, marginTop: 8 },
  linkCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  linkIconBox:   { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginRight: 14 },

  linkInfo:      { flex: 1 },
  linkName:      { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  linkSubtitle:  { fontSize: 13, color: GRAY },
  legal:         { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 24 },
});