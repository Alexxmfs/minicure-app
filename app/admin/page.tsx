"use client";

import { useEffect, useMemo, useState } from "react";
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

type CategoriaServico = "Serviços básicos" | "Gel e alongamento" | "Pés";

interface Servico {
  nome: string;
  preco: string;
  duracao: string;
  duracaoMin: number;
  categoria: CategoriaServico;
}

interface Agendamento {
  id: string;
  nomeCliente: string;
  telefone?: string;
  data: string;
  hora: string;
  categoria?: CategoriaServico;
  servico: string;
  preco?: string;
  duracao?: string;
  duracaoMin?: number;
  status: string;
}

const SERVICOS: Servico[] = [
  {
    nome: "Pé e mão",
    preco: "R$ 60,00",
    duracao: "2h",
    duracaoMin: 120,
    categoria: "Serviços básicos",
  },
  {
    nome: "Mão",
    preco: "R$ 30,00",
    duracao: "1h",
    duracaoMin: 60,
    categoria: "Serviços básicos",
  },
  {
    nome: "Pé",
    preco: "R$ 35,00",
    duracao: "2h",
    duracaoMin: 120,
    categoria: "Pés",
  },
  {
    nome: "Mão esmaltação em gel",
    preco: "R$ 55,00",
    duracao: "1h",
    duracaoMin: 60,
    categoria: "Serviços básicos",
  },
  {
    nome: "Pé esmaltação em gel",
    preco: "R$ 60,00",
    duracao: "1h",
    duracaoMin: 60,
    categoria: "Pés",
  },
  {
    nome: "Pe e mão esmaltação em gel",
    preco: "R$ 110,00",
    duracao: "2h",
    duracaoMin: 120,
    categoria: "Serviços básicos",
  },
  {
    nome: "Banho de gel",
    preco: "R$ 80,00",
    duracao: "1h30",
    duracaoMin: 90,
    categoria: "Gel e alongamento",
  },
  {
    nome: "Aplicação de tips gel",
    preco: "R$ 120,00",
    duracao: "2h30",
    duracaoMin: 150,
    categoria: "Gel e alongamento",
  },
  {
    nome: "Manutenção tips",
    preco: "R$ 90,00",
    duracao: "1h30",
    duracaoMin: 90,
    categoria: "Gel e alongamento",
  },
  {
    nome: "Postiça realista",
    preco: "R$ 60,00",
    duracao: "1h30",
    duracaoMin: 90,
    categoria: "Gel e alongamento",
  },
  {
    nome: "SPA dos pés+pedicure",
    preco: "R$ 100,00",
    duracao: "2h",
    duracaoMin: 120,
    categoria: "Pés",
  },
];

const CATEGORIAS: CategoriaServico[] = [
  "Serviços básicos",
  "Gel e alongamento",
  "Pés",
];

export default function AdminPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [formEdit, setFormEdit] = useState({
    nomeCliente: "",
    telefone: "",
    data: "",
    hora: "",
    categoria: "" as CategoriaServico | "",
    servico: "",
    preco: "",
    duracao: "",
    duracaoMin: 0,
  });

  const servicosFiltrados = useMemo(() => {
    if (!formEdit.categoria) return [];
    return SERVICOS.filter((s) => s.categoria === formEdit.categoria);
  }, [formEdit.categoria]);

  useEffect(() => {
    const q = query(collection(db, "agendamentos"), orderBy("data", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const lista = snapshot.docs.map((docItem) => ({
          ...docItem.data(),
          id: docItem.id,
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
      categoria: agendamento.categoria || "",
      servico: agendamento.servico || "",
      preco: agendamento.preco || "",
      duracao: agendamento.duracao || "",
      duracaoMin: agendamento.duracaoMin || 0,
    });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setFormEdit({
      nomeCliente: "",
      telefone: "",
      data: "",
      hora: "",
      categoria: "",
      servico: "",
      preco: "",
      duracao: "",
      duracaoMin: 0,
    });
  }

  function alterarCategoria(categoria: CategoriaServico | "") {
    setFormEdit({
      ...formEdit,
      categoria,
      servico: "",
      preco: "",
      duracao: "",
      duracaoMin: 0,
    });
  }

  function alterarServico(nomeServico: string) {
    const servicoSelecionado = SERVICOS.find((s) => s.nome === nomeServico);

    if (!servicoSelecionado) {
      setFormEdit({
        ...formEdit,
        servico: "",
        preco: "",
        duracao: "",
        duracaoMin: 0,
      });
      return;
    }

    setFormEdit({
      ...formEdit,
      categoria: servicoSelecionado.categoria,
      servico: servicoSelecionado.nome,
      preco: servicoSelecionado.preco,
      duracao: servicoSelecionado.duracao,
      duracaoMin: servicoSelecionado.duracaoMin,
    });
  }

  async function salvarEdicao(id: string) {
    if (
      !formEdit.nomeCliente ||
      !formEdit.telefone ||
      !formEdit.data ||
      !formEdit.hora ||
      !formEdit.categoria ||
      !formEdit.servico
    ) {
      alert("Preencha todos os campos da edição.");
      return;
    }

    try {
      await updateDoc(doc(db, "agendamentos", id), {
        nomeCliente: formEdit.nomeCliente,
        telefone: formEdit.telefone,
        data: formEdit.data,
        hora: formEdit.hora,
        categoria: formEdit.categoria,
        servico: formEdit.servico,
        preco: formEdit.preco,
        duracao: formEdit.duracao,
        duracaoMin: formEdit.duracaoMin,
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
                    value={formEdit.categoria}
                    onChange={(e) =>
                      alterarCategoria(e.target.value as CategoriaServico | "")
                    }
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="">Selecione a categoria</option>
                    {CATEGORIAS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  <select
                    value={formEdit.servico}
                    onChange={(e) => alterarServico(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                    disabled={!formEdit.categoria}
                  >
                    <option value="">
                      {formEdit.categoria
                        ? "Selecione o serviço"
                        : "Escolha primeiro a categoria"}
                    </option>

                    {servicosFiltrados.map((serv) => (
                      <option key={serv.nome} value={serv.nome}>
                        {serv.nome} — {serv.preco} — {serv.duracao}
                      </option>
                    ))}
                  </select>

                  {!!formEdit.servico && (
                    <div className="bg-pink-50 border border-pink-200 rounded-xl p-3">
                      <p className="text-sm">
                        <strong>Preço:</strong> {formEdit.preco}
                      </p>
                      <p className="text-sm">
                        <strong>Duração:</strong> {formEdit.duracao}
                      </p>
                    </div>
                  )}

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

                  {a.categoria && (
                    <p>
                      <strong>Categoria:</strong> {a.categoria}
                    </p>
                  )}

                  <p>
                    <strong>Serviço:</strong> {a.servico}
                  </p>

                  {a.preco && (
                    <p>
                      <strong>Preço:</strong> {a.preco}
                    </p>
                  )}

                  {a.duracao && (
                    <p>
                      <strong>Duração:</strong> {a.duracao}
                    </p>
                  )}

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