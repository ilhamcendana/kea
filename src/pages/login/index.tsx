import { PAGE_URL } from "@/helpers/constants";
import SEO from "@/molecules/SEO";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/supabase";
import { AuthError } from "@supabase/supabase-js";
import { Button, Form, Input, message, notification } from "antd";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/router";
import { useState } from "react";

type FieldType = {
  email?: string;
  password?: string;
};

const Login = () => {
  const [form] = Form.useForm<FieldType>();

  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();

  const [isLoading, isLoadingSet] = useState(false);
  const { setAuthState } = useAuthStore();

  const onLogin = async (values: FieldType) => {
    isLoadingSet(true);

    try {
      const { data } = await axios.post("/api/auth", {
        email: values?.email,
        password: values?.password,
      });
      console.log("Login data", data);
      setAuthState({
        session: data?.session,
        user: data?.user,
      });
      isLoadingSet(false);
      router.replace(PAGE_URL.SUMMARY);
    } catch (error: unknown) {
      isLoadingSet(false);
      if (axios.isAxiosError(error)) {
        messageApi.error(`${error?.response?.data?.error?.message}`);
        console.log("Login error", error);
      }
    }
  };

  return (
    <>
      <SEO title="Login | KEA" />
      {contextHolder}
      <div className="w-full h-dvh flex flex-col items-center justify-center gap-10">
        <div className="flex flex-col w-full max-w-[300px]">
          <h1 className="font-bold text-2xl">KEA</h1>
          <p className="text-xs">Kreasia Event Attendance</p>
        </div>
        <Form
          layout="vertical"
          name="basic"
          style={{ maxWidth: 300, width: "100%" }}
          form={form}
          autoComplete="on"
          onFinish={onLogin}
          disabled={isLoading}
        >
          <Form.Item<FieldType>
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password />
          </Form.Item>

          <div className="w-full">
            <Button type="primary" htmlType="submit" block loading={isLoading}>
              Submit
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
};

export default Login;
