import { Form, FormItemProps, Input, InputProps } from "antd";

interface IInput {
  item?: FormItemProps;
  input?: InputProps;
}

const TextInput = (props: IInput) => {
  return (
    <Form.Item {...props.item}>
      <Input {...props.input} placeholder={`Enter ${props?.item?.label}`} />
    </Form.Item>
  );
};

export default TextInput;
