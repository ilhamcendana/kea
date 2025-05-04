import { urlImage } from "@/helpers/constants";
import { ISection } from "@/pages/[eventId]/lp/manage";
import { Button, Spin } from "antd";
import clsx from "clsx";
import React, { ClassAttributes } from "react";

const LandingPagePreview = ({
  data,
  isLoading,
}: {
  data: ISection[];
  isLoading: boolean;
}) => {
  const renderComponent = (component: any, index: number) => {
    if (!component) return null;
    let props: any = {
      className: clsx(
        component?.className,
        component?.type === "h1" && "text-2xl font-bold"
      ),
      key: index,
    };
    if (component?.type === "img") {
      props = {
        ...props,
        src: `${urlImage}${component?.value}`,
      };
    } else {
      props = {
        ...props,
        children: component?.value,
      };
    }
    return React.createElement(component?.type, props);
  };

  return (
    <>      
      <div className="flex flex-col gap-4">
        {isLoading && (
          <div className="flex h-full w-full items-center justify-center">
            <Spin />
          </div>
        )}
        {!isLoading &&
          data &&
          data?.map((section, index) => (
            <div key={index} className="mb-4 flex flex-col gap-4">
              {section &&
                section?.components.map((component, ci) =>
                  renderComponent(component, ci)
                )}
            </div>
          ))}
      </div>
    </>
  );
};

export default LandingPagePreview;
