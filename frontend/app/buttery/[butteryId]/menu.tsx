import { useState, useCallback } from "react";
import { View, Text, ScrollView, TextInput, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import { API_BASE } from "../../../constants/api";

export default function MenuScreen() {
  const { butteryId } = useLocalSearchParams();
  const butteryIdValue = Array.isArray(butteryId) ? butteryId[0] : butteryId;

  const [menu, setMenu] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "available":
        return {
          bg: "#EAF8EE",
          text: "#1B7F3B",
          label: "Available",
        };
      case "low_stock":
        return {
          bg: "#FFF7E0",
          text: "#A16207",
          label: "Low Stock",
        };
      case "sold_out":
        return {
          bg: "#FDECEC",
          text: "#C0392B",
          label: "Sold Out",
        };
      default:
        return {
          bg: "#F3F4F6",
          text: "#6B7280",
          label: "Unknown",
        };
    }
  };

  const filteredMenu = menu.filter((item: any) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedMenu = categories.map((cat: any) => ({
    ...cat,
    items: filteredMenu.filter(
      (item: any) => Number(item.category_id) === Number(cat.id)
    ),
  }));

  const visibleGroups = groupedMenu.filter((group: any) => group.items.length > 0);

  const refreshMenu = () => {
    if (!butteryIdValue) return;

    axios
      .get(`${API_BASE}/butteries/${butteryIdValue}/menu`)
      .then((res) => setMenu(res.data))
      .catch((err) => console.log("menu error", err));
  };

  const refreshCategories = () => {
    if (!butteryIdValue) return;

    axios
      .get(`${API_BASE}/butteries/${butteryIdValue}/categories`)
      .then((res) => setCategories(res.data))
      .catch((err) => console.log("categories error", err));
  };

  useFocusEffect(
    useCallback(() => {
      if (!butteryIdValue) return;
      refreshMenu();
      refreshCategories();
    }, [butteryIdValue])
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>Menu</Text>
        <Text style={styles.subtitle}>
          Browse available buttery items by category
        </Text>
      </View>

      <TextInput
        placeholder="Search menu items..."
        placeholderTextColor="#9CA3AF"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
      />

      {visibleGroups.map((group: any) => (
        <View key={group.id} style={styles.categoryCard}>
          <Text style={styles.categoryTitle}>{group.name}</Text>

          <View style={styles.itemsList}>
            {group.items.map((item: any) => {
              const statusStyle = getStatusStyles(item.status);

              return (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemTopRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>
                      ${Number(item.price).toFixed(2)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusStyle.bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: statusStyle.text },
                      ]}
                    >
                      {statusStyle.label}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ))}

      {visibleGroups.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No menu items found</Text>
          <Text style={styles.emptyText}>
            Try a different search term to find what you’re looking for.
          </Text>
        </View>
      )}
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
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    color: "#111827",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },

  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
    fontSize: 15,
    color: "#111827",
  },

  categoryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },

  itemsList: {
    gap: 10,
  },

  itemCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },
  itemTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginRight: 10,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: "#00356B",
  },

  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    marginTop: 12,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
});