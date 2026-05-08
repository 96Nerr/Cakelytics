import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface TransactionItem {
  name: string;
  qty: number;
  price: number;
}

interface Transaction {
  id: string;
  trxCode: string;
  date: string;
  time: string;
  total: number;
  items: TransactionItem[];
}

const DUMMY_TRANSACTIONS: Transaction[] = [
  {
    id: '1', trxCode: 'TRX19', date: '23/04/2026', time: '08:39 AM', total: 105000,
    items: [{ name: 'Soft Cookies', qty: 3, price: 15000 }, { name: 'Cheesecake Slice', qty: 2, price: 30000 }],
  },
  {
    id: '2', trxCode: 'TRX118', date: '23/04/2026', time: '09:10 AM', total: 65000,
    items: [{ name: 'Croissant', qty: 2, price: 20000 }, { name: 'Lapis Legit', qty: 1, price: 25000 }],
  },
  {
    id: '3', trxCode: 'TRX117', date: '23/04/2026', time: '10:22 AM', total: 35000,
    items: [{ name: 'Brownies', qty: 2, price: 15000 }, { name: 'Mochi', qty: 1, price: 5000 }],
  },
  {
    id: '4', trxCode: 'TRX116', date: '23/04/2026', time: '11:45 AM', total: 95000,
    items: [{ name: 'Cheese Tart', qty: 3, price: 20000 }, { name: 'Macarons', qty: 2, price: 17500 }],
  },
  {
    id: '5', trxCode: 'TRX115', date: '23/04/2026', time: '12:05 PM', total: 105000,
    items: [{ name: 'Soft Cookies', qty: 3, price: 15000 }, { name: 'Cheesecake Slice', qty: 2, price: 30000 }],
  },
  {
    id: '6', trxCode: 'TRX111', date: '23/04/2026', time: '01:00 PM', total: 105000,
    items: [{ name: 'Soft Cookies', qty: 3, price: 15000 }, { name: 'Cheesecake Slice', qty: 2, price: 30000 }],
  },
  {
    id: '7', trxCode: 'TRX111', date: '23/04/2026', time: '02:30 PM', total: 105000,
    items: [{ name: 'Soft Cookies', qty: 3, price: 15000 }, { name: 'Cheesecake Slice', qty: 2, price: 30000 }],
  },
  {
    id: '8', trxCode: 'TRX111', date: '23/04/2026', time: '03:15 PM', total: 105000,
    items: [{ name: 'Soft Cookies', qty: 3, price: 15000 }, { name: 'Cheesecake Slice', qty: 2, price: 30000 }],
  },
  {
    id: '9', trxCode: 'TRX111', date: '23/04/2026', time: '04:00 PM', total: 105000,
    items: [{ name: 'Soft Cookies', qty: 3, price: 15000 }, { name: 'Cheesecake Slice', qty: 2, price: 30000 }],
  },
];

const PINK_DARK = '#E8848D';
const PINK_LIGHT = '#FAD8DB';
const RED_PRIMARY = '#E05A6A';
const WHITE = '#FFFFFF';
const GREEN_PRICE = '#2E9E5B';

function formatRupiah(amount: number): string {
  return 'Rp. ' + amount.toLocaleString('id-ID').replace(/,/g, '.');
}

