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
  email: Yup.string().email("E-mail inválido").required("Obrigatório"),
  password: Yup.string().required("Obrigatório"),
});

interface LoginResult {
  user: User;
  token: string;
}

export default function LoginPage() {
  usePageTitle("Entrar");
  const { login } = useAuth();
  const navigate = useNavigate();
  const { execute, error } = useFetch<LoginResult>();

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
        Entrar
      </h1>
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={schema}
        onSubmit={async (values, { setSubmitting }) => {
          const result = await execute("/auth/login", {
            method: "POST",
            body: JSON.stringify(values),
          });
          setSubmitting(false);
          if (result) {
            login(result.user, result.token);
            toast.success(`Bem-vindo, ${result.user.name}!`);
            navigate("/report", { replace: true });
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <Field
                name="email"
                type="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                placeholder="seu@email.com"
              />
              <ErrorMessage
                name="email"
                component="p"
                className="text-red-500 text-xs mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <Field
                name="password"
                type="password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                placeholder="••••••"
              />
              <ErrorMessage
                name="password"
                component="p"
                className="text-red-500 text-xs mt-1"
              />
            </div>
            <Button type="submit" loading={isSubmitting} className="w-full py-2.5">
              Entrar
            </Button>
            <p className="text-center text-sm text-gray-500">
              Não tem conta?{" "}
              <Link to="/register" className="text-blue-600 hover:underline font-medium">
                Cadastre-se
              </Link>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
}
