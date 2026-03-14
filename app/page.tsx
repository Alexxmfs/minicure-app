"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fff7fb]">
      <AnimatedBackground />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-sm rounded-[32px] border border-white/40 bg-white/65 p-6 shadow-2xl backdrop-blur-xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-500 to-rose-400 text-4xl shadow-lg"
          >
            💅
          </motion.div>

          <div className="text-center">
            <span className="mb-3 inline-block rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-600">
              Seu momento de beleza
            </span>

            <h1 className="text-3xl font-extrabold leading-tight text-gray-900">
              Agende sua
              <span className="block text-pink-600">Manicure</span>
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Escolha o melhor horário e garanta unhas lindas com praticidade,
              conforto e um atendimento especial.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-pink-50/90 p-3 text-center">
              <p className="text-lg">📅</p>
              <p className="mt-1 text-[11px] font-medium text-gray-700">
                Agendamento fácil
              </p>
            </div>

            <div className="rounded-2xl bg-rose-50/90 p-3 text-center">
              <p className="text-lg">✨</p>
              <p className="mt-1 text-[11px] font-medium text-gray-700">
                Atendimento premium
              </p>
            </div>

            <div className="rounded-2xl bg-pink-50/90 p-3 text-center">
              <p className="text-lg">💖</p>
              <p className="mt-1 text-[11px] font-medium text-gray-700">
                Unhas impecáveis
              </p>
            </div>
          </div>

          <Link
            href="/agendar"
            className="mt-8 flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-base font-semibold text-white shadow-lg shadow-pink-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            Agendar horário
          </Link>

          <p className="mt-4 text-center text-xs text-gray-500">
            Rápido, prático e pensado para o celular
          </p>
        </motion.div>
      </section>
    </main>
  );
}

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-rose-50 to-fuchsia-100" />

      <motion.div
        animate={{
          x: [0, 80, -30, 0],
          y: [0, -50, 40, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -left-24 -top-20 h-80 w-80 rounded-full bg-pink-300/40 blur-3xl"
      />

      <motion.div
        animate={{
          x: [0, -70, 40, 0],
          y: [0, 60, -20, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute right-[-100px] top-[10%] h-96 w-96 rounded-full bg-rose-300/30 blur-3xl"
      />

      <motion.div
        animate={{
          x: [0, 50, -50, 0],
          y: [0, -40, 60, 0],
          scale: [1, 1.08, 0.92, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[-140px] left-[10%] h-[26rem] w-[26rem] rounded-full bg-fuchsia-200/30 blur-3xl"
      />

      <motion.div
        animate={{
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.8),transparent_40%)]"
      />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[size:36px_36px] opacity-20" />

      <motion.div
        animate={{ y: [0, -18, 0], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[12%] top-[18%] h-3 w-3 rounded-full bg-white/80 shadow-[0_0_20px_rgba(255,255,255,0.9)]"
      />

      <motion.div
        animate={{ y: [0, 20, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[18%] top-[28%] h-4 w-4 rounded-full bg-pink-200/90 shadow-[0_0_25px_rgba(255,192,203,0.9)]"
      />

      <motion.div
        animate={{ y: [0, -15, 0], x: [0, 10, 0], opacity: [0.2, 0.45, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[18%] right-[22%] h-3 w-3 rounded-full bg-rose-200/80 shadow-[0_0_20px_rgba(255,182,193,0.8)]"
      />
    </div>
  );
}