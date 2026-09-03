import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";

const API = process.env.EXPO_PUBLIC_SITE_URL || "http://127.0.0.1:3000";
const tokens = {
  carbon: "#0A0A0A",
  bone: "#F3F0E7",
  paper: "#FAF8F2",
  mute: "#6E6C64",
  point: "#62E000",
  hairline: "#2A2924",
};

export default function App() {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);
  const [job, setJob] = useState(null);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/api/auth/session`)
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => {});
  }, []);

  async function signIn() {
    setBusy(true);
    const res = await fetch(`${API}/api/auth/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, mode: "local" }),
    });
    const data = await res.json();
    setUser(data.user);
    setBusy(false);
  }

  async function shoot() {
    setBusy(true);
    const created = await (await fetch(`${API}/api/jobs`, { method: "POST" })).json();
    const pick = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"] });
    if (!pick.canceled) {
      const form = new FormData();
      form.append("jobId", created.job.id);
      form.append("slot", "cover");
      form.append("file", {
        uri: pick.assets[0].uri,
        name: "cover.jpg",
        type: "image/jpeg",
      });
      const up = await (
        await fetch(`${API}/api/upload`, { method: "POST", body: form })
      ).json();
      setJob(up.job);
    } else {
      setJob(created.job);
    }
    setBusy(false);
  }

  async function saveFacts() {
    if (!job) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/api/facts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          facts: { title, price: "", material: "", ownerBrand: "" },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setJob(data.job);
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.pad}>
        <View style={styles.row}>
          <View style={styles.point} />
          <Text style={styles.kicker}>PIXELPOINT</Text>
        </View>
        <Text style={styles.h1}>OwnerShot Ads</Text>
        {!user ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Shop email"
              placeholderTextColor={tokens.mute}
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <Pressable style={styles.pointBtn} onPress={signIn}>
              <Text style={styles.pointBtnText}>Continue as shop owner</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.mute}>{user.email}</Text>
            <Pressable style={styles.carbonBtn} onPress={shoot}>
              <Text style={styles.carbonBtnText}>Shoot / Library</Text>
            </Pressable>
            {job?.coverUrl ? (
              <Image source={{ uri: `${API}${job.coverUrl}` }} style={styles.cover} />
            ) : null}
            <TextInput
              style={styles.input}
              placeholder="Title *"
              placeholderTextColor={tokens.mute}
              value={title}
              onChangeText={setTitle}
            />
            <Pressable
              style={[styles.pointBtn, !title || !job?.coverUrl ? styles.dead : null]}
              onPress={saveFacts}
              disabled={!title || !job?.coverUrl}
            >
              <Text style={styles.pointBtnText}>Save facts</Text>
            </Pressable>
            {error ? <Text style={styles.err}>{error}</Text> : null}
            {busy ? <ActivityIndicator color={tokens.point} /> : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.bone },
  pad: { padding: 20, gap: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  point: { width: 8, height: 8, backgroundColor: tokens.point },
  kicker: { letterSpacing: 4, fontSize: 11, color: tokens.mute, fontWeight: "600" },
  h1: { fontSize: 36, fontWeight: "700", color: tokens.carbon },
  mute: { color: tokens.mute },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: tokens.hairline,
    backgroundColor: tokens.paper,
    paddingHorizontal: 12,
    color: tokens.carbon,
    borderRadius: 2,
  },
  pointBtn: {
    minHeight: 44,
    backgroundColor: tokens.point,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 2,
  },
  pointBtnText: { color: tokens.carbon, fontWeight: "700", letterSpacing: 1.2 },
  carbonBtn: {
    minHeight: 44,
    backgroundColor: tokens.carbon,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 2,
  },
  carbonBtnText: { color: tokens.bone, fontWeight: "700", letterSpacing: 1.2 },
  dead: { backgroundColor: "#DDD8CC" },
  cover: { width: "100%", aspectRatio: 1, backgroundColor: tokens.carbon },
  err: { color: "#E23B2E" },
});
