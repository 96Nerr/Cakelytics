import { router } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Dimensions
} from "react-native";

const { width } = Dimensions.get("window");

const PINK_PRIMARY = "#FF6B97";
const DARK_TEXT = "#4A1525";
const MUTED_TEXT = "#8A6871";
const WHITE = "#FFFFFF";

const CAROUSEL_DATA = [
  {
    id: "1",
    image: require("../assets/images/logoBakever.png"),
    title: "Welcome to Cakelytics",
    desc: "Kelola pesanan kue, pantau ketersediaan stok dapur, dan kembangkan bisnis dessert kamu dalam satu sistem analitik yang cerdas."
  },
  {
    id: "2",
    image: require("../assets/images/kue.png"),
    title: "Analisis Penjualan",
    desc: "Lihat kue mana yang paling laku minggu ini dan atur strategi bisnismu lewat grafik data yang mudah dipahami."
  },
  {
    id: "3",
    image: require("../assets/images/pancake.png"),
    title: "Kelola Varian Menu",
    desc: "Eksplorasi resep pancake dan kue baru, pantau langsung dari dashboard dapur produksi kamu secara real-time."
  },
  {
    id: "4",
    image: require("../assets/images/sliceStrawberry.png"),
    title: "Optimalkan Keuntungan",
    desc: "Hitung margin profit dari setiap potongan stroberi dan slice cake dengan kalkulator analitik otomatis kami."
  },
];

export default function Welcome() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const autoPlayTimer = setInterval(() => {
      let nextIndex = activeIndex + 1;
      
      if (nextIndex >= CAROUSEL_DATA.length) {
        nextIndex = 0;
      }

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      
      setActiveIndex(nextIndex);
    }, 2500);

    return () => clearInterval(autoPlayTimer);
  }, [activeIndex]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  // 🛠️ LOGIKA BARU: Sekali tekan, langsung ganti halaman tanpa ampun
  const handleButtonPress = () => {
    router.replace("/(tabs)/Dashboard");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PINK_PRIMARY} />

      <View style={styles.topSection}>
        <FlatList
          ref={flatListRef}
          data={CAROUSEL_DATA}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.slideItem}>
              <Image source={item.image} style={styles.cake} />
            </View>
          )}
        />
        
        <View style={styles.indicatorContainer}>
          {CAROUSEL_DATA.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeIndex === index ? styles.activeDot : styles.inactiveDot
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.bottomSection}>
        <Text style={styles.title}>
          {CAROUSEL_DATA[activeIndex].title}
        </Text>

        <Text style={styles.description}>
          {CAROUSEL_DATA[activeIndex].desc}
        </Text>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={handleButtonPress}
        >
          {/* 🛠️ TEKS TOMBOL: Selalu tulisan "Mulai Sekarang" di semua slide */}
          <Text style={styles.buttonText}>Mulai Sekarang</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
  },
  topSection: {
    flex: 1.3, 
    backgroundColor: PINK_PRIMARY, 
    borderBottomLeftRadius: 60,   
    borderBottomRightRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  slideItem: {
    width: width, 
    justifyContent: "center",
    alignItems: "center",
  },
  cake: {
    width: 220,
    height: 220,
    resizeMode: "contain",
  },
  indicatorContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 25, 
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 20, 
    backgroundColor: WHITE,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  bottomSection: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "center",
    backgroundColor: WHITE,
  },
  title: {
    fontSize: 26,
    color: DARK_TEXT, 
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  description: {
    color: MUTED_TEXT, 
    textAlign: "center",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
    marginBottom: 40,
    paddingHorizontal: 10,
    height: 66, 
  },
  button: {
    backgroundColor: PINK_PRIMARY, 
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: "center",
  },
  buttonText: {
    color: WHITE,
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});