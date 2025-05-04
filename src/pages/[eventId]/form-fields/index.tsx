import useFetchFields from "@/hooks/useFetchFields";
import ModalCreateField from "@/molecules/modal/ModalCreateField";
import { DeleteOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Table } from "antd";
import { useEffect, useState } from "react";

const FormFields = () => {
  const [isModalOpen, setIsModalOpen] = useState<{
    open: boolean;
    data?: any;
  }>({ open: false });

  const { listAllFields, deleteField } = useFetchFields();

  const [data, setData] = useState<any[]>([]);

  function fetchFields() {
    listAllFields().then((res: any) => {
      setData(res);
    });
  }

  useEffect(() => {
    fetchFields();
  }, []);

  return (
    <>
      <div>
        <h3 className="font-bold text-2xl mb-8">Form Fields</h3>
        <div className="mb-10">
          <Button onClick={() => setIsModalOpen({ open: true })} type="primary">
            Add Field
          </Button>
        </div>

        <Table
          columns={[
            {
              title: "No",
              key: "key",
              render(value, record, index) {
                return index + 1;
              },
            },
            {
              title: "Label",
              dataIndex: "label",
              key: "label",
            },
            {
              title: "Type",
              dataIndex: "type",
              key: "type",
            },
            {
              title: "Required",
              dataIndex: "isRequired",
              key: "isRequired",
              render: (text) => <span>{text ? "Yes" : "No"}</span>,
            },
            {
              title: "Action",
              key: "action",
              render: (record) => (
                <div className="flex gap-2">
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => {
                      setIsModalOpen({ open: true, data: record });
                    }}
                  >
                    Edit
                  </Button>
                  <Popconfirm
                    title="Delete this field?"
                    onConfirm={async () => {
                      await deleteField(record?.id);                      
                      fetchFields();
                    }}
                  >
                    <Button
                      color="red"
                      size="small"
                      icon={<DeleteOutlined className="!text-red-500" />}
                    />
                  </Popconfirm>
                </div>
              ),
            },
          ]}
          dataSource={data}
        />
      </div>
      <ModalCreateField
        open={isModalOpen?.open}
        onClose={() => setIsModalOpen({ open: false })}
        editData={isModalOpen?.data}
        refetch={fetchFields}
      />
    </>
  );
};

export default FormFields;
