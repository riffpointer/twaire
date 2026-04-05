const STORAGE_KEY = "twaire-saved-accounts";

function readRawAccounts() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getSavedAccounts() {
  return readRawAccounts().filter(
    (account) => account && account.userId && account.switchToken,
  );
}

export function saveAccount(account) {
  const nextAccount = {
    userId: account.userId,
    username: account.username,
    publicName: account.publicName || account.username,
    profilePicture: account.profilePicture || null,
    verified: Boolean(account.verified),
    switchToken: account.switchToken,
  };

  const existingAccounts = getSavedAccounts().filter(
    (entry) => entry.userId !== nextAccount.userId,
  );

  const updatedAccounts = [nextAccount, ...existingAccounts].slice(0, 10);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAccounts));
  return updatedAccounts;
}

export function removeAccount(userId) {
  const updatedAccounts = getSavedAccounts().filter((account) => account.userId !== userId);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAccounts));
  return updatedAccounts;
}
