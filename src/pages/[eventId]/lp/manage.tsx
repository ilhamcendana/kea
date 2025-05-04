import { landingPageTable, PAGE_URL } from "@/helpers/constants";
import useFetchSections from "@/hooks/useFetchSections";
import LandingPagePreview from "@/molecules/LandingPagePreview";
import ModalAddComponent from "@/molecules/modal/ModalAddComponent";
import ModalCreateSection from "@/molecules/modal/ModalCreateSection";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/supabase";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Popconfirm, Select, Table } from "antd";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export interface ISection {
  order: number;
  id: string;
  key: string;
  sectionName: string;
  components: {
    type: "h1" | "paragraph" | "img" | "button";
    value: string;
    link?: string;
    className?: string;
    headingProps?: HTMLHeadingElement;
    paragraphProps?: HTMLParagraphElement;
    buttonProps?: HTMLButtonElement;
    imgProps?: HTMLImageElement;
    id: string;
  }[];
}

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  "data-row-key": string;
}

const LandingPageManage = () => {
  const [dataSource, setDataSource] = useState<ISection[]>([]);
  const { event } = useAuthStore();

  const { isLoading, listAllSections } = useFetchSections();

  async function fetchSections() {
    const data = await listAllSections();
    console.log("data", data);
    setDataSource(data as ISection[]);
  }

  useEffect(() => {
    if (event?.id) {
      fetchSections();
    }
  }, [event]);

  async function onDeleteSection(record: ISection) {
    const { error } = await supabase
      .from(landingPageTable)
      .delete()
      .eq("id", record.id);

    if (error) {
      console.log("error", error);
    }
    fetchSections();
  }

  const Row: React.FC<Readonly<RowProps>> = (props) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: props["data-row-key"],
    });

    const style: React.CSSProperties = {
      ...props.style,
      transform: CSS.Translate.toString(transform),
      transition,
      cursor: "move",
      ...(isDragging ? { position: "relative", zIndex: 9999 } : {}),
    };

    return (
      <tr
        {...props}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
      />
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    })
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setDataSource((prev) => {
        const activeIndex = prev.findIndex((i) => i.key === active.id);
        const overIndex = prev.findIndex((i) => i.key === over?.id);
        return arrayMove(prev, activeIndex, overIndex);
      });
    }
  };

  const [modalAddEditSectionConfig, modalAddEditSectionConfigSet] = useState<{
    show: boolean;
    data?: ISection;
  }>({
    show: false,
    data: undefined,
  });

  const [modalAddEditComponentConfig, modalAddEditComponentConfigSet] =
    useState<{
      show: boolean;
      data?: ISection;
      isEdit: string | null;
    }>({
      show: false,
      data: undefined,
      isEdit: null,
    });

  const [openedSection, openedSectionSet] = useState<ISection | null>(null);
  const openedSectionMemo = useMemo(() => {
    return dataSource?.find((i) => i?.id === openedSection?.id);
  }, [dataSource, openedSection?.id]);
  console.log(dataSource);
  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between items-center mb-4">
            {!openedSection && (
              <Button
                onClick={() => modalAddEditSectionConfigSet({ show: true })}
                type="primary"
              >
                Create Section
              </Button>
            )}
            {openedSection && (
              <Button
                onClick={() =>
                  modalAddEditComponentConfigSet({
                    show: true,
                    data: openedSectionMemo,
                    isEdit: null,
                  })
                }
                type="primary"
              >
                Add Component
              </Button>
            )}
            <Link
              target="_blank"
              href={PAGE_URL?.LANDING_PAGE?.replace(
                "[eventId]",
                event?.id || ""
              )}
            >
              <Button type="dashed">View site</Button>
            </Link>
          </div>

          <div className="flex flex-col gap-4 mt-4">
            {!openedSection && (
              <Table
                loading={isLoading}
                rowKey="key"
                columns={[
                  {
                    key: "Order",
                    title: "Order",
                    width: 100,
                    render(value, record, index) {
                      return (
                        <select
                          value={record?.order}
                          style={{ width: "100%" }}
                          onChange={async (e) => {
                            const getSectionWithOrder = dataSource?.find(
                              (x) => x?.order === Number(e.target.value)
                            );

                            await supabase
                              .from(landingPageTable)
                              .update({
                                order: record?.order,
                              })
                              .eq("id", getSectionWithOrder?.id);

                            await supabase
                              .from(landingPageTable)
                              .update({
                                order: Number(getSectionWithOrder?.order),
                              })
                              .eq("id", record.id);

                            fetchSections();
                          }}
                        >
                          {dataSource.map((item, i) => (
                            <option key={i} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                        </select>
                      );
                    },
                  },
                  {
                    key: "section-name",
                    title: "Section Name",
                    dataIndex: "sectionName",
                    width: 200,
                  },
                  {
                    key: "action",
                    title: "Action",
                    render(value, record) {
                      return (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              modalAddEditSectionConfigSet({
                                show: true,
                                data: record,
                              });
                            }}
                            icon={<EditOutlined />}
                            type="primary"
                          />
                          <Popconfirm
                            title="Are you sure to delete this section?"
                            onConfirm={() => onDeleteSection(record)}
                            styles={{ root: { zIndex: 10000 } }}
                          >
                            <Button
                              icon={<DeleteOutlined />}
                              type="primary"
                              danger
                            />
                          </Popconfirm>
                          <Button onClick={() => openedSectionSet(record)}>
                            Manage Components
                          </Button>
                        </div>
                      );
                    },
                  },
                ]}
                dataSource={dataSource?.sort((a, b) => a.order - b.order)}
              />
            )}

            {openedSection && (
              <div>
                <Button
                  type="text"
                  onClick={() => openedSectionSet(null)}
                  icon={<ArrowLeftOutlined />}
                  style={{ marginBottom: 16 }}
                >
                  Back to sections
                </Button>
                <Table
                  loading={isLoading}
                  columns={[
                    {
                      dataIndex: "type",
                      key: "type",
                      title: "Type",
                    },
                    {
                      dataIndex: "value",
                      key: "value",
                      title: "Value",
                    },
                    {
                      dataIndex: "link",
                      key: "link",
                      title: "Link",
                    },
                    {
                      dataIndex: "className",
                      key: "className",
                      title: "Class Name",
                    },
                    {
                      key: "action",
                      title: "Action",
                      render(value, record) {
                        return (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                modalAddEditComponentConfigSet({
                                  show: true,
                                  data: openedSectionMemo,
                                  isEdit: record?.id,
                                });
                              }}
                              icon={<EditOutlined />}
                              type="primary"
                            />
                            <Popconfirm
                              title="Are you sure to delete this component?"
                              styles={{ root: { zIndex: 10000 } }}
                            >
                              <Button
                                icon={<DeleteOutlined />}
                                type="primary"
                                danger
                              />
                            </Popconfirm>
                          </div>
                        );
                      },
                    },
                  ]}
                  dataSource={openedSectionMemo?.components || []}
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="border aspect-[9/16] overflow-y-auto">
            <LandingPagePreview data={dataSource} isLoading={isLoading} />
          </div>
        </div>
      </div>
      <ModalCreateSection
        open={modalAddEditSectionConfig.show}
        onClose={() => {
          modalAddEditSectionConfigSet({ show: false });
        }}
        onFinishCreateSection={() => {
          fetchSections();
        }}
        data={modalAddEditSectionConfig?.data}
        order={dataSource?.length + 1}
      />
      <ModalAddComponent
        open={modalAddEditComponentConfig.show}
        onClose={() => {
          modalAddEditComponentConfigSet({ show: false, isEdit: null });
        }}
        onFinishCreateComponent={() => {
          fetchSections();
        }}
        data={modalAddEditComponentConfig.data}
        isEdit={modalAddEditComponentConfig.isEdit}
      />
    </>
  );
};

export default LandingPageManage;
