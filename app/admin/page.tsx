"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

interface Agendamento {
  id: string;
  nomeCliente: string;
  telefone?: string;
  data: string;
  hora: string;
  servico: string;
  status: string;
}

export default function AdminPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [formEdit, setFormEdit] = useState({
    nomeCliente: "",
    telefone: "",
    data: "",
    hora: "",
    servico: "",
  });

  useEffect(() => {
    const q = query(collection(db, "agendamentos"), orderBy("data", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const lista = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        })) as Agendamento[];

        setAgendamentos(lista);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao buscar agendamentos:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  function iniciarEdicao(agendamento: Agendamento) {
    setEditandoId(agendamento.id);
    setFormEdit({
      nomeCliente: agendamento.nomeCliente || "",
      telefone: agendamento.telefone || "",
      data: agendamento.data || "",
      hora: agendamento.hora || "",
      servico: agendamento.servico || "",
    });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setFormEdit({
      nomeCliente: "",
      telefone: "",
      data: "",
      hora: "",
      servico: "",
    });
  }

  async function salvarEdicao(id: string) {
    try {
      await updateDoc(doc(db, "agendamentos", id), {
        nomeCliente: formEdit.nomeCliente,
        telefone: formEdit.telefone,
        data: formEdit.data,
        hora: formEdit.hora,
        servico: formEdit.servico,
      });

      cancelarEdicao();
      alert("Agendamento atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao editar agendamento:", error);
      alert("Não foi possível editar o agendamento.");
    }
  }

  async function excluirAgendamento(id: string) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este agendamento?"
    );
    if (!confirmar) return;

    try {
      await deleteDoc(doc(db, "agendamentos", id));
      alert("Agendamento excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error);
      alert("Não foi possível excluir o agendamento.");
    }
  }

  async function concluirAgendamento(id: string) {
    try {
      await updateDoc(doc(db, "agendamentos", id), {
        status: "concluído",
      });

      alert("Agendamento concluído com sucesso!");
    } catch (error) {
      console.error("Erro ao concluir agendamento:", error);
      alert("Não foi possível concluir o agendamento.");
    }
  }

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <h1 className="text-2xl font-bold text-pink-600 text-center mb-6">
        Painel da Administradora 💅
      </h1>

      {loading ? (
        <p className="text-center text-gray-600">Carregando agendamentos...</p>
      ) : agendamentos.length === 0 ? (
        <p className="text-center text-gray-500">
          Nenhum agendamento encontrado 😴
        </p>
      ) : (
        <div className="grid gap-4 max-w-md mx-auto">
          {agendamentos.map((a) => (
            <div
              key={a.id}
              className="bg-white p-4 rounded-2xl shadow-md border border-pink-100"
            >
              {editandoId === a.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formEdit.nomeCliente}
                    onChange={(e) =>
                      setFormEdit({ ...formEdit, nomeCliente: e.target.value })
                    }
                    placeholder="Nome do cliente"
                    className="w-full p-2 border rounded-lg"
                  />

                  <input
                    type="tel"
                    value={formEdit.telefone}
                    onChange={(e) =>
                      setFormEdit({ ...formEdit, telefone: e.target.value })
                    }
                    placeholder="Telefone"
                    className="w-full p-2 border rounded-lg"
                  />

                  <input
                    type="date"
                    value={formEdit.data}
                    onChange={(e) =>
                      setFormEdit({ ...formEdit, data: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg"
                  />

                  <input
                    type="time"
                    value={formEdit.hora}
                    onChange={(e) =>
                      setFormEdit({ ...formEdit, hora: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg"
                  />

                  <select
                    value={formEdit.servico}
                    onChange={(e) =>
                      setFormEdit({ ...formEdit, servico: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="">Selecione o serviço</option>
                    <option value="Pé e mão">💖 Pé e Mão</option>
                    <option value="Alongamento">✨ Alongamento</option>
                    <option value="Francesinha">🤍 Francesinha</option>
                    <option value="Spa dos Pés">🦶 Spa dos Pés</option>
                  </select>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => salvarEdicao(a.id)}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                    >
                      Salvar
                    </button>

                    <button
                      onClick={cancelarEdicao}
                      className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p>
                    <strong>Cliente:</strong> {a.nomeCliente}
                  </p>

                  {a.telefone && (
                    <p>
                      <strong>Telefone:</strong> {a.telefone}
                    </p>
                  )}

                  <p>
                    <strong>Data:</strong>{" "}
                    {new Date(`${a.data}T00:00:00`).toLocaleDateString("pt-BR")}
                  </p>

                  <p>
                    <strong>Hora:</strong> {a.hora}
                  </p>

                  <p>
                    <strong>Serviço:</strong> {a.servico}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`font-medium ${
                        a.status === "pendente"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {a.status}
                    </span>
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      onClick={() => iniciarEdicao(a)}
                      className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => excluirAgendamento(a.id)}
                      className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition"
                    >
                      Excluir
                    </button>

                    {a.status !== "concluído" && (
                      <button
                        onClick={() => concluirAgendamento(a.id)}
                        className="bg-pink-500 text-white px-3 py-2 rounded-lg hover:bg-pink-600 transition"
                      >
                        Concluir
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}