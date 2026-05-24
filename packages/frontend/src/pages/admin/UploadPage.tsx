import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useFetch } from "../../hooks/useFetch";
import { usePageTitle } from "../../hooks/usePageTitle";
import Button from "../../components/common/Button";

interface UploadResult {
  created: number;
  skipped: number;
}

export default function UploadPage() {
  usePageTitle("Importar CSV");
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { execute, loading, error } = useFetch<UploadResult>();
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const data = await execute("/transactions/upload", {
      method: "POST",
      body: fd,
    });
    if (data) {
      setResult(data);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      toast.success(
        `CSV importado: ${data.created} transações criadas, ${data.skipped} ignoradas.`
      );
    } else {
      toast.error("Erro ao importar CSV. Verifique o formato do arquivo.");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Importar Transações
      </h1>
      <div className="card p-6 max-w-lg animate-slide-up">
        <p className="text-sm text-gray-500 mb-5">
          Envie um CSV com as colunas:{" "}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-700">
            cpf, transaction_description, transaction_date, points_value, monetary_value, status
          </code>
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arquivo CSV
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => {
                  setResult(null);
                  setFile(e.target.files?.[0] ?? null);
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              {file && (
                <p className="text-xs text-gray-500 mt-2">
                  Selecionado: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {result && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 animate-fade-in">
              <strong>{result.created}</strong> transações importadas,{" "}
              <strong>{result.skipped}</strong> ignoradas.
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" loading={loading} disabled={!file}>
              Enviar
            </Button>
            {result && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/report")}
              >
                Ver Relatório
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
