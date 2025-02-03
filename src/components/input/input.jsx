export const Input = (props) => {
  // eslint-disable-next-line react/prop-types
  const { value, onChange, placeholder, onKeyDown } = props;
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
      className="flex-1 p-2 border rounded-lg resize-none"
      rows={1}
    />
  );
};