export default function RiwayatScreen() {
  const router = useRouter();
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);

  const totalQty = (trx: Transaction) => trx.items.reduce((s, i) => s + i.qty, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={PINK_DARK} />
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />

      <View style={styles.container}>
        {/* Header */}
        <Text style={styles.appTitle}>
          Cak<Text style={styles.appTitleAccent}>e</Text>litycs
        </Text>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>PENJUALAN</Text>
          <Ionicons name="cart-outline" size={18} color="#333" style={{ marginLeft: 6 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => router.push('/cart')}
            activeOpacity={0.8}
          >
            <Text style={styles.tabText}>Catat Jual</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => router.push('/rusak-kadaluarsa')}
            activeOpacity={0.8}
          >
            <Text style={styles.tabText}>Rusak / Kadaluarsa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabItem, styles.tabActive]} activeOpacity={0.8}>
            <Text style={[styles.tabText, styles.tabTextActive]}>Riwayat</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction List */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {DUMMY_TRANSACTIONS.map((trx) => (
            <TouchableOpacity
              key={trx.id}
              style={styles.trxCard}
              onPress={() => setSelectedTrx(trx)}
              activeOpacity={0.82}
            >
              <View style={styles.trxLeft}>
                <Text style={styles.trxCode}>Transaksi {trx.trxCode}</Text>
                <Text style={styles.trxDate}>{trx.date}</Text>
              </View>
              <Text style={styles.trxPrice}>{formatRupiah(trx.total)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Detail Modal */}
      <Modal
        visible={!!selectedTrx}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedTrx(null)}
      >
        <Pressable style={styles.overlay} onPress={() => setSelectedTrx(null)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            {selectedTrx && (
              <>
                {/* Header row */}
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTrxCode}>Transaksi {selectedTrx.trxCode}</Text>
                    <Text style={styles.modalDate}>{selectedTrx.date}</Text>
                    <Text style={styles.modalTime}>{selectedTrx.time}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => setSelectedTrx(null)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="close" size={14} color={WHITE} />
                  </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                {/* Items */}
                {selectedTrx.items.map((item, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <Text style={styles.itemName}>
                      {item.name} x {item.qty}
                    </Text>
                    <Text style={styles.itemPrice}>{formatRupiah(item.price * item.qty)}</Text>
                  </View>
                ))}

                <View style={styles.divider} />

                {/* Footer */}
                <View style={styles.modalFooter}>
                  <Text style={styles.pcsText}>{totalQty(selectedTrx)} pcs</Text>
                  <Text style={styles.totalPrice}>{formatRupiah(selectedTrx.total)}</Text>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PINK_DARK },
  bgTop: { ...StyleSheet.absoluteFillObject, backgroundColor: PINK_DARK },
  bgBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: '55%', backgroundColor: PINK_LIGHT,
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
  },
  appTitle: { fontSize: 22, fontWeight: '800', color: '#2a2a2a' },
  appTitleAccent: { color: RED_PRIMARY },
  sectionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#2a2a2a', letterSpacing: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 50,
    padding: 4,
    marginBottom: 16,
  },
  tabItem: { flex: 1, paddingVertical: 8, borderRadius: 50, alignItems: 'center' },
  tabActive: {
    backgroundColor: WHITE,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  tabText: { fontSize: 11, color: '#666', fontWeight: '500', textAlign: 'center' },
  tabTextActive: { color: '#2a2a2a', fontWeight: '700' },
  scrollContent: { paddingBottom: 24 },
  trxCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#c06070',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  trxLeft: {},
  trxCode: { fontSize: 13, fontWeight: '700', color: '#2a2a2a' },
  trxDate: { fontSize: 11, color: '#aaa', marginTop: 2 },
  trxPrice: { fontSize: 13, fontWeight: '700', color: GREEN_PRICE },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 12,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  modalTrxCode: { fontSize: 16, fontWeight: '800', color: '#1a1a1a' },
  modalDate: { fontSize: 12, color: '#888', marginTop: 2 },
  modalTime: { fontSize: 12, color: '#aaa' },
  closeBtn: {
    backgroundColor: RED_PRIMARY,
    width: 24, height: 24,
    borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 12 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  itemName: { fontSize: 13, color: '#333', fontWeight: '500' },
  itemPrice: { fontSize: 13, color: '#333', fontWeight: '600' },
  modalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pcsText: { fontSize: 13, color: '#aaa' },
  totalPrice: { fontSize: 15, fontWeight: '800', color: GREEN_PRICE },
});
