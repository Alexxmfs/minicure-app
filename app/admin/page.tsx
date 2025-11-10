"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

interface Agendamento {
  id: string;
  nomeCliente: string;
  data: string;
  hora: string;
  servico: string;
  status: string;
}

export default function AdminPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "agendamentos"), orderBy("data", "asc"));

    // 🔥 Atualiza automaticamente em tempo real
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Agendamento[];
      setAgendamentos(lista);
      setLoading(false);
    });

    return () => unsubscribe(); // encerra listener ao sair da página
  }, []);

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <h1 className="text-2xl font-bold text-pink-600 text-center mb-6">
        Painel da Administradora 💅
      </h1>

      {loading ? (
        <p className="text-center text-gray-600">Carregando agendamentos...</p>
      ) : agendamentos.length === 0 ? (
        <p className="text-center text-gray-500">Nenhum agendamento encontrado 😴</p>
      ) : (
        <div className="grid gap-4 max-w-md mx-auto">
          {agendamentos.map((a) => (
            <div
              key={a.id}
              className="bg-white p-4 rounded-2xl shadow-md border border-pink-100"
            >
              <p><strong>Cliente:</strong> {a.nomeCliente}</p>
              <p><strong>Data:</strong> {new Date(a.data).toLocaleDateString("pt-BR")}</p>
              <p><strong>Hora:</strong> {a.hora}</p>
              <p><strong>Serviço:</strong> {a.servico}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`${
                    a.status === "pendente" ? "text-yellow-600" : "text-green-600"
                  } font-medium`}
                >
                  {a.status}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
