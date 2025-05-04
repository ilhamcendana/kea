import React, { ReactNode, useEffect, useMemo } from "react";
import {
  AppstoreOutlined,
  BarChartOutlined,
  LaptopOutlined,
  LogoutOutlined,
  SettingOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { MenuProps, Popconfirm } from "antd";
import { Button, Menu, Select, theme, Layout } from "antd";
import Link from "next/link";
import { PAGE_URL } from "@/helpers/constants";
import { useAuthStore } from "@/store/useAuthStore";
import ModalCreateEvent from "./modal/ModalCreateEvent";
import { useRouter } from "next/router";
import useFetchEvents from "@/hooks/useFetchEvents";
import { supabase } from "@/supabase";
import SEO from "./SEO";

const { Content, Footer, Sider, Header } = Layout;

const siderStyle: React.CSSProperties = {
  overflow: "auto",
  height: "100vh",
  position: "sticky",
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  scrollbarWidth: "thin",
  scrollbarGutter: "stable",
};

const LayoutAuth = ({ children }: { children: ReactNode }) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { event, setAuthState } = useAuthStore();
  const { isLoading, listAllEvents } = useFetchEvents();

  const items: MenuProps["items"] = useMemo(() => {
    const eventId = event?.id;
    return [
      {
        key: "summary",
        icon: <BarChartOutlined />,
        label: <Link href={PAGE_URL.SUMMARY}>Summary</Link>,
      },
      {
        key: "manage-participant",
        icon: <TeamOutlined />,
        label: (
          <Link
            href={PAGE_URL.PARTICIPANT_LIST?.replace(
              "[eventId]",
              eventId || ""
            )}
          >
            Participant
          </Link>
        ),
      },
      {
        key: "manage-field",
        icon: <AppstoreOutlined />,
        label: (
          <Link
            href={PAGE_URL.FORM_FIELD_LIST?.replace("[eventId]", eventId || "")}
          >
            Form Fields
          </Link>
        ),
      },
      {
        key: "landing-page",
        icon: <LaptopOutlined />,
        label: (
          <Link
            href={PAGE_URL.LANDING_PAGE_MANAGE?.replace(
              "[eventId]",
              eventId || ""
            )}
          >
            Landing Page
          </Link>
        ),
      },
      {
        key: "settings",
        icon: <SettingOutlined />,
        label: "Settings",
        children: [
          {
            key: "signout",
            icon: <LogoutOutlined />,
            label: (
              <Popconfirm
                title="Are you sure want to signing out?"
                onConfirm={() => {
                  supabase.auth.signOut();
                  setAuthState({
                    event: undefined,
                    session: undefined,
                    user: undefined,
                  });
                  localStorage.removeItem("auth-store");
                  router.replace(PAGE_URL.LOGIN);
                }}
              >
                Sign Out
              </Popconfirm>
            ),
          },
        ],
      },
    ];
  }, [event]);

  const [isModalCreateEventOpen, setIsModalCreateEventOpen] =
    React.useState(false);

  const [allEvents, setAllEvents] = React.useState<Event[]>([]);

  const router = useRouter();

  const isHideLayout = useMemo(() => {
    if (
      (router.pathname?.includes("lp") &&
        !router.pathname?.includes("manage")) ||
      router.pathname?.includes("login")
    )
      return true;
    return false;
  }, [router.pathname]);

  async function fetchEvents() {
    const data = await listAllEvents();
    setAllEvents(data as Event[]);
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  if (isHideLayout) return children;

  return (
    <>
    <SEO title="Kreasia Event Attendance" />
      <Layout hasSider>
        <Sider style={siderStyle}>
          <div className="h-20 w-full text-white font-bold flex justify-center flex-col px-4 text-sm lg:text-lg">
            <p>Kreasia</p>
            <p>Event Attendance</p>
          </div>
          <div className="w-full !mt-8 px-2">
            <Select
              placeholder="Select Event"
              className="w-full"
              loading={isLoading}
              onChange={(value) =>
                setAuthState({ event: allEvents?.find((e) => e.id === value) })
              }
              value={event?.id}
            >
              {allEvents?.map((event) => (
                <Select.Option key={event.id} value={event.id}>
                  {event.name}
                </Select.Option>
              ))}
            </Select>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={["4"]}
            items={event?.id ? items : []}
          />
          <div className="w-full !mt-8 px-2 flex justify-center absolute bottom-10">
            <Button
              onClick={() => setIsModalCreateEventOpen(true)}
              type="primary"
            >
              Create event
            </Button>
          </div>
        </Sider>
        <Layout>
          <Header
            style={{ padding: 0, background: colorBgContainer }}
            className="flex items-center"
          >
            <div className="px-4">
              <h1 className="text-3xl font-bold">{event?.name}</h1>
            </div>
          </Header>
          <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
            {children}
          </Content>
          <Footer style={{ textAlign: "center" }}>
            KEA - Powered by{" "}
            <Link href="https://riqqlab.com" target="_blank">
              Riqqlab
            </Link>{" "}
            ©{new Date().getFullYear()}
          </Footer>
        </Layout>
      </Layout>
      <ModalCreateEvent
        open={isModalCreateEventOpen}
        onClose={() => setIsModalCreateEventOpen(false)}
      />
    </>
  );
};

export default LayoutAuth;
