import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SwapScreen } from "./src/screens/SwapScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: "#0a0a0f" },
            headerTintColor: "#ffffff",
            contentStyle: { backgroundColor: "#0a0a0f" },
          }}
        >
          <Stack.Screen name="Swap" component={SwapScreen} options={{ title: "AskStudio" }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
