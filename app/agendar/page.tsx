"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useRouter } from "next/navigation";

export default function AgendarPage() {
  const [nomeCliente, setNomeCliente] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [servico, setServico] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function salvarAgendamento(e: React.FormEvent) {
    e.preventDefault();

    if (!nomeCliente || !data || !hora || !servico) {
      alert("Preencha todos os campos!");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "agendamentos"), {
        nomeCliente,
        data,
        hora,
        servico,
        status: "pendente",
        secret: process.env.NEXT_PUBLIC_FIREBASE_SECRET, // 👈 pega do .env.local
      });
      alert("Agendamento feito com sucesso!");
      router.push("/"); // redireciona pra home depois
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar o agendamento!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
      <form
        onSubmit={salvarAgendamento}
        className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-center mb-4 text-pink-600">
          Novo Agendamento 💅
        </h1>

        <input
          type="text"
          placeholder="Nome do cliente"
          value={nomeCliente}
          onChange={(e) => setNomeCliente(e.target.value)}
          className="w-full mb-3 p-2 border rounded-lg focus:ring-2 focus:ring-pink-400"
        />

        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="w-full mb-3 p-2 border rounded-lg focus:ring-2 focus:ring-pink-400"
        />

        <input
          type="time"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          className="w-full mb-3 p-2 border rounded-lg focus:ring-2 focus:ring-pink-400"
        />

        <select
          value={servico}
          onChange={(e) => setServico(e.target.value)}
          className="w-full mb-4 p-2 border rounded-lg focus:ring-2 focus:ring-pink-400"
        >
          <option value="">Selecione o serviço</option>
          <option value="Unha simples">Unha simples</option>
          <option value="Unha em gel">Unha em gel</option>
          <option value="Pé e mão">Pé e mão</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink-500 text-white font-semibold py-2 rounded-lg hover:bg-pink-600 disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Agendar"}
        </button>
      </form>
    </div>
  );
}
