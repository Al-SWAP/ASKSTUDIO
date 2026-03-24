export type SwapEventCallback = (signature: string, slot: number) => void;

export interface SwapEventSubscription {
  id: number;
  unsubscribe: () => void;
}

export function listenForSwapConfirmation(
  connection: import("@solana/web3.js").Connection,
  signature: string,
  onConfirm: SwapEventCallback,
  timeoutMs = 60_000
): SwapEventSubscription {
  let subscriptionId: number | null = null;
  const timer = setTimeout(() => {
    if (subscriptionId !== null) {
      connection.removeSignatureListener(subscriptionId);
    }
  }, timeoutMs);

  subscriptionId = connection.onSignature(
    signature,
    (result, context) => {
      clearTimeout(timer);
      if (!result.err) {
        onConfirm(signature, context.slot);
      }
    },
    "confirmed"
  );

  return {
    id: subscriptionId,
    unsubscribe: () => {
      clearTimeout(timer);
      if (subscriptionId !== null) {
        connection.removeSignatureListener(subscriptionId);
      }
    },
  };
}

export async function waitForConfirmation(
  connection: import("@solana/web3.js").Connection,
  signature: string,
  timeoutMs = 60_000
): Promise<{ slot: number }> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Transaction confirmation timeout"));
    }, timeoutMs);

    listenForSwapConfirmation(connection, signature, (_, slot) => {
      clearTimeout(timeout);
      resolve({ slot });
    }, timeoutMs);
  });
}
