"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { motion } from "framer-motion";

export default function AgendarPage() {
  const [nomeCliente, setNomeCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [servico, setServico] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  async function salvarAgendamento(e: React.FormEvent) {
    e.preventDefault();

    if (!nomeCliente || !telefone || !data || !hora || !servico) {
      alert("Por favor, preencha todos os campos!");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "agendamentos"), {
        nomeCliente,
        telefone,
        data,
        hora,
        servico,
        status: "pendente",
        secret: "SENHA_MANICURE",
      });

      setSucesso(true);
      setNomeCliente("");
      setTelefone("");
      setData("");
      setHora("");
      setServico("");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar o agendamento!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-100 via-pink-50 to-white flex items-center justify-center px-4">
      <motion.div
        className="bg-white shadow-2xl rounded-3xl p-6 w-full max-w-sm border border-pink-200"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className="text-2xl font-bold text-center text-pink-600 mb-6"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          💅 Agende seu horário
        </motion.h1>

        {!sucesso ? (
          <form onSubmit={salvarAgendamento} className="space-y-4">
            <motion.input
              type="text"
              placeholder="Seu nome"
              className="w-full p-3 border border-pink-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
              whileFocus={{ scale: 1.02 }}
            />

            <motion.input
              type="tel"
              placeholder="Telefone (WhatsApp)"
              className="w-full p-3 border border-pink-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              whileFocus={{ scale: 1.02 }}
            />

            <motion.input
              type="date"
              className="w-full p-3 border border-pink-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
              value={data}
              onChange={(e) => setData(e.target.value)}
              whileFocus={{ scale: 1.02 }}
            />

            <motion.input
              type="time"
              className="w-full p-3 border border-pink-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              whileFocus={{ scale: 1.02 }}
            />

            <motion.select
              className="w-full p-3 border border-pink-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
              value={servico}
              onChange={(e) => setServico(e.target.value)}
              whileFocus={{ scale: 1.02 }}
            >
              <option value="">Selecione o serviço</option>
              <option value="Pé e mão">💖 Pé e Mão</option>
              <option value="Alongamento">✨ Alongamento</option>
              <option value="Francesinha">🤍 Francesinha</option>
              <option value="Spa dos Pés">🦶 Spa dos Pés</option>
            </motion.select>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-500 text-white py-3 rounded-xl text-lg font-medium hover:bg-pink-600 transition-all shadow-md disabled:opacity-60"
              whileTap={{ scale: 0.95 }}
            >
              {loading ? "Salvando..." : "Confirmar Agendamento"}
            </motion.button>
          </form>
        ) : (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-3xl mb-2">✅</p>
            <h2 className="text-lg font-semibold text-pink-600">
              Agendamento feito com sucesso!
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Entraremos em contato para confirmar 💕
            </p>
            <button
              onClick={() => setSucesso(false)}
              className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition"
            >
              Fazer outro
            </button>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}