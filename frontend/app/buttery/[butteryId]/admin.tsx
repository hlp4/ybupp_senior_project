import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import { API_BASE } from "../../../constants/api";

export default function AdminScreen() {
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  const { butteryId } = useLocalSearchParams();
  const butteryIdValue = Array.isArray(butteryId) ? butteryId[0] : butteryId;

  const [menu, setMenu] = useState<any[]>([]);
  const [hours, setHours] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showHours, setShowHours] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [openCategories, setOpenCategories] = useState<{ [key: number]: boolean }>({});
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editSearchQuery, setEditSearchQuery] = useState("");
  const [status, setStatus] = useState<any>(null);

  const [editHours, setEditHours] = useState({
    open_time: "",
    close_time: "",
    is_closed_all_day: false,
  });

  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    category_id: null as number | null,
  });

  const DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const refreshMenu = () => {
    if (!butteryIdValue) return;

    axios
      .get(`${API_BASE}/butteries/${butteryIdValue}/menu`)
      .then((res) => setMenu(res.data))
      .catch((err) => console.log("menu error", err));
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
      .then((res) => setStatus(res.data))
      .catch((err) => console.log("status error", err));
  };

  const refreshCategories = () => {
    if (!butteryIdValue) return;

    axios
      .get(`${API_BASE}/butteries/${butteryIdValue}/categories`)
      .then((res) => setCategories(res.data))
      .catch((err) => console.log("categories error", err));
  };

  const handleAdd = async () => {
    if (!newItem.name.trim() || !newItem.price || newItem.category_id === null) {
      console.log("Missing required fields");
      return;
    }
    if (!butteryIdValue) return;

    await axios.post(`${API_BASE}/butteries/${butteryIdValue}/menu`, {
      ...newItem,
      price: parseFloat(newItem.price) || 0,
    });

    setShowAddItem(false);
    setNewItem({
      name: "",
      price: "",
      category_id: null,
    });
    refreshMenu();
  };

  const handleSaveHours = async () => {
    if (!butteryIdValue || editingDay === null) return;

    await axios.put(
      `${API_BASE}/butteries/${butteryIdValue}/hours/${editingDay}`,
      editHours
    );

    setEditingDay(null);
    refreshHours();
  };

  const handleForceOpen = async () => {
    if (!butteryIdValue) return;

    await axios.post(`${API_BASE}/butteries/${butteryIdValue}/override`, {
      is_open: true,
      updated_by: "admin",
      reason: "Manually forced open",
    });

    refreshStatus();
  };

  const handleForceClosed = async () => {
    if (!butteryIdValue) return;

    await axios.post(`${API_BASE}/butteries/${butteryIdValue}/override`, {
      is_open: false,
      updated_by: "admin",
      reason: "Manually forced closed",
    });

    refreshStatus();
  };

  const handleReturnToSchedule = async () => {
    if (!butteryIdValue) return;

    await axios.post(`${API_BASE}/butteries/${butteryIdValue}/override/clear`);
    refreshStatus();
  };

  const toggleCategory = (categoryId: number) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const startEditingItem = (item: any) => {
    setEditingItemId(item.id);
    setSelectedItem({
      ...item,
      price: String(item.price),
    });
  };

  const cancelEditingItem = () => {
    setEditingItemId(null);
    setSelectedItem(null);
  };

  const filteredEditMenu = menu.filter((item: any) =>
    item.name.toLowerCase().includes(editSearchQuery.toLowerCase())
  );

  const groupedEditMenu = categories.map((cat: any) => ({
    ...cat,
    items: filteredEditMenu.filter(
      (item: any) => Number(item.category_id) === Number(cat.id)
    ),
  }));

  const visibleEditGroups = groupedEditMenu.filter(
    (group: any) => group.items.length > 0
  );

  useEffect(() => {
    if (!butteryIdValue) return;
    refreshMenu();
    refreshHours();
    refreshStatus();
    refreshCategories();
  }, [butteryIdValue]);

  if (!adminUnlocked) {
    return (
      <View style={styles.lockedScreen}>
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>Admin Access</Text>
          <Text style={styles.authSubtitle}>
            Enter the admin password to manage operating status, menu items, and hours.
          </Text>

          <TextInput
            placeholder="Enter admin password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={passwordInput}
            onChangeText={setPasswordInput}
            style={styles.input}
          />

          {authError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{authError}</Text>
            </View>
          ) : null}

          <Pressable
            style={styles.primaryButton}
            onPress={async () => {
              try {
                const res = await axios.post(
                  `${API_BASE}/butteries/${butteryIdValue}/verify-admin`,
                  { password: passwordInput }
                );

                if (res.data.success) {
                  setAdminUnlocked(true);
                  setAuthError("");
                  setPasswordInput("");
                }
              } catch (err) {
                setAuthError("Incorrect password");
              }
            }}
          >
            <Text style={styles.primaryButtonText}>Unlock Admin</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.pageTitle}>Admin Panel</Text>
        <Text style={styles.pageSubtitle}>
          Manage operating status, menu items, and buttery hours
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Operating Status</Text>
        <Text style={styles.sectionSubtitle}>
          Control whether this buttery follows its regular schedule or a manual override.
        </Text>

        <View
          style={[
            styles.statusBanner,
            status?.is_open ? styles.statusBannerOpen : styles.statusBannerClosed,
          ]}
        >
          <Text
            style={[
              styles.statusBannerText,
              status?.is_open ? styles.statusTextOpen : styles.statusTextClosed,
            ]}
          >
            {status ? (status.is_open ? "🟢 OPEN" : "🔴 CLOSED") : "Loading..."}
          </Text>

          <Text style={styles.statusMeta}>
            {status
              ? status.source === "override"
                ? `Override active${status.updated_at ? ` · ${status.updated_at}` : ""}`
                : "Following regular schedule"
              : ""}
          </Text>
        </View>

        <View style={styles.buttonGroup}>
          <Pressable style={styles.primaryButton} onPress={handleForceOpen}>
            <Text style={styles.primaryButtonText}>Force Open</Text>
          </Pressable>

          <Pressable style={styles.dangerButton} onPress={handleForceClosed}>
            <Text style={styles.dangerButtonText}>Force Closed</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={handleReturnToSchedule}>
            <Text style={styles.secondaryButtonText}>Return to Schedule</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Pressable
          onPress={() => {
            setShowEditMenu(!showEditMenu);
            if (showEditMenu) {
              setEditingItemId(null);
              setSelectedItem(null);
              setEditSearchQuery("");
            }
          }}
          style={styles.sectionHeader}
        >
          <Text style={styles.sectionTitle}>Edit Menu</Text>
          <Text style={styles.chevron}>{showEditMenu ? "▲" : "▼"}</Text>
        </Pressable>

        {showEditMenu && (
          <View style={styles.formContainer}>
            <TextInput
              placeholder="Search menu items to edit..."
              placeholderTextColor="#9CA3AF"
              value={editSearchQuery}
              onChangeText={setEditSearchQuery}
              style={styles.input}
            />

            {visibleEditGroups.map((category: any) => {
              const isSearching = editSearchQuery.trim().length > 0;
              const hasMatchingItems = category.items.length > 0;
              const isCategoryOpen = isSearching
                ? hasMatchingItems
                : openCategories[category.id];

              return (
                <View key={category.id} style={styles.subCard}>
                  <Pressable
                    onPress={() => {
                      if (!isSearching) {
                        toggleCategory(category.id);
                      }
                    }}
                    style={styles.sectionHeader}
                  >
                    <Text style={styles.subCardTitle}>{category.name}</Text>
                    <Text style={styles.chevron}>{isCategoryOpen ? "▲" : "▼"}</Text>
                  </Pressable>

                  {isCategoryOpen && (
                    <View style={styles.innerStack}>
                      {category.items.map((item: any) => {
                        const isEditing = editingItemId === item.id;

                        return (
                          <View key={item.id} style={styles.itemCard}>
                            <View style={styles.itemRow}>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <View style={styles.metaRow}>
                                  <Text style={styles.itemPrice}>
                                    ${Number(item.price).toFixed(2)}
                                  </Text>
                                  <View style={styles.itemStatusBadge}>
                                    <Text style={styles.itemStatusText}>
                                      {item.status}
                                    </Text>
                                  </View>
                                </View>
                              </View>

                              <Pressable
                                onPress={() => {
                                  if (isEditing) {
                                    cancelEditingItem();
                                  } else {
                                    startEditingItem(item);
                                  }
                                }}
                                style={styles.smallButton}
                              >
                                <Text style={styles.smallButtonText}>
                                  {isEditing ? "Cancel" : "Edit"}
                                </Text>
                              </Pressable>
                            </View>

                            {isEditing && selectedItem && (
                              <View style={styles.editBox}>
                                <Text style={styles.editLabel}>Edit {item.name}</Text>

                                <Text style={styles.fieldLabel}>Item Name</Text>
                                <TextInput
                                  placeholder="Item name"
                                  placeholderTextColor="#888"
                                  value={selectedItem.name}
                                  onChangeText={(t) =>
                                    setSelectedItem({ ...selectedItem, name: t })
                                  }
                                  style={styles.input}
                                />

                                <Text style={styles.fieldLabel}>Price</Text>
                                <TextInput
                                  placeholder="Price"
                                  placeholderTextColor="#888"
                                  keyboardType="numeric"
                                  value={String(selectedItem.price)}
                                  onChangeText={(t) =>
                                    setSelectedItem({ ...selectedItem, price: t })
                                  }
                                  style={styles.input}
                                />

                                <Text style={styles.fieldLabel}>Category</Text>
                                <View style={styles.pickerWrapper}>
                                  <RNPickerSelect
                                    onValueChange={(value) =>
                                      setSelectedItem({
                                        ...selectedItem,
                                        category_id: value,
                                      })
                                    }
                                    value={selectedItem.category_id}
                                    items={categories.map((c: any) => ({
                                      label: c.name,
                                      value: c.id,
                                    }))}
                                    placeholder={{
                                      label: "Select Category...",
                                      value: null,
                                    }}
                                    style={{
                                      inputIOSContainer: styles.pickerInput,
                                      inputAndroid: styles.pickerInput,
                                      placeholder: {
                                        color: "#888",
                                      },
                                    }}
                                  />
                                </View>

                                <Text style={styles.fieldLabel}>Status</Text>
                                <View style={styles.statusRow}>
                                  <Pressable
                                    style={[
                                      styles.statusButton,
                                      selectedItem.status === "available" &&
                                        styles.statusButtonActive,
                                    ]}
                                    onPress={() =>
                                      setSelectedItem({
                                        ...selectedItem,
                                        status: "available",
                                      })
                                    }
                                  >
                                    <Text style={styles.statusButtonText}>Available</Text>
                                  </Pressable>

                                  <Pressable
                                    style={[
                                      styles.statusButton,
                                      selectedItem.status === "low_stock" &&
                                        styles.statusButtonActive,
                                    ]}
                                    onPress={() =>
                                      setSelectedItem({
                                        ...selectedItem,
                                        status: "low_stock",
                                      })
                                    }
                                  >
                                    <Text style={styles.statusButtonText}>Low Stock</Text>
                                  </Pressable>

                                  <Pressable
                                    style={[
                                      styles.statusButton,
                                      selectedItem.status === "sold_out" &&
                                        styles.statusButtonActive,
                                    ]}
                                    onPress={() =>
                                      setSelectedItem({
                                        ...selectedItem,
                                        status: "sold_out",
                                      })
                                    }
                                  >
                                    <Text style={styles.statusButtonText}>Sold Out</Text>
                                  </Pressable>
                                </View>

                                <Pressable
                                  style={styles.primaryButton}
                                  onPress={async () => {
                                    const parsedPrice = parseFloat(selectedItem.price);

                                    if (
                                      !selectedItem.name.trim() ||
                                      Number.isNaN(parsedPrice)
                                    ) {
                                      console.log("Invalid item data");
                                      return;
                                    }
                                    if (!butteryIdValue) return;

                                    await axios.put(
                                      `${API_BASE}/butteries/${butteryIdValue}/menu/${selectedItem.id}`,
                                      {
                                        name: selectedItem.name,
                                        price: parsedPrice,
                                        category_id: selectedItem.category_id,
                                        status: selectedItem.status,
                                      }
                                    );

                                    cancelEditingItem();
                                    refreshMenu();
                                  }}
                                >
                                  <Text style={styles.primaryButtonText}>
                                    Save Changes
                                  </Text>
                                </Pressable>

                                <Pressable
                                  style={styles.dangerSoftButton}
                                  onPress={async () => {
                                    if (!butteryIdValue) return;
                                    await axios.delete(
                                      `${API_BASE}/butteries/${butteryIdValue}/menu/${selectedItem.id}`
                                    );
                                    cancelEditingItem();
                                    refreshMenu();
                                  }}
                                >
                                  <Text style={styles.dangerSoftButtonText}>
                                    Delete Item
                                  </Text>
                                </Pressable>
                              </View>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}

            {visibleEditGroups.length === 0 && (
              <View style={styles.emptyStateCard}>
                <Text style={styles.emptyStateTitle}>No matching menu items</Text>
                <Text style={styles.emptyStateText}>
                  Try a different search term to find the item you want to edit.
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.sectionCard}>
        <Pressable
          onPress={() => setShowAddItem(!showAddItem)}
          style={styles.sectionHeader}
        >
          <Text style={styles.sectionTitle}>Add New Item</Text>
          <Text style={styles.chevron}>{showAddItem ? "▲" : "▼"}</Text>
        </Pressable>

        {showAddItem && (
          <View style={styles.formContainer}>
            <Text style={styles.fieldLabel}>Item Name</Text>
            <TextInput
              placeholder="Name"
              value={newItem.name}
              placeholderTextColor="#888"
              onChangeText={(text) => setNewItem({ ...newItem, name: text })}
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>Price</Text>
            <TextInput
              placeholder="Price"
              value={newItem.price}
              placeholderTextColor="#888"
              keyboardType="numeric"
              onChangeText={(text) => setNewItem({ ...newItem, price: text })}
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.pickerWrapper}>
              <RNPickerSelect
                onValueChange={(value) =>
                  setNewItem({ ...newItem, category_id: value })
                }
                value={newItem.category_id}
                items={categories.map((c: any) => ({
                  label: c.name,
                  value: c.id,
                }))}
                placeholder={{ label: "Select Category...", value: null }}
                style={{
                  inputIOSContainer: styles.pickerInput,
                  inputAndroid: styles.pickerInput,
                  placeholder: {
                    color: "#888",
                  },
                }}
              />
            </View>

            <Pressable style={styles.primaryButton} onPress={handleAdd}>
              <Text style={styles.primaryButtonText}>Add Item</Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.sectionCard}>
        <Pressable
          onPress={() => {
            setShowHours(!showHours);
            if (showHours) {
              setEditingDay(null);
            }
          }}
          style={styles.sectionHeader}
        >
          <Text style={styles.sectionTitle}>Edit Hours</Text>
          <Text style={styles.chevron}>{showHours ? "▲" : "▼"}</Text>
        </Pressable>

        {showHours && (
          <View style={styles.formContainer}>
            {hours.map((day: any) => {
              const isEditing = editingDay === day.day_of_week;

              return (
                <View
                  key={`day-${day.day_of_week}`}
                  style={[styles.subCard, isEditing && styles.activeEditCard]}
                >
                  <View style={styles.itemRow}>
                    <View>
                      <Text style={styles.subCardTitle}>{DAYS[day.day_of_week]}</Text>
                      <Text
                        style={
                          day.is_closed_all_day
                            ? styles.closedHoursText
                            : styles.hoursText
                        }
                      >
                        {day.is_closed_all_day
                          ? "Closed"
                          : `${day.open_time} - ${day.close_time}`}
                      </Text>
                    </View>

                    <Pressable
                      onPress={() => {
                        if (isEditing) {
                          setEditingDay(null);
                        } else {
                          setEditingDay(day.day_of_week);
                          setEditHours({
                            open_time: day.open_time || "",
                            close_time: day.close_time || "",
                            is_closed_all_day: day.is_closed_all_day,
                          });
                        }
                      }}
                      style={styles.smallButton}
                    >
                      <Text style={styles.smallButtonText}>
                        {isEditing ? "Cancel" : "Edit"}
                      </Text>
                    </Pressable>
                  </View>

                  {isEditing && (
                    <View style={styles.editBox}>
                      <Text style={styles.editLabel}>Edit {DAYS[day.day_of_week]}</Text>

                      {!editHours.is_closed_all_day && (
                        <>
                          <Text style={styles.fieldLabel}>Open Time</Text>
                          <TextInput
                            placeholder="Open time (e.g. 21:30)"
                            placeholderTextColor="#888"
                            value={editHours.open_time}
                            onChangeText={(t) =>
                              setEditHours({ ...editHours, open_time: t })
                            }
                            style={styles.input}
                          />

                          <Text style={styles.fieldLabel}>Close Time</Text>
                          <TextInput
                            placeholder="Close time (e.g. 00:00)"
                            placeholderTextColor="#888"
                            value={editHours.close_time}
                            onChangeText={(t) =>
                              setEditHours({ ...editHours, close_time: t })
                            }
                            style={styles.input}
                          />
                        </>
                      )}

                      <Pressable
                        onPress={() =>
                          setEditHours({
                            ...editHours,
                            is_closed_all_day: !editHours.is_closed_all_day,
                          })
                        }
                        style={styles.secondaryButton}
                      >
                        <Text style={styles.secondaryButtonText}>
                          {editHours.is_closed_all_day
                            ? "Mark as OPEN"
                            : "Mark as CLOSED all day"}
                        </Text>
                      </Pressable>

                      <Pressable style={styles.primaryButton} onPress={handleSaveHours}>
                        <Text style={styles.primaryButtonText}>Save Hours</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  lockedScreen: {
    flex: 1,
    backgroundColor: "#F6F8FC",
    padding: 24,
    justifyContent: "center",
  },
  authCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 18,
  },

  container: {
    flex: 1,
    backgroundColor: "#F6F8FC",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
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
  pageTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 14,
    lineHeight: 18,
  },
  chevron: {
    fontSize: 16,
    color: "#6B7280",
  },
  formContainer: {
    marginTop: 14,
    gap: 12,
  },

  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#111827",
  },
  pickerWrapper: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  pickerInput: {
    zIndex: 100,
    fontSize: 16,
    color: "#111827",
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: -4,
  },

  errorBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 12,
    marginBottom: 4,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 14,
    fontWeight: "600",
  },

  statusBanner: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  statusBannerOpen: {
    backgroundColor: "#EAF8EE",
    borderWidth: 1,
    borderColor: "#B7E4C7",
  },
  statusBannerClosed: {
    backgroundColor: "#FDECEC",
    borderWidth: 1,
    borderColor: "#F5B5B5",
  },
  statusBannerText: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6,
  },
  statusTextOpen: {
    color: "#1B7F3B",
  },
  statusTextClosed: {
    color: "#C0392B",
  },
  statusMeta: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },

  buttonGroup: {
    gap: 10,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  dangerButton: {
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  dangerButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  secondaryButtonText: {
    color: "#1D4ED8",
    fontWeight: "700",
    fontSize: 16,
  },
  dangerSoftButton: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 10,
  },
  dangerSoftButtonText: {
    color: "#B91C1C",
    fontWeight: "700",
    fontSize: 16,
  },

  subCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ECEFF3",
  },
  activeEditCard: {
    borderColor: "#BFDBFE",
    backgroundColor: "#F8FBFF",
  },
  subCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  innerStack: {
    marginTop: 12,
    gap: 10,
  },

  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#00356B",
  },
  itemStatusBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  itemStatusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4338CA",
    textTransform: "capitalize",
  },

  smallButton: {
    backgroundColor: "#EEF2FF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  smallButtonText: {
    color: "#2563EB",
    fontWeight: "700",
  },

  editBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 10,
  },
  editLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },

  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  statusButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  statusButtonActive: {
    backgroundColor: "#DBEAFE",
    borderWidth: 1,
    borderColor: "#93C5FD",
  },
  statusButtonText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 13,
  },

  hoursText: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 4,
  },
  closedHoursText: {
    fontSize: 14,
    color: "#B91C1C",
    fontWeight: "700",
    marginTop: 4,
  },

  emptyStateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
});