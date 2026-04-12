import React from "react";
import { useTheme } from "../Context/themeContext";

const Select = ({
  name = "",
  id,
  className,
  onChange = () => {},
  value,
  itemArray,
  displayName,
  disabled,
}) => {
  const { theme } = useTheme();
  const themeClass =
    theme === "dark"
      ? "bg-gray-700 text-white border-gray-600 focus:border-gray-300"
      : "text-gray-900 bg-gray-100 border-gray-300 focus:border-gray-600";
  const sortedItemArray = itemArray?.sort((a, b) =>
    a.value.localeCompare(b.value)
  );

  return (
    <select
      name={name}
      id={id}
      className={`${className} ${themeClass} outline-none transition-all duration-300`}
      onChange={onChange}
      value={value}
      disabled={disabled}
    >
      {displayName && <option value="">{displayName?.toCapitalize()}</option>}

      {sortedItemArray?.map((item) => {
        return (
          <option
            key={item?.id}
            value={item?.value}
            className={`${
              theme === "dark"
                ? "even:bg-gray-900 border-b-2 border-white p-1 last:border-b-0"
                : "even:bg-gray-50 border-b-2"
            }`}
          >
            {item.displayName ? item.displayName.toCapitalize() : item.name ? item.name.toCapitalize() : item.value.toCapitalize()}
          </option>
        );
      })}
    </select>
  );
};

export default Select;
