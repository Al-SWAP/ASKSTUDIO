import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";

const JUPITER_API = "https://quote-api.jup.ag/v6";
const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

interface Quote {
  outAmount: string;
  priceImpactPct: string;
  slippageBps: number;
  routePlan: Array<{ swapInfo: { label?: string }; percent: number }>;
}

export function SwapScreen() {
  const [inputAmount, setInputAmount] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = async () => {
    const amount = parseFloat(inputAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Enter a valid amount");
      return;
    }

    setLoading(true);
    setError(null);
    setQuote(null);

    try {
      const lamports = Math.floor(amount * 1e9);
      const params = new URLSearchParams({
        inputMint: SOL_MINT,
        outputMint: USDC_MINT,
        amount: lamports.toString(),
        slippageBps: "50",
        swapMode: "ExactIn",
      });

      const res = await fetch(`${JUPITER_API}/quote?${params}`, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) throw new Error(`Quote failed: ${res.status}`);
      const data: Quote = await res.json();
      setQuote(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Quote failed");
    } finally {
      setLoading(false);
    }
  };

  const outputUsdc = quote
    ? (parseInt(quote.outAmount, 10) / 1e6).toFixed(4)
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>AskStudio Swap</Text>
      <Text style={styles.subtitle}>SOL → USDC · Powered by Jupiter</Text>

      <View style={styles.card}>
        <Text style={styles.label}>You Pay (SOL)</Text>
        <TextInput
          style={styles.input}
          value={inputAmount}
          onChangeText={setInputAmount}
          placeholder="0.00"
          placeholderTextColor="#ffffff40"
          keyboardType="numeric"
        />
      </View>

      {quote && (
        <View style={styles.card}>
          <Text style={styles.label}>You Receive (USDC)</Text>
          <Text style={styles.outputAmount}>{outputUsdc}</Text>
          <Text style={styles.meta}>
            Price Impact: {parseFloat(quote.priceImpactPct).toFixed(3)}%
          </Text>
          <Text style={styles.meta}>
            Slippage: {(quote.slippageBps / 100).toFixed(2)}%
          </Text>
          {quote.routePlan.map((step, i) => (
            <Text key={i} style={styles.routeStep}>
              {step.swapInfo.label ?? "DEX"} — {step.percent}%
            </Text>
          ))}
        </View>
      )}

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={fetchQuote} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Get Quote</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        Connect a wallet to execute swaps. Quote only — no transaction signing in this view.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0f" },
  content: { padding: 24, gap: 16 },
  title: { fontSize: 28, fontWeight: "800", color: "#a78bfa", textAlign: "center" },
  subtitle: { fontSize: 13, color: "#ffffff60", textAlign: "center", marginBottom: 8 },
  card: {
    backgroundColor: "#ffffff0d",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ffffff1a",
    padding: 16,
    gap: 8,
  },
  label: { fontSize: 12, color: "#ffffff60", textTransform: "uppercase", letterSpacing: 1 },
  input: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "right",
    paddingVertical: 4,
  },
  outputAmount: { fontSize: 28, fontWeight: "700", color: "#ffffff", textAlign: "right" },
  meta: { fontSize: 12, color: "#ffffff60" },
  routeStep: {
    fontSize: 11,
    color: "#a78bfa",
    backgroundColor: "#7c3aed20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  errorCard: {
    backgroundColor: "#ef444420",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ef444440",
    padding: 12,
  },
  errorText: { color: "#f87171", fontSize: 13 },
  button: {
    backgroundColor: "#7c3aed",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: { color: "#ffffff", fontWeight: "700", fontSize: 16 },
  disclaimer: { fontSize: 11, color: "#ffffff30", textAlign: "center", marginTop: 8 },
});
