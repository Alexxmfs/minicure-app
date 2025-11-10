import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center bg-pink-100">
      <h1 className="text-3xl font-bold text-pink-600 mb-4">
        💅 Agende sua Manicure
      </h1>
      <p className="text-gray-700 mb-6">
        Escolha o melhor horário e garanta suas unhas lindas!
      </p>
      <Link
        href="/agendar"
        className="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition"
      >
        Agendar horário
      </Link>
    </main>
  );
}
