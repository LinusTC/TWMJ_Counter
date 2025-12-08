import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface GradientBackgroundProps {
  children: React.ReactNode;
}

export default function gradientBackground({ children }: GradientBackgroundProps) {
  return (
    <LinearGradient
      colors={["#FFF9E6", "#FFE8E8", "#F5E8FF", "#E8FFFF"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
