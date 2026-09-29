const METAMASK_EXTENSION_ID = "nkbihfbeogaeaoehlefnkodbefgpgknn";

const isMetaMaskExtensionFailure = (reason: unknown): boolean => {
  if (!(reason instanceof Error)) return false;

  const cause = "cause" in reason ? String(reason.cause ?? "") : "";
  const details = [reason.message, reason.stack, cause].join(" ");
  return (
    details.includes(`chrome-extension://${METAMASK_EXTENSION_ID}/`) &&
    (details.includes("Failed to connect to MetaMask") || details.includes("MetaMask extension not found"))
  );
};

export const ignoreBrokenMetaMaskInjection = (): void => {
  window.addEventListener("unhandledrejection", (event) => {
    if (isMetaMaskExtensionFailure(event.reason)) {
      event.preventDefault();
    }
  });
};
