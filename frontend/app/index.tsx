import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  StyleSheet,
  Animated,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import axios from "axios";
import { API_BASE } from "../constants/api";

const butteryImages: Record<string, any> = {
  Silliman: require("../assets/images/silliman.png"),
  Saybrook: require("../assets/images/saybrook.png"),
  Berkeley: require("../assets/images/berkeley.png"),
  Branford: require("../assets/images/branford.png"),
  Davenport: require("../assets/images/davenport.png"),
  "Ezra Stiles": require("../assets/images/ezra-stiles.png"),
  "Grace Hopper": require("../assets/images/grace-hopper.png"),
  "Jonathan Edwards": require("../assets/images/jonathan-edwards.png"),
  Morse: require("../assets/images/morse.png"),
  "Pauli Murray": require("../assets/images/pauli-murray.png"),
  Pierson: require("../assets/images/pierson.png"),
  "Timothy Dwight": require("../assets/images/timothy-dwight.png"),
  Trumbull: require("../assets/images/trumbull.png"),
  "Benjamin Franklin": require("../assets/images/benjamin-franklin.png"),
};

export default function ButterySelector() {
  const [butteries, setButteries] = useState<any[]>([]);
  const [showSplash, setShowSplash] = useState(true);

  const splashFade = useRef(new Animated.Value(0)).current;
  const splashSlide = useRef(new Animated.Value(30)).current;
  const contentFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    axios
      .get(`${API_BASE}/butteries`)
      .then((res) => setButteries(res.data))
      .catch((err) => console.log("butteries error", err));
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(splashFade, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(splashSlide, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(splashFade, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }).start(() => {
        setShowSplash(false);

        Animated.timing(contentFade, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }).start();
      });
    }, 2200);

    return () => clearTimeout(timer);
  }, [splashFade, splashSlide, contentFade]);

  const getButteryImage = (butteryName: string) => {
    return butteryImages[butteryName] || require("../assets/images/yale.svg");
  };

  if (showSplash) {
    return (
      <Animated.View style={[styles.splashContainer, { opacity: splashFade }]}>
        <Animated.View
          style={[
            styles.splashTextWrapper,
            { transform: [{ translateY: splashSlide }] },
          ]}
        >
          <Text style={styles.splashTitle}>Welcome to YBupp!</Text>
          <Text style={styles.splashSubtitle}>
            An app for all your Yale Buttery needs!
          </Text>
        </Animated.View>
      </Animated.View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.contentContainer, { opacity: contentFade }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.headerTitle}>Welcome to YBupp!</Text>

          <Text style={styles.headerSubtitle}>
            Choose a residential college buttery
          </Text>

          <View style={styles.grid}>
            {butteries.map((buttery: any) => (
              <Pressable
                key={buttery.id}
                onPress={() => router.push(`/buttery/${buttery.id}`)}
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.cardPressed,
                ]}
              >
                <View style={styles.imageWrapper}>
                  <Image
                    source={getButteryImage(buttery.name)}
                    style={styles.image}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.cardTextSection}>
                  <Text style={styles.cardTitle}>
                    {buttery.display_name || buttery.name}
                  </Text>

                  <Text style={styles.cardSubtitle}>{buttery.name}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },

  splashContainer: {
    flex: 1,
    backgroundColor: "#00356B",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  splashTextWrapper: {
    alignItems: "center",
  },
  splashTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "white",
    textAlign: "center",
    marginBottom: 12,
  },
  splashSubtitle: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    opacity: 0.95,
  },

  headerTitle: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    color: "#111827",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 24,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 18,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  imageWrapper: {
    height: 120,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  image: {
    width: "85%",
    height: "85%",
  },
  cardTextSection: {
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    color: "#111827",
  },
  cardSubtitle: {
    marginTop: 4,
    fontSize: 12,
    textAlign: "center",
    color: "#6b7280",
  },
});