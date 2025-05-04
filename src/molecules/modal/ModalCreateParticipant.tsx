"use client";

import TextInput from "@/atoms/TextInput";
import useFetchParticipant from "@/hooks/useFetchParticipant";
import useInsertToDB from "@/hooks/useInsertToDB";
import { useAuthStore } from "@/store/useAuthStore";
import { DeleteOutlined } from "@ant-design/icons";
import { Button, Form, Input, Select, Switch, Tag } from "antd";
import dynamic from "next/dynamic";
import { useEffect, useMemo } from "react";

const Modal = dynamic(() => import("antd/lib/modal"), {
  ssr: false,
});

interface IModalCreateParticipantProps {
  open: boolean;
  onClose: () => void;
  editData?: any;
  fields?: any[];
  refetch?: () => void;
}

const ModalCreateParticipant = ({
  open,
  onClose,
  editData,
  fields,
  refetch,
}: IModalCreateParticipantProps) => {
  const [form] = Form.useForm();

  const isEdit = useMemo(() => !!editData, [editData]);

  const { event } = useAuthStore();

  const { mutate, isLoading } = useInsertToDB();

  const { updateParticipant, isLoading: isLoadingUpdate } =
    useFetchParticipant();

  useEffect(() => {
    if (isEdit) {
      form.setFieldsValue(editData);
    }
  }, [isEdit]);

  if (typeof window === "undefined") return null;
  return (
    <Modal
      open={open}
      title={isEdit ? "Edit Participant" : "Create Participant"}
      width={600}
      centered
      closeIcon={false}
      footer={[
        <div className="flex justify-end gap-2">
          <Button
            disabled={isLoading || isLoadingUpdate}
            onClick={() => {
              form.resetFields();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            loading={isLoading || isLoadingUpdate}
            onClick={async () => {
              if (isEdit) {
                await form.validateFields();
                await updateParticipant({data: form.getFieldsValue()}, editData?.id);
                form.resetFields();
                onClose();
                refetch && refetch();
              } else {
                await form.validateFields();
                await mutate({
                  tableName: "participants_dev",
                  payload: [
                    { data: form.getFieldsValue(), eventID: event?.id },
                  ],
                });
                form.resetFields();
                onClose();
                refetch && refetch();
              }
            }}
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
        disabled={isLoading || isLoadingUpdate}
      >
        {fields?.map((item, i) => {
          if (item?.type === "text")
            return (
              <TextInput
                key={i}
                item={{
                  name: item?.name,
                  label: item?.label,
                  rules: item?.isRequired ? [{ required: true }] : [],
                }}
              />
            );
          if (item?.type === "number")
            return (
              <TextInput
                key={i}
                item={{
                  name: item?.name,
                  label: item?.label,
                  rules: item?.isRequired ? [{ required: true }] : [],
                }}
                input={{
                  type: "number",
                }}
              />
            );
          if (item?.type === "select") {
            return (
              <Form.Item
                key={i}
                label={item?.label}
                name={item?.name}
                rules={[{ required: item?.isRequired }]}
              >
                <Select placeholder="Select option">
                  {item?.options?.map((option: any, i: number) => (
                    <Select.Option key={i} value={option?.value}>
                      {option?.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            );
          }
        })}
        {/* <Form.Item label="Label" name="label" rules={[{ required: true }]}>
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
          <Form.Item name="options" label="Options" style={{ marginBottom: 4 }}>
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
        </Form.Item> */}
      </Form>
    </Modal>
  );
};

export default ModalCreateParticipant;
