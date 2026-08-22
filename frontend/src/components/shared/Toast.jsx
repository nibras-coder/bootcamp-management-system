import { useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";

// Small reusable toast — renders in the bottom-right corner and auto-dismisses.
// Usage: const [toast, setToast] = useState(null);
//        setToast({ type: "success", message: "Saved!" });
//        <Toast toast={toast} onClose={() => setToast(null)} />
function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm text-white ${
        isSuccess ? "bg-teal-800" : "bg-red-600"
      }`}
    >
      {isSuccess ? <CheckCircle size={18} /> : <XCircle size={18} />}
      {toast.message}
    </div>
  );
}

export default Toast;
