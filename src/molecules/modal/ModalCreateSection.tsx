import { landingPageTable, storageBucket } from "@/helpers/constants";
import { ISection } from "@/pages/[eventId]/lp/manage";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/supabase";
import { DeleteOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Upload, Select } from "antd";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

const Modal = dynamic(() => import("antd/lib/modal"), { ssr: false });

interface IModalCreateSection {
  open: boolean;
  onClose: () => void;
  onFinishCreateSection?: () => void;
  data?: ISection;
  order: number;
}

interface IComponent {
  type: "h1" | "paragraph" | "img" | "button";
  value: string;
  link?: string;
  className?: string;
  isDeleted?: boolean;  
}

const ModalCreateSection = ({
  open,
  onClose,
  onFinishCreateSection,
  data,
  order
}: IModalCreateSection) => {
  const [components, componentsSet] = useState<IComponent[]>([]);

  const isEdit = useMemo(() => (data ? true : false), [data]);

  const { event } = useAuthStore();

  const [api, contextHolder] = message.useMessage();

  const [form] = Form.useForm();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        sectionName: data?.sectionName,
      });
      // componentsSet(data?.components);
      // data?.components?.forEach((item, i) => {
      //   form.setFieldsValue({
      //     [`component-type__${i}`]: item?.type,
      //     [`component-value__${i}`]: item?.value,
      //     [`component-class__${i}`]: item?.className,
      //     [`component-link__${i}`]: item?.link,
      //   });
      // });
    }
  }, [data]);

  async function createSection() {
    await form.validateFields();
    setIsLoading(true);

    try {
      if (!isEdit) {
        await supabase
          .from(landingPageTable)
          .insert([
            {
              sectionName: form.getFieldValue("sectionName"),
              eventID: event?.id,
              components: [],
              order
            },
          ]);
      } else {
        const { error } = await supabase
          .from(landingPageTable)
          .upsert([
            {
              sectionName: form.getFieldValue("sectionName"),
              eventID: event?.id,
              id: data?.id,
            },
          ]);
      }
      onClose();
      setIsLoading(false);
      onFinishCreateSection && onFinishCreateSection();
    } catch (error) {
      setIsLoading(false);
    }
  }

  async function onSave() {
    await form.validateFields();
    setIsLoading(true);

    try {
      const getFields = form.getFieldsValue();

      const sectionName = getFields?.sectionName;

      let componentsBucket = [];
      for (let i = 0; i < components?.length; i++) {
        if (!components[i].isDeleted) {
          let component: any = {
            type: getFields[`component-type-${i}`],
            value: getFields[`component-value-${i}`],
            className: getFields[`component-class-${i}`] || "",
          };

          if (
            getFields[`component-type-${i}`] === "img" &&
            typeof getFields[`component-value-${i}`] !== "string"
          ) {
            const { data, error } = await supabase.storage
              .from(storageBucket)
              .upload(
                `landing-page_dev/${sectionName}/${
                  getFields[`component-value-${i}`]?.file?.name
                }`,
                getFields[`component-value-${i}`]?.file?.originFileObj
              );

            if (error) {
              api.error(error?.message || "Failed to upload image");
              setIsLoading(false);
              return;
            } else {
              component = {
                ...component,
                value: data?.path,
              };
            }
          }
          if (getFields[`component-type-${i}`] === "button") {
            component = {
              ...component,
              link: getFields[`component-link-${i}`],
            };
          }
          componentsBucket.push(component);
        }
      }

      const payload = {
        sectionName,
        components: componentsBucket,
        eventID: event?.id,
      };

      if (isEdit) {
        const { error } = await supabase
          .from(landingPageTable)
          .update(payload)
          .eq("eventID", event?.id)
          .eq("id", data?.id);

        if (error) {
          setIsLoading(false);
          api.error(error?.message || "Failed to update section");
          return;
        } else {
          setIsLoading(false);
          onClose();
          form.resetFields();
          componentsSet([]);
          api.success("Section updated successfully");
          onFinishCreateSection && onFinishCreateSection();
        }
      } else {
        const { data, error } = await supabase
          .from(landingPageTable)
          .insert([payload]);

        if (error) {
          setIsLoading(false);
          api.error(error?.message || "Failed to create section");
          return;
        } else {
          setIsLoading(false);
          onClose();
          form.resetFields();
          componentsSet([]);
          api.success("Section created successfully");
          onFinishCreateSection && onFinishCreateSection();
        }
      }
    } catch (error) {
      setIsLoading(false);
      api.error("Failed to create section");
      console.error("Error creating section:", error);
    }
  }

  return (
    <>
      {contextHolder}
      <Modal
        width={800}
        wrapStyle={{ zIndex: 10000 }}
        open={open}
        onCancel={() => {
          onClose();
          form.resetFields();
          componentsSet([]);
        }}
        title={isEdit ? "Edit Section" : "Create Section"}
        footer={[
          <Button
            loading={isLoading}
            onClick={() => createSection()}
            type="primary"
          >
            {isEdit ? "Edit" : "Save"}
          </Button>,
        ]}
      >
        <Form
          layout="vertical"
          autoComplete="off"
          style={{ marginTop: 16 }}
          form={form}
          disabled={isLoading}
        >
          <Form.Item
            label="Section Name"
            name="sectionName"
            rules={[{ required: true, message: "Please input section name!" }]}
          >
            <Input placeholder="Enter section name" />
          </Form.Item>
          {/* {components?.map((item, i) => (
            <AddSectionForm
              i={i}
              onDelete={() => {
                componentsSet((prev) => {
                  const newComponents = [...prev];
                  newComponents[i].isDeleted = true;
                  return newComponents;
                });
              }}
            />
          ))}
          <Button
            htmlType="button"
            onClick={() => {
              componentsSet((prev) => [...prev, { type: "h1", value: "" }]);
            }}
          >
            Add component
          </Button> */}
        </Form>
      </Modal>
    </>
  );
};

export default ModalCreateSection;
