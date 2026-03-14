"use client";

import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { motion } from "framer-motion";

type CategoriaServico = "Serviços básicos" | "Gel e alongamento" | "Pés";

interface Servico {
  nome: string;
  preco: string;
  duracao: string;
  duracaoMin: number;
  categoria: CategoriaServico;
}

interface AgendamentoExistente {
  id: string;
  data: string;
  hora: string;
  servico: string;
  duracaoMin?: number;
  status?: string;
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

const HORARIOS_BASE = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
];

const BLOQUEIOS_FIXOS = [
  {
    inicio: "13:00",
    fim: "13:30",
    motivo: "Almoço",
  },
];

function horaParaMinutos(hora: string) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function minutosParaHora(totalMin: number) {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function temConflito(
  inicioNovo: number,
  fimNovo: number,
  inicioExistente: number,
  fimExistente: number,
) {
  return inicioNovo < fimExistente && fimNovo > inicioExistente;
}

function buscarServicoPorNome(nome: string) {
  return SERVICOS.find((s) => s.nome === nome);
}

export default function AgendarPage() {
  const [nomeCliente, setNomeCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [data, setData] = useState("");
  const [categoria, setCategoria] = useState<CategoriaServico | "">("");
  const [servico, setServico] = useState("");
  const [hora, setHora] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [agendamentosDia, setAgendamentosDia] = useState<
    AgendamentoExistente[]
  >([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);

  const servicosFiltrados = useMemo(() => {
    if (!categoria) return [];
    return SERVICOS.filter((s) => s.categoria === categoria);
  }, [categoria]);

  const servicoSelecionado = useMemo(() => {
    return SERVICOS.find((s) => s.nome === servico);
  }, [servico]);

  useEffect(() => {
    setServico("");
    setHora("");
  }, [categoria]);

  useEffect(() => {
    setHora("");
  }, [servico]);

  useEffect(() => {
    async function carregarAgendamentosDoDia() {
      if (!data) {
        setAgendamentosDia([]);
        return;
      }

      setCarregandoHorarios(true);

      try {
        const q = query(
          collection(db, "agendamentos"),
          where("data", "==", data),
        );
        const snapshot = await getDocs(q);

        const lista = snapshot.docs.map((docSnap) => {
          const dados = docSnap.data() as Partial<AgendamentoExistente>;
          const servicoEncontrado = buscarServicoPorNome(dados.servico || "");

          return {
            ...dados,
            id: docSnap.id,
            data: dados.data || "",
            hora: dados.hora || "",
            servico: dados.servico || "",
            duracaoMin: dados.duracaoMin ?? servicoEncontrado?.duracaoMin ?? 60,
            status: dados.status || "pendente",
          } as AgendamentoExistente;
        });

        setAgendamentosDia(lista);
      } catch (error) {
        console.error("Erro ao buscar horários ocupados:", error);
        setAgendamentosDia([]);
      } finally {
        setCarregandoHorarios(false);
      }
    }

    carregarAgendamentosDoDia();
  }, [data, sucesso]);

  const horariosDisponiveis = useMemo(() => {
    if (!servicoSelecionado) return [];

    const duracaoNovo = servicoSelecionado.duracaoMin;
    const ultimoHorarioPermitido = horaParaMinutos("21:00");

    return HORARIOS_BASE.filter((horarioBase) => {
      const inicioNovo = horaParaMinutos(horarioBase);
      const fimNovo = inicioNovo + duracaoNovo;

      if (fimNovo > ultimoHorarioPermitido) {
        return false;
      }

      const conflitouComAlmoco = BLOQUEIOS_FIXOS.some((bloqueio) => {
        const inicioBloqueio = horaParaMinutos(bloqueio.inicio);
        const fimBloqueio = horaParaMinutos(bloqueio.fim);

        return temConflito(inicioNovo, fimNovo, inicioBloqueio, fimBloqueio);
      });

      if (conflitouComAlmoco) {
        return false;
      }

      const conflitouComAgendamento = agendamentosDia.some((agendamento) => {
        if (agendamento.status === "cancelado") return false;

        const inicioExistente = horaParaMinutos(agendamento.hora);
        const fimExistente = inicioExistente + (agendamento.duracaoMin || 60);

        return temConflito(inicioNovo, fimNovo, inicioExistente, fimExistente);
      });

      return !conflitouComAgendamento;
    });
  }, [agendamentosDia, servicoSelecionado]);

  async function salvarAgendamento(e: React.FormEvent) {
    e.preventDefault();

    if (!nomeCliente || !telefone || !data || !categoria || !servico || !hora) {
      alert("Por favor, preencha todos os campos!");
      return;
    }

    if (!servicoSelecionado) {
      alert("Selecione um serviço válido.");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "agendamentos"), {
        nomeCliente,
        telefone,
        data,
        hora,
        categoria,
        servico: servicoSelecionado.nome,
        preco: servicoSelecionado.preco,
        duracao: servicoSelecionado.duracao,
        duracaoMin: servicoSelecionado.duracaoMin,
        status: "pendente",
        secret: "SENHA_MANICURE",
      });

      setSucesso(true);
      setNomeCliente("");
      setTelefone("");
      setData("");
      setCategoria("");
      setServico("");
      setHora("");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar o agendamento!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-100 via-pink-50 to-white flex items-center justify-center px-4 py-8">
      <motion.div
        className="bg-white shadow-2xl rounded-3xl p-6 w-full max-w-md border border-pink-200"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className="text-2xl font-bold text-center text-pink-600 mb-2"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          💅 Agende seu horário
        </motion.h1>

        <p className="text-sm text-center text-gray-500 mb-6">
          Escolha a categoria, o serviço e o melhor horário disponível
        </p>

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

            <motion.select
              className="w-full p-3 border border-pink-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
              value={categoria}
              onChange={(e) =>
                setCategoria(e.target.value as CategoriaServico | "")
              }
              whileFocus={{ scale: 1.02 }}
            >
              <option value="">Selecione a categoria</option>
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </motion.select>

            <motion.select
              className="w-full p-3 border border-pink-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
              value={servico}
              onChange={(e) => setServico(e.target.value)}
              whileFocus={{ scale: 1.02 }}
              disabled={!categoria}
            >
              <option value="">
                {categoria
                  ? "Selecione o serviço"
                  : "Escolha primeiro a categoria"}
              </option>

              {servicosFiltrados.map((s) => (
                <option key={s.nome} value={s.nome}>
                  {s.nome} — {s.preco} — {s.duracao}
                </option>
              ))}
            </motion.select>

            {servicoSelecionado && (
              <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4">
                <p className="font-semibold text-pink-700">
                  {servicoSelecionado.nome}
                </p>
                <p className="text-sm text-gray-700">
                  Preço: {servicoSelecionado.preco}
                </p>
                <p className="text-sm text-gray-700">
                  Duração: {servicoSelecionado.duracao}
                </p>
              </div>
            )}

            <motion.select
              className="w-full p-3 border border-pink-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              whileFocus={{ scale: 1.02 }}
              disabled={!data || !servicoSelecionado || carregandoHorarios}
            >
              <option value="">
                {!data
                  ? "Escolha primeiro a data"
                  : !servicoSelecionado
                    ? "Escolha primeiro o serviço"
                    : carregandoHorarios
                      ? "Carregando horários..."
                      : horariosDisponiveis.length === 0
                        ? "Nenhum horário disponível"
                        : "Selecione o horário"}
              </option>

              {horariosDisponiveis.map((h) => {
                const inicio = horaParaMinutos(h);
                const fim = inicio + (servicoSelecionado?.duracaoMin || 0);

                return (
                  <option key={h} value={h}>
                    {h} às {minutosParaHora(fim)}
                  </option>
                );
              })}
            </motion.select>

            {data &&
              servicoSelecionado &&
              horariosDisponiveis.length === 0 &&
              !carregandoHorarios && (
                <p className="text-sm text-red-500">
                  Não há horários livres para esse serviço nessa data.
                </p>
              )}

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm text-gray-600">
              <p className="font-medium text-gray-700 mb-1">Observação:</p>
              <p>• Atendimento das 08:00 às 21:00</p>
              <p>
                • Caso queira um horário mais cedo ou tenha algum problema no
                sistema, entre em contato: 11 99389-6183
              </p>
            </div>

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
