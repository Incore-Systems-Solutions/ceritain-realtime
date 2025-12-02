"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, CreditCard, Loader2, ExternalLink } from "lucide-react";
import { paymentApi, PaymentChannel } from "@/lib/payment-api";
import { useAuth } from "@/context/AuthProvider";

interface TopupModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function TopupModal({ onClose, onSuccess }: TopupModalProps) {
  const { token } = useAuth();
  const [step, setStep] = useState<"amount" | "payment" | "success">("amount");
  const [nominal, setNominal] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<number | null>(null);
  const [paymentChannels, setPaymentChannels] = useState<PaymentChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [error, setError] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [orderId, setOrderId] = useState("");
  const [expiredAt, setExpiredAt] = useState("");

  const quickAmounts = [10000, 25000, 50000, 100000, 250000, 500000];

  useEffect(() => {
    fetchPaymentChannels();
  }, []);

  const fetchPaymentChannels = async () => {
    try {
      const response = await paymentApi.getPaymentChannels();
      setPaymentChannels(
        response.data.filter((channel) => channel.is_show === "y")
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat metode pembayaran"
      );
    } finally {
      setLoadingChannels(false);
    }
  };

  const handleAmountSubmit = () => {
    const amount = parseInt(nominal);
    if (!amount || amount < 10000) {
      setError("Minimal topup Rp 10.000");
      return;
    }
    setError("");
    setStep("payment");
  };

  const handleTopup = async () => {
    if (!token || !selectedPayment) return;

    setLoading(true);
    setError("");

    try {
      const response = await paymentApi.createTopup(
        token,
        selectedPayment,
        parseInt(nominal)
      );

      if (response.errorCode === 0 && response.result) {
        const paymentUrl = response.result.payment_url;
        setPaymentUrl(paymentUrl);
        setOrderId(response.result.order_id);
        setExpiredAt(response.result.expired_at);

        // Open payment URL in new window
        window.open(paymentUrl, "_blank", "noopener,noreferrer");

        setStep("success");
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat topup");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const calculateFee = (channelId: number) => {
    const channel = paymentChannels.find((c) => c.id === channelId);
    if (!channel) return 0;

    const amount = parseInt(nominal) || 0;
    const percentageFee = (amount * parseFloat(channel.persentase_fee)) / 100;
    const flatFee = channel.flat_fee ? parseFloat(channel.flat_fee) : 0;

    return percentageFee + flatFee;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-800 overflow-hidden z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {step === "amount" && "Topup Token"}
            {step === "payment" && "Pilih Pembayaran"}
            {step === "success" && "Topup Berhasil"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Amount */}
          {step === "amount" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nominal Topup
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={nominal}
                    onChange={(e) => setNominal(e.target.value)}
                    placeholder="0"
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="10000"
                  />
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setNominal(amount.toString())}
                    className="py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500 transition text-sm font-medium"
                  >
                    {formatCurrency(amount)}
                  </button>
                ))}
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleAmountSubmit}
                disabled={!nominal}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition"
              >
                Lanjutkan
              </button>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === "payment" && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Topup
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(parseInt(nominal) || 0)}
                </p>
              </div>

              {loadingChannels ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="space-y-2">
                  {paymentChannels.map((channel) => {
                    const fee = calculateFee(channel.id);
                    const total = parseInt(nominal) + fee;

                    return (
                      <button
                        key={channel.id}
                        onClick={() => setSelectedPayment(channel.id)}
                        className={`w-full p-4 rounded-lg border-2 transition text-left ${
                          selectedPayment === channel.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {channel.nama_payment}
                              </p>
                              <p className="text-xs text-gray-500">
                                Fee: {formatCurrency(fee)}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(total)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setStep("amount")}
                  className="flex-1 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium py-3 rounded-lg transition"
                >
                  Kembali
                </button>
                <button
                  onClick={handleTopup}
                  disabled={!selectedPayment || loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Bayar Sekarang"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === "success" && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Topup Berhasil Dibuat!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Order ID: {orderId}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Berlaku sampai: {expiredAt}
                </p>
              </div>

              <a
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                Bayar Sekarang
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={onClose}
                className="w-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium py-3 rounded-lg transition"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
