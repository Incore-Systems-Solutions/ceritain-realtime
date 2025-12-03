"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  CreditCard,
  Loader2,
  ExternalLink,
  Wallet,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
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

        // Open payment URL in popup window (like DigitalOcean)
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        window.open(
          paymentUrl,
          "PaymentWindow",
          `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
        );

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
        className="absolute inset-0 bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
        className="relative bg-white/95 backdrop-blur-xl rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
                {step === "amount" && (
                  <Wallet className="w-6 h-6 text-white" strokeWidth={2.5} />
                )}
                {step === "payment" && (
                  <CreditCard
                    className="w-6 h-6 text-white"
                    strokeWidth={2.5}
                  />
                )}
                {step === "success" && (
                  <CheckCircle2
                    className="w-6 h-6 text-white"
                    strokeWidth={2.5}
                  />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {step === "amount" && "Topup Token"}
                  {step === "payment" && "Pilih Pembayaran"}
                  {step === "success" && "Yeay, Berhasil!"}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Description */}
          <div className="flex items-start gap-2 bg-white/60 backdrop-blur-sm rounded-2xl p-3">
            <p className="text-sm text-gray-600 leading-relaxed">
              {step === "amount" &&
                "Isi token buat lanjut ngobrol sama AI Friendly. Tenang, prosesnya gampang banget kok!"}
              {step === "payment" &&
                "Pilih metode pembayaran yang paling nyaman buat kamu. Semua aman dan terpercaya!"}
              {step === "success" &&
                "Token kamu udah siap! Sekarang kamu bisa lanjut cerita dan curhat sepuasnya sama AI Friendly "}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Amount */}
          {step === "amount" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Nominal Topup
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={nominal}
                    onChange={(e) => setNominal(e.target.value)}
                    placeholder="0"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-blue-400 focus:bg-white transition-all font-semibold text-lg"
                    min="10000"
                  />
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((amount) => (
                  <motion.button
                    key={amount}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setNominal(amount.toString())}
                    className="py-3 px-3 rounded-2xl bg-white/80 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 border-2 border-gray-200 hover:border-blue-400 transition-all text-sm font-semibold text-gray-700 shadow-sm"
                  >
                    {formatCurrency(amount)}
                  </motion.button>
                ))}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAmountSubmit}
                disabled={!nominal}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/30"
              >
                Lanjutkan
              </motion.button>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === "payment" && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-5">
                <p className="text-sm text-gray-600 font-semibold mb-1">
                  Total Topup
                </p>
                <p className="text-3xl font-bold text-gray-900">
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
                      <motion.button
                        key={channel.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedPayment(channel.id)}
                        className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                          selectedPayment === channel.id
                            ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-md"
                            : "border-gray-200 bg-white/50 hover:border-blue-300 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                selectedPayment === channel.id
                                  ? "bg-blue-500"
                                  : "bg-gray-100"
                              }`}
                            >
                              <CreditCard
                                className={`w-5 h-5 ${
                                  selectedPayment === channel.id
                                    ? "text-white"
                                    : "text-gray-400"
                                }`}
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {channel.nama_payment}
                              </p>
                              <p className="text-xs text-gray-500 font-medium">
                                Fee: {formatCurrency(fee)}
                              </p>
                            </div>
                          </div>
                          <p className="text-base font-bold text-gray-900">
                            {formatCurrency(total)}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep("amount")}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-4 rounded-2xl transition-all"
                >
                  Kembali
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleTopup}
                  disabled={!selectedPayment || loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Bayar Sekarang"
                  )}
                </motion.button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === "success" && (
            <div className="space-y-5 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-[24px] flex items-center justify-center mx-auto shadow-lg">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Topup Berhasil Dibuat! 🎉
                </h3>
                <div className="bg-blue-50 rounded-2xl p-4 mb-2">
                  <p className="text-sm text-gray-600 font-semibold mb-1">
                    Order ID
                  </p>
                  <p className="text-base font-bold text-gray-900">{orderId}</p>
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  Berlaku sampai: {expiredAt}
                </p>
              </div>

              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
              >
                Bayar Sekarang
                <ExternalLink className="w-5 h-5" />
              </motion.a>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-4 rounded-2xl transition-all"
              >
                Tutup
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
