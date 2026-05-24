import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useFetch } from "../../hooks/useFetch";
import { usePageTitle } from "../../hooks/usePageTitle";
import Button from "../../components/common/Button";
import type { User } from "../../types/auth";

const schema = Yup.object({
  name: Yup.string().required("Obrigatório"),
  email: Yup.string().email("E-mail inválido").required("Obrigatório"),
  cpf: Yup.string()
    .test("cpf", "CPF inválido (ex: 123.456.789-00)", (v) => {
      const digits = (v ?? "").replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 11;
    })
    .required("Obrigatório"),
  password: Yup.string()
    .min(6, "Mínimo 6 caracteres")
    .required("Obrigatório"),
});

interface RegisterResult {
  user: User;
  token: string;
}

const fields: Array<{
  name: "name" | "email" | "cpf" | "password";
  label: string;
  type: string;
  placeholder: string;
}> = [
  { name: "name", label: "Nome completo", type: "text", placeholder: "Seu nome" },
  { name: "email", label: "E-mail", type: "email", placeholder: "seu@email.com" },
  { name: "cpf", label: "CPF", type: "text", placeholder: "000.000.000-00" },
  { name: "password", label: "Senha", type: "password", placeholder: "••••••" },
];

export default function RegisterPage() {
  usePageTitle("Criar Conta");
  const { login } = useAuth();
  const navigate = useNavigate();
  const { execute, error } = useFetch<RegisterResult>();

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="lg:hidden text-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl font-bold text-white">$</span>
        </div>
      </div>
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Criar Conta
      </h1>
      <Formik
        initialValues={{ name: "", email: "", cpf: "", password: "" }}
        validationSchema={schema}
        onSubmit={async (values, { setSubmitting }) => {
          const result = await execute("/auth/register", {
            method: "POST",
            body: JSON.stringify(values),
          });
          setSubmitting(false);
          if (result) {
            login(result.user, result.token);
            toast.success("Conta criada com sucesso!");
            navigate("/report", { replace: true });
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            {fields.map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <Field
                  name={name}
                  type={type}
                  placeholder={placeholder}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                />
                <ErrorMessage
                  name={name}
                  component="p"
                  className="text-red-500 text-xs mt-1"
                />
              </div>
            ))}
            <Button type="submit" loading={isSubmitting} className="w-full py-2.5">
              Cadastrar
            </Button>
            <p className="text-center text-sm text-gray-500">
              Já tem conta?{" "}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">
                Entrar
              </Link>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
}
