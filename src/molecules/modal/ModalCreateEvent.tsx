import { eventsTable } from "@/helpers/constants";
import useInsertToDB from "@/hooks/useInsertToDB";
import { Button, DatePicker, Form, Input, message } from "antd";
import dayjs from "dayjs";
import dynamic from "next/dynamic";

const Modal = dynamic(() => import("antd/lib/modal"), { ssr: false });

interface IModalCreateEvent {
  open: boolean;
  onClose: () => void;
}

const ModalCreateEvent = ({ open, onClose }: IModalCreateEvent) => {
  const { mutate: mutateCreateEvent, isLoading } = useInsertToDB();
  const [api, contextHolder] = message.useMessage();
  return (
    <>
      {contextHolder}
      <Modal open={open} onCancel={onClose} title="Create Event" footer={null}>
        <Form
          disabled={isLoading}
          layout="vertical"
          initialValues={{
            name: "",
            eventDate: "",
          }}
          autoComplete="off"
          onFinish={(values) => {
            mutateCreateEvent({
              tableName: eventsTable,
              payload: [
                {
                  name: values?.name,
                  eventDate: values?.eventDate,
                },
              ],
            })
              .then(() => {
                onClose();
                api.success('Event created successfully');
              })
              .catch((error) => {
                console.error("Error creating event:", error);
                api.error(error?.message || "Failed to create event");
              });
          }}
        >
          <Form.Item
            label="Event Name"
            name="name"
            rules={[{ required: true, message: "Please input event name!" }]}
          >
            <Input type="text" placeholder="Event Name" />
          </Form.Item>
          <Form.Item label="Event Date" name="eventDate">
            <DatePicker minDate={dayjs()} />
          </Form.Item>

          <div className="w-full flex justify-end gap-2">
            <Button loading={isLoading} type="primary" htmlType="submit">
              Save
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default ModalCreateEvent;
