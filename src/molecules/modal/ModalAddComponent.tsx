import { landingPageTable, storageBucket, urlImage } from "@/helpers/constants";
import { ISection } from "@/pages/[eventId]/lp/manage";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/supabase";
import { Button, Form, Input, message, Select, Upload } from "antd";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const Modal = dynamic(() => import("antd/lib/modal"), { ssr: false });

interface IModalCreateSection {
  open: boolean;
  onClose: () => void;
  onFinishCreateComponent?: () => void;
  data?: ISection;
  isEdit: string | null;
}

const ModalAddComponent = ({
  onClose,
  open,
  data,
  onFinishCreateComponent,
  isEdit,
}: IModalCreateSection) => {
  const [form] = Form.useForm();
  const watch = Form.useWatch([], form);

  const [api, contextHolder] = message.useMessage();

  const { event } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);

  const handleFinish = async () => {
    await form.validateFields();
    setIsLoading(true);
    const getFormValues = form.getFieldsValue();

    const value =
      getFormValues?.[`component-type`] === "img"
        ? `landing-page_dev/${data?.sectionName}/${
            getFormValues?.[`component-value`]?.file?.name
          }/${dayjs().toString()}`
        : getFormValues?.[`component-value`];

    const newComponent = {
      type: getFormValues?.[`component-type`],
      value: value,
      link: getFormValues?.[`component-link`],
      className: getFormValues?.[`component-class`],
      id: uuidv4(),
    };

    if (getFormValues?.[`component-type`] === "img") {
      const { error } = await supabase.storage
        .from(storageBucket)
        .upload(
          value as string,
          getFormValues?.[`component-value`]?.file?.originFileObj
        );
      if (error) {
        api.error(error?.message || "Failed to upload image");
        setIsLoading(false);
        return;
      }
    }

    if (!isEdit) {
      const { error } = await supabase
        .from(landingPageTable)
        .update({
          components: data?.components
            ? [...data?.components, newComponent]
            : [newComponent],
        })
        .eq("eventID", event?.id)
        .eq("id", data?.id);
      if (error) {
        console.log("error", error);
        setIsLoading(false);
      }
      setIsLoading(false);
      onClose();
      form.resetFields();
      onFinishCreateComponent && onFinishCreateComponent();
    } else {
      let sample = data ? [...data.components] : [];
      sample[sample.findIndex((x) => x?.id === isEdit)].type =
        getFormValues?.[`component-type`];
      sample[sample.findIndex((x) => x?.id === isEdit)].value =
        value;
      sample[sample.findIndex((x) => x?.id === isEdit)].link =
        getFormValues?.[`component-link`];
      sample[sample.findIndex((x) => x?.id === isEdit)].className =
        getFormValues?.[`component-class`];
      const { error } = await supabase
        .from(landingPageTable)
        .update({
          components: sample,
        })
        .eq("eventID", event?.id)
        .eq("id", data?.id);

      if (error) {
        console.log("error", error);
        setIsLoading(false);
      }
      setIsLoading(false);
      onClose();
      form.resetFields();
      onFinishCreateComponent && onFinishCreateComponent();
    }
  };

  useEffect(() => {
    if (isEdit && open) {
      const getComponent = data?.components?.find(
        (item) => item?.id === isEdit
      );
      form.setFieldValue(`component-type`, getComponent?.type);
      form.setFieldValue(`component-value`, getComponent?.value);
      form.setFieldValue(`component-link`, getComponent?.link);
      form.setFieldValue(`component-class`, getComponent?.className);
    }
  }, [isEdit, open]);
  return (
    <>
      {contextHolder}
      <Modal
        open={open}
        onCancel={() => {
          onClose();
          form.resetFields();
        }}
        footer={[
          <Button onClick={handleFinish} type="primary" loading={isLoading}>
            Save
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" disabled={isLoading}>
          <Form.Item
            label="Component Type"
            name={`component-type`}
            rules={[
              {
                required: true,
                message: "Please input type of component!",
              },
            ]}
          >
            <Select placeholder="Select type">
              <Select.Option value="h1">Heading</Select.Option>
              <Select.Option value="p">Paragraph</Select.Option>
              <Select.Option value="img">Image</Select.Option>
              <Select.Option value="button">Button</Select.Option>
            </Select>
          </Form.Item>
          {watch?.[`component-type`] !== "img" && (
            <Form.Item
              label="Component Value"
              name={`component-value`}
              rules={[
                {
                  required: true,
                  message: "Please input value of component!",
                },
              ]}
            >
              {watch?.[`component-type`] === "paragraph" ? (
                <Input.TextArea
                  placeholder="Enter value"
                  className="resize-none"
                  rows={2}
                />
              ) : (
                <Input placeholder="Enter value" />
              )}
            </Form.Item>
          )}

          {watch?.[`component-type`] === "img" && (
            <Form.Item
              label="Component Image"
              name={`component-value`}
              rules={[{ required: true, message: "Please upload image!" }]}
            >
              {typeof watch?.[`component-value`] === "string" ? (
                <div className="relative w-full">
                  <img
                    src={`${urlImage}/${watch?.[`component-value`]}`}
                    alt=""
                  />
                  <Button
                    block
                    onClick={() => form.setFieldValue("component-value", null)}
                    style={{ background: "red", color: "white" }}
                  >
                    Delete
                  </Button>
                </div>
              ) : (
                <Upload maxCount={1} accept="image/*">
                  <Button type="primary" block>
                    Upload Image
                  </Button>
                </Upload>
              )}
            </Form.Item>
          )}
          {watch?.[`component-type`] === "button" && (
            <div className="col-span-2">
              <Form.Item
                style={{ marginTop: 0 }}
                label="Button Link"
                name={`component-link`}
                rules={[
                  {
                    required: true,
                    message: "Please input link of component!",
                  },
                ]}
              >
                <Input placeholder="Enter link" />
              </Form.Item>
            </div>
          )}
          <div className="col-span-2">
            <Form.Item
              style={{ marginTop: 0 }}
              label="Class Name"
              name={`component-class`}
            >
              <Input placeholder="Enter class" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default ModalAddComponent;
