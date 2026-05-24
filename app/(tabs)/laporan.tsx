import React, { useEffect, useState } from "react";
import { Image } from "react-native";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  BarChart,
  PieChart,
} from "react-native-chart-kit";

const screenWidth =
  Dimensions.get("window").width;

const BASE_URL =
  "http://192.168.1.8:5000/api";

export default function Laporan() {

  const [selectedTab, setSelectedTab] =
    useState("7hari");

  const [loading, setLoading] =
    useState(true);

  const [summary, setSummary] =
    useState({
      pendapatan: 0,
      keuntungan: 0,
    });

  const [chartData, setChartData] =
    useState<any>(null);

  const [pieData, setPieData] =
    useState<any[]>([]);

  const [produkTerlaris, setProdukTerlaris] =
    useState<any[]>([]);

  useEffect(() => {
    fetchLaporan();
  }, [selectedTab]);

  const fetchLaporan = async () => {

    try {

      setLoading(true);

      const response = await fetch(
        `${BASE_URL}/transaksi`
      );

      const data: any[] =
        await response.json();

      processData(data);

    } catch (error) {

      console.log("ERROR:", error);

    } finally {

      setLoading(false);

    }
  };

  const processData = (data: any[]) => {

    let totalPendapatan = 0;

    let totalKeuntungan = 0;

    const produkMap: any = {};

    const grafikPendapatan: number[] = [];

    let labels: string[] = [];

    // =========================
    // 7 HARI
    // =========================

    if (selectedTab === "7hari") {

      labels = [
        "Sab,25",
        "Min,26",
        "Sen,27",
        "Sel,28",
        "Rab,30",
        "Kam,1",
        "Jum,2",
      ];

      for (let i = 0; i < 7; i++) {
        grafikPendapatan.push(0);
      }

    }

    // =========================
    // 6 BULAN
    // =========================

    else {

      labels = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
      ];

      for (let i = 0; i < 6; i++) {
        grafikPendapatan.push(0);
      }
    }

    data.forEach((trx: any) => {

      const trxDate = new Date(
        trx.tanggalTransaksi
      );

      totalPendapatan +=
        trx.totalPenjualan || 0;

      totalKeuntungan +=
        (trx.totalPenjualan || 0) * 0.4;

      // =====================
      // GRAFIK
      // =====================

      if (selectedTab === "7hari") {

        const day =
          trxDate.getDay();

        const index =
          day === 0 ? 6 : day - 1;

        grafikPendapatan[index] +=
          trx.totalPenjualan || 0;

      } else {

        const month =
          trxDate.getMonth();

        if (month < 6) {

          grafikPendapatan[month] +=
            trx.totalPenjualan || 0;
        }
      }

      // =====================
      // PRODUK TERLARIS
      // =====================

      trx.detailPenjualan?.forEach(
        (item: any) => {

          const nama =
            item?.produk?.namaProduk ||
            "Produk Tidak Diketahui";

          if (!produkMap[nama]) {

            produkMap[nama] = {
              nama,
              qty: 0,
              total: 0,
            };
          }

          produkMap[nama].qty +=
            item?.jumlah || 0;

          produkMap[nama].total +=
            item?.subtotal || 0;
        }
      );
    });

    // =========================
    // SUMMARY
    // =========================

    setSummary({
      pendapatan: totalPendapatan,
      keuntungan: totalKeuntungan,
    });

    // =========================
    // BAR CHART
    // =========================

    setChartData({
      labels,
      datasets: [
        {
          data: grafikPendapatan,
        },
      ],
    });

    // =========================
    // SORT PRODUK
    // =========================

    const sortedProduk: any[] =
      Object.values(produkMap)
        .sort(
          (a: any, b: any) =>
            b.qty - a.qty
        )
        .slice(0, 3);

    const totalQty =
      sortedProduk.reduce<number>(
        (a, b: any) =>
          a + b.qty,
        0
      );

    const colors = [
      "#FF1E1E",
      "#7ED6F7",
      "#5B4B8A",
    ];

    let pie: any[] = [];

    if (totalQty > 0) {

      pie = sortedProduk.map(
        (
          item: any,
          index: number
        ) => ({

          name: item.nama,

          population: Math.round(
            (item.qty / totalQty) * 100
          ),

          color: colors[index],

          legendFontColor: "#333",

          legendFontSize: 12,
        })
      );
    }

    setPieData(pie);

    setProdukTerlaris(sortedProduk);
  };

  const formatRupiah = (
    number: number
  ) => {

    return (
      "Rp." +
      number.toLocaleString("id-ID")
    );
  };

  if (loading) {

    return (
      <SafeAreaView
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color="#E8848D"
        />
      </SafeAreaView>
    );
  }

  return (

    <SafeAreaView
      style={styles.container}
    >

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
      >

        {/* HEADER */}
        <View style={styles.header}>

          <Image
            source={require("../../assets/images/logo-cakelitycs.png")}
            style={styles.logo}
          />

          <View style={styles.titleRow}>

            <Text style={styles.title}>
              LAPORAN
            </Text>

            <Ionicons
              name="stats-chart"
              size={20}
              color="white"
            />

          </View>

        </View>

        {/* FILTER */}
        <View
          style={styles.filterContainer}
        >

          <TouchableOpacity
            style={[
              styles.filterButton,

              selectedTab ===
                "7hari" &&
                styles.activeButton,
            ]}

            onPress={() =>
              setSelectedTab("7hari")
            }
          >

            <Text
              style={[
                styles.filterText,

                selectedTab ===
                  "7hari" &&
                  styles.activeText,
              ]}
            >
              7 Hari terakhir
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,

              selectedTab ===
                "6bulan" &&
                styles.activeButton,
            ]}

            onPress={() =>
              setSelectedTab("6bulan")
            }
          >

            <Text
              style={[
                styles.filterText,

                selectedTab ===
                  "6bulan" &&
                  styles.activeText,
              ]}
            >
              6 Bulan terakhir
            </Text>

          </TouchableOpacity>

        </View>

        {/* TODAY */}
        <Text style={styles.todayTitle}>
          TODAY
        </Text>

        <View style={styles.cardRow}>

          {/* PENDAPATAN */}
          <View style={styles.smallCard}>

            <View style={styles.iconYellow}>

              <Text style={styles.moneyText}>
                $
              </Text>

            </View>

            <Text style={styles.cardLabel}>
              Pendapatan
            </Text>

            <Text style={styles.cardValue}>
              {formatRupiah(
                summary.pendapatan
              )}
            </Text>

          </View>

          {/* KEUNTUNGAN */}
          <View style={styles.smallCard}>

            <View style={styles.iconGreen}>

              <Ionicons
                name="trending-up"
                size={15}
                color="#2E7D32"
              />

            </View>

            <Text style={styles.cardLabel}>
              Keuntungan
            </Text>

            <Text style={styles.cardValue}>
              {formatRupiah(
                summary.keuntungan
              )}
            </Text>

          </View>

        </View>

        {/* GRAFIK */}
        <View style={styles.chartCard}>

          <Text style={styles.chartTitle}>
            Grafik Penjualan
          </Text>

          <Text style={styles.chartSub}>
            {selectedTab === "7hari"
              ? "7 Hari Terakhir"
              : "6 Bulan Terakhir"}
          </Text>

          {chartData && (

            <BarChart
              data={chartData}

              width={screenWidth - 80}

              height={220}

              fromZero

              showValuesOnTopOfBars

              yAxisLabel=""

              yAxisSuffix=""

              chartConfig={{

                backgroundColor: "#fff",

                backgroundGradientFrom:
                  "#fff",

                backgroundGradientTo:
                  "#fff",

                decimalPlaces: 0,

                color: () => "#8EC5FF",

                labelColor: () => "#777",

                barPercentage: 0.6,
              }}

              style={{
                marginTop: 10,
                borderRadius: 16,
              }}
            />
          )}

        </View>

        {/* PRODUK TERLARIS */}
        <View
          style={styles.bestSellerCard}
        >

          <Text
            style={
              styles.bestSellerTitle
            }
          >
            Produk Terlaris (
            {selectedTab ===
            "7hari"
              ? "7 Hari Terakhir"
              : "6 Bulan Terakhir"}
            )
          </Text>

          {/* DONUT */}
          <View style={styles.pieRow}>

            <View
              style={
                styles.donutWrapper
              }
            >

              {pieData.length > 0 && (

                <PieChart
                  data={pieData}

                  width={170}

                  height={170}

                  accessor={"population"}

                  backgroundColor={
                    "transparent"
                  }

                  paddingLeft={"15"}

                  hasLegend={false}

                  chartConfig={{
                    color: () => "#000",
                  }}
                />
              )}

              <View
                style={
                  styles.donutCenter
                }
              />

            </View>

            {/* LEGEND */}
            <View
              style={
                styles.legendContainer
              }
            >

              {pieData.map(
                (item, index) => (

                  <View
                    key={index}
                    style={
                      styles.legendLine
                    }
                  >

                    <View
                      style={
                        styles.legendLeft
                      }
                    >

                      <View
                        style={[
                          styles.legendDot,
                          {
                            backgroundColor:
                              item.color,
                          },
                        ]}
                      />

                      <Text
                        style={
                          styles.legendName
                        }
                      >
                        {item.name}
                      </Text>

                    </View>

                    <Text
                      style={
                        styles.legendPercent
                      }
                    >
                      {item.population}%
                    </Text>

                  </View>
                )
              )}

            </View>

          </View>

          {/* CARD PRODUK */}
          {produkTerlaris.map(
            (
              item: any,
              index
            ) => (

              <View
                key={index}
                style={[
                  styles.productCard,
                  {
                    backgroundColor:
                      index === 0
                        ? "#F6C1C6"
                        : "#F3F3F3",
                  },
                ]}
              >

                <View
                  style={
                    styles.productLeft
                  }
                >

                  <View
                    style={[
                      styles.productIcon,

                      {
                        backgroundColor:
                          index === 0
                            ? "#FFE85E"
                            : index === 1
                            ? "#8ED8FF"
                            : "#E6A8FF",
                      },
                    ]}
                  >

                    <Ionicons
                      name="medal"
                      size={18}
                      color="#111"
                    />

                  </View>

                  <View>

                    <Text
                      style={
                        styles.productName
                      }
                    >
                      {item.nama}
                    </Text>

                    <Text
                      style={
                        styles.productIncome
                      }
                    >
                      Pendapatan :
                      {" "}
                      {formatRupiah(
                        item.total
                      )}
                    </Text>

                  </View>

                </View>

                <View
                  style={
                    styles.productRight
                  }
                >

                  <Text
                    style={
                      styles.productQty
                    }
                  >
                    {item.qty}
                  </Text>

                  <Text
                    style={
                      styles.productSold
                    }
                  >
                    Terjual
                  </Text>

                </View>

              </View>
            )
          )}

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    flex: 1,
    backgroundColor: "#F6AEB5",
  },

  header: {
    backgroundColor: "#E9B1B5",

    paddingTop: 50,

    paddingHorizontal: 20,

    paddingBottom: 25,

    borderBottomLeftRadius: 30,

    borderBottomRightRadius: 30,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.12,

    shadowRadius: 8,

    elevation: 6,
  },

  logo: {
    width: 150,
    height: 40,
    resizeMode: "contain",
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },

  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },

  filterContainer: {
    flexDirection: "row",

    backgroundColor:
      "rgba(255,255,255,0.3)",

    margin: 20,

    borderRadius: 20,

    padding: 5,
  },

  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: "center",
  },

  activeButton: {
    backgroundColor: "white",
  },

  filterText: {
    color: "#333",
    fontWeight: "500",
    fontSize: 13,
  },

  activeText: {
    fontWeight: "bold",
  },

  todayTitle: {
    marginHorizontal: 20,
    marginBottom: 10,
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
  },

  smallCard: {
    backgroundColor: "white",
    width: "48%",
    borderRadius: 18,
    padding: 15,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.08,

    shadowRadius: 6,

    elevation: 4,
  },

  iconYellow: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: "#F9D98C",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  iconGreen: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: "#B7F29D",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  moneyText: {
    fontWeight: "bold",
    fontSize: 16,
  },

  cardLabel: {
    color: "#999",
    fontSize: 12,
  },

  cardValue: {
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 5,
  },

  chartCard: {
    backgroundColor: "white",

    marginHorizontal: 20,

    marginTop: 20,

    borderRadius: 24,

    padding: 18,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.1,

    shadowRadius: 8,

    elevation: 5,

    marginBottom: 20,
  },

  chartTitle: {
    fontWeight: "bold",
    fontSize: 18,
  },

  chartSub: {
    color: "#999",
    fontSize: 12,
    marginTop: 2,
  },

  bestSellerCard: {
    backgroundColor: "white",

    marginHorizontal: 20,

    marginBottom: 30,

    borderRadius: 24,

    padding: 18,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.1,

    shadowRadius: 8,

    elevation: 5,
  },

  bestSellerTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 15,
  },

  pieRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  donutWrapper: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  donutCenter: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
  },

  legendContainer: {
    flex: 1,
    gap: 18,
  },

  legendLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  legendLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },

  legendName: {
    fontSize: 12,
    color: "#333",
  },

  legendPercent: {
    fontSize: 12,
    color: "#333",
  },

  productCard: {
    marginTop: 15,
    borderRadius: 20,
    padding: 15,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  productLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  productIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,

    justifyContent: "center",

    alignItems: "center",

    marginRight: 12,
  },

  productName: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#222",
  },

  productIncome: {
    color: "#888",
    marginTop: 2,
    fontSize: 12,
  },

  productRight: {
    alignItems: "center",
  },

  productQty: {
    fontWeight: "bold",
    fontSize: 28,
    color: "#111",
  },

  productSold: {
    color: "#777",
    fontSize: 12,
  },
});