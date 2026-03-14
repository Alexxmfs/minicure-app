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
import { AnimatePresence, motion } from "framer-motion";
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
  const [mostrarConcluidos, setMostrarConcluidos] = useState(false);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [animandoIds, setAnimandoIds] = useState<string[]>([]);
  const [processandoIds, setProcessandoIds] = useState<string[]>([]);

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

  const agendamentosVisiveis = useMemo(() => {
    return agendamentos.filter((a) => {
      if (animandoIds.includes(a.id)) return false;
      if (!mostrarConcluidos && a.status === "concluído") return false;
      return true;
    });
  }, [agendamentos, animandoIds, mostrarConcluidos]);

  const totalPendentes = useMemo(
    () => agendamentos.filter((a) => a.status !== "concluído").length,
    [agendamentos]
  );

  const totalConcluidos = useMemo(
    () => agendamentos.filter((a) => a.status === "concluído").length,
    [agendamentos]
  );

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
    setFormEdit((prev) => ({
      ...prev,
      categoria,
      servico: "",
      preco: "",
      duracao: "",
      duracaoMin: 0,
    }));
  }

  function alterarServico(nomeServico: string) {
    const servicoSelecionado = SERVICOS.find((s) => s.nome === nomeServico);

    if (!servicoSelecionado) {
      setFormEdit((prev) => ({
        ...prev,
        servico: "",
        preco: "",
        duracao: "",
        duracaoMin: 0,
      }));
      return;
    }

    setFormEdit((prev) => ({
      ...prev,
      categoria: servicoSelecionado.categoria,
      servico: servicoSelecionado.nome,
      preco: servicoSelecionado.preco,
      duracao: servicoSelecionado.duracao,
      duracaoMin: servicoSelecionado.duracaoMin,
    }));
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

    setAnimandoIds((prev) => [...prev, id]);
    setProcessandoIds((prev) => [...prev, id]);

    try {
      await new Promise((resolve) => setTimeout(resolve, 320));
      await deleteDoc(doc(db, "agendamentos", id));
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error);
      setAnimandoIds((prev) => prev.filter((item) => item !== id));
      alert("Não foi possível excluir o agendamento.");
    } finally {
      setProcessandoIds((prev) => prev.filter((item) => item !== id));
    }
  }

  async function concluirAgendamento(id: string) {
    setAnimandoIds((prev) => [...prev, id]);
    setProcessandoIds((prev) => [...prev, id]);

    try {
      await new Promise((resolve) => setTimeout(resolve, 320));
      await updateDoc(doc(db, "agendamentos", id), {
        status: "concluído",
      });
    } catch (error) {
      console.error("Erro ao concluir agendamento:", error);
      setAnimandoIds((prev) => prev.filter((item) => item !== id));
      alert("Não foi possível concluir o agendamento.");
    } finally {
      setProcessandoIds((prev) => prev.filter((item) => item !== id));
    }
  }

  function getCategoriaStyle(categoria?: CategoriaServico) {
    if (categoria === "Serviços básicos") {
      return "bg-pink-100 text-pink-700 border-pink-200";
    }
    if (categoria === "Gel e alongamento") {
      return "bg-purple-100 text-purple-700 border-purple-200";
    }
    if (categoria === "Pés") {
      return "bg-amber-100 text-amber-700 border-amber-200";
    }
    return "bg-gray-100 text-gray-700 border-gray-200";
  }

  function formatarData(data: string) {
    return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-pink-50 to-white px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 rounded-3xl border border-pink-200 bg-white/90 p-5 shadow-xl shadow-pink-100"
        >
          <h1 className="text-center text-2xl font-bold text-pink-600">
            Painel da Administradora 💅
          </h1>
          <p className="mt-2 text-center text-sm text-gray-500">
            Gerencie seus agendamentos de forma rápida e bonita no celular
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-pink-50 p-4 border border-pink-100">
              <p className="text-xs text-gray-500">Pendentes</p>
              <p className="text-2xl font-bold text-pink-600">{totalPendentes}</p>
            </div>
            <div className="rounded-2xl bg-green-50 p-4 border border-green-100">
              <p className="text-xs text-gray-500">Concluídos</p>
              <p className="text-2xl font-bold text-green-600">{totalConcluidos}</p>
            </div>
          </div>

          <button
            onClick={() => setMostrarConcluidos((prev) => !prev)}
            className="mt-4 w-full rounded-2xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm font-medium text-pink-700 transition hover:bg-pink-100"
          >
            {mostrarConcluidos ? "Ocultar concluídos" : "Mostrar concluídos"}
          </button>
        </motion.div>

        {loading ? (
          <div className="rounded-3xl bg-white p-6 text-center text-gray-600 shadow-lg">
            Carregando agendamentos...
          </div>
        ) : agendamentosVisiveis.length === 0 ? (
          <div className="rounded-3xl bg-white p-6 text-center text-gray-500 shadow-lg">
            Nenhum agendamento encontrado 😴
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {agendamentosVisiveis.map((a) => {
                const processando = processandoIds.includes(a.id);

                return (
                  <motion.div
                    key={a.id}
                    layout
                    initial={{ opacity: 0, y: 18, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{
                      opacity: 0,
                      x: 120,
                      scale: 0.9,
                      filter: "blur(6px)",
                      transition: { duration: 0.3 },
                    }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden rounded-[28px] border border-pink-100 bg-white shadow-lg shadow-pink-100"
                  >
                    <div className="bg-gradient-to-r from-pink-500 to-fuchsia-500 px-5 py-4 text-white">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-pink-100">
                            Cliente
                          </p>
                          <h2 className="text-lg font-semibold leading-tight">
                            {a.nomeCliente}
                          </h2>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            a.status === "concluído"
                              ? "bg-white/20 text-white"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {a.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5">
                      {editandoId === a.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={formEdit.nomeCliente}
                            onChange={(e) =>
                              setFormEdit((prev) => ({
                                ...prev,
                                nomeCliente: e.target.value,
                              }))
                            }
                            placeholder="Nome do cliente"
                            className="w-full rounded-2xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:bg-white"
                          />

                          <input
                            type="tel"
                            value={formEdit.telefone}
                            onChange={(e) =>
                              setFormEdit((prev) => ({
                                ...prev,
                                telefone: e.target.value,
                              }))
                            }
                            placeholder="Telefone"
                            className="w-full rounded-2xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:bg-white"
                          />

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <input
                              type="date"
                              value={formEdit.data}
                              onChange={(e) =>
                                setFormEdit((prev) => ({
                                  ...prev,
                                  data: e.target.value,
                                }))
                              }
                              className="w-full rounded-2xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:bg-white"
                            />

                            <input
                              type="time"
                              value={formEdit.hora}
                              onChange={(e) =>
                                setFormEdit((prev) => ({
                                  ...prev,
                                  hora: e.target.value,
                                }))
                              }
                              className="w-full rounded-2xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:bg-white"
                            />
                          </div>

                          <select
                            value={formEdit.categoria}
                            onChange={(e) =>
                              alterarCategoria(
                                e.target.value as CategoriaServico | ""
                              )
                            }
                            className="w-full rounded-2xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:bg-white"
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
                            className="w-full rounded-2xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:bg-white"
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
                            <div className="rounded-2xl border border-pink-200 bg-pink-50 p-4">
                              <p className="text-sm text-gray-700">
                                <strong>Preço:</strong> {formEdit.preco}
                              </p>
                              <p className="text-sm text-gray-700">
                                <strong>Duração:</strong> {formEdit.duracao}
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => salvarEdicao(a.id)}
                              className="rounded-2xl bg-green-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-600"
                            >
                              Salvar
                            </button>

                            <button
                              onClick={cancelarEdicao}
                              className="rounded-2xl bg-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-400"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="grid gap-3">
                            <div className="rounded-2xl bg-pink-50 p-4">
                              <div className="flex flex-wrap items-center gap-2">
                                {a.categoria && (
                                  <span
                                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getCategoriaStyle(
                                      a.categoria
                                    )}`}
                                  >
                                    {a.categoria}
                                  </span>
                                )}
                                {a.duracao && (
                                  <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                                    {a.duracao}
                                  </span>
                                )}
                              </div>

                              <div className="mt-3 space-y-1 text-sm text-gray-700">
                                <p>
                                  <strong>Telefone:</strong>{" "}
                                  {a.telefone || "Não informado"}
                                </p>
                                <p>
                                  <strong>Data:</strong> {formatarData(a.data)}
                                </p>
                                <p>
                                  <strong>Hora:</strong> {a.hora}
                                </p>
                                <p>
                                  <strong>Serviço:</strong> {a.servico}
                                </p>
                                {a.preco && (
                                  <p>
                                    <strong>Preço:</strong> {a.preco}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <button
                              onClick={() => iniciarEdicao(a)}
                              disabled={processando}
                              className="rounded-2xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60"
                            >
                              Editar
                            </button>

                            <button
                              onClick={() => excluirAgendamento(a.id)}
                              disabled={processando}
                              className="rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
                            >
                              {processando ? "Processando..." : "Excluir"}
                            </button>

                            {a.status !== "concluído" && (
                              <button
                                onClick={() => concluirAgendamento(a.id)}
                                disabled={processando}
                                className="rounded-2xl bg-pink-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-pink-600 disabled:opacity-60"
                              >
                                Concluir
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}