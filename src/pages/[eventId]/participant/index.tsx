import useFetchFields from "@/hooks/useFetchFields";
import useFetchParticipant from "@/hooks/useFetchParticipant";
import ModalCreateParticipant from "@/molecules/modal/ModalCreateParticipant";
import { useAuthStore } from "@/store/useAuthStore";
import { DeleteOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Table } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

const Participant = () => {
  const [isModalOpen, setIsModalOpen] = useState<{
    open: boolean;
    data?: any;
  }>({ open: false });  

  const [fields, setFields] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const { event } = useAuthStore();

  const { listAllFields } = useFetchFields();
  const { isLoading, listAllParticipant, deleteParticipant } = useFetchParticipant();

  function fetchFields() {
    listAllFields().then((res: any) => {
      setFields(res);
    });
  }

  function fetchParticipants() {
    listAllParticipant().then((res: any) => {
      setParticipants(res);
    });
  }

  useEffect(() => {
    if(event?.id) {
      fetchFields();
      fetchParticipants();
    }
  }, [event?.id]);

  const dataToField = useMemo(() => {
    if(participants?.length === 0) return [];
    const filtered = Object.keys(participants?.[0])?.filter(x => x !== "eventID" && x !== "data");
    // Object.keys(filtered[filtered.indexOf("data")])?.
    return filtered.map((key) => ({
      title: key,
      dataIndex: key,
      render: (value:any) => {
        if(key === "id") return value?.split("-")?.[value?.split("-")?.length - 1];
        if(key === "createdAt") return dayjs(value).format("DD/MM/YYYY");
        return value;
      }
    }));
  }, [participants]);

  const dataJSONToField = useMemo(() => {
    if(participants?.length === 0) return [];
    const dataOnly = participants?.map(x => x?.data);
    let sample = {};
    dataOnly?.forEach((x) => {
      if(!sample) {
        sample = x;
      }
      if(Object.keys(x)?.length > Object.keys(sample)?.length) {
        sample = x;
      }
    })
    return Object.keys(sample).map((key,i) => ({
      title: key,
      dataIndex: key,
    }));
  }, [participants]);

  const participantsProcessed = useMemo(() => {
    if(participants?.length === 0) return [];
    return participants?.map((item) => {
      return {
        ...item,
        ...item?.data,
      };
    });
  }
, [participants]);

console.log(dataJSONToField)

  return (
    <>
      <div>
        <h3 className="font-bold text-2xl mb-8">Participant</h3>
        <div className="mb-10">
          <Button onClick={() => setIsModalOpen({ open: true })} type="primary">
            Add Participant
          </Button>
        </div>

        <Table
          loading={isLoading}
          columns={[
            {
              title: "No",
              key: "key",
              render(value, record, index) {
                return index + 1;
              },
            },
            ...dataToField,
            ...dataJSONToField,
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
                    title="Delete this participant?"
                    onConfirm={async () => {
                      await deleteParticipant(record?.id);
                      fetchParticipants();
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
          dataSource={participantsProcessed}
        />
      </div>
      <ModalCreateParticipant
        open={isModalOpen?.open}
        onClose={() => setIsModalOpen({ open: false })}
        editData={isModalOpen?.data}
        fields={fields}
        refetch={fetchParticipants}
      />
    </>
  );
};

export default Participant;
