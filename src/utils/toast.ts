// Small helper that dynamically imports react-hot-toast and forwards calls.
export async function toastSuccess(msg: string) {
  const mod = await import('react-hot-toast');
  const t = mod.default as { success: (m: string) => void };
  t.success(msg);
}

export async function toastError(msg: string) {
  const mod = await import('react-hot-toast');
  const t = mod.default as { error: (m: string) => void };
  t.error(msg);
}

export default {
  success: toastSuccess,
  error: toastError,
};
