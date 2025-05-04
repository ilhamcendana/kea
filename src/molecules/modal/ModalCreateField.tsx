"use client";

import useFetchFields from "@/hooks/useFetchFields";
import useInsertToDB from "@/hooks/useInsertToDB";
import { useAuthStore } from "@/store/useAuthStore";
import { DeleteOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Select, Switch, Tag } from "antd";
import dynamic from "next/dynamic";
import { useEffect, useMemo } from "react";

const Modal = dynamic(() => import("antd/lib/modal"), {
  ssr: false,
});

interface IModalCreateFieldProps {
  open: boolean;
  onClose: () => void;
  editData?: any;
  refetch?: () => void;
}

const ModalCreateField = ({
  open,
  onClose,
  editData,
  refetch,
}: IModalCreateFieldProps) => {
  const [form] = Form.useForm<{
    label: string;
    type: string;
    optionInput: string;
    options: { value: string; label: string }[];
    isRequired: boolean;
  }>();

  const watch = Form.useWatch([], form);

  const isHaveOptions = useMemo(
    () => ["select", "radio", "checkbox"]?.includes(watch?.type),
    [watch?.type]
  );

  const isEdit = useMemo(() => !!editData, [editData]);

  useEffect(() => {
    if (isEdit) {
      form.setFieldsValue({
        label: editData?.label,
        type: editData?.type,
        options: editData?.options,
        isRequired: editData?.isRequired,
      });
    }
  }, [isEdit]);

  const { mutate, isLoading } = useInsertToDB();
  const { updateField, isLoading:isloadingUpdate } = useFetchFields();
  const { event, user } = useAuthStore();
  const [api, contextHolder] = message.useMessage();

  const onCreateField = async () => {
    mutate({
      tableName: "fields_dev",
      payload: [
        {
          label: form.getFieldValue("label"),
          name: form.getFieldValue("label")?.split(" ")?.join("_"),
          type: form.getFieldValue("type"),
          options: form.getFieldValue("options") || null,
          isRequired: form.getFieldValue("isRequired") || false,
          eventID: event?.id,
          createdBy: user?.id,
        },
      ],
    })
      .then(() => {
        onClose();
        api.success("Field created successfully");
        refetch && refetch();
      })
      .catch((error) => {
        console.error("Error creating Field:", error);
        api.error(error?.message || "Failed to create Field");
      });
  };

  const onUpdateField = async () => {
    try {
      await updateField({
        label: form.getFieldValue("label"),
        name: form.getFieldValue("label")?.split(" ")?.join("_"),
        type: form.getFieldValue("type"),
        options: form.getFieldValue("options") || null,
        isRequired: form.getFieldValue("isRequired") || false,
        eventID: event?.id,
        createdBy: user?.id,
      }, editData?.id);
      onClose();
      api.success("Field updated successfully");
      refetch && refetch();
    } catch (error: any) {
      console.error("Error updating Field:", error);
      api.error(error?.message || "Failed to update Field");
    }
  };

  if (typeof window === "undefined") return null;
  return (
    <>
      {contextHolder}
      <Modal
        open={open}
        title={isEdit ? "Edit Field" : "Create Field"}
        width={600}
        centered
        closeIcon={false}
        footer={[
          <div className="flex justify-end gap-2">
            <Button
              disabled={isLoading || isloadingUpdate}
              onClick={() => {
                form.resetFields();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => (isEdit ? onUpdateField() : onCreateField())}
              loading={isLoading || isloadingUpdate}
            >
              {isEdit ? "Update" : "Create"}
            </Button>
          </div>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
          disabled={isLoading || isloadingUpdate}
        >
          <Form.Item label="Label" name="label" rules={[{ required: true }]}>
            <Input placeholder="Enter label" />
          </Form.Item>
          <Form.Item label="Type" name="type" rules={[{ required: true }]}>
            <Select placeholder="Select type">
              <Select.Option value="text">Text</Select.Option>
              <Select.Option value="number">Number</Select.Option>
              <Select.Option value="select">Select</Select.Option>
              <Select.Option value="checkbox">Checkbox</Select.Option>
              <Select.Option value="radio">Radio</Select.Option>
            </Select>
          </Form.Item>
          {isHaveOptions && (
            <Form.Item
              name="options"
              label="Options"
              style={{ marginBottom: 4 }}
            >
              <div className="flex flex-wrap gap-1">
                {watch?.options?.map((item, i) => (
                  <Tag
                    onClose={() => {
                      const options = watch?.options || [];
                      form.setFieldValue(
                        "options",
                        options.filter((_, index) => index !== i)
                      );
                    }}
                    closeIcon={<DeleteOutlined className="!text-red-500" />}
                    key={i}
                  >
                    {item?.label}
                  </Tag>
                ))}
              </div>
            </Form.Item>
          )}
          {isHaveOptions && (
            <Form.Item name="optionInput" extra="Press Enter to add option">
              <Input
                placeholder="Enter option"
                onKeyDown={(e) => {
                  if (e.code === "Enter") {
                    e.preventDefault();
                    const value = e.currentTarget.value;
                    if (value) {
                      const options = watch?.options || [];
                      form.setFieldValue("options", [
                        ...options,
                        { value: value?.split(" ").join("_"), label: value },
                      ]);
                      form.setFieldValue("optionInput", "");
                    }
                  }
                }}
              />
            </Form.Item>
          )}
          <Form.Item label="Required?" name="isRequired">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ModalCreateField;
