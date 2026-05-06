import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import { API_BASE } from "../../../constants/api";


export default function Home() {
  const { butteryId } = useLocalSearchParams();
  const butteryIdValue = Array.isArray(butteryId) ? butteryId[0] : butteryId;

  const [buttery, setButtery] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [hours, setHours] = useState<any[]>([]);

  const DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const today = new Date().getDay();

  const refreshButtery = () => {
    if (!butteryIdValue) return;

    axios
      .get(`${API_BASE}/butteries/${butteryIdValue}`)
      .then((res) => setButtery(res.data))
      .catch((err) => console.log("buttery error", err));
  };

  const refreshHours = () => {
    if (!butteryIdValue) return;

    axios
      .get(`${API_BASE}/butteries/${butteryIdValue}/hours`)
      .then((res) => setHours(res.data))
      .catch((err) => console.log("hours error", err));
  };

  const refreshStatus = () => {
    if (!butteryIdValue) return;

    axios
      .get(`${API_BASE}/butteries/${butteryIdValue}/status`)
      .then((res) => {
        setStatus(res.data);
      })
      .catch((err) => console.log("status error", err));
  };

  const formatTime = (time: string | null) => {
    if (!time) return "";

    const [hourStr, minute] = time.split(":");
    let hour = parseInt(hourStr);

    const ampm = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;
    if (hour === 0) hour = 12;

    return `${hour}:${minute} ${ampm}`;
  };

  useFocusEffect(
    useCallback(() => {
      if (!butteryIdValue) return;

      refreshButtery();
      refreshHours();
      refreshStatus();
    }, [butteryIdValue])
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.pageLabel}>Welcome to</Text>
        <Text style={styles.title}>{buttery?.display_name || "Loading..."}</Text>
        <Text style={styles.subtitle}>
          Hours, live status, and regular weekly schedule
        </Text>
      </View>

      <View
        style={[
          styles.statusCard,
          status?.is_open ? styles.statusCardOpen : styles.statusCardClosed,
        ]}
      >
        <Text
          style={[
            styles.statusBadge,
            status?.is_open ? styles.badgeOpen : styles.badgeClosed,
          ]}
        >
          {status ? (status.is_open ? "OPEN NOW" : "CLOSED") : "LOADING STATUS..."}
        </Text>

        <Text style={styles.statusDetail}>
          {status
            ? status.source === "override"
              ? `Manual override${status.updated_at ? ` · as of ${status.updated_at}` : ""}`
              : "Based on regular schedule"
            : ""}
        </Text>
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Regular Schedule</Text>
        <Text style={styles.sectionSubtitle}>Weekly hours</Text>
      </View>

      <View style={styles.scheduleWrapper}>
        {hours.map((day: any) => {
          const isToday = day.day_of_week === today;

          return (
            <View
              key={`day-${day.day_of_week}`}
              style={[styles.dayCard, isToday && styles.todayCard]}
            >
              <View style={styles.row}>
                <View>
                  <Text style={[styles.day, isToday && styles.todayText]}>
                    {DAYS[day.day_of_week]}
                  </Text>
                  {isToday && <Text style={styles.todayLabel}>Today</Text>}
                </View>

                <Text
                  style={
                    day.is_closed_all_day
                      ? styles.hoursClosed
                      : styles.hoursOpen
                  }
                >
                  {day.is_closed_all_day
                    ? "Closed"
                    : `${formatTime(day.open_time)} - ${formatTime(day.close_time)}`}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FC",
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },

  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  pageLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#6B7280",
    marginBottom: 8,
    textAlign: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },

  statusCard: {
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginBottom: 22,
    alignItems: "center",
  },
  statusCardOpen: {
    backgroundColor: "#EAF8EE",
    borderWidth: 1,
    borderColor: "#B7E4C7",
  },
  statusCardClosed: {
    backgroundColor: "#FDECEC",
    borderWidth: 1,
    borderColor: "#F5B5B5",
  },
  statusBadge: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  badgeOpen: {
    color: "#1B7F3B",
  },
  badgeClosed: {
    color: "#C0392B",
  },
  statusDetail: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },

  sectionHeaderRow: {
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },

  scheduleWrapper: {
    gap: 10,
  },
  dayCard: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  todayCard: {
    borderWidth: 2,
    borderColor: "#00356B",
    backgroundColor: "#F3F7FF",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  day: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  todayText: {
    color: "#00356B",
  },
  todayLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#00356B",
  },
  hoursOpen: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  hoursClosed: {
    fontSize: 14,
    color: "#C0392B",
    fontWeight: "700",
  },
});