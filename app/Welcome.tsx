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

// DATA ASLI: Ada 4 item
const BASE_DATA = [
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

const CAROUSEL_DATA = [...BASE_DATA, { ...BASE_DATA[0], id: "fake-1" }];

export default function Welcome() {
  const [activeIndex, setActiveIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const flatListRef = useRef<FlatList>(null);
  const isResetting = useRef(false);

  useEffect(() => {
    const autoPlayTimer = setInterval(() => {
      if (isResetting.current) return;

      let nextIndex = currentIndexRef.current + 1;

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });

      currentIndexRef.current = nextIndex;
      
      setActiveIndex(nextIndex % BASE_DATA.length);
    }, 2500);

    return () => clearInterval(autoPlayTimer);
  }, []);

  const onMomentumScrollEnd = (e: any) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    
    currentIndexRef.current = index;

    // Jika sudah sampai di slide "tiruan" (paling akhir)
    if (index === CAROUSEL_DATA.length - 1) {
      isResetting.current = true;
      // Secara instan lempar ke indeks 0 tanpa animasi
      flatListRef.current?.scrollToIndex({ index: 0, animated: false });
      currentIndexRef.current = 0;
      setActiveIndex(0);
      isResetting.current = false;
    } else {
      setActiveIndex(index % BASE_DATA.length);
    }
  };

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
          onMomentumScrollEnd={onMomentumScrollEnd} 
          keyExtractor={(item, idx) => item.id + idx}
          renderItem={({ item }) => (
            <View style={styles.slideItem}>
              <Image source={item.image} style={styles.cake} />
            </View>
          )}
        />
        
        <View style={styles.indicatorContainer}>
          {BASE_DATA.map((_, index) => (
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
          {BASE_DATA[activeIndex].title}
        </Text>

        <Text style={styles.description}>
          {BASE_DATA[activeIndex].desc}
        </Text>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={handleButtonPress}
        >
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
    flex: 1, 
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
    width: 300,
    height: 300,
    resizeMode: "contain",
  },
  indicatorContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 20, 
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