import { Tabs, useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Alert } from "react-native";

export default function ButteryTabsLayout() {
  const { butteryId } = useLocalSearchParams();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "ellipse";

          if (route.name === "index") iconName = "home";
          else if (route.name === "menu") iconName = "restaurant";
          else if (route.name === "admin") iconName = "settings";
          else if (route.name === "butteries") iconName = "exit-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home" }}
        initialParams={{ butteryId }}
      />

      <Tabs.Screen
        name="menu"
        options={{ title: "Menu" }}
        initialParams={{ butteryId }}
      />

      <Tabs.Screen
        name="admin"
        options={{ title: "Admin" }}
        initialParams={{ butteryId }}
      />

      <Tabs.Screen
        name="butteries"
        options={{ title: "Exit" }}
        initialParams={{ butteryId }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();

            Alert.alert(
              "Exit",
              "Are you sure you want to return to the main menu?",
              [
                { text: "No", style: "cancel" },
                {
                  text: "Yes",
                  onPress: () => router.replace("/"),
                },
              ]
            );
          },
        }}
      />
    </Tabs>
  );
}